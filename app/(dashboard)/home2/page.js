"use client";

import { useMemo } from "react";
import {
  FALLBACK_ACT,
  FALLBACK_TGT,
  PRODUCTS,
  PIPELINE_GROUPS,
  BDM,
  KHOI_YTD,
} from "@/lib/data";

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
const fv = (v, d = 1) => v.toLocaleString("vi-VN", { minimumFractionDigits: d, maximumFractionDigits: d });
const fvInt = (v) => Math.round(v).toLocaleString("vi-VN");
function sum(arr) { return arr.reduce((a, b) => a + b, 0); }

// ── Card ──
function Card({ title, children, style: s, right, subtitle }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
      border: "1px solid rgba(124,108,255,0.12)",
      borderRadius: 16, padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: 10,
      ...s,
    }}>
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)" }}>{title}</div>
            {subtitle && <div style={{ fontSize: 10.5, color: "var(--text-faint)", marginTop: 2 }}>{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Donut ──
function Donut({ segments, size = 120, thickness = 14, children }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const dash = (s.pct / 100) * circ;
          const el = (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color}
              strokeWidth={thickness} strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-off} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 4px ${s.color}50)` }} />
          );
          off += dash;
          return el;
        })}
      </svg>
      {children && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>}
    </div>
  );
}

// ── Progress Ring ──
function Ring({ pct, color, label, size = 90, thickness = 7 }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
            strokeWidth={thickness} strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color}50)` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "var(--text-strong)" }}>
          {Math.round(pct)}%
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color, textAlign: "center" }}>{label}</div>
    </div>
  );
}

