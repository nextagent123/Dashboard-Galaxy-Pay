"use client";

export default function DashboardError({ error, reset }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", gap: 16, padding: 32,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: "rgba(251,113,133,0.1)", border: "1px solid rgba(251,113,133,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
      }}>!</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Đã xảy ra lỗi</h2>
      <p style={{ fontSize: 13, color: "#8a8fa6", margin: 0, textAlign: "center", maxWidth: 400 }}>
        {error?.message || "Trang gặp sự cố. Vui lòng thử lại."}
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: 8, padding: "10px 20px", border: "none", borderRadius: 10,
          background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}
      >
        Thử lại
      </button>
    </div>
  );
}
