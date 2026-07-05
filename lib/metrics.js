// Derived calculations ported 1:1 from the dc.html logic class. Every function
// here is pure (data in, plain numbers/strings out) — charts and cards render
// from these, no JSX/SVG is built in this file.
import {
  FALLBACK_TGT,
  FALLBACK_ACT,
  COMPANY,
  KHOI,
  PIPELINE_GROUPS,
  STATUS_COLORS,
  PRODUCTS,
  BDM,
  KHOI_YTD,
  OTA_REPORTS,
  OTA_MONTHLY_OVERVIEW,
  LOA_CUSTOMERS,
  MONTHS_12,
} from "./data";
import { vn, vnTy, pctS, cCol, sum, pctColor as pctColor100, vnLoc, vnInt } from "./format";

// ============================================================================
// TRANG CHỦ
// ============================================================================
const PERIOD_DEFS = (ACT, TGT, N) => ({
  month: { range: `Tháng ${N}/2026 · số liệu trong tháng`, pick: (a) => a[N - 1], tPick: (t) => t[N - 1], comp: `Hoàn thành KH tháng ${N}` },
  quarter: { range: `Quý 2/2026 · lũy kế T4–T${N}`, pick: (a) => a[3] + a[4], tPick: (t) => t[3] + t[4], comp: "Hoàn thành KH Quý 2 (LK)" },
  h1: { range: `Nửa đầu 2026 (H1) · lũy kế T1–T${N}`, pick: (a) => sum(a.slice(0, N)), tPick: (t) => sum(t.slice(0, 6)), comp: "Hoàn thành Target H1" },
  year: { range: `Năm 2026 · lũy kế T1–T${N} (đến 31/05)`, pick: (a) => sum(a.slice(0, N)), tPick: (t) => sum(t), comp: "Hoàn thành Target năm" },
});

const M_DEFS = [
  { key: "gmv", label: "GMV", iconBg: "rgba(157,139,255,0.16)", glow: "rgba(157,139,255,0.5)" },
  { key: "dt", label: "Doanh thu", iconBg: "rgba(52,211,153,0.14)", glow: "rgba(52,211,153,0.4)" },
  { key: "ln", label: "Lợi nhuận", iconBg: "rgba(251,191,36,0.14)", glow: "rgba(251,191,36,0.35)" },
];

const DV_MAP = {
  month: { a: 161, t: 100, l: "Go-live tháng 5" },
  quarter: { a: 168, t: 200, l: "Go-live Q2 (LK)" },
  h1: { a: 552, t: 470, l: "Go-live H1 (LK)" },
  year: { a: 552, t: 470, l: "Lũy kế vs KH go-live" },
};

