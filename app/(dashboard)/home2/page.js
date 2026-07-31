"use client";

import { useMemo } from "react";
import {
  FALLBACK_ACT,
  FALLBACK_TGT,
  PRODUCTS,
  KHOI,
  PIPELINE_GROUPS,
  BDM,
} from "@/lib/data";

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
const fv = (v, d = 1) => v.toLocaleString("vi-VN", { minimumFractionDigits: d, maximumFractionDigits: d });
const fvInt = (v) => Math.round(v).toLocaleString("vi-VN");

function sum(arr) { return arr.reduce((a, b) => a + b, 0); }

// ── Donut Chart (SVG) ──
function DonutChart({ segments, size = 120, thickness = 14, children }) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-soft)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const dash = (s.pct / 100) * circ;
          const gap = circ - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${s.color}40)` }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      {children && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Progress Ring ──
function ProgressRing({ pct, color, label, size = 110, thickness = 8 }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-soft)" strokeWidth={thickness} />
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: "var(--text-strong)",
        }}>
          {fv(pct, 0)}%
        </div>
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color, textAlign: "center" }}>{label}</div>
    </div>
  );
}

// ── Area Chart (SVG) ──
function AreaChart({ dataA, dataB, labels, height = 140, colorA = "#38bdf8", colorB = "#f87171" }) {
  const all = [...dataA, ...dataB];
  const maxV = Math.max(...all) * 1.15;
  const w = 100;
  const h = height;
  const padL = 0;
  const padR = 0;
  const step = (w - padL - padR) / (dataA.length - 1);

  const toPoints = (data) => data.map((v, i) => `${padL + i * step},${h - (v / maxV) * h}`).join(" ");

  const makeAreaPath = (data) => {
    const pts = data.map((v, i) => `${padL + i * step},${h - (v / maxV) * h}`);
    return `M${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(" ")} L${padL + (data.length - 1) * step},${h} L${padL},${h} Z`;
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorA} stopOpacity="0.35" />
          <stop offset="100%" stopColor={colorA} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorB} stopOpacity="0.25" />
          <stop offset="100%" stopColor={colorB} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={makeAreaPath(dataA)} fill="url(#gradA)" />
      <polyline points={toPoints(dataA)} fill="none" stroke={colorA} strokeWidth="1.5" />
      <path d={makeAreaPath(dataB)} fill="url(#gradB)" />
      <polyline points={toPoints(dataB)} fill="none" stroke={colorB} strokeWidth="1.5" />
    </svg>
  );
}

// ── Dashboard Card Shell ──
function DCard({ title, children, style: extraStyle, right }) {
  return (
    <div style={{
      background: "var(--card-bg-soft)",
      border: "1px solid var(--border-soft)",
      borderRadius: 14,
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      ...extraStyle,
    }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {title && <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)" }}>{title}</div>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Horizontal Bar ──
function HBar({ label, value, pct, color, maxPct = 100 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 100, fontSize: 11.5, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--surface-raised)", overflow: "hidden" }}>
        <div style={{ width: `${(pct / maxPct) * 100}%`, height: "100%", borderRadius: 4, background: color, transition: "width 0.5s" }} />
      </div>
      <div className="mono" style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-strong)", width: 50, textAlign: "right", flexShrink: 0 }}>{value}</div>
    </div>
  );
}

export default function Home2Page() {
  const data = useMemo(() => {
    const ACT = FALLBACK_ACT;
    const TGT = FALLBACK_TGT;
    const N = ACT.gmv.length;

    const gmvAct = sum(ACT.gmv);
    const dtAct = sum(ACT.dt);
    const lnAct = sum(ACT.ln);
    const gmvTgt = sum(TGT.gmv);
    const dtTgt = sum(TGT.dt);
    const lnTgt = sum(TGT.ln);
    const total = gmvAct + dtAct + lnAct;

    const gmvH1Tgt = sum(TGT.gmv.slice(0, 6));
    const dtH1Tgt = sum(TGT.dt.slice(0, 6));
    const lnH1Tgt = sum(TGT.ln.slice(0, 6));

    const topProducts = PRODUCTS
      .map(p => ({
        name: p.name.replace("Dự án ", ""),
        code: p.code,
        accent: p.accent,
        total: sum(p.months.map(m => m[1])),
        txn: sum(p.months.map(m => m[2])),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const topBDM = BDM
      .map(b => {
        const gmvActual = sum(b.metrics.gmv.actual.filter(v => v !== null));
        return { name: b.name, short: b.short, accent: b.accent, gmv: gmvActual };
      })
      .sort((a, b) => b.gmv - a.gmv)
      .slice(0, 5);

    const maxBDMGmv = Math.max(...topBDM.map(b => b.gmv));

    const pipelineStatus = PIPELINE_GROUPS.map(g => ({
      name: g.short,
      color: g.color,
      pct: Math.round((g.actYTD / g.target) * 100),
      label: g.label,
    }));

    return {
      N,
      gmvAct, dtAct, lnAct,
      gmvTgt, dtTgt, lnTgt,
      gmvH1Tgt, dtH1Tgt, lnH1Tgt,
      gmvMonthly: ACT.gmv,
      dtMonthly: ACT.dt,
      gmvTgtMonthly: TGT.gmv.slice(0, N),
      topProducts,
      topBDM,
      maxBDMGmv,
      pipelineStatus,
    };
  }, []);

  const distSegments = [
    { pct: 60, color: "#7c6cff", label: "GMV", value: fv(data.gmvAct, 0) + " tỷ" },
    { pct: 25, color: "#34d399", label: "Doanh thu", value: fv(data.dtAct, 1) + " tỷ" },
    { pct: 15, color: "#f59e0b", label: "Lợi nhuận", value: fv(data.lnAct, 1) + " tỷ" },
  ];

  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, color: "var(--accent)", textTransform: "uppercase" }}>
            GALAXY PAY · DASHBOARD V2
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, letterSpacing: -0.3, color: "var(--text-strong)" }}>
            Trang chủ 2 — Tổng quan dữ liệu
          </h1>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 10,
          background: "rgba(124,108,255,0.08)",
          border: "1px solid rgba(124,108,255,0.25)",
          fontSize: 12, color: "var(--text-dim)",
        }}>
          Số liệu đến <span className="mono" style={{ fontWeight: 700, color: "var(--accent-light)", marginLeft: 4 }}>16/07/2026</span>
        </div>
      </div>

      {/* ── ROW 1: 3 columns ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 14, marginBottom: 14 }}
           className="home2-row1">

        {/* Card 1: Distribution */}
        <DCard title="Phân bổ chỉ tiêu">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <DonutChart segments={distSegments} size={110} thickness={12}>
              <span className="mono" style={{ fontSize: 16, fontWeight: 800, color: "var(--text-strong)" }}>
                {fv((data.gmvAct / data.gmvTgt) * 100, 0)}%
              </span>
              <span style={{ fontSize: 9, color: "var(--text-faint)" }}>GMV YTD</span>
            </DonutChart>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {distSegments.map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "var(--text-dim)", flex: 1 }}>{s.label}</span>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-strong)" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </DCard>

        {/* Card 2: GMV Trend (area chart) */}
        <DCard title="Xu hướng GMV" right={
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8" }} />
                <span style={{ color: "var(--text-dim)" }}>Thực đạt</span>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
                <span style={{ color: "var(--text-dim)" }}>Kế hoạch</span>
              </span>
            </div>
          </div>
        }>
          <div style={{ display: "flex", gap: 24, marginBottom: 4 }}>
            <div>
              <span className="mono" style={{ fontSize: 24, fontWeight: 800, color: "var(--text-strong)" }}>
                {fv(data.gmvAct, 0)}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 6 }}>tỷ · Thực đạt</span>
              <span style={{
                fontSize: 10, fontWeight: 700, color: "#34d399",
                background: "rgba(52,211,153,0.12)", padding: "2px 7px",
                borderRadius: 6, marginLeft: 8,
              }}>
                {fv((data.gmvAct / data.gmvH1Tgt) * 100, 0)}% H1 ↑
              </span>
            </div>
          </div>

          <AreaChart
            dataA={data.gmvMonthly}
            dataB={data.gmvTgtMonthly}
            labels={MONTHS.slice(0, data.N)}
            height={120}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-faint)", marginTop: 2 }}>
            {MONTHS.slice(0, data.N).map(m => <span key={m}>{m}</span>)}
          </div>
        </DCard>

        {/* Card 3: Pipeline KPI Status */}
        <DCard title="Tiến độ KPI">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center", paddingTop: 4 }}>
            {data.pipelineStatus.map((p) => (
              <ProgressRing key={p.name} pct={p.pct} color={p.color} label={p.label} size={90} thickness={7} />
            ))}
          </div>
        </DCard>
      </div>

      {/* ── ROW 2: Top products, Top BDM, Monthly breakdown ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}
           className="home2-row2">

        {/* Top Products */}
        <DCard title="Top sản phẩm theo GMV" right={
          <span style={{ fontSize: 10, color: "var(--text-faint)" }}>T1–T7/2026</span>
        }>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.topProducts.map((p, i) => (
              <div key={p.code} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: p.accent + "22",
                  border: `1px solid ${p.accent}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, color: p.accent, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{fvInt(p.txn)} giao dịch</div>
                </div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: p.accent, flexShrink: 0 }}>
                  {fv(p.total, 1)} tỷ
                </span>
              </div>
            ))}
          </div>
        </DCard>

        {/* Monthly GMV Breakdown */}
        <DCard title="GMV theo tháng" right={
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-light)" }}>
            {fv(data.gmvAct, 0)} tỷ
          </span>
        }>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.gmvMonthly.map((v, i) => {
              const tgt = data.gmvTgtMonthly[i];
              const pct = (v / tgt) * 100;
              const isTop = v === Math.max(...data.gmvMonthly);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 22, fontSize: 10.5, fontWeight: 600, color: isTop ? "#7c6cff" : "var(--text-faint)", flexShrink: 0 }}>
                    {MONTHS[i]}
                  </span>
                  <div style={{ flex: 1, height: 10, borderRadius: 5, background: "var(--surface-raised)", overflow: "hidden", position: "relative" }}>
                    <div style={{
                      width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 5,
                      background: isTop
                        ? "linear-gradient(90deg,#7c6cff,#b98cff)"
                        : pct >= 100 ? "#34d399" : "linear-gradient(90deg,rgba(124,108,255,0.5),rgba(124,108,255,0.3))",
                    }} />
                  </div>
                  <span className="mono" style={{
                    width: 60, fontSize: 10.5, fontWeight: 700, textAlign: "right", flexShrink: 0,
                    color: isTop ? "#b98cff" : pct >= 100 ? "#34d399" : "var(--text-dim)",
                  }}>
                    {fv(v, 0)} tỷ
                  </span>
                </div>
              );
            })}
          </div>
        </DCard>

        {/* Top BDM */}
        <DCard title="Top BDM theo GMV" right={
          <span style={{ fontSize: 10, color: "var(--text-faint)" }}>Lũy kế Q1-Q2</span>
        }>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.topBDM.map((b, i) => (
              <HBar
                key={b.name}
                label={b.short}
                value={fv(b.gmv, 0) + " tỷ"}
                pct={b.gmv}
                color={b.accent}
                maxPct={data.maxBDMGmv}
              />
            ))}
          </div>
        </DCard>
      </div>

      {/* ── ROW 3: KPI Completion Rings + Target bars ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
           className="home2-row3">

        {/* KPI Completion */}
        <DCard title="Hoàn thành mục tiêu H1">
          <div style={{ display: "flex", justifyContent: "space-around", padding: "8px 0" }}>
            <ProgressRing
              pct={Math.round((data.gmvAct / data.gmvH1Tgt) * 100)}
              color="#7c6cff"
              label="GMV"
              size={100}
              thickness={8}
            />
            <ProgressRing
              pct={Math.round((data.dtAct / data.dtH1Tgt) * 100)}
              color="#34d399"
              label="Doanh thu"
              size={100}
              thickness={8}
            />
            <ProgressRing
              pct={Math.round((data.lnAct / data.lnH1Tgt) * 100)}
              color="#f59e0b"
              label="Lợi nhuận"
              size={100}
              thickness={8}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", fontSize: 11, color: "var(--text-dim)", textAlign: "center" }}>
            <span>{fv(data.gmvAct, 0)} / {fv(data.gmvH1Tgt, 0)} tỷ</span>
            <span>{fv(data.dtAct, 1)} / {fv(data.dtH1Tgt, 1)} tỷ</span>
            <span>{fv(data.lnAct, 1)} / {fv(data.lnH1Tgt, 1)} tỷ</span>
          </div>
        </DCard>

        {/* Target vs Actual Bars */}
        <DCard title="So sánh Thực đạt vs Mục tiêu năm">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 0" }}>
            {[
              { label: "GMV", act: data.gmvAct, tgt: data.gmvTgt, color: "#7c6cff" },
              { label: "Doanh thu", act: data.dtAct, tgt: data.dtTgt, color: "#34d399" },
              { label: "Lợi nhuận", act: data.lnAct, tgt: data.lnTgt, color: "#f59e0b" },
            ].map((item) => {
              const pct = (item.act / item.tgt) * 100;
              return (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-strong)" }}>{item.label}</span>
                    <span className="mono" style={{ fontSize: 11, color: item.color, fontWeight: 700 }}>
                      {fv(pct, 1)}% năm
                    </span>
                  </div>
                  <div style={{ position: "relative", height: 12, borderRadius: 6, background: "var(--surface-raised)", overflow: "hidden" }}>
                    <div style={{
                      width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 6,
                      background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "var(--text-faint)" }}>
                    <span>Thực đạt: {fv(item.act, 1)} tỷ</span>
                    <span>Mục tiêu: {fv(item.tgt, 0)} tỷ</span>
                  </div>
                </div>
              );
            })}
          </div>
        </DCard>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .home2-row1, .home2-row2 { grid-template-columns: 1fr !important; }
          .home2-row3 { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 901px) and (max-width: 1200px) {
          .home2-row1 { grid-template-columns: 1fr 1fr !important; }
          .home2-row2 { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}
