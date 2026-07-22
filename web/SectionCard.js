// Generic bordered panel used to wrap chart/table sections across pages.
export default function SectionCard({ title, subtitle, right, children, style, dark = false }) {
  return (
    <section className="card" style={{ background: dark ? "rgba(255,255,255,0.03)" : undefined, borderColor: dark ? "rgba(255,255,255,0.06)" : undefined, ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: title ? 20 : 0 }}>
          {title && (
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h2>
              {subtitle && <div style={{ fontSize: 12, color: "#8a8fa6", marginTop: 4 }}>{subtitle}</div>}
            </div>
          )}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
