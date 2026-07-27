export default function DashboardLoading() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh",
    }}>
      <div style={{
        width: 36, height: 36, border: "3px solid rgba(124,108,255,0.2)",
        borderTopColor: "#7c6cff", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
