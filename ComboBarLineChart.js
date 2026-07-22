"use client";

import { useState } from "react";
import { vnInt, vnTy } from "@/lib/format";
import ChartTooltip from "./ChartTooltip";

// Bar (GTGD, tỷ VND) + line (SLGD) combo chart used on the product report page.
// `header` toggles the taller "main" variant (title + legend baked into the SVG);
// the monthly-overview variant omits it and is a bit shorter.
export default function ComboBarLineChart({ labels, gtgd, slgd, accent, header = false }) {
  const cW = 900;
  const cH = header ? 320 : 260;
  const pL = header ? 56 : 46;
  const pR = header ? 36 : 24;
  const pT = header ? 52 : 30;
  const pB = header ? 44 : 34;
  const iW = cW - pL - pR;
  const iH = cH - pT - pB;
  const barMaxRaw = Math.max(...gtgd, 0.01);
  const lineMaxRaw = Math.max(...slgd, 1);
  const barMax = barMaxRaw * 1.35;
  const lineMax = lineMaxRaw * (header ? 1.2 : 1.2);
  const n = labels.length;
  const step = iW / Math.max(n, 1);
  const barW = step * (header ? 0.55 : 0.6);
  const barX = (i) => pL + step * i + (step - barW) / 2;
  const barY = (v) => pT + iH - (v / barMax) * iH;
  const lineX = (i) => pL + step * i + step / 2;
  const lineY = (v) => pT + iH * 0.15 + (1 - v / lineMax) * iH * (header ? 0.55 : 0.55);
  const fontScale = header ? 1 : 0.93;
  const [hover, setHover] = useState(null);

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
        {header && (
          <>
            <text x={pL} y={26} fontSize={12.5} fontWeight={700} fill="#8a8fa6" letterSpacing={1}>
              THEO KỲ · ĐVT: TỶ VND (CỘT) &amp; SỐ GD (ĐƯỜNG)
            </text>
            <rect x={cW - pR - 200} y={16} width={12} height={12} fill={accent} opacity={0.85} rx={2} />
            <text x={cW - pR - 183} y={26} fontSize={12} fill="#c8ccd9">GTGD (tỷ)</text>
            <line x1={cW - pR - 98} x2={cW - pR - 78} y1={22} y2={22} stroke="#fbbf24" strokeWidth={2.4} />
            <circle cx={cW - pR - 88} cy={22} r={3.5} fill="#fbbf24" />
            <text x={cW - pR - 72} y={26} fontSize={12} fill="#c8ccd9">SLGD</text>
          </>
        )}
        <line x1={pL} x2={cW - pR} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={1} />
        {gtgd.map((v, i) => {
          const bh = Math.max(1, pT + iH - barY(v));
          const labelInside = bh > (header ? 32 : 28);
          const ly = labelInside ? barY(v) + (header ? 16 : 14) : pT + iH + (header ? 14 : 13);
          const lc = labelInside ? "#ffffff" : "#a7abbe";
          return (
            <g key={"b" + i}>
              <rect x={barX(i)} y={barY(v)} width={barW} height={bh} fill={accent} opacity={hover === i ? 1 : 0.9} rx={4} style={{ transition: "opacity 0.15s" }} />
              {v > 0 && (
                <text x={barX(i) + barW / 2} y={ly} fontSize={11.5 * fontScale} fontWeight={800} fill={lc} textAnchor="middle" className="mono">
                  {v >= 1 ? v.toFixed(1) : (v * 1000).toFixed(0) + "tr"}
                </text>
              )}
            </g>
          );
        })}
        <polyline fill="none" stroke="#fbbf24" strokeWidth={header ? 2.6 : 2.4} strokeLinecap="round" strokeLinejoin="round" points={slgd.map((v, i) => `${lineX(i)},${lineY(v)}`).join(" ")} />
        {slgd.map((v, i) => (v > 0 ? <circle key={"d" + i} cx={lineX(i)} cy={lineY(v)} r={hover === i ? (header ? 5.5 : 5) : (header ? 4 : 3.5)} fill="#fbbf24" stroke="#0a0b12" strokeWidth={header ? 1.5 : 1.2} style={{ transition: "r 0.15s" }} /> : null))}
        {slgd.map((v, i) => (v > 0 ? (
          <text key={"l" + i} x={lineX(i)} y={lineY(v) - (header ? 11 : 9)} fontSize={11.5 * fontScale} fontWeight={700} fill="#fbbf24" textAnchor="middle" className="mono">
            {vnInt(v)}
          </text>
        ) : null))}
        {labels.map((w, i) => (
          <text key={"x" + i} x={lineX(i)} y={cH - (header ? 14 : 12)} fontSize={11.5 * fontScale} fill="#a7abbe" textAnchor="middle" fontWeight={600}>
            {w}
          </text>
        ))}
        {labels.map((_, i) => (
          <rect
            key={"h" + i}
            x={pL + step * i}
            y={pT}
            width={step}
            height={iH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>
      {hover != null && (
        <ChartTooltip x={(lineX(hover) / cW) * 100} y={(Math.min(barY(gtgd[hover]), lineY(slgd[hover])) / cH) * 100}>
          <div style={{ fontWeight: 700, color: "#8a8fa6", fontSize: 10.5 }}>{labels[hover]}</div>
          <div style={{ color: accent, fontWeight: 800 }}>GTGD: {vnTy(gtgd[hover])} tỷ</div>
          <div style={{ color: "#fbbf24", fontWeight: 800 }}>SLGD: {vnInt(slgd[hover])}</div>
        </ChartTooltip>
      )}
    </div>
  );
}
