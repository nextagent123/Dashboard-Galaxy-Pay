"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "./AuthProvider";

const SUGGESTIONS = [
  { title: "Tổng quan kinh doanh", sub: "lũy kế năm nay đến đâu?", prompt: "Tổng quan kinh doanh" },
  { title: "Tiến độ KPI", sub: "GMV, doanh thu, lợi nhuận", prompt: "Tiến độ KPI" },
  { title: "Biểu phí dịch vụ", sub: "của Galaxy Pay", prompt: "Biểu phí dịch vụ" },
  { title: "SoftPOS là gì?", sub: "và khác POS truyền thống ra sao", prompt: "SoftPOS là gì?" },
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
        <ul key={`list-${i}`} className="cb-md-list">
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
        <ol key={`list-${i}`} className="cb-md-list cb-md-ol">
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

function SparkleIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2z" />
      <path d="M19 15l.9 2.6 2.6.9-2.6.9L19 22l-.9-2.6-2.6-.9 2.6-.9L19 15z" opacity="0.7" />
    </svg>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <button type="button" className="cb-action-btn" onClick={copy} aria-label="Sao chép câu trả lời">
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
      )}
      <span>{copied ? "Đã chép" : "Sao chép"}</span>
    </button>
  );
}

export default function ChatBot() {
  const { allowedRoutes } = useAuth();
  const restricted = !!allowedRoutes;
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const isEmpty = messages.length === 0;

  function newChat() {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setLoading(false);
    inputRef.current?.focus();
  }

  function stop() {
    abortRef.current?.abort();
  }

  async function handleSend(e, overrideText) {
    e?.preventDefault();
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    const history = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantText = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, restricted }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Lỗi ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
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
      if (err.name === "AbortError") {
        if (!assistantText) {
          setMessages((prev) => (prev[prev.length - 1]?.role === "assistant" ? prev.slice(0, -1) : prev));
        }
      } else {
        setMessages((prev) => [
          ...prev.filter((m, i) => !(i === prev.length - 1 && m.role === "assistant" && !m.content)),
          { role: "assistant", content: `Xin lỗi, đã có lỗi xảy ra: ${err.message}` },
        ]);
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  }

  const waitingFirstToken = loading && messages[messages.length - 1]?.role !== "assistant";

  return (
    <>
      {!open && (
        <button className="chatbot-fab" onClick={() => setOpen(true)} aria-label="Mở Trợ lý AI">
          <div className="chatbot-fab-inner">
            <img src="/chatbot-ai.jpg" alt="AI" width="32" height="32" style={{ borderRadius: "50%", objectFit: "cover" }} />
            <span className="chatbot-fab-sparkle chatbot-fab-sparkle-1">✦</span>
            <span className="chatbot-fab-sparkle chatbot-fab-sparkle-2">✧</span>
            <span className="chatbot-fab-sparkle chatbot-fab-sparkle-3">✦</span>
          </div>
          <span className="chatbot-fab-pulse" />
          <span className="chatbot-fab-label">Trợ lý Khối Kinh doanh</span>
        </button>
      )}

      {open && (
        <div className={`chatbot-panel${expanded ? " chatbot-panel--expanded" : ""}`} role="dialog" aria-label="Trợ lý Khối Kinh doanh">
          <div className="chatbot-header">
            <div className="cb-header-left">
              <button type="button" className="cb-icon-btn" onClick={newChat} aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </button>
              <div className="cb-title">
                <span className="cb-title-text">Trợ lý Khối Kinh doanh</span>
                <span className="cb-model-pill">
                  <span className="chatbot-status-dot" />
                  Sẵn sàng
                </span>
              </div>
            </div>
            <div className="cb-header-right">
              <button
                type="button"
                className="cb-icon-btn cb-expand-btn"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? "Thu nhỏ" : "Phóng to"}
                title={expanded ? "Thu nhỏ" : "Phóng to"}
              >
                {expanded ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" /></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
                )}
              </button>
              <button type="button" className="cb-icon-btn" onClick={() => setOpen(false)} aria-label="Đóng">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {isEmpty ? (
              <div className="cb-greeting">
                <div className="cb-greeting-title">Xin chào! 👋</div>
                <div className="cb-greeting-sub">Mình có thể giúp gì cho bạn hôm nay?</div>
              </div>
            ) : (
              <div className="cb-thread">
                {messages.map((msg, i) =>
                  msg.role === "user" ? (
                    <div key={i} className="cb-row cb-row--user">
                      <div className="cb-user-bubble">{msg.content}</div>
                    </div>
                  ) : (
                    <div key={i} className="cb-row cb-row--assistant">
                      <div className="cb-avatar"><SparkleIcon /></div>
                      <div className="cb-assistant-body">
                        {msg.content ? renderMarkdown(msg.content) : <span className="chatbot-typing-text">Đang suy nghĩ...</span>}
                        {msg.content && !(loading && i === messages.length - 1) && (
                          <div className="cb-actions">
                            <CopyButton text={msg.content} />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
                {waitingFirstToken && (
                  <div className="cb-row cb-row--assistant">
                    <div className="cb-avatar"><SparkleIcon /></div>
                    <div className="cb-assistant-body">
                      <span className="chatbot-typing-text">Đang suy nghĩ...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="cb-composer-wrap">
            {isEmpty && !restricted && (
              <div className="cb-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s.title} type="button" className="cb-suggestion" onClick={() => handleSend(null, s.prompt)}>
                    <span className="cb-suggestion-title">{s.title}</span>
                    <span className="cb-suggestion-sub">{s.sub}</span>
                  </button>
                ))}
              </div>
            )}

            <form className="cb-composer" onSubmit={handleSend}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Gửi tin nhắn..."
                className="cb-textarea"
                aria-label="Nội dung tin nhắn"
              />
              <div className="cb-composer-bar">
                <span className="cb-hint">Enter để gửi · Shift + Enter xuống dòng</span>
                {loading ? (
                  <button type="button" className="cb-send-btn" onClick={stop} aria-label="Dừng trả lời">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2" /></svg>
                  </button>
                ) : (
                  <button type="submit" className="cb-send-btn" disabled={!input.trim()} aria-label="Gửi">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
