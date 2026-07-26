import { supabase } from "./supabase";
import {
  FALLBACK_TGT,
  FALLBACK_ACT,
  COMPANY,
  KHOI,
  PIPELINE_GROUPS,
  PRODUCTS,
  BDM,
  KHOI_YTD,
  OTA_REPORTS,
  OTA_MONTHLY_OVERVIEW,
  LOA_SOURCES,
  CHANNEL_SALES,
  NVKD_SALES,
} from "./data";

let _synced = false;
let _promise = null;

function applyArray(target, source) {
  if (!Array.isArray(source) || source.length === 0) return;
  target.length = 0;
  target.push(...source);
}

function applyKpi(target, source) {
  if (source.gmv) target.gmv = source.gmv;
  if (source.dt) target.dt = source.dt;
  if (source.ln) target.ln = source.ln;
}

function applyKhoi(target, source) {
  for (const k of ["gmv", "dt", "ln", "dv"]) {
    if (!source[k]) continue;
    if (source[k].plan) target[k].plan = source[k].plan;
    if (source[k].act) target[k].act = source[k].act;
  }
}

function applyCompany(target, source) {
  for (const k of ["gmv", "dt", "ln"]) {
    if (source[k]?.data) target[k].data = source[k].data;
  }
}

function isValidPipeline(d) {
  if (!Array.isArray(d)) return false;
  return d.every(
    (g) =>
      g.key && typeof g.target === "number" && typeof g.runrate === "number" &&
      Array.isArray(g.projects) && Array.isArray(g.featured) &&
      Array.isArray(g.monthlyTargets)
  );
}

function isValidBdm(d) {
  if (!Array.isArray(d)) return false;
  return d.every(
    (b) =>
      b.name && b.metrics &&
      b.metrics.gmv?.kpi && b.metrics.gmv?.actual &&
      b.metrics.rev?.kpi && b.metrics.rev?.actual &&
      b.metrics.gp?.kpi && b.metrics.gp?.actual
  );
}

const APPLY = {
  kpi_target: (d) => applyKpi(FALLBACK_TGT, d),
  kpi_actual: (d) => applyKpi(FALLBACK_ACT, d),
  company: (d) => applyCompany(COMPANY, d),
  khoi: (d) => applyKhoi(KHOI, d),
  khoi_ytd: (d) => Object.assign(KHOI_YTD, d),
  pipeline: (d) => { if (isValidPipeline(d)) applyArray(PIPELINE_GROUPS, d); },
  products: (d) => applyArray(PRODUCTS, d),
  bdm: (d) => { if (isValidBdm(d)) applyArray(BDM, d); },
  ota_reports: (d) => applyArray(OTA_REPORTS, d),
  ota_monthly: (d) => Object.assign(OTA_MONTHLY_OVERVIEW, d),
  loa_sources: (d) => applyArray(LOA_SOURCES, d),
  channel_sales: (d) => applyArray(CHANNEL_SALES, d),
  nvkd_sales: (d) => applyArray(NVKD_SALES, d),
};

async function doSync() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from("dashboard_data")
      .select("key, data");
    if (error || !data) return;
    for (const row of data) {
      const fn = APPLY[row.key];
      if (fn && row.data) fn(row.data);
    }
    _synced = true;
  } catch {}
}

export function syncDashboardData() {
  if (_synced) return Promise.resolve();
  if (!_promise) _promise = doSync();
  return _promise;
}

export function isSynced() {
  return _synced;
}
