"use client";

import { useState, useMemo } from "react";
import ChartTooltip from "./ChartTooltip";

function polyFit(ys, degree) {
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const size = degree + 1;
  const m = Array.from({ length: size }, () => new Array(size + 1).fill(0));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      for (let k = 0; k < n; k++) m[r][c] += Math.pow(xs[k], r + c);
    }
    for (let k = 0; k < n; k++) m[r][size] += ys[k] * Math.pow(xs[k], r);
  }
  for (let col = 0; col < size; col++) {
    let pivot = col;
    for (let row = col + 1; row < size; row++) if (Math.abs(m[row][col]) > Math.abs(m[pivot][col])) pivot = row;
    [m[col], m[pivot]] = [m[pivot], m[col]];
    for (let row = col + 1; row < size; row++) {
      const f = m[row][col] / m[col][col];
      for (let j = col; j <= size; j++) m[row][j] -= f * m[col][j];
    }
  }
  const coeffs = new Array(size);
  for (let i = size - 1; i >= 0; i--) {
    coeffs[i] = m[i][size];
    for (let j = i + 1; j < size; j++) coeffs[i] -= m[i][j] * coeffs[j];
    coeffs[i] /= m[i][i];
  }
  return (x) => coeffs.reduce((sum, c, p) => sum + c * Math.pow(x, p), 0);
}

export default function GrowthBarChart({ title, unit, years, h1, fullYear, forecastYear, heightPx = 260 }) {
  const [hover, setHover] = useState(null);

  const max = useMemo(() => Math.max(...fullYear, ...h1), [h1, fullYear]);
  const poly = useMemo(() => polyFit(fullYear, 2), [fullYear]);
  const suffix = unit === "Triệu đồng" ? "m" : "b";

  const svgW = 520;
  const svgH = heightPx;
  const padL = 65;
  const padR = 20;
  const padT = 30;
  const padB = 40;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;
  const ceiling = max * 1.18;

  const groupW = chartW / years.length;
  const barW = groupW * 0.28;
  const barGap = groupW * 0.06;

  const toH = (v) => (v / ceiling) * chartH;
  const toY = (v) => padT + chartH - toH(v);

  const gridLines = 5;
  const gridStep = ceiling / gridLines;

  const trendPoints = years.map((_, i) => {
    const x = padL + i * groupW + groupW / 2;
    const y = toY(poly(i));
    return `${x},${y}`;
  }).join(" ");

  const fmt = (v) => v >= 1000 ? v.toLocaleString("vi-VN") : String(v);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#ecedf5", marginBottom: 6 }}>{title} ({unit})</div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%">
        <defs>
          <linearGradient id={`fg-${title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridLines + 1 }, (_, i) => {
          const val = Math.round(gridStep * i);
          const y = toY(val);
          return (
            <g key={i}>
              <line x1={padL} x2={svgW - padR} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={padL - 8} y={y + 4} textAnchor="end" fill="#6b6f82" fontSize="10" fontFamily="monospace">{fmt(val)}</text>
            </g>
          );
        })}

        {years.map((yr, i) => {
          const cx = padL + i * groupW + groupW / 2;
          const h1Val = h1[i];
          const fyVal = fullYear[i];
          const isForecast = yr === forecastYear;
          const isHovered = hover === i;

          return (
            <g key={yr} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
              {h1Val > 0 && (
                <>
                  <rect
                    x={cx - barW - barGap / 2}
                    y={toY(h1Val)}
                    width={barW}
                    height={toH(h1Val)}
                    rx={4}
                    fill={isHovered ? "rgba(200,175,255,0.5)" : "rgba(180,155,240,0.3)"}
                  />
                  <text x={cx - barW / 2 - barGap / 2} y={toY(h1Val) - 6} textAnchor="middle" fill="#b09de0" fontSize="9" fontWeight="600" fontFamily="monospace">
                    {fmt(h1Val)} {suffix}
                  </text>
                </>
              )}

              <rect
                x={cx + barGap / 2}
                y={toY(fyVal)}
                width={barW}
                height={toH(fyVal)}
                rx={4}
                fill={isForecast ? `url(#fg-${title})` : isHovered ? "rgba(140,100,220,0.95)" : "rgba(120,80,200,0.7)"}
                style={isHovered ? { filter: "brightness(1.2)" } : undefined}
              />
              <text x={cx + barW / 2 + barGap / 2} y={toY(fyVal) - 6} textAnchor="middle" fill={isForecast ? "#a78bfa" : "#c9cbd8"} fontSize="9.5" fontWeight="700" fontFamily="monospace">
                {fmt(fyVal)} {suffix}
              </text>

              <text x={cx} y={svgH - 8} textAnchor="middle" fill="#8a8fa6" fontSize="12" fontWeight="600">{yr}</text>
            </g>
          );
        })}

        <polyline points={trendPoints} fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 8, fontSize: 11, color: "#8a8fa6" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 10, borderRadius: 2, background: "rgba(180,155,240,0.35)", display: "inline-block" }} /> H1
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 14, height: 10, borderRadius: 2, background: "rgba(120,80,200,0.7)", display: "inline-block" }} /> Full year
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 20, height: 0, borderTop: "2px dashed #f87171", display: "inline-block", opacity: 0.6 }} /> Poly. (Full year)
        </span>
      </div>

      {hover != null && (
        <ChartTooltip x={((hover + 0.5) / years.length) * 100} y={0}>
          <div style={{ fontWeight: 700, color: "#8a8fa6", fontSize: 10.5 }}>{years[hover]}</div>
          <div style={{ color: "#b09de0" }}>H1: <b>{fmt(h1[hover])} {suffix}</b></div>
          <div style={{ color: "#c3b9ff" }}>Full Year: <b>{fmt(fullYear[hover])} {suffix}</b>{years[hover] === forecastYear ? " (F)" : ""}</div>
        </ChartTooltip>
      )}
    </div>
  );
}
