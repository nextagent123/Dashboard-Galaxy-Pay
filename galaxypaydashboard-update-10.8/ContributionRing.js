// Circular progress ring (donut) — premium way to show a % contribution.
// The arc animates from 0 on mount via CSS transition on strokeDashoffset.
export default function ContributionRing({ pct, color, size = 104, stroke = 10, sub, big }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(pct, 100));
  const offset = c * (1 - clamped / 100);
  const gid = `ring-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.65" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="mono" style={{ fontSize: big ? size * 0.26 : size * 0.22, fontWeight: 800, color: "#ecedf5", letterSpacing: -0.5, lineHeight: 1 }}>
          {clamped.toFixed(clamped >= 10 ? 0 : 1)}%
        </span>
        {sub && <span style={{ fontSize: size * 0.09, color: "#8a8fa6", marginTop: 3, fontWeight: 600 }}>{sub}</span>}
      </div>
    </div>
  );
}
