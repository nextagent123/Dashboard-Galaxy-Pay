"use client";

import { useState } from "react";
import { getCompanyKpi, getCompanyBars, getCompanyRows } from "@/lib/metrics";
import { MONTH_COLS } from "@/lib/data";
import { METRIC_ICON_PATHS } from "@/lib/icons";
import Icon from "@/components/ui/Icon";
import KpiCardShell from "@/components/ui/KpiCardShell";
import SegmentedTabs from "@/components/ui/SegmentedTabs";
import SectionCard from "@/components/ui/SectionCard";
import { PageHeader, DateBadge } from "@/components/ui/PageHeader";
import BarTrendChart from "@/components/charts/BarTrendChart";
import GrowthBarChart from "@/components/charts/GrowthBarChart";

const GROWTH_REVENUE = {
  title: "Doanh thu",
  unit: "Triệu đồng",
  years: [2022, 2023, 2024, 2025, 2026],
  h1:       [0,     9282,  32520,  110944, 114764],
  fullYear: [9911,  24403, 80396,  231294, 345003],
  forecastYear: 2026,
};

const GROWTH_GMV = {
  title: "GMV",
  unit: "Tỷ đồng",
  years: [2022, 2023, 2024, 2025, 2026],
  h1:       [0,    3199, 5748, 6191,  8647],
  fullYear: [21,   7998, 11833, 12843, 24028],
  forecastYear: 2026,
};

const TABS = [
  { value: "gmv", label: "GMV" },
  { value: "dt", label: "Doanh thu" },
  { value: "ln", label: "Lợi nhuận" },
];

export default function CompanyPage() {
  const [metric, setMetric] = useState("gmv");
  const companyKpi = getCompanyKpi();
  const bars = getCompanyBars(metric);
  const rows = getCompanyRows();

  return (
    <>
      <PageHeader
        eyebrow="GALAXY PAY · KẾ HOẠCH KINH DOANH TOÀN CÔNG TY"
        title="KPI Company 2026"
        subtitle={'Nguồn: sheet "Overall KPI Công ty" — kế hoạch tổng công ty theo 12 tháng'}
        right={<DateBadge>FY 2026 · Kế hoạch</DateBadge>}
      />

      <SectionCard
        title="Chỉ số tăng trưởng — Tăng trưởng bền vững, tạo giá trị"
        subtitle="So sánh H1 vs Full Year qua các năm · Đường nét đứt = xu hướng đa thức (Full Year)"
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <GrowthBarChart {...GROWTH_REVENUE} />
          <GrowthBarChart {...GROWTH_GMV} />
        </div>
      </SectionCard>

      <section className="grid-3">
        {companyKpi.map((k) => (
          <KpiCardShell key={k.key} label={k.label} icon={<Icon paths={METRIC_ICON_PATHS[k.key]} />} iconBg={k.iconBg} glow={k.glow}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14, position: "relative" }}>
              <span className="mono" style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{k.year}</span>
              <span style={{ fontSize: 13, color: "#8a8fa6", fontWeight: 600 }}>tỷ VND / năm</span>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 18, position: "relative", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div style={{ fontSize: 11, color: "#8a8fa6" }}>H1</div>
                <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: "#c9cbd8", marginTop: 3 }}>{k.h1} tỷ</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8a8fa6" }}>H2</div>
                <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: "#c9cbd8", marginTop: 3 }}>{k.h2} tỷ</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#8a8fa6" }}>Tháng cao nhất</div>
                <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: "#c3b9ff", marginTop: 3 }}>T{k.peakM} · {k.peakV}</div>
              </div>
            </div>
          </KpiCardShell>
        ))}
      </section>

      <SectionCard
        title="Kế hoạch theo tháng 2026 — Toàn công ty"
        subtitle="Chọn chỉ số để xem chi tiết. Đơn vị: tỷ VND · Cột nổi bật = tháng cao nhất trong năm."
        right={<SegmentedTabs options={TABS} value={metric} onChange={setMetric} />}
      >
        <BarTrendChart data={bars} heightPx={240} gap="10px" maxBarWidth={46} labelPrefix="T" />
      </SectionCard>

      <SectionCard title="Bảng KPI toàn công ty theo tháng" right={<div style={{ fontSize: 12, color: "#8a8fa6" }}>Đơn vị: tỷ VND</div>}>
        <div className="table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 820 }}>
            <thead>
              <tr style={{ color: "#8a8fa6" }}>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Chỉ tiêu</th>
                {MONTH_COLS.map((m) => (
                  <th key={m} className="mono" style={{ textAlign: "right", padding: "10px 6px", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>T{m}</th>
                ))}
                <th style={{ textAlign: "right", padding: "10px 8px", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#c3b9ff" }}>FY26</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td style={{ padding: "12px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontWeight: 700, color: "#ecedf5" }}>{r.name}</td>
                  {r.cells.map((c, i) => (
                    <td key={i} className="mono" style={{ padding: "12px 6px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "right", color: c.color }}>{c.v}</td>
                  ))}
                  <td className="mono" style={{ padding: "12px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "right", fontWeight: 800, color: "#c3b9ff" }}>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
