// Horizontal ranked bar list — leaderboard style (e.g. top CTV by revenue).
// Pure presentational: rows = [{ label, value, valueStr }], sorted by caller.
export default function RankedBarList({ rows, color = "#7c6cff", onSelect }) {
  const maxV = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r, i) => (
        <div
          key={r.label}
          onClick={onSelect ? () => onSelect(r.label) : undefined}
          style={{ display: "grid", gridTemplateColumns: "22px 1fr auto", alignItems: "center", gap: 10, cursor: onSelect ? "pointer" : "default" }}
        >
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "#565a6e" }}>{i + 1}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#c9cbd8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
            <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.max((r.value / maxV) * 100, 2)}%`, borderRadius: 4, background: color }} />
            </div>
          </div>
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "#ecedf5", whiteSpace: "nowrap" }}>{r.valueStr}</span>
        </div>
      ))}
    </div>
  );
}
