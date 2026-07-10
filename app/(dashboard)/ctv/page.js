"use client";

import { useState } from "react";
import { getNvkdSummary, getNvkdList, getNvkdMonthlyTrend, getNvkdDetail } from "@/lib/metrics";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import StatCard from "@/components/ui/StatCard";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import RankedBarList from "@/components/charts/RankedBarList";

const ACCENT = "#7c6cff";
const fmtVndShort = (v) => (v >= 1e6 ? (v / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + "tr" : v.toLocaleString("vi-VN"));

export default function CtvReportPage() {
  const summary = getNvkdSummary();
  const list = getNvkdList();
  const monthlyTrend = getNvkdMonthlyTrend();
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const rows = getNvkdDetail(selected, query);
  const topN = list.slice(0, 8).map((n) => ({ label: n.name, value: n.revenue, valueStr: n.revenueStr }));

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · BÁO CÁO CỘNG TÁC VIÊN"
        title="Hiệu quả cộng tác viên (NVKD)"
        subtitle="Số lượng khách hàng giới thiệu, doanh thu phát sinh &amp; hoa hồng nhận được"
        right={<DateBadge>{summary.totalCtv} cộng tác viên</DateBadge>}
      />

      <div className="grid-4">
        <StatCard label="Tổng số CTV" val={String(summary.totalCtv)} sub="Đang phát sinh doanh thu" />
        <StatCard label="Lượt khách hàng giới thiệu" val={String(summary.totalCustomers)} sub="Tổng lượt phát sinh · toàn bộ CTV" />
        <StatCard label="Doanh thu phát sinh" val={summary.totalRevenueStr} sub="Cộng dồn tất cả CTV" />
        <StatCard label="Hoa hồng nhận được" val={summary.totalCommissionStr} sub="Cộng dồn tất cả CTV" />
      </div>

      <section className="grid-2">
        <SectionCard title="Doanh thu theo tháng" subtitle="Toàn bộ CTV · theo tháng phát sinh">
          <SimpleBarChart
            labels={monthlyTrend.map((m) => m.label)}
            values={monthlyTrend.map((m) => m.revenue)}
            color={ACCENT}
            formatValue={fmtVndShort}
          />
        </SectionCard>
        <SectionCard title="Top cộng tác viên theo doanh thu" subtitle="8 CTV đóng góp doanh thu cao nhất">
          <RankedBarList rows={topN} color={ACCENT} onSelect={(name) => setSelected(name)} />
        </SectionCard>
      </section>

      <SectionCard title="Bảng xếp hạng cộng tác viên" subtitle={`${list.length} CTV · sắp xếp theo doanh thu giảm dần`}>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8a8fa6", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>
                <th style={thStyle}>CTV</th>
                <th style={{ ...thStyle, textAlign: "right" }}>KH giới thiệu</th>
                <th style={{ ...thStyle, textAlign: "right" }}>SL</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Doanh thu</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Hoa hồng</th>
                <th style={{ ...thStyle, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {list.map((n) => (
                <tr key={n.name} style={{ borderTop: "1px solid rgba(255,255,255,0.055)", background: selected === n.name ? "rgba(124,108,255,0.06)" : undefined }}>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "#ecedf5" }}>{n.name}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right" }}>{n.customerCount}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right" }}>{n.quantity}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{n.revenueStr}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", color: "#34d399" }}>{n.commissionStr}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button
                      onClick={() => setSelected(n.name)}
                      style={{
                        fontSize: 11.5, fontWeight: 700, color: ACCENT, background: `${ACCENT}1a`, border: `1px solid ${ACCENT}44`,
                        borderRadius: 8, padding: "5px 10px", cursor: "pointer",
                      }}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Danh sách khách hàng chi tiết"
        subtitle={`${selected === "all" ? "Tất cả CTV" : selected} · ${rows.length} lượt phát sinh`}
        right={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={selected} onChange={(e) => setSelected(e.target.value)} style={selectStyle}>
              <option value="all">Tất cả CTV</option>
              {list.map((n) => (
                <option key={n.name} value={n.name}>{n.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm khách hàng..."
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: "#ecedf5", outline: "none", minWidth: 180 }}
            />
          </div>
        }
      >
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8a8fa6", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>
                <th style={thStyle}>Khách hàng</th>
                {selected === "all" && <th style={thStyle}>CTV</th>}
                <th style={thStyle}>Tháng</th>
                <th style={{ ...thStyle, textAlign: "right" }}>SL</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Doanh thu</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Hoa hồng</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Lợi nhuận gộp</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}>
                  <td style={tdStyle}>{r.khachHang}</td>
                  {selected === "all" && <td style={tdStyle}>{r.nvkd}</td>}
                  <td style={tdStyle}>{r.thang}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right" }}>{r.soLuongStr}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{r.doanhThuStr}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", color: "#8a8fa6" }}>{r.hoaHongStr}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", color: "#34d399" }}>{r.loiNhuanGopStr}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#8a8fa6", fontSize: 13 }}>Không tìm thấy khách hàng phù hợp.</div>
          )}
        </div>
      </SectionCard>
    </>
  );
}

const thStyle = { padding: "8px 10px" };
const tdStyle = { padding: "9px 10px", color: "#c9cbd8" };
const selectStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 12.5,
  color: "#ecedf5",
  outline: "none",
  cursor: "pointer",
};
