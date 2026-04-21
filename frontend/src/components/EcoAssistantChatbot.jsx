import { useEffect, useMemo, useRef, useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { ecoAssistantAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function EcoAssistantChatbot({ buttonClassName = "" }) {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const abortRef = useRef(null);

  const canSend = useMemo(
    () => question.trim().length > 0 && !loading,
    [question, loading],
  );

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    ecoAssistantAPI
      .getHistory()
      .then((res) => setMessages(res.data || []))
      .catch(() => setError("Failed to load Eco Assistant history."));
  }, [open, isAuthenticated]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  if (!isAuthenticated) return null;

  const sendQuestion = async (e) => {
    e.preventDefault();
    const prompt = question.trim();
    if (!prompt || loading) return;

    setError("");
    setLoading(true);
    setQuestion("");

    const tempUserId = Date.now();
    const tempAssistantId = tempUserId + 1;

    setMessages((prev) => [
      ...prev,
      {
        id: tempUserId,
        role: "user",
        content: prompt,
        created_at: new Date().toISOString(),
      },
      {
        id: tempAssistantId,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
        streaming: true,
      },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await ecoAssistantAPI.streamReply({
        question: prompt,
        signal: controller.signal,
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAssistantId
                ? { ...m, content: (m.content || "") + chunk }
                : m,
            ),
          );
        },
      });

      const refreshed = await ecoAssistantAPI.getHistory();
      setMessages(refreshed.data || []);
    } catch (_err) {
      setError("Eco Assistant is unavailable right now. Please try again.");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempAssistantId
            ? {
                ...m,
                content:
                  m.content || "Unable to generate a response right now.",
              }
            : m,
        ),
      );
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          buttonClassName ||
          "fixed bottom-36 right-6 md:bottom-28 md:right-10 z-50 w-14 h-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        }
        aria-label="Toggle Eco Assistant"
      >
        {open ? (
          <FiX className="w-6 h-6" />
        ) : (
          <FiMessageCircle className="w-6 h-6" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-52 right-4 md:bottom-44 md:right-10 z-50 w-[92vw] max-w-md h-[65vh] rounded-2xl border border-gray-200 bg-white shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-green-50">
            <h3 className="font-semibold text-gray-900">Eco Assistant</h3>
            <p className="text-xs text-gray-600">
              Ask sustainability questions anytime
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500">
                Try: "Suggest a zero-waste alternative to plastic wrap."
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-green-600 text-white"
                      : "mr-auto bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  {m.content}
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
              {error}
            </div>
          )}

          <form
            onSubmit={sendQuestion}
            className="p-3 border-t border-gray-100 bg-white flex items-center gap-2"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about eco-friendly products..."
              className="flex-1 h-10 px-3 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-green-200 focus:border-green-500"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="h-10 w-10 rounded-lg bg-green-600 text-white disabled:opacity-50 flex items-center justify-center"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
