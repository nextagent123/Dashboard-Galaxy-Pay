// Simple flex/div bar chart (no SVG) — ported from the home/company monthly
// trend markup: value label above, bar, month label below.
export default function BarTrendChart({ data, heightPx = 220, gap = "10px", maxBarWidth = 46, labelPrefix = "", valueFontSize = 10.5, labelFontSize = 11 }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap, height: heightPx, marginTop: 24, paddingTop: 10 }} className="chart-tall">
      {data.map((b, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
          <span className="mono" style={{ fontSize: valueFontSize, fontWeight: 600, color: b.valColor }}>{b.value}</span>
          <div
            style={{
              width: "100%",
              maxWidth: maxBarWidth,
              height: b.height,
              borderRadius: "8px 8px 4px 4px",
              background: b.bar,
              transition: "height 0.5s cubic-bezier(.4,0,.2,1)",
            }}
          />
          <span style={{ fontSize: labelFontSize, color: b.labelColor, fontWeight: b.labelWeight }}>{labelPrefix}{b.label}</span>
        </div>
      ))}
    </div>
  );
}
