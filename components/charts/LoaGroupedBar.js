// Horizontal grouped bar: customer count vs loa count per segment.
export default function LoaGroupedBar({ customers }) {
  const cW = 900, cH = 300, pL = 180, pR = 90, pT = 30, pB = 30;
  const iW = cW - pL - pR, iH = cH - pT - pB;
  const maxL = Math.max(...customers.map((c) => Math.max(c.lastLoas, c.lastCust)));
  const rowH = iH / customers.length;

  return (
    <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
      <line x1={pL} x2={cW - pR} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={1} />
      {customers.map((c, i) => {
        const yBase = pT + i * rowH;
        const bh = (rowH - 6) / 2;
        const wCust = (c.lastCust / maxL) * iW;
        const wLoas = (c.lastLoas / maxL) * iW;
        return (
          <g key={c.name}>
            <text x={pL - 12} y={yBase + rowH / 2 + 3} fontSize={13} fill="#ecedf5" textAnchor="end" fontWeight={700}>{c.name}</text>
            <text x={pL - 12} y={yBase + rowH / 2 + 18} fontSize={10.5} fill={c.color} textAnchor="end">{c.avgLoaStr} loa/KH</text>
            <rect x={pL} y={yBase + 4} width={wCust} height={bh} fill={c.color} opacity={0.6} rx={3} />
            <text x={pL + wCust + 6} y={yBase + 4 + bh / 2 + 4} fontSize={11} fill="#c8ccd9" fontWeight={600} className="mono">{c.lastCustStr} KH</text>
            <rect x={pL} y={yBase + 8 + bh} width={wLoas} height={bh} fill={c.color} opacity={1} rx={3} />
            <text x={pL + wLoas + 6} y={yBase + 8 + bh + bh / 2 + 4} fontSize={11} fill={c.color} fontWeight={700} className="mono">{c.lastLoasStr} loa</text>
          </g>
        );
      })}
    </svg>
  );
}
