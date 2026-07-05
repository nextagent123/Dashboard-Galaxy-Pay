// Compact KPI strip card used on OTA / Loa / Product / Personal-KPI pages.
export default function StatCard({ label, val, sub, deltaStr, deltaColor }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "18px 20px",
        minHeight: 108,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        justifyContent: sub || deltaStr ? undefined : "center",
      }}
    >
      <div style={{ fontSize: 11, color: "#8a8fa6", letterSpacing: 1.2, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 800, color: "#ecedf5", marginTop: 2, letterSpacing: -0.5 }}>{val}</div>
      {sub && <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 2 }}>{sub}</div>}
      {deltaStr && <div style={{ fontSize: 11, color: deltaColor, fontWeight: 600, marginTop: 2 }}>{deltaStr}</div>}
    </div>
  );
}
