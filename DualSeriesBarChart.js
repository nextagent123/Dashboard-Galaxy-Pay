"use client";

import { useState } from "react";
import ChartTooltip from "./ChartTooltip";

// Grouped bar chart comparing 2 series per month (e.g. KHCN vs KHDN revenue).
export default function DualSeriesBarChart({ data, seriesA, seriesB, colorA, colorB, formatValue }) {
  const cW = 760, cH = 280, pL = 44, pR = 20, pT = 30, pB = 40;
  const iW = cW - pL - pR, iH = cH - pT - pB;
  const n = data.length;
  const groupW = iW / Math.max(n, 1);
  const barW = Math.min(26, groupW * 0.32);
  const barGap = 6;
  const maxV = Math.max(...data.map((d) => Math.max(d[seriesA], d[seriesB])), 1) * 1.15;
  const y = (v) => pT + iH - (v / maxV) * iH;
  const fmt = formatValue || ((v) => v.toLocaleString("vi-VN"));
  const [hover, setHover] = useState(null);

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
        <line x1={pL} x2={cW - pR} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={1} />
        {data.map((d, i) => {
          const gx = pL + i * groupW + (groupW - (barW * 2 + barGap)) / 2;
          const ay = y(d[seriesA]);
          const by = y(d[seriesB]);
          const keyA = `${i}-a`;
          const keyB = `${i}-b`;
          return (
            <g key={i}>
              <rect x={gx} y={ay} width={barW} height={Math.max(pT + iH - ay, 1)} fill={colorA} rx={3} opacity={hover === keyA ? 1 : 0.9} style={{ transition: "opacity 0.15s" }} />
              <rect x={gx + barW + barGap} y={by} width={barW} height={Math.max(pT + iH - by, 1)} fill={colorB} rx={3} opacity={hover === keyB ? 1 : 0.9} style={{ transition: "opacity 0.15s" }} />
              <rect x={gx - 2} y={pT} width={barW + 4} height={iH} fill="transparent" onMouseEnter={() => setHover(keyA)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }} />
              <rect x={gx + barW + barGap - 2} y={pT} width={barW + 4} height={iH} fill="transparent" onMouseEnter={() => setHover(keyB)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }} />
              <text x={pL + i * groupW + groupW / 2} y={cH - 14} fontSize={11.5} fill="#a7abbe" textAnchor="middle" fontWeight={600}>
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hover != null &&
        (() => {
          const [iStr, which] = hover.split("-");
          const i = parseInt(iStr, 10);
          const d = data[i];
          const isA = which === "a";
          const gx = pL + i * groupW + (groupW - (barW * 2 + barGap)) / 2;
          const bx = isA ? gx : gx + barW + barGap;
          const val = isA ? d[seriesA] : d[seriesB];
          const color = isA ? colorA : colorB;
          return (
            <ChartTooltip x={((bx + barW / 2) / cW) * 100} y={(y(val) / cH) * 100}>
              <div style={{ fontWeight: 700, color: "#8a8fa6", fontSize: 10.5 }}>{d.label}</div>
              <div style={{ color, fontWeight: 800 }}>{fmt(val)}</div>
            </ChartTooltip>
          );
        })()}
    </div>
  );
}
