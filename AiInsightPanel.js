"use client";

import { useEffect, useState } from "react";

const TONE = {
  hot: { grad: "linear-gradient(135deg,#fb7185,#f59e0b)", glow: "rgba(251,113,133,0.4)" },
  gold: { grad: "linear-gradient(135deg,#fde68a,#f59e0b)", glow: "rgba(251,191,36,0.4)" },
  purple: { grad: "linear-gradient(135deg,#b98cff,#7c6cff)", glow: "rgba(124,108,255,0.45)" },
  green: { grad: "linear-gradient(135deg,#6ee7b7,#34d399)", glow: "rgba(52,211,153,0.4)" },
  red: { grad: "linear-gradient(135deg,#fb7185,#e11d48)", glow: "rgba(251,113,133,0.4)" },
};

// Hero-style banner that rotates dramatic, AI-voiced narrative lines built
// from the same numbers already shown on the page (see getAiInsights).
export default function AiInsightPanel({ insights }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (insights.length < 2) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % insights.length);
        setVisible(true);
      }, 280);
    }, 4600);
    return () => clearInterval(t);
  }, [insights.length]);

  const current = insights[idx];
  const tone = TONE[current.tone] || TONE.purple;

  return (
    <section
      className="card ai-insight-card"
      style={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(124,108,255,0.32)",
        background: "linear-gradient(160deg, rgba(124,108,255,0.16), rgba(255,255,255,0.015))",
      }}
    >
      <div className="ai-shimmer" />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative" }}>
        <div className="ai-avatar" style={{ background: tone.grad, boxShadow: `0 0 28px ${tone.glow}` }}>
          <span style={{ fontSize: 22 }}>🤖</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.4 }}>BUSINESS INSIGHT</span>
            <span className="ai-live-dot" />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#34d399", letterSpacing: 0.3 }}>
              ĐANG PHÂN TÍCH REAL-TIME
            </span>
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 15.5,
              fontWeight: 650,
              lineHeight: 1.55,
              color: "#ecedf5",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(6px)",
              transition: "all 0.28s ease",
              minHeight: 48,
            }}
          >
            <span style={{ marginRight: 8, fontSize: 18 }}>{current.icon}</span>
            {current.text}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 18, position: "relative" }}>
        {insights.map((_, i) => (
          <span
            key={i}
            style={{
              height: 3,
              borderRadius: 3,
              flex: 1,
              background: i === idx ? "linear-gradient(90deg,#7c6cff,#c3b9ff)" : "rgba(255,255,255,0.08)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
    </section>
  );
}
