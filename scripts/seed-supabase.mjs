#!/usr/bin/env node
// Seed Supabase dashboard_data table with current static data.
// Usage: SUPABASE_URL=... SUPABASE_KEY=... node scripts/seed-supabase.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_KEY (or NEXT_PUBLIC_ variants)");
  process.exit(1);
}

const supabase = createClient(URL, KEY);

const {
  FALLBACK_TGT, FALLBACK_ACT, COMPANY, KHOI, KHOI_YTD,
  PIPELINE_GROUPS, PRODUCTS, BDM, OTA_REPORTS, OTA_MONTHLY_OVERVIEW,
  LOA_SOURCES, CHANNEL_SALES, NVKD_SALES,
} = await import("../lib/data.js");

const rows = [
  {
    key: "kpi_target",
    description: "KPI Target — kế hoạch 12 tháng (GMV/DT/LN, đơn vị tỷ VND)",
    data: { gmv: FALLBACK_TGT.gmv, dt: FALLBACK_TGT.dt, ln: FALLBACK_TGT.ln },
  },
  {
    key: "kpi_actual",
    description: "KPI Actual — thực đạt (GMV/DT/LN, đơn vị tỷ VND). Thêm số mới vào cuối mảng khi có dữ liệu tháng mới.",
    data: { gmv: FALLBACK_ACT.gmv, dt: FALLBACK_ACT.dt, ln: FALLBACK_ACT.ln },
  },
  {
    key: "company",
    description: "KPI Company — kế hoạch toàn công ty 12 tháng",
    data: { gmv: { data: COMPANY.gmv.data }, dt: { data: COMPANY.dt.data }, ln: { data: COMPANY.ln.data } },
  },
  {
    key: "khoi",
    description: "KPI Khối Kinh doanh — plan vs actual theo tháng",
    data: {
      gmv: { plan: KHOI.gmv.plan, act: KHOI.gmv.act },
      dt: { plan: KHOI.dt.plan, act: KHOI.dt.act },
      ln: { plan: KHOI.ln.plan, act: KHOI.ln.act },
      dv: { plan: KHOI.dv.plan, act: KHOI.dv.act },
    },
  },
  {
    key: "khoi_ytd",
    description: "Lũy kế Khối KD T1-T6/2026 (tỷ VND)",
    data: { gmv: KHOI_YTD.gmv, rev: KHOI_YTD.rev, gp: KHOI_YTD.gp },
  },
  {
    key: "pipeline",
    description: "Sale Pipeline — dự án & cơ hội kinh doanh",
    data: PIPELINE_GROUPS.map(g => ({
      key: g.key, label: g.label, short: g.short, unit: g.unit,
      color: g.color, barCol: g.barCol,
      zoneBg: g.zoneBg, zoneBorder: g.zoneBorder,
      zoneTag: g.zoneTag, zoneNarrative: g.zoneNarrative,
      target: g.target, runrate: g.runrate, actYTD: g.actYTD,
      prevYear: g.prevYear, monthsElapsed: g.monthsElapsed,
      monthlyTargets: g.monthlyTargets, desc: g.desc,
      featured: g.featured, projects: g.projects,
    })),
  },
  {
    key: "products",
    description: "Báo cáo sản phẩm — GTGD & SLGD theo tuần/tháng",
    data: PRODUCTS.map(p => ({
      key: p.key, code: p.code, name: p.name, accent: p.accent,
      weeks: p.weeks, months: p.months,
    })),
  },
  {
    key: "bdm",
    description: "KPI cá nhân BDM — GMV/Rev/GP theo tháng",
    data: BDM.map(b => ({
      name: b.name, role: b.role, accent: b.accent, short: b.short,
      metrics: b.metrics,
    })),
  },
  {
    key: "ota_reports",
    description: "Báo cáo Dịch vụ OTA — chi tiết theo đối tác",
    data: OTA_REPORTS,
  },
  {
    key: "ota_monthly",
    description: "OTA — tổng quan theo tháng",
    data: OTA_MONTHLY_OVERVIEW,
  },
  {
    key: "loa_sources",
    description: "Báo cáo Dịch vụ Loa thanh toán — nguồn khai thác",
    data: LOA_SOURCES,
  },
  {
    key: "channel_sales",
    description: "Báo cáo Quản lý Kênh bán — KHCN & KHDN",
    data: CHANNEL_SALES,
  },
  {
    key: "nvkd_sales",
    description: "Báo cáo Cộng tác viên (NVKD)",
    data: NVKD_SALES,
  },
];

console.log(`Seeding ${rows.length} rows into dashboard_data...`);

const { error } = await supabase
  .from("dashboard_data")
  .upsert(rows, { onConflict: "key" });

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log("Done! All dashboard data seeded to Supabase.");