export function getHome(period) {
  const TGT = FALLBACK_TGT;
  const ACT = FALLBACK_ACT;
  const N = ACT.gmv.length;
  const PDEF = PERIOD_DEFS(ACT, TGT, N)[period];
  const mom = (k) => (ACT[k][4] / ACT[k][3] - 1) * 100;

  const metrics = M_DEFS.map((d) => {
    const val = PDEF.pick(ACT[d.key]);
    const tgt = PDEF.tPick(TGT[d.key]);
    const p = (val / tgt) * 100;
    const dm = mom(d.key);
    return {
      key: d.key,
      label: d.label,
      value: vnTy(val),
      unit: "tỷ VND",
      delta: vn(Math.abs(dm), 1) + "%",
      deltaArrow: dm >= 0 ? "↑" : "↓",
      deltaColor: dm >= 0 ? "#34d399" : "#fb7185",
      deltaBg: dm >= 0 ? "rgba(52,211,153,0.12)" : "rgba(251,113,133,0.12)",
      iconBg: d.iconBg,
      glow: d.glow,
      compLabel: PDEF.comp,
      h1pct: pctS(p),
      h1bar: Math.min(p, 100) + "%",
      h1Color: p >= 100 ? "#34d399" : "#c3b9ff",
    };
  });

  const dv = DV_MAP[period];
  const dvp = (dv.a / dv.t) * 100;
  metrics.push({
    key: "dv",
    label: "ĐV CNTT go-live",
    value: vn(dv.a, 0),
    unit: "đơn vị",
    delta: "154 ĐV",
    deltaArrow: "↑",
    deltaColor: "#34d399",
    deltaBg: "rgba(52,211,153,0.12)",
    iconBg: "rgba(124,108,255,0.16)",
    glow: "rgba(124,108,255,0.5)",
    compLabel: dv.l,
    h1pct: pctS(dvp),
    h1bar: Math.min(dvp, 100) + "%",
    h1Color: dvp >= 100 ? "#34d399" : "#c3b9ff",
  });

  const targets = [
    { key: "gmv", name: "GMV" },
    { key: "dt", name: "Doanh thu" },
    { key: "ln", name: "Lợi nhuận" },
  ].map((r) => {
    const act = sum(ACT[r.key].slice(0, N));
    const yr = sum(TGT[r.key]);
    const h1 = sum(TGT[r.key].slice(0, 6));
    const fillP = (act / yr) * 100;
    const markP = (h1 / yr) * 100;
    const h1P = (act / h1) * 100;
    return {
      name: r.name,
      actual: vnTy(act) + " tỷ",
      year: vnTy(yr) + " tỷ",
      h1: vnTy(h1) + " tỷ",
      fill: fillP + "%",
      h1mark: markP + "%",
      yearPct: pctS(fillP),
      h1pct: pctS(h1P),
      h1Color: cCol(h1P),
    };
  });

  const mLbl = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const THEMES = {
    indigo: { peak: "linear-gradient(180deg,#b98cff,#7c6cff)", norm: "linear-gradient(180deg,rgba(124,108,255,0.6),rgba(124,108,255,0.3))", accent: "#c3b9ff" },
    green: { peak: "linear-gradient(180deg,#6ee7b7,#34d399)", norm: "linear-gradient(180deg,rgba(52,211,153,0.55),rgba(52,211,153,0.25))", accent: "#6ee7b7" },
    amber: { peak: "linear-gradient(180deg,#fcd34d,#f59e0b)", norm: "linear-gradient(180deg,rgba(251,191,36,0.55),rgba(251,191,36,0.22))", accent: "#fcd34d" },
  };
  const makeTrend = (act, tgt, dec, th) => {
    const T = THEMES[th];
    const all = tgt.map((t, i) => (i < N ? act[i] : t));
    const maxV = Math.max(...all);
    const pk = act.indexOf(Math.max(...act.slice(0, N)));
    return all.map((v, i) => {
      const isPlan = i >= N;
      const isPeak = i === pk;
      return {
        label: mLbl[i],
        value: vn(v, dec),
        height: 8 + (v / maxV) * 92 + "%",
        bar: isPlan
          ? "repeating-linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.07) 4px,transparent 4px,transparent 8px)"
          : isPeak
            ? T.peak
            : T.norm,
        valColor: isPlan ? "#565a6e" : isPeak ? T.accent : "#8a8fa6",
        labelColor: isPlan ? "#565a6e" : isPeak ? T.accent : "#8a8fa6",
        labelWeight: isPeak ? 700 : 500,
      };
    });
  };

  return {
    periodRange: PDEF.range,
    metrics,
    targets,
    trend: makeTrend(ACT.gmv, TGT.gmv, 0, "indigo"),
    trendDT: makeTrend(ACT.dt, TGT.dt, 1, "green"),
    trendLN: makeTrend(ACT.ln, TGT.ln, 1, "amber"),
    trendTotal: "8.826 tỷ",
    trendTotalDT: "93,4 tỷ",
    trendTotalLN: "25,0 tỷ",
  };
}

// ============================================================================
// KPI COMPANY
// ============================================================================
const COMPANY_ICON_BG = { gmv: "rgba(157,139,255,0.16)", dt: "rgba(52,211,153,0.14)", ln: "rgba(251,191,36,0.14)" };
const COMPANY_GLOW = { gmv: "rgba(157,139,255,0.5)", dt: "rgba(52,211,153,0.4)", ln: "rgba(251,191,36,0.35)" };

