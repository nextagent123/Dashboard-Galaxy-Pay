"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const WELCOME_MSG = {
  role: "assistant",
  content:
    "Chào bạn! Mình là **Trợ lý Khối Kinh doanh** 👋\n\nHỏi mình bất cứ điều gì về chỉ số kinh doanh, sản phẩm, biểu phí hay tiến độ KPI nhé!",
};

const SUGGESTIONS = [
  { icon: "📊", text: "Tổng quan kinh doanh" },
  { icon: "🏢", text: "Galaxy Pay là gì?" },
  { icon: "💰", text: "Biểu phí dịch vụ" },
  { icon: "📦", text: "SME in a Box" },
  { icon: "🎯", text: "Tiến độ KPI" },
  { icon: "📱", text: "SoftPOS là gì?" },
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
      let rafId = null;
      let pendingUpdate = false;

      const flushUpdate = () => {
        pendingUpdate = false;
        const snapshot = assistantText;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: snapshot };
          return next;
        });
      };

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
              if (!pendingUpdate) {
                pendingUpdate = true;
                rafId = requestAnimationFrame(flushUpdate);
              }
            }
          } catch {}
        }
      }
      if (rafId) cancelAnimationFrame(rafId);
      flushUpdate();
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
      {!open && (
        <button
          className="chatbot-fab"
          onClick={() => setOpen(true)}
          aria-label="Mở Trợ lý AI"
        >
          <div className="chatbot-fab-inner">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect x="6" y="10" width="28" height="22" rx="6" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
              <rect x="14" y="4" width="12" height="8" rx="4" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
              <line x1="20" y1="12" x2="20" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
              <circle className="chatbot-ai-eye-left" cx="15" cy="20" r="2.5" fill="#fff" />
              <circle className="chatbot-ai-eye-right" cx="25" cy="20" r="2.5" fill="#fff" />
              <circle className="chatbot-ai-pupil-left" cx="15.8" cy="20" r="1.2" fill="#7c6cff" />
              <circle className="chatbot-ai-pupil-right" cx="25.8" cy="20" r="1.2" fill="#7c6cff" />
              <path d="M15 26 Q20 29 25 26" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <line x1="2" y1="18" x2="6" y2="18" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="2" y1="22" x2="6" y2="22" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="34" y1="18" x2="38" y2="18" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="34" y1="22" x2="38" y2="22" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="chatbot-fab-sparkle chatbot-fab-sparkle-1">✦</span>
            <span className="chatbot-fab-sparkle chatbot-fab-sparkle-2">✧</span>
            <span className="chatbot-fab-sparkle chatbot-fab-sparkle-3">✦</span>
          </div>
          <span className="chatbot-fab-pulse" />
          <span className="chatbot-fab-label">Trợ lý Khối Kinh doanh</span>
        </button>
      )}

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="chatbot-header-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c-4.97 0-9 3.13-9 7 0 2.38 1.41 4.5 3.6 5.85L5 21l4.2-2.1c.9.2 1.84.1 2.8.1 4.97 0 9-3.13 9-7s-4.03-7-9-7Z" />
                </svg>
              </div>
              <div>
                <div className="chatbot-header-title">Trợ lý Khối Kinh doanh</div>
                <div className="chatbot-header-status">
                  <span className="chatbot-status-dot" />
                  Sẵn sàng hỗ trợ
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="chatbot-close-btn"
              aria-label="Đóng"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="chatbot-msg-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3c-4.97 0-9 3.13-9 7 0 2.38 1.41 4.5 3.6 5.85L5 21l4.2-2.1c.9.2 1.84.1 2.8.1 4.97 0 9-3.13 9-7s-4.03-7-9-7Z" />
                    </svg>
                  </div>
                )}
                <div className={`chatbot-bubble chatbot-bubble--${msg.role}`}>
                  {msg.role === "assistant"
                    ? renderMarkdown(msg.content) || (loading && i === messages.length - 1 ? <span className="chatbot-typing-text">Đang suy nghĩ...</span> : "")
                    : msg.content}
                </div>
              </div>
            ))}

            {showSuggestions && (
              <div className="chatbot-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    className="chatbot-chip"
                    onClick={() => handleSend(null, s.text)}
                  >
                    <span className="chatbot-chip-icon">{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            )}

            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="chatbot-msg chatbot-msg--assistant">
                <div className="chatbot-msg-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c-4.97 0-9 3.13-9 7 0 2.38 1.41 4.5 3.6 5.85L5 21l4.2-2.1c.9.2 1.84.1 2.8.1 4.97 0 9-3.13 9-7s-4.03-7-9-7Z" />
                  </svg>
                </div>
                <div className="chatbot-bubble chatbot-bubble--assistant chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chatbot-input-bar" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              disabled={loading}
              className="chatbot-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="chatbot-send-btn"
              aria-label="Gửi"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
