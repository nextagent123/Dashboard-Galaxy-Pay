"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const WELCOME_MSG = {
  role: "assistant",
  content:
    "Xin chào! Tôi là Khối Kinh doanh Chatbot AI. Bạn có thể hỏi tôi về các chỉ số kinh doanh, sản phẩm Galaxy Pay, biểu phí, đối tác, SME in a Box... hoặc bất kỳ nội dung nào liên quan.",
};

const SUGGESTIONS = [
  "Tổng quan kinh doanh",
  "Galaxy Pay là gì?",
  "Biểu phí dịch vụ",
  "SME in a Box",
  "Tiến độ KPI",
  "SoftPOS là gì?",
];

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^(#{1,3})/)[1].length;
      const content = line.replace(/^#{1,3}\s+/, "");
      elements.push(
        <div key={i} className={`cb-md-h${level}`}>
          {inlineFormat(content)}
        </div>
      );
    } else if (/^[•\-\*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[•\-\*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[•\-\*]\s+/, ""));
        i++;
      }
      elements.push(
        <ul key={i} className="cb-md-list">
          {items.map((item, j) => (
            <li key={j}>{inlineFormat(item)}</li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+[\.\)]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+[\.\)]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+[\.\)]\s+/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="cb-md-list cb-md-ol">
          {items.map((item, j) => (
            <li key={j}>{inlineFormat(item)}</li>
          ))}
        </ol>
      );
      continue;
    } else if (line.trim() === "---" || line.trim() === "—") {
      elements.push(<hr key={i} className="cb-md-hr" />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="cb-md-spacer" />);
    } else {
      elements.push(
        <div key={i} className="cb-md-p">
          {inlineFormat(line)}
        </div>
      );
    }
    i++;
  }

  return <div className="cb-md">{elements}</div>;
}

function inlineFormat(text) {
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
    const codeMatch = remaining.match(/`([^`]+?)`/);

    let firstMatch = null;
    let firstIdx = remaining.length;

    if (boldMatch && boldMatch.index < firstIdx) {
      firstMatch = { type: "bold", match: boldMatch };
      firstIdx = boldMatch.index;
    }
    if (italicMatch && italicMatch.index < firstIdx) {
      firstMatch = { type: "italic", match: italicMatch };
      firstIdx = italicMatch.index;
    }
    if (codeMatch && codeMatch.index < firstIdx) {
      firstMatch = { type: "code", match: codeMatch };
      firstIdx = codeMatch.index;
    }

    if (!firstMatch) {
      parts.push(remaining);
      break;
    }

    if (firstIdx > 0) {
      parts.push(remaining.slice(0, firstIdx));
    }

    const m = firstMatch.match;
    if (firstMatch.type === "bold") {
      parts.push(<strong key={key++}>{m[1]}</strong>);
    } else if (firstMatch.type === "italic") {
      parts.push(<em key={key++}>{m[1]}</em>);
    } else if (firstMatch.type === "code") {
      parts.push(<code key={key++} className="cb-md-code">{m[1]}</code>);
    }

    remaining = remaining.slice(firstIdx + m[0].length);
  }

  return parts;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const showSuggestions = messages.length <= 1 && !loading;

  async function handleSend(e, overrideText) {
    e?.preventDefault();
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    const apiMessages = history
      .filter((m) => m !== WELCOME_MSG)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Lỗi ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const evt = JSON.parse(data);
            if (evt.text) {
              assistantText += evt.text;
              const snapshot = assistantText;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: snapshot };
                return next;
              });
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Xin lỗi, đã có lỗi xảy ra: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button - hidden on mobile when chat is open */}
      {!open && (
        <button
          className="chatbot-fab"
          onClick={() => setOpen(true)}
          aria-label="Mở chat AI"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c-4.97 0-9 3.13-9 7 0 2.38 1.41 4.5 3.6 5.85L5 21l4.2-2.1c.9.2 1.84.1 2.8.1 4.97 0 9-3.13 9-7s-4.03-7-9-7Z" />
            <circle cx="8" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="16" cy="10" r="1" fill="currentColor" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="chatbot-header-avatar">
                <span style={{ fontSize: 18 }}>🤖</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Khối Kinh doanh Chatbot AI</div>
                <div style={{ fontSize: 10.5, color: "#34d399", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  <span className="ai-live-dot" style={{ width: 5, height: 5 }} />
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", color: "#a7abbe", padding: 8, minWidth: 36, minHeight: 36, display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label="Đóng"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="chatbot-msg-avatar">🤖</div>
                )}
                <div className={`chatbot-bubble chatbot-bubble--${msg.role}`}>
                  {msg.role === "assistant"
                    ? renderMarkdown(msg.content) || (loading && i === messages.length - 1 ? "..." : "")
                    : msg.content}
                </div>
              </div>
            ))}

            {/* Suggestion chips */}
            {showSuggestions && (
              <div className="chatbot-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="chatbot-chip"
                    onClick={() => handleSend(null, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-msg-avatar">🤖</div>
                <div className="chatbot-bubble chatbot-bubble--assistant chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form className="chatbot-input-bar" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về Galaxy Pay, KPI, biểu phí..."
              disabled={loading}
              className="chatbot-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="chatbot-send-btn"
              aria-label="Gửi"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4Z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
