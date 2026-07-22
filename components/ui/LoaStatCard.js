// Device/signal-flavored KPI card for the Loa thanh toán report: icon badge
// with a soft radiating glow instead of the OTA page's ticket-stub motif.
export default function LoaStatCard({ icon, label, val, sub, accent }) {
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
      <div style={{ position: "absolute", top: -40, right: -40, width: 100, height: 100, borderRadius: "50%", background: accent, opacity: 0.14, filter: "blur(20px)" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, position: "relative" }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${accent}1e`, flexShrink: 0 }}>
          {icon}
        </span>
        <span style={{ fontSize: 10.5, color: "#8a8fa6", letterSpacing: 1.1, fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div className="mono" style={{ fontSize: 27, fontWeight: 800, color: "#ecedf5", letterSpacing: -0.5, position: "relative" }}>{val}</div>
      {sub && <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 4, position: "relative" }}>{sub}</div>}
    </div>
  );
}
