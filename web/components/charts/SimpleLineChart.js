import { vnInt } from "@/lib/format";

// Single-series line chart with area fill and value labels — used for the
// OTA "Booking Count" trend.
export default function SimpleLineChart({ labels, values, color = "#fb7185" }) {
  const cW = 700, cH = 260, pL = 36, pR = 20, pT = 36, pB = 36;
  const iW = cW - pL - pR, iH = cH - pT - pB;
  const maxV = Math.max(...values, 1) * 1.2;
  const n = labels.length;
  const step = n > 1 ? iW / (n - 1) : 0;
  const x = (i) => pL + step * i;
  const y = (v) => pT + iH - (v / maxV) * iH;
  const linePts = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPts = `${x(0)},${pT + iH} ` + linePts + ` ${x(n - 1)},${pT + iH}`;

  return (
    <svg viewBox={`0 0 ${cW} ${cH}`} width="100%" style={{ display: "block" }}>
      <line x1={pL} x2={cW - pR} y1={pT + iH} y2={pT + iH} stroke="#3a3f52" strokeWidth={1} />
      <polygon points={areaPts} fill={color} opacity={0.12} />
      <polyline fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" points={linePts} />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={4} fill={color} stroke="#0a0b12" strokeWidth={1.3} />
      ))}
      {values.map((v, i) => (
        <text key={"l" + i} x={x(i)} y={y(v) - 12} fontSize={12} fontWeight={700} fill={color} textAnchor="middle" className="mono">
          {vnInt(v)}
        </text>
      ))}
      {labels.map((l, i) => (
        <text key={"x" + i} x={x(i)} y={cH - 12} fontSize={11.5} fill="#a7abbe" textAnchor="middle" fontWeight={600}>
          {l}
        </text>
      ))}
    </svg>
  );
}
