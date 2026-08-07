"use client";

import { PIPELINE_V2 } from "@/lib/data";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";

/* ─── number formatter ─── */
function fmtNum(v) {
  if (v >= 1000) return v.toLocaleString("vi-VN");
  if (v >= 1) return v.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  return v.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

/* ─── New-project badge (red cross) ─── */
function NewBadge() {
  return (
    <div style={{
      position: "absolute", top: -10, right: -6,
      width: 22, height: 22, borderRadius: 5,
      background: "#e11d48",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 6px rgba(225,29,72,0.4)",
    }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <line x1="6" y1="2" x2="6" y2="10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="2" y1="6" x2="10" y2="6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* ─── CRR-to-Target line chart (left side) ─── */
function CrrChart({ zone }) {
  const W = 340, H = 200;
  const padL = 20, padR = 20, padT = 40, padB = 50;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Scale: 0 → target * 1.05
  const maxVal = zone.target * 1.05;
  const yPos = (v) => padT + innerH - (v / maxVal) * innerH;

  // Trend line points: start at prevYear, end at CRR
  const startY = yPos(zone.prevYear);
  const endY = yPos(zone.crr);
  const midX = padL + innerW * 0.5;
  const endX = padL + innerW;

  // Target dashed line
  const targetY = yPos(zone.target);

  // Gap bracket
  const gapX = endX + 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
      {/* Target dashed line */}
      <line x1={padL} x2={W - padR + 50} y1={targetY} y2={targetY}
        stroke={zone.color} strokeWidth="1.5" strokeDasharray="8,5" />
      <text x={padL + 4} y={targetY - 8} fontSize="11" fontWeight="800" fill={zone.color} className="mono">
        Target 2026: {fmtNum(zone.target)} {zone.unit}
      </text>

      {/* CRR dotted line extension */}
      <line x1={endX} x2={W - padR + 50} y1={endY} y2={endY}
        stroke={zone.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />

      {/* Growth trend line */}
      <path
        d={`M${padL},${startY} Q${midX},${startY - 15} ${endX},${endY}`}
        fill="none" stroke={zone.color} strokeWidth="2.5" strokeLinecap="round"
      />

      {/* Start dot */}
      <circle cx={padL} cy={startY} r="4" fill={zone.color} />
      {/* End dot */}
      <circle cx={endX} cy={endY} r="5" fill={zone.color} />

      {/* Gap bracket */}
      <line x1={gapX} x2={gapX} y1={targetY + 2} y2={endY - 2} stroke={zone.color} strokeWidth="1.5" />
      <line x1={gapX - 4} x2={gapX + 4} y1={targetY + 2} y2={targetY + 2} stroke={zone.color} strokeWidth="1.5" />
      <line x1={gapX - 4} x2={gapX + 4} y1={endY - 2} y2={endY - 2} stroke={zone.color} strokeWidth="1.5" />

      {/* Gap label */}
      <text x={gapX + 10} y={(targetY + endY) / 2 + 4} fontSize="12" fontWeight="800" fill={zone.color} className="mono">
        [Gap: {fmtNum(zone.gap)} {zone.unit}]
      </text>

      {/* CRR label */}
      <text x={padL} y={H - 12} fontSize="11.5" fontWeight="800" fill="var(--text-strong)">
        Current Run Rate (CRR): {fmtNum(zone.crr)} {zone.unit}
      </text>
      <text x={padL} y={H} fontSize="10" fill="var(--text-dim)">
        (vs {fmtNum(zone.prevYear)} {zone.unit} 2025) ({zone.prevYearPct}%)
      </text>
    </svg>
  );
}

/* ─── Project waterfall bars (right side) ─── */
function ProjectBars({ zone }) {
  const projects = zone.projects;
  const maxVal = Math.max(...projects.map((p) => p.value));
  const maxBarH = 140;
  const minBarH = 32;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flex: 1, minWidth: 0 }}>
      {projects.map((p, i) => {
        const barH = Math.max((p.value / maxVal) * maxBarH, minBarH);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
            {/* Value label */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9.5, color: "var(--text-dim)", whiteSpace: "nowrap" }}>{p.kind}</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 800, color: "var(--text-strong)", whiteSpace: "nowrap" }}>{p.valueStr}</div>
            </div>

            {/* Bar */}
            <div style={{ position: "relative", width: "80%", maxWidth: 72 }}>
              {p.isNew && <NewBadge />}
              <div style={{
                width: "100%", height: barH, borderRadius: "6px 6px 0 0",
                background: `linear-gradient(180deg, ${zone.barColor}, ${zone.barColor}bb)`,
                boxShadow: `0 4px 14px ${zone.barColor}33`,
              }} />
            </div>

            {/* Project name */}
            <div style={{
              fontSize: 10.5, color: "var(--text-dim)", textAlign: "center",
              lineHeight: 1.35, padding: "0 2px", maxWidth: 130,
              textWrap: "balance",
            }}>
              {p.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Single zone card ─── */
function ZoneCard({ zone }) {
  return (
    <section style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border)",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
    }}>
      {/* Zone header badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "18px 26px",
        borderBottom: "1px solid var(--border-soft)",
      }}>
        <div style={{
          padding: "8px 20px", borderRadius: 10,
          background: zone.color,
          color: "#fff", fontSize: 16, fontWeight: 900,
          letterSpacing: 1, boxShadow: `0 4px 14px ${zone.color}55`,
        }}>
          {zone.label}
        </div>
      </div>

      {/* Main content: CRR chart + Project bars */}
      <div style={{
        padding: "24px 26px 28px",
        display: "flex", alignItems: "flex-end", gap: 24,
        flexWrap: "wrap",
      }}>
        {/* Left: CRR growth chart */}
        <div style={{ width: 340, flexShrink: 0 }}>
          <CrrChart zone={zone} />
        </div>

        {/* Right: Project bars */}
        <ProjectBars zone={zone} />
      </div>
    </section>
  );
}

/* ─── Page ─── */
export default function PipelineV2Page() {
  const gmvZone = PIPELINE_V2.find((z) => z.key === "gmv");

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · STRATEGIC PIPELINE V2"
        title="Chiến lược Pipeline 2026"
        subtitle="CRR → Gap → Dự án lấp gap · GMV — Doanh thu — Lợi nhuận"
        right={<DateBadge>Số liệu lũy kế đến 05/08/2026</DateBadge>}
      />

      {/* GMV Zone */}
      {gmvZone && <ZoneCard zone={gmvZone} />}
    </>
  );
}
