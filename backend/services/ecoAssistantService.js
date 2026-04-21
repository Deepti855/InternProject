const ECO_SYSTEM_PROMPT = `
You are Eco Assistant, a sustainability guidance chatbot for a social app.
Focus on:
- eco-friendly product recommendations
- sustainable alternatives
- conceptual carbon footprint estimates (non-precise)
- helping users write clearer sustainability-related posts

Be practical, concise, and actionable. If uncertain, say what assumptions you used.
`;

const buildFallbackReply = (question) => {
  return `I can help with that. Based on your question, start by checking product materials, packaging, and brand transparency reports. Prefer durable or refillable options, verify fair labor claims, and compare lifecycle impact (production + shipping + disposal). If you share your draft post text, I can suggest a cleaner sustainability-focused version.`;
};

const streamFromOpenAI = async ({ messages, onToken }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const fallback = buildFallbackReply(messages[messages.length - 1]?.content || "");
    onToken(fallback);
    return fallback;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4-turbo",
      stream: true,
      temperature: 0.4,
      messages: [{ role: "system", content: ECO_SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("OpenAI stream failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullText = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.replace(/^data:\s*/, "");
      if (data === "[DONE]") continue;

      try {
        const json = JSON.parse(data);
        const token = json?.choices?.[0]?.delta?.content || "";
        if (token) {
          fullText += token;
          onToken(token);
        }
      } catch (_err) {
        // Ignore malformed stream lines and continue.
      }
    }
  }

  return fullText.trim();
};

module.exports = { streamFromOpenAI };
