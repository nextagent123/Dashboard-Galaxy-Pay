"use client";

import { useState } from "react";
import ChartTooltip from "./ChartTooltip";

// Simple flex/div bar chart (no SVG) — ported from the home/company monthly
// trend markup: value label above, bar, month label below.
export default function BarTrendChart({ data, heightPx = 220, gap = "10px", maxBarWidth = 46, labelPrefix = "", valueFontSize = 10.5, labelFontSize = 11 }) {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap, height: heightPx, marginTop: 24, paddingTop: 10 }} className="chart-tall">
        {data.map((b, i) => (
          <div
            key={i}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end", cursor: "pointer" }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="mono" style={{ fontSize: valueFontSize, fontWeight: 600, color: b.valColor }}>{b.value}</span>
            <div
              style={{
                width: "100%",
                maxWidth: maxBarWidth,
                height: b.height,
                borderRadius: "8px 8px 4px 4px",
                background: b.bar,
                transition: "height 0.5s cubic-bezier(.4,0,.2,1), filter 0.15s, transform 0.15s",
                filter: hover === i ? "brightness(1.25)" : "none",
                transform: hover === i ? "scaleX(1.08)" : "none",
              }}
            />
            <span style={{ fontSize: labelFontSize, color: b.labelColor, fontWeight: b.labelWeight }}>{labelPrefix}{b.label}</span>
          </div>
        ))}
      </div>
      {hover != null && (
        <ChartTooltip x={((hover + 0.5) / data.length) * 100} y={0}>
          <div style={{ fontWeight: 700, color: "#8a8fa6", fontSize: 10.5 }}>{labelPrefix}{data[hover].label}</div>
          <div style={{ color: data[hover].valColor, fontWeight: 800 }}>{data[hover].value}</div>
        </ChartTooltip>
      )}
    </div>
  );
}