export function getCompanyKpi() {
  return ["gmv", "dt", "ln"].map((key) => {
    const c = COMPANY[key];
    const yr = sum(c.data);
    const h1 = sum(c.data.slice(0, 6));
    const h2 = yr - h1;
    let peakI = 0;
    c.data.forEach((v, i) => { if (v > c.data[peakI]) peakI = i; });
    return { key, label: c.name, year: vnTy(yr), h1: vnTy(h1), h2: vnTy(h2), peakM: peakI + 1, peakV: vnTy(c.data[peakI]) + " tỷ", iconBg: COMPANY_ICON_BG[key], glow: COMPANY_GLOW[key] };
  });
}

export function getCompanyBars(metric) {
  const cData = COMPANY[metric];
  const cMax = Math.max(...cData.data);
  let cPeakI = 0;
  cData.data.forEach((v, i) => { if (v > cData.data[cPeakI]) cPeakI = i; });
  const dec = metric === "gmv" ? 0 : 1;
  return cData.data.map((v, i) => {
    const isPeak = i === cPeakI;
    return {
      label: String(i + 1).padStart(2, "0"),
      value: vn(v, dec),
      height: 10 + (v / cMax) * 90 + "%",
      bar: isPeak ? cData.peak : cData.norm,
      valColor: isPeak ? cData.accent : "#8a8fa6",
      labelColor: isPeak ? cData.accent : "#8a8fa6",
      labelWeight: isPeak ? 700 : 500,
    };
  });
}

export function getCompanyRows() {
  return ["gmv", "dt", "ln"].map((k) => {
    const c = COMPANY[k];
    const dec = k === "gmv" ? 0 : 1;
    let mx = 0, mxi = 0;
    c.data.forEach((v, i) => { if (v > mx) { mx = v; mxi = i; } });
    return {
      name: c.name,
      cells: c.data.map((v, i) => ({ v: vn(v, dec), color: i === mxi ? c.accent : "#c9cbd8" })),
      total: vnTy(sum(c.data)),
    };
  });
}

// ============================================================================
// KPI KHỐI KINH DOANH
// ============================================================================
const KHOI_ICON_BG = { gmv: "rgba(157,139,255,0.16)", dt: "rgba(52,211,153,0.14)", ln: "rgba(251,191,36,0.14)", dv: "rgba(124,108,255,0.16)" };
const KHOI_GLOW = { gmv: "rgba(157,139,255,0.5)", dt: "rgba(52,211,153,0.4)", ln: "rgba(251,191,36,0.35)", dv: "rgba(124,108,255,0.5)" };

export function getKhoiKpi() {
  return ["gmv", "dt", "ln", "dv"].map((key) => {
    const kd = KHOI[key];
    const act5 = sum(kd.act);
    const plan5 = sum(kd.plan.slice(0, 5));
    const yr = sum(kd.plan);
    const p = plan5 > 0 ? (act5 / plan5) * 100 : 0;
    const dec = key === "dv" ? 0 : key === "gmv" ? 0 : 1;
    return {
      key,
      label: kd.name,
      unit: kd.unit,
      act: key === "gmv" ? vnTy(act5) : vn(act5, dec),
      plan5: key === "gmv" ? vnTy(plan5) : vn(plan5, dec),
      yr: key === "gmv" ? vnTy(yr) : vn(yr, dec),
      pct: pctS(p),
      bar: Math.min(p, 100) + "%",
      pctColor: pctColor100(p),
      barBg: p >= 100 ? "linear-gradient(90deg,#34d399,#6ee7b7)" : p >= 80 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#e11d48,#fb7185)",
      iconBg: KHOI_ICON_BG[key],
      glow: KHOI_GLOW[key],
    };
  });
}