// ── Smooth Area Chart ──
function AreaChart({ dataA, dataB, labels, height = 160 }) {
  const all = [...dataA, ...dataB];
  const maxV = Math.max(...all) * 1.2;
  const minV = Math.min(...all) * 0.8;
  const range = maxV - minV;
  const n = dataA.length;
  const padX = 6;
  const w = 100;
  const usableW = w - padX * 2;
  const step = usableW / (n - 1);

  const toY = (v) => height - ((v - minV) / range) * (height * 0.85) - height * 0.08;
  const toX = (i) => padX + i * step;

  const makePath = (data) => {
    if (data.length < 2) return "";
    let d = `M${toX(0)},${toY(data[0])}`;
    for (let i = 1; i < data.length; i++) {
      const x0 = toX(i - 1), y0 = toY(data[i - 1]);
      const x1 = toX(i), y1 = toY(data[i]);
      const cpx = (x0 + x1) / 2;
      d += ` C${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
    }
    return d;
  };

  const makeArea = (data) => {
    const line = makePath(data);
    return `${line} L${toX(data.length - 1)},${height} L${toX(0)},${height} Z`;
  };

  const gridLines = 5;
  const gridVals = Array.from({ length: gridLines }, (_, i) => minV + (range / (gridLines - 1)) * i);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="areaA2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.01" />
        </linearGradient>
        <linearGradient id="areaB2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {gridVals.map((v, i) => {
        const y = toY(v);
        return <line key={i} x1={padX} x2={w - padX} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />;
      })}
      <path d={makeArea(dataB)} fill="url(#areaB2)" />
      <path d={makePath(dataB)} fill="none" stroke="#f87171" strokeWidth="1.2" opacity="0.8" />
      <path d={makeArea(dataA)} fill="url(#areaA2)" />
      <path d={makePath(dataA)} fill="none" stroke="#38bdf8" strokeWidth="1.5" />
      {dataA.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r="1.2" fill="#38bdf8" />
      ))}
    </svg>
  );
}

// ── Mini Bar Chart ──
function MiniBarChart({ data, color, height = 100 }) {
  const maxV = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{
            width: "100%", maxWidth: 28, borderRadius: 4,
            height: `${(d.value / maxV) * (height - 20)}px`,
            background: d.peak ? `linear-gradient(180deg, ${color}, ${color}88)` : `${color}44`,
            transition: "height 0.3s",
          }} />
          <span style={{ fontSize: 8, color: "var(--text-faint)", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home2Page() {
  const d = useMemo(() => {
    const ACT = FALLBACK_ACT;
    const TGT = FALLBACK_TGT;
    const N = ACT.gmv.length;

    const gmvA = sum(ACT.gmv), dtA = sum(ACT.dt), lnA = sum(ACT.ln);
    const gmvT = sum(TGT.gmv), dtT = sum(TGT.dt), lnT = sum(TGT.ln);
    const gmvH1 = sum(TGT.gmv.slice(0, 6)), dtH1 = sum(TGT.dt.slice(0, 6)), lnH1 = sum(TGT.ln.slice(0, 6));

    const topProd = PRODUCTS
      .map(p => ({ name: p.name.replace("Dự án ", ""), code: p.code, accent: p.accent, total: sum(p.months.map(m => m[1])), txn: sum(p.months.map(m => m[2])) }))
      .sort((a, b) => b.total - a.total).slice(0, 5);

    const topBDM = BDM
      .map(b => ({ name: b.name, short: b.short, accent: b.accent, gmv: sum(b.metrics.gmv.actual.filter(v => v !== null)) }))
      .sort((a, b) => b.gmv - a.gmv).slice(0, 5);
    const maxBDM = Math.max(...topBDM.map(b => b.gmv));

    const pipeline = PIPELINE_GROUPS.map(g => ({
      name: g.short, color: g.color, label: g.label,
      pct: Math.round((g.actYTD / g.target) * 100),
      actYTD: g.actYTD, target: g.target,
    }));

    const monthlyDT = ACT.dt.map((v, i) => ({ label: MONTHS[i], value: v, peak: v === Math.max(...ACT.dt) }));

    return { N, ACT, TGT, gmvA, dtA, lnA, gmvT, dtT, lnT, gmvH1, dtH1, lnH1, topProd, topBDM, maxBDM, pipeline, monthlyDT };
  }, []);

  const distSegs = [
    { pct: 55, color: "#7c6cff", label: "GMV", val: fv(d.gmvA, 0) + " tỷ" },
    { pct: 30, color: "#34d399", label: "Doanh thu", val: fv(d.dtA, 1) + " tỷ" },
    { pct: 15, color: "#f59e0b", label: "Lợi nhuận", val: fv(d.lnA, 1) + " tỷ" },
  ];

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: "var(--accent)", textTransform: "uppercase" }}>GALAXY PAY · DASHBOARD V2</div>
          <h1 style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, letterSpacing: -0.3, color: "var(--text-strong)" }}>Tổng quan dữ liệu kinh doanh</h1>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 8, background: "rgba(124,108,255,0.08)", border: "1px solid rgba(124,108,255,0.2)" }}>
          Cập nhật <span className="mono" style={{ fontWeight: 700, color: "var(--accent-light)" }}>05/08/2026</span>
        </div>
      </div>

      {/* ══ ROW 1: Distribution | Area Chart | KPI Rings ══ */}
      <div className="home2-grid-top" style={{ display: "grid", gridTemplateColumns: "280px 1fr 200px", gap: 12, marginBottom: 12 }}>

        {/* Distribution Donut */}
        <Card title="Phân bổ chỉ tiêu" subtitle="Lũy kế T1–T7/2026">
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 0" }}>
            <Donut segments={distSegs} size={100} thickness={12}>
              <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: "var(--text-strong)" }}>{fv((d.gmvA / d.gmvT) * 100, 0)}%</span>
              <span style={{ fontSize: 8, color: "var(--text-faint)" }}>GMV YTD</span>
            </Donut>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {distSegs.map(s => (
                <div key={s.label}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{s.label}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: "var(--text-strong)", paddingLeft: 14 }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Area Chart */}
        <Card title="Xu hướng GMV theo tháng" right={
          <div style={{ display: "flex", gap: 14, fontSize: 10.5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 3, borderRadius: 2, background: "#38bdf8" }} /><span style={{ color: "var(--text-dim)" }}>Thực đạt</span></span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 3, borderRadius: 2, background: "#f87171" }} /><span style={{ color: "var(--text-dim)" }}>Kế hoạch</span></span>
          </div>
        }>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
            <span className="mono" style={{ fontSize: 26, fontWeight: 800, color: "var(--text-strong)" }}>{fv(d.gmvA, 0)}</span>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>tỷ · Thực đạt</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399", background: "rgba(52,211,153,0.12)", padding: "2px 8px", borderRadius: 6 }}>
              {fv((d.gmvA / d.gmvH1) * 100, 0)}% H1 ↑
            </span>
            <span className="mono" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-dim)", marginLeft: "auto" }}>{fv(sum(d.TGT.gmv.slice(0, d.N)), 0)}</span>
            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>tỷ · KH</span>
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", padding: "8px 4px 0" }}>
            <AreaChart dataA={d.ACT.gmv} dataB={d.TGT.gmv.slice(0, d.N)} labels={MONTHS.slice(0, d.N)} height={130} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 6px", fontSize: 10, color: "var(--text-faint)" }}>
            {MONTHS.slice(0, d.N).map(m => <span key={m}>{m}</span>)}
          </div>
        </Card>

        {/* KPI Rings */}
        <Card title="Tiến độ KPI" subtitle="vs Target năm">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center", paddingTop: 2 }}>
            <Ring pct={(d.gmvA / d.gmvT) * 100} color="#7c6cff" label="GMV" size={78} thickness={6} />
            <Ring pct={(d.dtA / d.dtT) * 100} color="#34d399" label="Doanh thu" size={78} thickness={6} />
            <Ring pct={(d.lnA / d.lnT) * 100} color="#f59e0b" label="Lợi nhuận gộp" size={78} thickness={6} />
          </div>
        </Card>
      </div>

      {/* ══ ROW 2: Products | DT Monthly | BDM Ranking ══ */}
      <div className="home2-grid-mid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>

        {/* Top Products */}
        <Card title="Top sản phẩm" subtitle="Xếp hạng theo GMV · T1–T7">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {d.topProd.map((p, i) => (
              <div key={p.code} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: `${p.accent}20`, border: `1px solid ${p.accent}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, color: p.accent,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 9.5, color: "var(--text-faint)" }}>{fvInt(p.txn)} GD</div>
                </div>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: p.accent, flexShrink: 0 }}>{fv(p.total, 1)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly DT Bar Chart */}
        <Card title="Doanh thu theo tháng" subtitle="Đơn vị: tỷ VND" right={
          <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>{fv(d.dtA, 1)} tỷ</span>
        }>
          <MiniBarChart data={d.monthlyDT} color="#34d399" height={110} />
        </Card>

        {/* BDM Ranking */}
        <Card title="Xếp hạng BDM" subtitle="GMV lũy kế Q1–Q2">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {d.topBDM.map((b, i) => (
              <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 28, fontSize: 11, fontWeight: 600, color: "var(--text-dim)", flexShrink: 0 }}>{b.short}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ width: `${(b.gmv / d.maxBDM) * 100}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${b.accent}, ${b.accent}88)` }} />
                </div>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--text-strong)", width: 50, textAlign: "right", flexShrink: 0 }}>{fv(b.gmv, 0)} tỷ</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ══ ROW 3: H1 Completion | Pipeline | Target vs Actual ══ */}
      <div className="home2-grid-bot" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>

        {/* H1 Completion Rings */}
        <Card title="Hoàn thành mục tiêu H1" subtitle="Thực đạt vs Target H1">
          <div style={{ display: "flex", justifyContent: "space-around", padding: "6px 0" }}>
            <Ring pct={(d.gmvA / d.gmvH1) * 100} color="#7c6cff" label="GMV" size={80} thickness={6} />
            <Ring pct={(d.dtA / d.dtH1) * 100} color="#34d399" label="DT" size={80} thickness={6} />
            <Ring pct={(d.lnA / d.lnH1) * 100} color="#f59e0b" label="LN" size={80} thickness={6} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", fontSize: 10, color: "var(--text-faint)", textAlign: "center" }}>
            <span>{fv(d.gmvA, 0)}/{fv(d.gmvH1, 0)}</span>
            <span>{fv(d.dtA, 1)}/{fv(d.dtH1, 1)}</span>
            <span>{fv(d.lnA, 1)}/{fv(d.lnH1, 1)}</span>
          </div>
        </Card>

        {/* Pipeline Status */}
        <Card title="Sale Pipeline" subtitle="Tiến độ dự án chiến lược">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "4px 0" }}>
            {d.pipeline.map(p => (
              <div key={p.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-strong)" }}>{p.label}</span>
                  <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.pct}%</span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(p.pct, 100)}%`, height: "100%", borderRadius: 5, background: `linear-gradient(90deg, ${p.color}, ${p.color}88)` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "var(--text-faint)", marginTop: 3 }}>
                  <span>YTD: {fvInt(p.actYTD)} tỷ</span>
                  <span>Target: {fvInt(p.target)} tỷ</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Target vs Actual */}
        <Card title="Thực đạt vs Mục tiêu năm" subtitle="Tỷ lệ hoàn thành 2026">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 0" }}>
            {[
              { label: "GMV", act: d.gmvA, tgt: d.gmvT, color: "#7c6cff" },
              { label: "Doanh thu", act: d.dtA, tgt: d.dtT, color: "#34d399" },
              { label: "Lợi nhuận", act: d.lnA, tgt: d.lnT, color: "#f59e0b" },
            ].map(item => {
              const pct = (item.act / item.tgt) * 100;
              return (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-strong)" }}>{item.label}</span>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: item.color }}>{fv(pct, 1)}%</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", borderRadius: 5, background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, color: "var(--text-faint)", marginTop: 3 }}>
                    <span>{fv(item.act, 1)} tỷ</span>
                    <span>{fv(item.tgt, 0)} tỷ</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .home2-grid-top { grid-template-columns: 1fr 1fr !important; }
          .home2-grid-top > :first-child { grid-column: 1; }
          .home2-grid-top > :nth-child(2) { grid-column: 2; }
          .home2-grid-top > :nth-child(3) { grid-column: 1 / -1; }
          .home2-grid-mid, .home2-grid-bot { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .home2-grid-top, .home2-grid-mid, .home2-grid-bot { grid-template-columns: 1fr !important; }
          .home2-grid-top > :first-child { grid-column: 1; }
        }
      `}</style>
    </>
  );
}
