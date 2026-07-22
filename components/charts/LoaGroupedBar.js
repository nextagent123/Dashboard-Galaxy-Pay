"use client";

import { useState } from "react";
import ChartTooltip from "./ChartTooltip";

// Horizontal grouped bar: customer count vs loa count per segment.
export default function LoaGroupedBar({ customers }) {
  const cW = 900, cH = 300, pL = 180, pR = 90, pT = 30, pB = 30;
  const iW = cW - pL - pR, iH = cH - pT - pB;
  const maxL = Math.max(...customers.map((c) => Math.max(c.lastLoas, c.lastCust)));
  const rowH = iH / customers.length;
  const [hover, setHover] = useState(null);

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
        <line x1={pL} x2={cW - pR} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={1} />
        {customers.map((c, i) => {
          const yBase = pT + i * rowH;
          const bh = (rowH - 6) / 2;
          const wCust = (c.lastCust / maxL) * iW;
          const wLoas = (c.lastLoas / maxL) * iW;
          const isHover = hover === i;
          return (
            <g key={c.name}>
              <text x={pL - 12} y={yBase + rowH / 2 + 3} fontSize={13} fill="#ecedf5" textAnchor="end" fontWeight={700}>{c.name}</text>
              <text x={pL - 12} y={yBase + rowH / 2 + 18} fontSize={10.5} fill={c.color} textAnchor="end">{c.avgLoaStr} loa/KH</text>
              <rect x={pL} y={yBase + 4} width={wCust} height={bh} fill={c.color} opacity={isHover ? 0.85 : 0.6} rx={3} style={{ transition: "opacity 0.15s" }} />
              <text x={pL + wCust + 6} y={yBase + 4 + bh / 2 + 4} fontSize={11} fill="#c8ccd9" fontWeight={600} className="mono">{c.lastCustStr} KH</text>
              <rect x={pL} y={yBase + 8 + bh} width={wLoas} height={bh} fill={c.color} opacity={isHover ? 1 : 1} rx={3} />
              <text x={pL + wLoas + 6} y={yBase + 8 + bh + bh / 2 + 4} fontSize={11} fill={c.color} fontWeight={700} className="mono">{c.lastLoasStr} loa</text>
              <rect
                x={pL}
                y={yBase}
                width={iW}
                height={rowH}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              />
            </g>
          );
        })}
      </svg>
      {hover != null && (() => {
        const c = customers[hover];
        const yBase = pT + hover * rowH;
        return (
          <ChartTooltip x={((pL + iW * 0.3) / cW) * 100} y={(yBase / cH) * 100}>
            <div style={{ fontWeight: 700, color: "#8a8fa6", fontSize: 10.5 }}>{c.name}</div>
            <div style={{ color: "#c8ccd9" }}>Khách hàng: <b>{c.lastCustStr}</b></div>
            <div style={{ color: c.color }}>Số loa: <b>{c.lastLoasStr}</b></div>
            <div style={{ color: c.color, opacity: 0.85 }}>TB: {c.avgLoaStr} loa/KH</div>
          </ChartTooltip>
        );
      })()}
    </div>
  );
}
