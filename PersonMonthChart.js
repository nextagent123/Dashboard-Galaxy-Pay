"use client";

import { useState } from "react";
import ChartTooltip from "./ChartTooltip";

// Bigger per-metric monthly chart for the personal-KPI player cards: ghost
// "kế hoạch" bar + solid "thực tế" bar, each labeled with its value so plan
// vs actual is legible at a glance (not just relative bar height).
export default function PersonMonthChart({ months, kpi, actual, color, fmt }) {
  const cW = 900, cH = 170, pT = 26, pB = 22;
  const iH = cH - pT - pB;
  const N = months.length;
  const step = cW / N;
  const barW = Math.min(16, step * 0.32);
  const gap = 3;
  const maxVal = Math.max(...kpi.filter((v) => v != null), ...actual.filter((v) => v != null), 1);
  const y = (v) => pT + iH - (v / maxVal) * iH;
  const format = fmt || ((v) => v.toLocaleString("vi-VN"));
  const [hover, setHover] = useState(null);

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
        <line x1={0} x2={cW} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={0.8} />
        {Array.from({ length: N }).map((_, i) => {
          const kv = kpi[i], av = actual[i];
          const groupW = barW * 2 + gap;
          const gx = i * step + (step - groupW) / 2;
          const isHover = hover === i;
          return (
            <g key={i}>
              {kv != null && kv > 0 && (
                <>
                  <rect x={gx} y={y(kv)} width={barW} height={pT + iH - y(kv)} fill={color} opacity={isHover ? 0.35 : 0.2} rx={2} style={{ transition: "opacity 0.15s" }} />
                  <text x={gx + barW / 2} y={y(kv) - 4} fontSize={8.5} fill={color} opacity={0.75} textAnchor="middle" fontWeight={600} className="mono">
                    {format(kv)}
                  </text>
                </>
              )}
              {av != null && av > 0 && (
                <>
                  <rect x={gx + barW + gap} y={y(av)} width={barW} height={pT + iH - y(av)} fill={color} opacity={isHover ? 1 : 0.95} rx={2} style={{ transition: "opacity 0.15s" }} />
                  <text x={gx + barW + gap + barW / 2} y={y(av) - 4} fontSize={8.5} fill={color} textAnchor="middle" fontWeight={800} className="mono">
                    {format(av)}
                  </text>
                </>
              )}
              <text x={i * step + step / 2} y={cH - 6} fontSize={9.5} fill="#5b5f74" textAnchor="middle" fontWeight={600}>
                {months[i]}
              </text>
              {(kv != null || av != null) && (
                <rect
                  x={i * step}
                  y={pT}
                  width={step}
                  height={iH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{ cursor: "pointer" }}
                />
              )}
            </g>
          );
        })}
      </svg>
      {hover != null && (() => {
        const kv = kpi[hover], av = actual[hover];
        const topY = Math.min(kv != null ? y(kv) : cH, av != null ? y(av) : cH);
        const pct = kv ? Math.round((av / kv) * 100) : null;
        return (
          <ChartTooltip x={((hover * step + step / 2) / cW) * 100} y={(topY / cH) * 100}>
            <div style={{ fontWeight: 700, color: "#8a8fa6", fontSize: 10.5 }}>{months[hover]}</div>
            <div style={{ color, opacity: 0.75 }}>Kế hoạch: <b>{kv != null ? format(kv) : "—"}</b></div>
            <div style={{ color }}>Thực tế: <b>{av != null ? format(av) : "—"}</b></div>
            {pct != null && <div style={{ color: pct >= 100 ? "#34d399" : "#fbbf24", fontWeight: 700 }}>{pct}% kế hoạch</div>}
          </ChartTooltip>
        );
      })()}
    </div>
  );
}
