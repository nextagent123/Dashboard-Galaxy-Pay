// Small 12-month bar chart on each player card: faint "kế hoạch" bar behind a
// solid "thực tế" bar, per month.
export default function MiniMonthChart({ kpi, actual, color }) {
  const cW = 260, cH = 90, pT = 8, pB = 20;
  const iH = cH - pT - pB;
  const N = kpi.length;
  const maxVal = Math.max(...kpi.filter((v) => v != null), ...actual.filter((v) => v != null), 1);
  const step = cW / N;
  const barW = step * 0.7;

  return (
    <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
      <line x1={0} x2={cW} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={0.8} />
      {Array.from({ length: N }).map((_, i) => {
        const kv = kpi[i], av = actual[i];
        const kx = i * step + (step - barW) / 2;
        return (
          <g key={i}>
            {kv != null && kv > 0 && <rect x={kx} y={pT + iH - (kv / maxVal) * iH} width={barW} height={(kv / maxVal) * iH} fill={color} opacity={0.18} rx={2} />}
            {av != null && av > 0 && <rect x={kx} y={pT + iH - (av / maxVal) * iH} width={barW} height={(av / maxVal) * iH} fill={color} opacity={0.95} rx={2} />}
            <text x={i * step + step / 2} y={cH - 5} fontSize={9} fill="#5b5f74" textAnchor="middle" fontWeight={600}>T{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}
