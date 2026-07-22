"use client";

import { useState } from "react";
import { vnTy } from "@/lib/format";
import { STATUS_COLORS } from "@/lib/data";
import ChartTooltip from "./ChartTooltip";

// Waterfall: CRR baseline + each project's contribution stacked → Total,
// compared against the dashed Target line.
export default function WaterfallChart({ runrate, target, projects, unit, barCol }) {
  const wfW = 1000, wfH = 360, wfPadL = 60, wfPadR = 30, wfPadT = 50, wfPadB = 80;
  const wfInnerH = wfH - wfPadT - wfPadB;
  const wfInnerW = wfW - wfPadL - wfPadR;

  const steps = [{ label: "CRR", value: runrate, type: "base" }];
  let running = runrate;
  projects.forEach((p) => {
    running += p.target;
    steps.push({ label: p.name, value: p.target, type: "step", status: p.status, running });
  });
  steps.push({ label: "Total", value: running, type: "total" });

  const wfMax = Math.max(target, running) * 1.22;
  const wfBarW = (wfInnerW / steps.length) * 0.65;
  const wfGap = (wfInnerW / steps.length) * 0.35;
  const wfStepW = wfBarW + wfGap;
  const yWf = (v) => wfPadT + wfInnerH - (v / wfMax) * wfInnerH;
  const xWf = (i) => wfPadL + wfGap / 2 + i * wfStepW;
  const wfTargetY = yWf(target);
  const wfFinalReached = running >= target;
  const [hover, setHover] = useState(null);

  let wfCum = 0;
  const bars = [];
  const labelsTop = [];
  const labelsBot = [];
  const connectors = [];
  const hitRects = [];
  const barTops = [];

  steps.forEach((s, i) => {
    const bx = xWf(i);
    let barTop, barBot, barCol_;
    if (s.type === "base") {
      barBot = yWf(0);
      barTop = yWf(s.value);
      barCol_ = "#64748b";
      wfCum = s.value;
    } else if (s.type === "step") {
      barBot = yWf(wfCum);
      barTop = yWf(wfCum + s.value);
      barCol_ = STATUS_COLORS[s.status] || barCol;
      wfCum += s.value;
    } else {
      barBot = yWf(0);
      barTop = yWf(s.value);
      barCol_ = wfFinalReached ? "#34d399" : "#fb7185";
    }
    barTops.push(barTop);
    bars.push(
      <rect key={"bar" + i} x={bx} y={barTop} width={wfBarW} height={Math.max(2, barBot - barTop)} fill={barCol_} opacity={s.type === "step" ? (hover === i ? 1 : 0.92) : 1} rx={4} style={{ transition: "opacity 0.15s" }} />
    );
    labelsTop.push(
      <text key={"lt" + i} x={bx + wfBarW / 2} y={barTop - 8} fontSize={13} fill="#ecedf5" fontWeight={700} textAnchor="middle" className="mono">
        {s.type === "step" ? `+${vnTy(s.value)}` : vnTy(s.value)}
      </text>
    );
    if (s.type === "step") {
      labelsTop.push(
        <text key={"lr" + i} x={bx + wfBarW / 2} y={barTop - 24} fontSize={10.5} fill="#8a8fa6" textAnchor="middle" className="mono">
          Σ {vnTy(s.running)}
        </text>
      );
    }
    const shortName = s.label.length > 22 ? s.label.slice(0, 20) + "…" : s.label;
    labelsBot.push(
      <text
        key={"lb" + i}
        x={bx + wfBarW / 2}
        y={wfPadT + wfInnerH + 22}
        fontSize={11.5}
        fill={s.type === "base" ? "#a7abbe" : s.type === "total" ? (wfFinalReached ? "#34d399" : "#fb7185") : "#c8ccd9"}
        textAnchor="middle"
        fontWeight={s.type === "step" ? 500 : 700}
      >
        {shortName}
      </text>
    );
    if (i < steps.length - 1) {
      const nextIsTotal = steps[i + 1].type === "total";
      const yConn = nextIsTotal ? yWf(wfCum) : barTop;
      connectors.push(<line key={"c" + i} x1={bx + wfBarW} x2={xWf(i + 1)} y1={yConn} y2={yConn} stroke="#5b5f74" strokeWidth={1.2} strokeDasharray="4,3" />);
    }
    hitRects.push(
      <rect
        key={"h" + i}
        x={bx}
        y={wfPadT}
        width={wfBarW}
        height={wfInnerH}
        fill="transparent"
        onMouseEnter={() => setHover(i)}
        onMouseLeave={() => setHover(null)}
        style={{ cursor: "pointer" }}
      />
    );
  });

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${wfW} ${wfH}`} width="100%" style={{ overflow: "visible", display: "block" }}>
        <line x1={wfPadL} x2={wfW - wfPadR} y1={yWf(0)} y2={yWf(0)} stroke="#3a3f52" strokeWidth={1} />
        <line x1={wfPadL} x2={wfW - wfPadR} y1={wfTargetY} y2={wfTargetY} stroke="#e11d48" strokeWidth={1.6} strokeDasharray="8,5" opacity={0.85} />
        <rect x={wfPadL + 8} y={wfTargetY - 22} width={148} height={20} fill="#e11d48" rx={4} />
        <text x={wfPadL + 82} y={wfTargetY - 8} fontSize={12} fill="#fff" fontWeight={700} textAnchor="middle">
          Target: {vnTy(target)} {unit}
        </text>
        {connectors}
        {bars}
        {labelsTop}
        {labelsBot}
        <text x={wfPadL - 8} y={wfPadT - 20} fontSize={11} fill="#8a8fa6" textAnchor="start">
          Đơn vị: {unit} VND
        </text>
        {hitRects}
      </svg>
      {hover != null && (
        <ChartTooltip x={((xWf(hover) + wfBarW / 2) / wfW) * 100} y={(barTops[hover] / wfH) * 100}>
          <div style={{ fontWeight: 700, color: "#8a8fa6", fontSize: 10.5 }}>{steps[hover].label}</div>
          <div style={{ color: "#ecedf5", fontWeight: 800 }}>
            {steps[hover].type === "step" ? `+${vnTy(steps[hover].value)}` : vnTy(steps[hover].value)} {unit}
          </div>
          {steps[hover].type === "step" && <div style={{ color: "#8a8fa6" }}>Lũy kế: {vnTy(steps[hover].running)} {unit}</div>}
        </ChartTooltip>
      )}
    </div>
  );
}
