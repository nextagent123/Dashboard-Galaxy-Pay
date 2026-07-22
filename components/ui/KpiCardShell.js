// Shared shell for the "glow blob" KPI cards used on Home / Company / Khối.
// Callers supply the label/icon (header row) and the body underneath.
export default function KpiCardShell({ label, icon, iconBg, glow, children, rise = true }) {
  return (
    <div className={rise ? "kpi-card rise" : "kpi-card"} style={{ "--glow": glow }}>
      <div className="kpi-card__glow" />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#b9bccb" }}>{label}</span>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: iconBg,
          }}
        >
          {icon}
        </span>
      </div>
      {children}
    </div>
  );
}
