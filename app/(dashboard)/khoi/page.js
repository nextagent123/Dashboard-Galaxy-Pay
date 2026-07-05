"use client";

import { useState } from "react";
import { getKhoiKpi, getKhoiBars, getKhoiRows, getRunrate } from "@/lib/metrics";
import { MONTH_COLS } from "@/lib/data";
import { METRIC_ICON_PATHS } from "@/lib/icons";
import Icon from "@/components/ui/Icon";
import KpiCardShell from "@/components/ui/KpiCardShell";
import SegmentedTabs from "@/components/ui/SegmentedTabs";
import SectionCard from "@/components/ui/SectionCard";
import { PageHeader, DateBadge } from "@/components/ui/PageHeader";
import PlanActualBarChart from "@/components/charts/PlanActualBarChart";

const TABS = [
  { value: "gmv", label: "GMV" },
  { value: "dt", label: "Doanh thu" },
  { value: "ln", label: "Lợi nhuận" },
  { value: "dv", label: "ĐV CN Loa" },
];

export default function KhoiPage() {
  const [metric, setMetric] = useState("gmv");
  const khoiKpi = getKhoiKpi();
  const bars = getKhoiBars(metric);
  const rows = getKhoiRows();
  const runrate = getRunrate();

  return (
    <>
      <PageHeader
        eyebrow="GALAXY PAY · KPI KHỐI KINH DOANH"
        title="KPI Khối Kinh doanh 2026"
        subtitle={'Nguồn: sheet "KPI Khối Kinh doanh" · Thực đạt vs Kế hoạch theo tháng · Cập nhật đến 30/06/2026'}
        right={<DateBadge>Lũy kế T1–T6/2026</DateBadge>}
      />

      <section className="grid-4">
        {khoiKpi.map((k) => (
          <KpiCardShell key={k.key} label={k.label} icon={<Icon paths={METRIC_ICON_PATHS[k.key]} />} iconBg={k.iconBg} glow={k.glow}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14, position: "relative" }}>
              <span className="mono" style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{k.act}</span>
              <span style={{ fontSize: 12, color: "#8a8fa6", fontWeight: 600 }}>{k.unit}</span>
            </div>
            <div style={{ fontSize: 11.5, color: "#8a8fa6", marginTop: 4, position: "relative" }}>
              KH lũy kế T1–T6: <b className="mono" style={{ color: "#c9cbd8" }}>{k.plan5}</b> · {k.unit}
            </div>
            <div style={{ marginTop: 14, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8a8fa6", marginBottom: 6 }}>
                <span>Đạt vs KH T1–T6</span>
                <span className="mono" style={{ fontWeight: 700, color: k.pctColor }}>{k.pct}</span>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: k.bar, borderRadius: 6, background: k.barBg }} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 12, position: "relative" }}>
              KPI năm: <b className="mono" style={{ color: "#c9cbd8" }}>{k.yr}</b> · {k.unit}
            </div>
          </KpiCardShell>
        ))}
      </section>

      <SectionCard title="Thực đạt vs Kế hoạch theo tháng" right={<SegmentedTabs options={TABS} value={metric} onChange={setMetric} size="sm" />}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11.5, color: "#8a8fa6", marginTop: -14, marginBottom: 6 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(180deg,#b98cff,#7c6cff)" }} />Thực đạt (T1–T6)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(124,108,255,0.18)", border: "1px dashed rgba(195,185,255,0.55)" }} />Kế hoạch
          </span>
        </div>
        <PlanActualBarChart data={bars} />
      </SectionCard>

      <section>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Runrate — Ước tính cả năm theo tốc độ hiện tại</h2>
          <div style={{ fontSize: 12, color: "#8a8fa6", marginTop: 4 }}>Trung bình/tháng (T1–T6) × 12 = dự báo cả năm · so với KPI năm và KH trung bình tháng.</div>
        </div>
        <div className="grid-2">
          {runrate.map((r) => (
            <div key={r.key} style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ecedf5" }}>{r.name}</div>
                <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 7, color: r.paceColor, background: r.paceBg, whiteSpace: "nowrap" }}>
                  {r.paceArrow} Tốc độ {r.paceDelta} vs KH/tháng
                </span>
              </div>

              <div className="runrate-trio" style={{ marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6", letterSpacing: 0.4, textTransform: "uppercase" }}>Trung bình/tháng</div>
                  <div className="mono" style={{ fontSize: 17, fontWeight: 800, color: "#ecedf5", marginTop: 4 }}>{r.perMonth}</div>
                  <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 2 }}>KH/tháng: <b className="mono" style={{ color: "#c9cbd8" }}>{r.planPerMonth}</b></div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6", letterSpacing: 0.4, textTransform: "uppercase" }}>Runrate cả năm</div>
                  <div className="mono" style={{ fontSize: 17, fontWeight: 800, color: "#c3b9ff", marginTop: 4 }}>{r.forecast}</div>
                  <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 2 }}>KPI năm: <b className="mono" style={{ color: "#c9cbd8" }}>{r.yrPlan}</b></div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6", letterSpacing: 0.4, textTransform: "uppercase" }}>Đạt/thiếu vs KPI năm</div>
                  <div className="mono" style={{ fontSize: 17, fontWeight: 800, color: r.pctColor, marginTop: 4 }}>{r.pct}</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>Gap: <b className="mono" style={{ color: r.gapColor }}>{r.gap}</b></div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ position: "relative", height: 10, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, width: r.barW, borderRadius: 6, background: "linear-gradient(90deg,#7c6cff,#b98cff)" }} />
                  <div style={{ position: "absolute", top: -3, bottom: -3, left: r.markerLeft, width: 2, background: "#fbbf24", boxShadow: "0 0 6px rgba(251,191,36,0.7)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "#8a8fa6", marginTop: 6 }}>
                  <span>Runrate</span>
                  <span>▏ KPI năm (100%)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SectionCard title="Bảng chi tiết KPI Khối Kinh doanh" right={<div style={{ fontSize: 12, color: "#8a8fa6" }}>Đơn vị: tỷ VND (GMV/DT/LN) · đơn vị (ĐV CN Loa Thanh toán)</div>}>
        <div className="table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 920 }}>
            <thead>
              <tr style={{ color: "#8a8fa6" }}>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Chỉ tiêu</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>Loại</th>
                {MONTH_COLS.map((m) => (
                  <th key={m} className="mono" style={{ textAlign: "right", padding: "10px 6px", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>T{m}</th>
                ))}
                <th style={{ textAlign: "right", padding: "10px 8px", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#c3b9ff" }}>FY26</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ background: r.rowBg }}>
                  <td style={{ padding: "11px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontWeight: r.nameWeight, color: r.nameColor }}>{r.name}</td>
                  <td style={{ padding: "11px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 5, color: r.typeColor, background: r.typeBg }}>{r.type}</span>
                  </td>
                  {r.cells.map((c, i) => (
                    <td key={i} className="mono" style={{ padding: "11px 6px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "right", color: c.color }}>{c.v}</td>
                  ))}
                  <td className="mono" style={{ padding: "11px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)", textAlign: "right", fontWeight: 800, color: r.totalColor }}>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
