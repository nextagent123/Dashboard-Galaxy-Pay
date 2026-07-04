// Monthly stacked bar chart (GTGD by customer) — used on both OTA and Loa
// pages, each month's total labeled on top.
export default function StackedMonthlyChart({ months, customers, valueKey = "gtgd" }) {
  const tW = 900, tH = 260, tPL = 40, tPR = 20, tPT = 30, tPB = 42;
  const tIW = tW - tPL - tPR, tIH = tH - tPT - tPB;
  const monthTotals = months.map((_, mi) => customers.reduce((s, c) => s + c[valueKey][mi], 0));
  const monthMax = Math.max(...monthTotals) * 1.15 || 1;
  const stepM = tIW / months.length;
  const barMW = stepM * 0.6;

  return (
    <svg viewBox={`0 0 ${tW} ${tH}`} width="100%" style={{ display: "block" }}>
      <line x1={tPL} x2={tW - tPR} y1={tPT + tIH} y2={tPT + tIH} stroke="#3a3f52" strokeWidth={1} />
      {months.map((m, mi) => {
        const xb = tPL + mi * stepM + (stepM - barMW) / 2;
        let stackY = tPT + tIH;
        const isEmpty = monthTotals[mi] === 0;
        const segs = customers.map((c) => {
          const v = c[valueKey][mi];
          const h = (v / monthMax) * tIH;
          stackY -= h;
          return <rect key={c.name} x={xb} y={stackY} width={barMW} height={h} fill={c.color} opacity={0.9} />;
        });
        return (
          <g key={mi}>
            {segs}
            {!isEmpty && <text x={xb + barMW / 2} y={stackY - 6} fontSize={11} fill="#ecedf5" fontWeight={700} textAnchor="middle" className="mono">{monthTotals[mi].toFixed(1)}</text>}
            <text x={xb + barMW / 2} y={tH - 16} fontSize={11.5} fill={isEmpty ? "#565a6e" : "#8a8fa6"} textAnchor="middle" fontWeight={600}>{m}</text>
          </g>
        );
      })}
    </svg>
  );
}
