export function Eyebrow({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 2,
      color: "#a78bfa",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{
        width: 16, height: 2, borderRadius: 1,
        background: "linear-gradient(90deg, #7c6cff, #a78bfa)",
        display: "inline-block",
      }}/>
      {children}
    </div>
  );
}

export function EyebrowWide({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: 2,
      color: "#a78bfa",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{
        width: 16, height: 2, borderRadius: 1,
        background: "linear-gradient(90deg, #7c6cff, #a78bfa)",
        display: "inline-block",
      }}/>
      {children}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <header style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      gap: 20, flexWrap: "wrap",
      paddingBottom: 20,
      borderBottom: "1px solid rgba(124,108,255,0.1)",
    }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 style={{
          margin: "8px 0 0", fontSize: 28, fontWeight: 800,
          letterSpacing: -0.5,
          background: "linear-gradient(135deg, var(--text-strong) 0%, var(--text) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{title}</h1>
        {subtitle && (
          <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 6, lineHeight: 1.5 }}>
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </header>
  );
}

export function ReportHeader({ eyebrow, title, subtitle, right }) {
  return (
    <header style={{
      display: "flex", alignItems: "flex-end", justifyContent: "space-between",
      gap: 20, flexWrap: "wrap",
      paddingBottom: 20,
      borderBottom: "1px solid rgba(124,108,255,0.1)",
    }}>
      <div>
        <EyebrowWide>{eyebrow}</EyebrowWide>
        <h1 style={{
          fontSize: 32, margin: "8px 0 0",
          letterSpacing: -0.5, textWrap: "balance",
          fontWeight: 800,
          background: "linear-gradient(135deg, var(--text-strong) 0%, var(--text) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>{title}</h1>
        {subtitle && (
          <div style={{ fontSize: 13, color: "var(--text-faint)", marginTop: 6, lineHeight: 1.5 }}>
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </header>
  );
}

export function DateBadge({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px",
      background: "rgba(124,108,255,0.06)",
      border: "1px solid rgba(124,108,255,0.15)",
      borderRadius: 10,
      fontSize: 12.5, fontWeight: 500,
      color: "var(--text-dim)",
      whiteSpace: "nowrap",
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4.5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 2.5v4M16 2.5v4" />
      </svg>
      {children}
    </div>
  );
}
