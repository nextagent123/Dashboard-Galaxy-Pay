// Khối Kinh doanh "Thực đạt vs Kế hoạch" chart: dashed ghost plan bar + solid
// actual bar, with a % completion badge floating above each pair.
export default function PlanActualBarChart({ data, heightPx = 280 }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: heightPx, paddingTop: 22 }} className="chart-tall">
      {data.map((b, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end", position: "relative" }}>
          <div style={{ position: "relative", display: "flex", gap: 3, alignItems: "flex-end", height: "100%", width: "100%", justifyContent: "center" }}>
            <span
              className="mono"
              style={{
                position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                fontSize: 9.5, fontWeight: 700, padding: "2px 6px", borderRadius: 5,
                color: b.pctColor, background: b.pctBg, whiteSpace: "nowrap",
              }}
            >
              {b.pct}
            </span>
            <div style={{ width: 22, height: b.planH, borderRadius: "6px 6px 3px 3px", background: "rgba(124,108,255,0.16)", border: "1px dashed rgba(195,185,255,0.5)" }} />
            <div style={{ width: 22, height: b.actH, borderRadius: "6px 6px 3px 3px", background: b.actBg }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span className="mono" style={{ fontSize: 9.5, color: b.actColor, fontWeight: 700 }}>{b.actV}</span>
            <span style={{ fontSize: 11, color: b.labelColor, fontWeight: b.labelWeight }}>T{b.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
