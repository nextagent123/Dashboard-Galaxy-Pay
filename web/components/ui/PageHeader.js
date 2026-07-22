export function Eyebrow({ children }) {
  return <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1.6, color: "#8a7dff" }}>{children}</div>;
}

export function EyebrowWide({ children }) {
  return <div style={{ fontSize: 12, color: "#8a8fa6", letterSpacing: 2, fontWeight: 700 }}>{children}</div>;
}

// Home / Company / Khối style header (h1 27px).
export function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 style={{ margin: "6px 0 0", fontSize: 27, fontWeight: 800, letterSpacing: -0.4 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: "#8a8fa6", marginTop: 5 }}>{subtitle}</div>}
      </div>
      {right}
    </header>
  );
}

// Wider report-style header (h1 34px) used by OTA/Loa/Product/Personal/Pipeline.
export function ReportHeader({ eyebrow, title, subtitle, right }) {
  return (
    <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
      <div>
        <EyebrowWide>{eyebrow}</EyebrowWide>
        <h1 style={{ fontSize: 34, margin: "6px 0 0", letterSpacing: -0.5, textWrap: "balance" }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: "#8a8fa6", marginTop: 5 }}>{subtitle}</div>}
      </div>
      {right}
    </header>
  );
}

export function DateBadge({ children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "9px 14px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        fontSize: 13,
        color: "#c9cbd8",
        whiteSpace: "nowrap",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8a8fa6" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4.5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 2.5v4M16 2.5v4" />
      </svg>
      {children}
    </div>
  );
}