export function getKhoiBars(metric) {
  const kData = KHOI[metric];
  const kMax = Math.max(...kData.plan, ...kData.act);
  const kDec = metric === "gmv" || metric === "dv" ? 0 : 1;
  const actMax = Math.max(...kData.act);
  return kData.plan.map((planV, i) => {
    const actV = i < 5 ? kData.act[i] : null;
    const isPeak = actV !== null && actV === actMax;
    const pctM = actV !== null && planV > 0 ? (actV / planV) * 100 : null;
    return {
      label: String(i + 1).padStart(2, "0"),
      planH: 6 + (planV / kMax) * 94 + "%",
      planVStr: vn(planV, kDec),
      actH: actV !== null ? 6 + (actV / kMax) * 94 + "%" : "0%",
      actBg: actV === null ? "transparent" : isPeak ? kData.peak : "linear-gradient(180deg,rgba(124,108,255,0.7),rgba(124,108,255,0.35))",
      actV: actV !== null ? vn(actV, kDec) : "",
      actColor: isPeak ? kData.accent : "#c9cbd8",
      labelColor: i < 5 ? "#c9cbd8" : "#565a6e",
      labelWeight: isPeak ? 700 : 500,
      pct: pctM !== null ? vn(pctM, 0) + "%" : "",
      pctColor: pctM === null ? "transparent" : pctM >= 100 ? "#34d399" : pctM >= 80 ? "#fbbf24" : "#fb7185",
      pctBg: pctM === null ? "transparent" : pctM >= 100 ? "rgba(52,211,153,0.14)" : pctM >= 80 ? "rgba(251,191,36,0.14)" : "rgba(251,113,133,0.14)",
    };
  });
}

export function getKhoiRows() {
  const rows = [];
  ["gmv", "dt", "ln", "dv"].forEach((k) => {
    const kd = KHOI[k];
    const dec = k === "gmv" || k === "dv" ? 0 : 1;
    const act5 = sum(kd.act);
    const plan5 = sum(kd.plan.slice(0, 5));
    rows.push({
      name: kd.name, type: "Thực đạt", typeColor: "#c3b9ff", typeBg: "rgba(124,108,255,0.18)",
      nameWeight: 700, nameColor: "#ecedf5", rowBg: "rgba(124,108,255,0.04)",
      cells: MONTHS_12.map((_, i) => (i < 5 ? { v: vn(kd.act[i], dec), color: "#ecedf5" } : { v: "–", color: "#4d5165" })),
      total: vn(act5, dec), totalColor: "#c3b9ff",
    });
    rows.push({
      name: "", type: "Kế hoạch", typeColor: "#8a8fa6", typeBg: "rgba(255,255,255,0.06)",
      nameWeight: 500, nameColor: "#8a8fa6", rowBg: "transparent",
      cells: kd.plan.map((v) => ({ v: v === 0 ? "–" : vn(v, dec), color: "#8a8fa6" })),
      total: vn(sum(kd.plan), dec), totalColor: "#c9cbd8",
    });
    rows.push({
      name: "", type: "% Đạt", typeColor: "#fbbf24", typeBg: "rgba(251,191,36,0.15)",
      nameWeight: 500, nameColor: "#8a8fa6", rowBg: "transparent",
      cells: MONTHS_12.map((_, i) => {
        if (i < 5 && kd.plan[i] > 0) { const p = (kd.act[i] / kd.plan[i]) * 100; return { v: vn(p, 0) + "%", color: pctColor100(p) }; }
        return { v: "–", color: "#4d5165" };
      }),
      total: plan5 > 0 ? vn((act5 / plan5) * 100, 1) + "%" : "–",
      totalColor: plan5 > 0 ? pctColor100((act5 / plan5) * 100) : "#c9cbd8",
    });
  });
  return rows;
}

export function getRunrate() {
  return ["gmv", "dt", "ln", "dv"].map((k) => {
    const kd = KHOI[k];
    const dec = k === "gmv" || k === "dv" ? 0 : 1;
    const act5 = sum(kd.act);
    const perMonth = act5 / 5;
    const forecast = perMonth * 12;
    const yrPlan = sum(kd.plan);
    const pct = (forecast / yrPlan) * 100;
    const gap = forecast - yrPlan;
    const monthlyPlanAvg = yrPlan / 12;
    const paceDelta = (perMonth / monthlyPlanAvg - 1) * 100;
    const unitSuffix = k === "dv" ? "" : " tỷ";
    const fmt = (v) => (k === "gmv" ? vnTy(v) : vn(v, dec)) + unitSuffix;
    return {
      key: k,
      name: kd.name,
      act5: fmt(act5),
      perMonth: fmt(perMonth),
      planPerMonth: fmt(monthlyPlanAvg),
      paceDelta: (paceDelta >= 0 ? "+" : "") + vn(paceDelta, 1) + "%",
      paceColor: paceDelta >= 0 ? "#34d399" : "#fb7185",
      paceBg: paceDelta >= 0 ? "rgba(52,211,153,0.14)" : "rgba(251,113,133,0.14)",
      paceArrow: paceDelta >= 0 ? "↑" : "↓",
      forecast: fmt(forecast),
      yrPlan: fmt(yrPlan),
      pct: vn(pct, 1) + "%",
      pctColor: pctColor100(pct),
      gap: (gap >= 0 ? "+" : "") + fmt(Math.abs(gap)),
      gapColor: gap >= 0 ? "#34d399" : "#fb7185",
      barW: Math.min(pct, 100) + "%",
      markerLeft: Math.min((100 / Math.max(pct, 100)) * 100, 100) + "%",
    };
  });
}

