// Horizontal bar: total GTGD per customer, with SLGD annotated inside the bar.
export default function OtaBarCompare({ customers }) {
  const cW = 900, cH = 280, pL = 140, pR = 40, pT = 20, pB = 40;
  const iW = cW - pL - pR, iH = cH - pT - pB;
  const maxG = Math.max(...customers.map((c) => c.totalGtgd));
  const rowH = iH / customers.length;

  return (
    <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
      <line x1={pL} x2={cW - pR} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={1} />
      {customers.map((c, i) => {
        const y = pT + i * rowH + rowH * 0.15;
        const bh = rowH * 0.7;
        const bw = (c.totalGtgd / maxG) * iW;
        // SLGD label only fits inside the bar once it's wide enough; otherwise
        // fold both numbers into the single label after the bar so short bars
        // (small customers) don't get overlapping/garbled text.
        const slgdInside = bw > 70;
        return (
          <g key={c.name}>
            <text x={pL - 12} y={y + bh / 2 + 5} fontSize={13} fill="#ecedf5" textAnchor="end" fontWeight={600}>{c.name}</text>
            <rect x={pL} y={y} width={bw} height={bh} fill={c.color} rx={5} opacity={0.92} />
            {slgdInside && (
              <text x={pL + 8} y={y + bh / 2 + 5} fontSize={11.5} fill="#0a0b12" fontWeight={700} className="mono">{c.totalSlgd.toLocaleString("vi-VN")} GD</text>
            )}
            <text x={pL + bw + 8} y={y + bh / 2 + 5} fontSize={13} fill={c.color} fontWeight={800} textAnchor="start" className="mono">
              {c.totalGtgd.toFixed(1)} Tỷ{!slgdInside ? ` · ${c.totalSlgd.toLocaleString("vi-VN")} GD` : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
