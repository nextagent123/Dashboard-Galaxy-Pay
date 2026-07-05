// Grouped bar chart comparing % KPI achievement across people (3 bars/person),
// with a dashed 100% "Đạt KPI" reference line.
export default function GroupedCompareChart({ people }) {
  const cW = 900, cH = 320, pL = 44, pR = 24, pT = 40, pB = 62;
  const iW = cW - pL - pR, iH = cH - pT - pB;
  const groupW = iW / people.length;
  const barW = 52, barGap = 10;
  const groupInnerW = 3 * barW + 2 * barGap;
  const yMax = 120;
  const yBar = (v) => pT + iH - (Math.min(v, yMax) / yMax) * iH;

  return (
    <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
      <line x1={pL} x2={cW - pR} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={1} />
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={pL} x2={cW - pR} y1={yBar(g)} y2={yBar(g)} stroke={g === 100 ? "#e11d48" : "#3a3f52"} strokeWidth={g === 100 ? 1.4 : 1} strokeDasharray={g === 100 ? "6,4" : "3,4"} opacity={g === 100 ? 0.85 : 0.5} />
          <text x={pL - 8} y={yBar(g) + 4} fontSize={11} fill="#8a8fa6" textAnchor="end">{g}%</text>
          {g === 100 && <text x={cW - pR - 4} y={yBar(g) - 6} fontSize={10.5} fill="#e11d48" textAnchor="end" fontWeight={700}>Đạt KPI</text>}
        </g>
      ))}
      {people.map((person, gi) => {
        const gx = pL + gi * groupW + (groupW - groupInnerW) / 2;
        return (
          <g key={gi}>
            {person.metricRows.map((m, mi) => {
              const bx = gx + mi * (barW + barGap);
              const val = m.pct == null ? 0 : m.pct;
              const by = yBar(val);
              const bh = pT + iH - by;
              const isEmpty = m.pct == null;
              return (
                <g key={mi}>
                  {isEmpty ? (
                    <rect x={bx} y={pT + iH - 8} width={barW} height={8} fill="none" stroke={m.color} strokeWidth={1.2} strokeDasharray="3,3" opacity={0.4} rx={3} />
                  ) : (
                    <rect x={bx} y={by} width={barW} height={Math.max(bh, 2)} fill={m.color} rx={3} opacity={0.92} />
                  )}
                  {!isEmpty && <text x={bx + barW / 2} y={by - 8} fontSize={12} fill={m.color} fontWeight={800} textAnchor="middle" className="mono">{m.pctStr}</text>}
                  {isEmpty && <text x={bx + barW / 2} y={pT + iH - 14} fontSize={11} fill="#565a6e" textAnchor="middle">—</text>}
                  <text x={bx + barW / 2} y={pT + iH + 14} fontSize={9.5} fill={m.color} textAnchor="middle" fontWeight={600}>{m.label}</text>
                </g>
              );
            })}
            <text x={pL + gi * groupW + groupW / 2} y={cH - 24} fontSize={12.5} fill="#ecedf5" textAnchor="middle" fontWeight={700}>{person.name}</text>
            <text x={pL + gi * groupW + groupW / 2} y={cH - 10} fontSize={10.5} fill="#8a8fa6" textAnchor="middle">{person.role}</text>
          </g>
        );
      })}
    </svg>
  );
}