// ============================================================================
// SALEPIPELINE
// ============================================================================
export function getPipelineGroups(filter) {
  const groups = filter === "all" ? PIPELINE_GROUPS : PIPELINE_GROUPS.filter((g) => g.key === filter);
  return groups.map((g) => {
    const app = (g.runrate / g.target) * 100;
    const gap = g.target - g.runrate;
    const totProj = sum(g.projects.map((p) => p.target));
    return {
      ...g,
      appStr: vn(app, 1) + "%",
      appColor: cCol(app),
      gapLabel: gap >= 0 ? "Thiếu KPI" : "Vượt KPI",
      gapStr: vnTy(Math.abs(gap)) + " " + g.unit,
      targetStr: vnTy(g.target),
      runrateStr: vnTy(g.runrate),
      actYTDStr: vnTy(g.actYTD),
      prevStr: vnTy(g.prevYear),
      totProjStr: vnTy(totProj),
      featured: (() => {
        const featMax = Math.max(...g.featured.map((f) => f.value));
        return g.featured.map((f) => ({ ...f, barH: Math.max(35, (f.value / featMax) * 140) }));
      })(),
      projRows: g.projects.map((p, i) => ({
        ...p,
        idx: i + 1,
        targetStr: vnTy(p.target) + " " + g.unit,
        statusColor: STATUS_COLORS[p.status] || "#8a8fa6",
        statusBg: (STATUS_COLORS[p.status] || "#8a8fa6") + "22",
      })),
    };
  });
}

export const PIPELINE_TABS = [
  { id: "all", label: "Tất cả", short: "ALL", color: "#c3b9ff" },
  { id: "gmv", label: "GMV", short: "GMV", color: "#7c6cff" },
  { id: "dt", label: "Doanh thu", short: "REV", color: "#34d399" },
  { id: "ln", label: "Lợi nhuận", short: "LN", color: "#f59e0b" },
];

// ============================================================================
// BÁO CÁO SẢN PHẨM
// ============================================================================
function fmtGTGD(v) {
  if (v == null) return "–";
  if (v >= 1) return vnLoc(v, 2) + " tỷ";
  if (v >= 0.001) return vnLoc(v * 1000, 0) + " tr";
  return v > 0 ? vnLoc(v * 1e9, 0) + " đ" : "0";
}

