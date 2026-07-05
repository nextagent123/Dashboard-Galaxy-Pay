import Icon from "./Icon";

// Boarding-pass-flavored KPI card: icon badge + dashed "ticket stub" accent line.
export default function TicketStatCard({ icon, iconBg, iconColor, label, val, sub, accent }) {
  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 14,
        padding: "18px 20px",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `repeating-linear-gradient(90deg, ${accent}, ${accent} 8px, transparent 8px, transparent 16px)`, opacity: 0.7 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: iconBg, flexShrink: 0 }}>
          <Icon paths={icon} size={16} stroke={iconColor} strokeWidth={2} />
        </span>
        <span style={{ fontSize: 10.5, color: "#8a8fa6", letterSpacing: 1.1, fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div className="mono" style={{ fontSize: 27, fontWeight: 800, color: "#ecedf5", letterSpacing: -0.5 }}>{val}</div>
      {sub && <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
