// Stacked GTGD bars (left axis) + total-customer line (right axis).
export default function LoaComboTrend({ months, customers }) {
  const tW = 900, tH = 300, tPL = 48, tPR = 48, tPT = 32, tPB = 50;
  const tIW = tW - tPL - tPR, tIH = tH - tPT - tPB;
  const monthTotalsGT = months.map((_, mi) => customers.reduce((s, c) => s + c.gtgd[mi], 0));
  const monthTotalsC = months.map((_, mi) => customers.reduce((s, c) => s + c.cust[mi], 0));
  const monthMaxGT = Math.max(...monthTotalsGT) * 1.2 || 1;
  const monthMaxC = Math.max(...monthTotalsC) * 1.2 || 1;
  const stepM = tIW / months.length;
  const barMW = stepM * 0.6;
  const lineX = (mi) => tPL + mi * stepM + stepM / 2;
  const lineY = (v) => tPT + tIH - (v / monthMaxC) * tIH * 0.7;
  const linePts = monthTotalsC.map((v, mi) => (v > 0 ? `${lineX(mi)},${lineY(v)}` : null)).filter(Boolean).join(" ");

  return (
    <svg viewBox={`0 0 ${tW} ${tH}`} width="100%" style={{ display: "block" }}>
      <line x1={tPL} x2={tW - tPR} y1={tPT + tIH} y2={tPT + tIH} stroke="#3a3f52" strokeWidth={1} />
      <text x={tPL} y={20} fontSize={11} fill="#8a8fa6">GTGD (Tỷ) — trục trái</text>
      <text x={tW - tPR} y={20} fontSize={11} fill="#fbbf24" textAnchor="end">Số KH (line) — trục phải</text>
      {months.map((m, mi) => {
        const xb = tPL + mi * stepM + (stepM - barMW) / 2;
        let stackY = tPT + tIH;
        const isEmpty = monthTotalsGT[mi] === 0;
        const segs = customers.map((c) => {
          const v = c.gtgd[mi];
          const h = (v / monthMaxGT) * tIH;
          stackY -= h;
          return <rect key={c.name} x={xb} y={stackY} width={barMW} height={h} fill={c.color} opacity={0.9} />;
        });
        return (
          <g key={mi}>
            {segs}
            {!isEmpty && <text x={xb + barMW / 2} y={stackY - 6} fontSize={10.5} fill="#ecedf5" fontWeight={700} textAnchor="middle" className="mono">{monthTotalsGT[mi].toFixed(1)}</text>}
            <text x={xb + barMW / 2} y={tH - 24} fontSize={11.5} fill={isEmpty ? "#565a6e" : "#8a8fa6"} textAnchor="middle" fontWeight={600}>{m}</text>
          </g>
        );
      })}
      <polyline fill="none" stroke="#fbbf24" strokeWidth={2.4} points={linePts} strokeLinejoin="round" strokeLinecap="round" />
      {monthTotalsC.map((v, mi) => (v > 0 ? <circle key={mi} cx={lineX(mi)} cy={lineY(v)} r={3.5} fill="#fbbf24" /> : null))}
    </svg>
  );
}
