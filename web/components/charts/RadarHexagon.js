// 6-axis radar/hexagon used on the personal-KPI player cards.
export default function RadarHexagon({ axes, accent }) {
  const hR = 88, hcx = 110, hcy = 105;
  const axPts = axes.map((a, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 3;
    const outer = { x: hcx + hR * Math.cos(angle), y: hcy + hR * Math.sin(angle) };
    const inner = { x: hcx + ((hR * a.val) / 100) * Math.cos(angle), y: hcy + ((hR * a.val) / 100) * Math.sin(angle) };
    const labelPos = { x: hcx + (hR + 18) * Math.cos(angle), y: hcy + (hR + 18) * Math.sin(angle) };
    return { ...a, outer, inner, labelPos, angle };
  });
  const outerPoly = axPts.map((p) => `${p.outer.x},${p.outer.y}`).join(" ");
  const innerPoly = axPts.map((p) => `${p.inner.x},${p.inner.y}`).join(" ");

  return (
    <svg viewBox="0 0 220 220" width="100%" style={{ display: "block" }}>
      <polygon fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth={1} points={outerPoly} />
      {[0.25, 0.5, 0.75].map((k, gi) => (
        <polygon
          key={"g" + gi}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={0.8}
          points={axPts.map((p) => `${hcx + hR * k * Math.cos(p.angle)},${hcy + hR * k * Math.sin(p.angle)}`).join(" ")}
        />
      ))}
      {axPts.map((p, i) => (
        <line key={"ax" + i} x1={hcx} y1={hcy} x2={p.outer.x} y2={p.outer.y} stroke="rgba(255,255,255,0.08)" strokeWidth={0.8} />
      ))}
      <polygon fill={accent} fillOpacity={0.22} stroke={accent} strokeWidth={2} points={innerPoly} />
      {axPts.map((p, i) => (
        <circle key={"d" + i} cx={p.inner.x} cy={p.inner.y} r={2.8} fill={accent} />
      ))}
      {axPts.map((p, i) => (
        <text key={"lb" + i} x={p.labelPos.x} y={p.labelPos.y + 4} fontSize={10.5} fill="#a7abbe" textAnchor="middle" fontWeight={600}>
          {p.label}
        </text>
      ))}
      {axPts.map((p, i) => (
        <text key={"v" + i} x={p.inner.x} y={p.inner.y - 6} fontSize={9.5} fill={accent} textAnchor="middle" fontWeight={800} className="mono">
          {p.val.toFixed(0)}
        </text>
      ))}
    </svg>
  );
}
