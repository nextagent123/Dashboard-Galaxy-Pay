// Single-series bar chart with value labels — used for the OTA "Revenue Report" trend.
export default function SimpleBarChart({ labels, values, color = "#fb7185", formatValue }) {
  const cW = 700, cH = 260, pL = 40, pR = 20, pT = 36, pB = 36;
  const iW = cW - pL - pR, iH = cH - pT - pB;
  const maxV = Math.max(...values, 1) * 1.2;
  const n = labels.length;
  const step = iW / n;
  const barW = step * 0.55;
  const y = (v) => pT + iH - (v / maxV) * iH;
  const fmt = formatValue || ((v) => v.toLocaleString("vi-VN"));

  return (
    <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
      <line x1={pL} x2={cW - pR} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={1} />
      {values.map((v, i) => {
        const bx = pL + step * i + (step - barW) / 2;
        const by = y(v);
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={pT + iH - by} fill={color} opacity={0.85} rx={5} />
            <text x={bx + barW / 2} y={by - 10} fontSize={11.5} fontWeight={700} fill={color} textAnchor="middle" className="mono">
              {fmt(v)}
            </text>
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={"x" + i} x={pL + step * i + step / 2} y={cH - 12} fontSize={11.5} fill="#a7abbe" textAnchor="middle" fontWeight={600}>
          {l}
        </text>
      ))}
    </svg>
  );
}