export function getProductGroups({ query = "", pick = "", period = "week", range = "5" } = {}) {
  const q = query.trim().toLowerCase();
  const rangeN = range === "3" ? 3 : range === "all" ? 999 : 5;
  const filtered = PRODUCTS.filter((p) => {
    if (pick && p.key !== pick) return false;
    if (q && p.name.toLowerCase().indexOf(q) < 0 && p.code.toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  const isWeek = period === "week";

  const groups = filtered.map((p) => {
    const allRows = isWeek ? p.weeks : p.months;
    const rows = allRows.slice(Math.max(0, allRows.length - rangeN));
    const labels = rows.map((r) => r[0]);
    const gtgd = rows.map((r) => r[1] || 0);
    const slgd = rows.map((r) => r[2] || 0);
    const cumGTGD = sum(p.months.map((m) => m[1] || 0));
    const cumSLGD = sum(p.months.map((m) => m[2] || 0));
    const lastIdx = rows.length - 1;
    const lastLabel = labels[lastIdx] || "";
    const prevLabel = labels[lastIdx - 1] || "";
    const lastG = gtgd[lastIdx] || 0, prevG = gtgd[lastIdx - 1] || 0;
    const lastS = slgd[lastIdx] || 0, prevS = slgd[lastIdx - 1] || 0;
    const dG = prevG > 0 ? (lastG / prevG - 1) * 100 : null;
    const dS = prevS > 0 ? (lastS / prevS - 1) * 100 : null;

    const kpiCards = [
      { val: fmtGTGD(cumGTGD), label: "Lũy kế GTGD (7 tháng)", delta: null },
      { val: vnInt(cumSLGD), label: "Lũy kế SLGD (7 tháng)", delta: null },
      { val: fmtGTGD(lastG), label: "GTGD " + lastLabel, delta: dG },
      { val: vnInt(lastS), label: "SLGD " + lastLabel, delta: dS },
    ].map((k) => ({
      ...k,
      deltaStr: k.delta == null ? "" : `${k.delta >= 0 ? "▲" : "▼"} ${Math.abs(k.delta).toFixed(0)}% so với ${prevLabel}`,
      deltaColor: k.delta == null ? "" : k.delta >= 0 ? "#22c55e" : "#e11d48",
    }));

    return {
      ...p,
      labels, gtgd, slgd,
      monthLabels: p.months.map((m) => m[0]),
      monthGtgd: p.months.map((m) => m[1] || 0),
      monthSlgd: p.months.map((m) => m[2] || 0),
      isWeek,
      kpiCards,
    };
  });

  return { groups, matchCount: filtered.length };
}

export const PRODUCT_OPTIONS = PRODUCTS.map((p) => ({ key: p.key, name: p.name }));

// ============================================================================
// KPI CÁ NHÂN
// ============================================================================
function fmtVal(v, unit) {
  if (v == null) return "–";
  if (unit === "tỷ") return vnLoc(v, v < 10 ? 2 : v < 100 ? 1 : 0) + " tỷ";
  return vnLoc(v, 0) + " tr";
}
const toBillion = (v, unit) => (v == null ? null : unit === "tỷ" ? v : v / 1000);

const PERSON_METRIC_DEFS = [
  { key: "gmv", label: "GMV", khoiKey: "gmv", color: "#7c6cff" },
  { key: "rev", label: "Revenue", khoiKey: "rev", color: "#34d399" },
  { key: "gp", label: "Gross Profit", khoiKey: "gp", color: "#f59e0b" },
];

// period: 'year' (T1-T12, default) | 'h1' (T1-T6) | 'h2' (T7-T12) | 'm1'..'m12' (1 tháng)
export function periodToRange(period) {
  if (period === "h1") return [0, 6];
  if (period === "h2") return [6, 12];
  if (period && /^m\d{1,2}$/.test(period)) {
    const m = parseInt(period.slice(1), 10);
    return [m - 1, m];
  }
  return [0, 12];
}

export const PERSON_PERIOD_OPTIONS = [
  { value: "year", label: "Cả năm (T1–T12)", group: "Giai đoạn" },
  { value: "h1", label: "Nửa đầu năm (T1–T6)", group: "Giai đoạn" },
  { value: "h2", label: "Nửa cuối năm (T7–T12)", group: "Giai đoạn" },
  ...Array.from({ length: 12 }, (_, i) => ({ value: `m${i + 1}`, label: `Tháng ${i + 1}`, group: "Theo tháng" })),
];

export function getPersonalKpi(period = "year") {
  const [rangeStart, rangeEnd] = periodToRange(period);
  const people = BDM.map((person) => {
    const M = PERSON_METRIC_DEFS.map((m) => {
      const d = person.metrics[m.key];
      let kYTD = 0, aYTD = 0, nMonths = 0;
      const anyActual = d.actual.slice(rangeStart, rangeEnd).some((v) => v != null);
      for (let i = rangeStart; i < rangeEnd; i++) {
        if (d.actual[i] != null) {
          kYTD += d.kpi[i] || 0;
          aYTD += d.actual[i] || 0;
          nMonths++;
        }
      }
      const pct = anyActual && kYTD > 0 ? (aYTD / kYTD) * 100 : null;
      const kFY = sum(d.kpi.map((v) => v || 0));
      const aBil = toBillion(aYTD, d.unit);
      const contrib = KHOI_YTD[m.khoiKey] > 0 ? (aBil / KHOI_YTD[m.khoiKey]) * 100 : 0;
      return {
        ...m,
        unit: d.unit,
        kpi: d.kpi,
        actual: d.actual,
        actualYTDStr: aYTD > 0 ? fmtVal(aYTD, d.unit) : "–",
        kpiYTDStr: kYTD > 0 ? fmtVal(kYTD, d.unit) : "–",
        kpiFYStr: fmtVal(kFY, d.unit),
        nMonths,
        pct,
        pctStr: pct == null ? "—" : pct.toFixed(0) + "%",
        barWidth: (pct == null ? 0 : Math.min(pct, 100)) + "%",
        barColor: m.color,
        barGlow: pct != null && pct >= 90 ? "0 0 16px " + m.color + "aa" : "0 0 6px " + m.color + "44",
        contribStr: contrib.toFixed(2) + "%",
        statusColor: pct == null ? "#8a8fa6" : pct >= 100 ? "#22c55e" : pct >= 80 ? "#f59e0b" : "#fb7185",
        statusIcon: pct == null ? "–" : pct >= 100 ? "▲" : pct >= 80 ? "●" : "▼",
        statusLabel: pct == null ? "Chưa có DL" : pct >= 100 ? "Vượt KPI" : pct >= 80 ? "Đang đuổi" : "Chưa đạt",
      };
    });

    const validPct = M.map((m) => m.pct).filter((v) => v != null);
    const avgPct = validPct.length ? validPct.reduce((s, v) => s + v, 0) / validPct.length : 0;
    const rating = validPct.length ? Math.max(45, Math.min(99, Math.round(48 + avgPct * 0.35))) : 50;
    const tier =
      rating >= 90 ? { label: "ELITE", color: "#fbbf24", bg: "linear-gradient(135deg,#fde68a,#f59e0b)" } :
      rating >= 80 ? { label: "STAR", color: "#c3b9ff", bg: "linear-gradient(135deg,#b9a8ff,#7c6cff)" } :
      rating >= 70 ? { label: "PRO", color: "#93c5fd", bg: "linear-gradient(135deg,#93c5fd,#2563eb)" } :
      rating >= 60 ? { label: "PROSPECT", color: "#67e8f9", bg: "linear-gradient(135deg,#67e8f9,#0891b2)" } :
      { label: "ROOKIE", color: "#a1a1aa", bg: "linear-gradient(135deg,#d4d4d8,#71717a)" };

    const coverage = (Math.max(...M.map((m) => m.nMonths)) / Math.max(rangeEnd - rangeStart, 1)) * 100;
    const contribAvg = M.reduce((s, m) => s + parseFloat(m.contribStr), 0) / 3;
    const norm = (v) => Math.max(0, Math.min(100, v));
    const axes = [
      { label: "GMV", val: norm(M[0].pct || 0) },
      { label: "Revenue", val: norm(M[1].pct || 0) },
      { label: "GP", val: norm(M[2].pct || 0) },
      { label: "Đóng góp", val: norm(contribAvg * 3) },
      { label: "Độ phủ", val: norm(coverage) },
      { label: "Tổng", val: norm(avgPct) },
    ];

    return {
      ...person,
      metricRows: M,
      rating,
      tier,
      axes,
      overallPctStr: validPct.length ? avgPct.toFixed(0) + "%" : "—",
      contribAvgStr: contribAvg.toFixed(2) + "%",
    };
  });

  return { people };
}

// ============================================================================
// BÁO CÁO DỊCH VỤ OTA
// ============================================================================
export function getOtaAgentOptions() {
  const seen = new Set();
  const opts = [];
  OTA_REPORTS.forEach((r) => {
    if (!seen.has(r.agent)) { seen.add(r.agent); opts.push({ value: r.agent, label: r.agent }); }
  });
  return opts;
}

export function getOtaPeriodOptions(agent) {
  return OTA_REPORTS.filter((r) => r.agent === agent).map((r) => ({ value: r.periodKey, label: r.periodLabel }));
}

export function getOtaReport(agent, periodKey) {
  const r =
    OTA_REPORTS.find((x) => x.agent === agent && x.periodKey === periodKey) ||
    OTA_REPORTS.find((x) => x.agent === agent) ||
    OTA_REPORTS[0];
  const dailyBookings = r.daily.map((d) => d.bookings);
  const dailyRevenue = r.daily.map((d) => d.revenue);
  const successRate = r.totalBookings > 0 ? (r.successfulBookings / r.totalBookings) * 100 : 0;
  return {
    agent: r.agent,
    agentCode: r.agentCode,
    periodKey: r.periodKey,
    periodLabel: r.periodLabel,
    labels: r.daily.map((d) => d.label),
    dailyBookings,
    dailyRevenue,
    kpiCards: [
      { label: "Total Bookings", val: vnInt(r.totalBookings), sub: "Tổng số đơn đặt" },
      { label: "Successful Bookings", val: vnInt(r.successfulBookings), sub: pctS_(successRate) + " tỷ lệ thành công" },
      { label: "Cancelled Bookings", val: vnInt(r.cancelledBookings), sub: "Đơn huỷ" },
      { label: "Total Revenue", val: vnInt(r.totalRevenue) + " đ", sub: "Doanh thu kỳ báo cáo" },
    ],
  };
}
function pctS_(n) {
  return n.toFixed(0) + "%";
}

export function getOtaMonthlyOverview() {
  const r = OTA_MONTHLY_OVERVIEW;
  const successRate = r.totalBookings > 0 ? (r.successfulBookings / r.totalBookings) * 100 : 0;
  return {
    labels: r.monthly.map((m) => m.label),
    monthlyBookings: r.monthly.map((m) => m.bookings),
    monthlyRevenue: r.monthly.map((m) => m.revenue),
    kpiCards: [
      { label: "Total Bookings", val: vnInt(r.totalBookings), sub: "Tổng số đơn đặt · cả năm" },
      { label: "Successful Bookings", val: vnInt(r.successfulBookings), sub: pctS_(successRate) + " tỷ lệ thành công" },
      { label: "Cancelled Bookings", val: vnInt(r.cancelledBookings), sub: "Đơn huỷ" },
      { label: "Total Revenue", val: vnInt(r.totalRevenue) + " đ", sub: "Doanh thu cả năm" },
    ],
  };
}

// ============================================================================
// BÁO CÁO DỊCH VỤ LOA THANH TOÁN
// ============================================================================
export function getLoaReport() {
  const N = 6;
  const cust = LOA_CUSTOMERS.map((c) => {
    const lastCust = c.cust[N - 1], lastLoas = c.loas[N - 1];
    const avgLoaPerCust = lastCust > 0 ? lastLoas / lastCust : 0;
    return {
      ...c, lastCust, lastLoas, avgLoaPerCust, totalGtgd: sum(c.gtgd),
      lastCustStr: lastCust.toLocaleString("vi-VN"),
      lastLoasStr: lastLoas.toLocaleString("vi-VN"),
      avgLoaStr: avgLoaPerCust.toFixed(2),
      totalGtgdStr: sum(c.gtgd).toFixed(1) + " Tỷ",
    };
  });
  const grandCust = sum(cust.map((c) => c.lastCust));
  const grandLoas = sum(cust.map((c) => c.lastLoas));
  const grandGtgd = sum(cust.map((c) => c.totalGtgd));
  const avgLoa = grandCust > 0 ? grandLoas / grandCust : 0;
  return {
    customers: cust,
    months: MONTHS_12,
    kpiCards: [
      { label: "Tổng khách hàng", val: grandCust.toLocaleString("vi-VN"), sub: "Cuối T6/2026" },
      { label: "Tổng loa deployed", val: grandLoas.toLocaleString("vi-VN"), sub: "Cuối T6/2026" },
      { label: "TB loa / khách", val: avgLoa.toFixed(2), sub: "Toàn danh mục" },
      { label: "GTGD YTD", val: grandGtgd.toFixed(1) + " Tỷ", sub: "6 tháng đầu 2026" },
    ],
    legendItems: cust.map((c) => ({ name: c.name, color: c.color })),
    detailRows: cust.map((c) => ({
      name: c.name, color: c.color,
      monthCells: MONTHS_12.map((_, mi) => ({ cust: c.cust[mi] || "", loas: c.loas[mi] || "", gtgd: c.gtgd[mi] ? c.gtgd[mi].toFixed(1) : "" })),
      totalGtgd: c.totalGtgdStr,
    })),
  };
}
