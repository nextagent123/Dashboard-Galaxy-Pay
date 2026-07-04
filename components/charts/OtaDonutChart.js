// Cumulative start angle for each slice, computed up front (no mutation
// during the render map — just a running-total reduce).
function sliceAngles(customers, grandGTGD) {
  let cursor = -Math.PI / 2;
  return customers.map((c) => {
    const pct = c.totalGtgd / grandGTGD;
    const a0 = cursor;
    const a1 = a0 + pct * Math.PI * 2;
    cursor = a1;
    return { a0, a1, pct };
  });
}

export default function OtaDonutChart({ customers, grandGTGD }) {
  const donutR = 78, donutIR = 52, donutCX = 100, donutCY = 100;
  const angles = sliceAngles(customers, grandGTGD);
  const slices = customers.map((c, i) => {
    const { a0, a1, pct } = angles[i];
    const large = pct > 0.5 ? 1 : 0;
    const x0 = donutCX + donutR * Math.cos(a0), y0 = donutCY + donutR * Math.sin(a0);
    const x1 = donutCX + donutR * Math.cos(a1), y1 = donutCY + donutR * Math.sin(a1);
    const xi0 = donutCX + donutIR * Math.cos(a1), yi0 = donutCY + donutIR * Math.sin(a1);
    const xi1 = donutCX + donutIR * Math.cos(a0), yi1 = donutCY + donutIR * Math.sin(a0);
    const d = `M ${x0} ${y0} A ${donutR} ${donutR} 0 ${large} 1 ${x1} ${y1} L ${xi0} ${yi0} A ${donutIR} ${donutIR} 0 ${large} 0 ${xi1} ${yi1} Z`;
    return <path key={c.name} d={d} fill={c.color} opacity={0.92} />;
  });

  return (
    <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 220, display: "block" }}>
      {slices}
      <text x={100} y={96} fontSize={11} fill="#8a8fa6" textAnchor="middle">Tổng GTGD</text>
      <text x={100} y={114} fontSize={18} fontWeight={800} fill="#ecedf5" textAnchor="middle" className="mono">{grandGTGD.toFixed(0)} Tỷ</text>
    </svg>
  );
}
