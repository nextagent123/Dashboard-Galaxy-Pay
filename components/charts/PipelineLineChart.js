import { vnTy } from "@/lib/format";

// Runrate progression line: prevYear anchor + cumulative YTD monthly points,
// against a dashed Target reference line (with a Gap bracket when short).
export default function PipelineLineChart({ monthlyTargets, prevYear, runrate, target, unit, color }) {
  const chartW = 400, chartH = 175, padX = 28, padY = 30;
  const monthly = [{ x: 0, v: prevYear * 0.42 }];
  let cum = 0;
  monthlyTargets.forEach((v) => {
    cum += v;
    monthly.push({ x: monthly.length, v: cum });
  });
  const maxV = target;
  const xScale = (i) => padX + (i / (monthly.length - 1)) * (chartW - 2 * padX);
  const yScale = (v) => chartH - padY - (Math.min(v, maxV) / maxV) * (chartH - 2 * padY);
  const pts = monthly.map((p, i) => `${xScale(i).toFixed(1)},${yScale(p.v).toFixed(1)}`).join(" ");
  const targetY = yScale(target);
  const runrateY = yScale(runrate);
  const lastX = xScale(monthly.length - 1);
  const lastY = yScale(monthly[monthly.length - 1].v);
  const gap = target - runrate;

  return (
    <svg viewBox="0 0 400 200" width="100%" style={{ overflow: "visible", display: "block" }}>
      <line x1={padX} x2={chartW - padX - 8} y1={targetY} y2={targetY} stroke={color} strokeWidth={1.6} strokeDasharray="7,5" opacity={0.9} />
      <text x={chartW - padX - 12} y={targetY - 8} fontSize={15} fill={color} textAnchor="end" fontWeight={700} style={{ letterSpacing: "0.2px" }}>
        Target 2026: {vnTy(target)} {unit}
      </text>
      {gap > 0 && (
        <g>
          <line x1={chartW - padX - 6} x2={chartW - padX - 6} y1={targetY} y2={runrateY} stroke={color} strokeWidth={1.4} />
          <polygon points={`${chartW - padX - 10},${targetY + 3} ${chartW - padX - 2},${targetY + 3} ${chartW - padX - 6},${targetY - 3}`} fill={color} />
          <polygon points={`${chartW - padX - 10},${runrateY - 3} ${chartW - padX - 2},${runrateY - 3} ${chartW - padX - 6},${runrateY + 3}`} fill={color} />
          <text x={chartW - padX - 14} y={(targetY + runrateY) / 2 + 4} fontSize={14} fill="#c084fc" textAnchor="end" fontWeight={700} fontStyle="italic">
            Gap: {vnTy(Math.abs(gap))} {unit}
          </text>
        </g>
      )}
      <polyline fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" points={pts} />
      <circle cx={lastX} cy={lastY} r={4.5} fill={color} stroke="#0a0b12" strokeWidth={1.5} />
      <text x={padX} y={chartH - 6} fontSize={15} fill="#ecedf5" fontWeight={600}>
        <tspan>Current Run Rate: </tspan>
        <tspan fill={color} fontWeight={800}>{vnTy(runrate)} {unit}</tspan>
      </text>
      <text x={padX} y={chartH + 12} fontSize={13} fill="#8a8fa6">
        (so với {vnTy(prevYear)} {unit} năm 2025)
      </text>
    </svg>
  );
}
