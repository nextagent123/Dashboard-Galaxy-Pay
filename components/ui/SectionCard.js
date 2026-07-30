export default function SectionCard({ title, subtitle, icon, right, children, style, dark = false }) {
  return (
    <section className="card" style={{ background: dark ? "var(--surface-hover)" : undefined, borderColor: dark ? "var(--border-soft)" : undefined, ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: title ? 20 : 0 }}>
          {title && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: -0.2 }}>{title}</h2>
                {subtitle && <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 3 }}>{subtitle}</div>}
              </div>
            </div>
          )}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
