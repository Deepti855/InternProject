const db = require("../config/db");
const { streamFromOpenAI } = require("../services/ecoAssistantService");

const dbRun = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

const dbAll = (query, params = []) =>
  new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

exports.getHistory = async (req, res) => {
  try {
    const rows = await dbAll(
      "SELECT id, role, content, created_at FROM eco_assistant_messages WHERE user_id = ? ORDER BY created_at ASC",
      [req.user.id]
    );
    res.json(rows);
  } catch (_err) {
    res.status(500).json({ message: "Failed to fetch Eco Assistant history" });
  }
};

exports.streamReply = async (req, res) => {
  const question = (req.body?.question || "").trim();
  if (!question) return res.status(400).json({ message: "Question is required" });
  if (question.length > 2000) return res.status(400).json({ message: "Question is too long" });

  try {
    await dbRun(
      "INSERT INTO eco_assistant_messages (user_id, role, content) VALUES (?, ?, ?)",
      [req.user.id, "user", question]
    );

    const history = await dbAll(
      "SELECT role, content FROM eco_assistant_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
      [req.user.id]
    );
    const recentMessages = history.reverse().map((m) => ({ role: m.role, content: m.content }));

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let assistantText = "";
    const generated = await streamFromOpenAI({
      messages: recentMessages,
      onToken: (token) => {
        assistantText += token;
        res.write(token);
      },
    });

    const finalText = (generated || assistantText || "I could not generate a response right now.").trim();
    await dbRun(
      "INSERT INTO eco_assistant_messages (user_id, role, content) VALUES (?, ?, ?)",
      [req.user.id, "assistant", finalText]
    );

    res.end();
  } catch (_err) {
    if (!res.headersSent) {
      return res.status(500).json({ message: "Eco Assistant failed to respond" });
    }
    res.write("\n\nEco Assistant is temporarily unavailable.");
    res.end();
  }
};
