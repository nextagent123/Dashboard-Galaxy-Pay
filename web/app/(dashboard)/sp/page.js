"use client";

import { useState } from "react";
import { getProductGroups, PRODUCT_OPTIONS } from "@/lib/metrics";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import ComboBarLineChart from "@/components/charts/ComboBarLineChart";

const RANGE_OPTIONS = [
  { value: "3", label: "3 kỳ gần nhất" },
  { value: "5", label: "5 kỳ gần nhất" },
  { value: "all", label: "Tất cả" },
];

export default function ProductPage() {
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState("");
  const [period, setPeriod] = useState("week");
  const [range, setRange] = useState("5");

  const { groups, matchCount } = getProductGroups({ query, pick, period, range });
  const periodLabel = period === "week" ? "theo tuần" : "theo tháng";

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · BÁO CÁO SẢN PHẨM"
        title="Báo cáo hiệu quả theo sản phẩm"
        subtitle={`Lũy kế 7 tháng 2026 + so sánh ${periodLabel} · ${matchCount} / 7 dự án`}
        right={<DateBadge>Số liệu đến 02/07/2026</DateBadge>}
      />

      <section className="grid-product-filter card" style={{ padding: "16px 18px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#8a8fa6", textTransform: "uppercase" }}>Tìm sản phẩm</span>
          <div style={{ position: "relative" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8fa6" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập tên dự án (vd: QR, HDB, SkyPOS...)"
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px 10px 36px", fontSize: 13.5, color: "#ecedf5", outline: "none" }}
            />
          </div>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#8a8fa6", textTransform: "uppercase" }}>Chọn nhanh dự án</span>
          <select value={pick} onChange={(e) => setPick(e.target.value)} style={selectStyle}>
            <option value="">Tất cả sản phẩm</option>
            {PRODUCT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.name}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#8a8fa6", textTransform: "uppercase" }}>Kiểu thời gian</span>
          <div style={{ display: "inline-flex", padding: 3, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }}>
            <div onClick={() => setPeriod("week")} style={{ padding: "7px 16px", borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: "pointer", color: period === "week" ? "#ecedf5" : "#8a8fa6", background: period === "week" ? "rgba(124,108,255,0.28)" : "transparent", boxShadow: period === "week" ? "inset 0 0 0 1px rgba(124,108,255,0.5)" : "none" }}>Tuần</div>
            <div onClick={() => setPeriod("month")} style={{ padding: "7px 16px", borderRadius: 7, fontSize: 12.5, fontWeight: 700, cursor: "pointer", color: period === "month" ? "#ecedf5" : "#8a8fa6", background: period === "month" ? "rgba(124,108,255,0.28)" : "transparent", boxShadow: period === "month" ? "inset 0 0 0 1px rgba(124,108,255,0.5)" : "none" }}>Tháng</div>
          </div>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#8a8fa6", textTransform: "uppercase" }}>Kỳ báo cáo</span>
          <select value={range} onChange={(e) => setRange(e.target.value)} style={selectStyle}>
            {RANGE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
      </section>

      {matchCount === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 14, color: "#8a8fa6", fontSize: 13.5 }}>
          Không tìm thấy sản phẩm nào khớp — thử xóa bộ lọc.
        </div>
      )}

      {groups.map((p) => (
        <section key={p.key} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "26px 28px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: p.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14, letterSpacing: 0.5 }}>{p.code}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: p.accent, letterSpacing: 0.3, textTransform: "uppercase" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#8a8fa6", marginTop: 2 }}>Chi tiết dự án · So sánh {periodLabel} · {range === "all" ? "tất cả" : range} kỳ gần nhất</div>
            </div>
          </div>

          <div className="grid-4">
            {p.kpiCards.map((k, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 6, minHeight: 100, justifyContent: "center" }}>
                <div className="mono" style={{ fontSize: 24, fontWeight: 800, color: "#ecedf5", letterSpacing: -0.5 }}>{k.val}</div>
                <div style={{ fontSize: 11.5, color: "#8a8fa6" }}>{k.label}</div>
                {k.deltaStr && <div style={{ fontSize: 11, color: k.deltaColor, fontWeight: 600, marginTop: 2 }}>{k.deltaStr}</div>}
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 20px" }}>
            <ComboBarLineChart labels={p.labels} gtgd={p.gtgd} slgd={p.slgd} accent={p.accent} header />
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5" }}>Xu hướng theo tháng · 2026</div>
                <div style={{ fontSize: 11.5, color: "#8a8fa6", marginTop: 2 }}>GTGD (cột tô) &amp; SLGD (đường vàng) · toàn bộ dữ liệu theo tháng</div>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#a7abbe" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: p.accent }} />GTGD (tỷ VND)</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 2, background: "#fbbf24" }} />SLGD</span>
              </div>
            </div>
            <ComboBarLineChart labels={p.monthLabels} gtgd={p.monthGtgd} slgd={p.monthSlgd} accent={p.accent} />
          </div>
        </section>
      ))}
    </>
  );
}

const selectStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 13.5,
  color: "#ecedf5",
  outline: "none",
  cursor: "pointer",
};
