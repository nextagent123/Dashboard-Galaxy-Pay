"use client";

import { useState } from "react";
import { getChannelReport, getChannelDetail, CHANNEL_OPTIONS } from "@/lib/metrics";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import DualSeriesBarChart from "@/components/charts/DualSeriesBarChart";

export default function ChannelReportPage() {
  const { channels, monthlyTrend, totalRevenueStr, totalUniqueCustomers, periodLabel } = getChannelReport();
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const rows = getChannelDetail(selected, query);
  const selectedLabel = CHANNEL_OPTIONS.find((o) => o.value === selected)?.label || "Tất cả kênh";

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · BÁO CÁO QUẢN LÝ KÊNH BÁN"
        title="Đóng góp theo kênh bán hàng"
        subtitle={`Kênh Khách hàng cá nhân (KHCN) &amp; Khách hàng doanh nghiệp (KHDN) · ${periodLabel}`}
        right={<DateBadge>{totalUniqueCustomers} khách hàng · {totalRevenueStr}</DateBadge>}
      />

      <section className="grid-2">
        {channels.map((c) => {
          const isSelected = selected === c.key;
          return (
            <div
              key={c.key}
              onClick={() => setSelected(isSelected ? "all" : c.key)}
              className="card"
              style={{
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                border: isSelected ? `1px solid ${c.color}66` : undefined,
                background: isSelected ? `linear-gradient(160deg, ${c.color}1c, rgba(255,255,255,0.015))` : undefined,
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5" }}>{c.label}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 7, color: c.color, background: `${c.color}1f` }}>
                  {c.shareStr} doanh thu
                </span>
              </div>
              <div className="grid-4" style={{ gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6", textTransform: "uppercase", letterSpacing: 0.5 }}>Khách hàng</div>
                  <div className="mono" style={{ fontSize: 19, fontWeight: 800, color: "#ecedf5", marginTop: 4 }}>{c.uniqueCustomers}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6", textTransform: "uppercase", letterSpacing: 0.5 }}>Số lượng</div>
                  <div className="mono" style={{ fontSize: 19, fontWeight: 800, color: "#ecedf5", marginTop: 4 }}>{c.quantity}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6", textTransform: "uppercase", letterSpacing: 0.5 }}>Doanh thu</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: c.color, marginTop: 4 }}>{c.revenueStr}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6", textTransform: "uppercase", letterSpacing: 0.5 }}>Lợi nhuận</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: "#ecedf5", marginTop: 4 }}>{c.profitStr}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 12 }}>
                Phát sinh từ {c.firstMonthLabel} đến {c.lastMonthLabel} · nhấn để xem chi tiết khách hàng
              </div>
            </div>
          );
        })}
      </section>

      <SectionCard
        title="Xu hướng doanh thu theo tháng"
        subtitle="So sánh KHCN và KHDN theo từng tháng phát sinh"
        right={
          <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "#a7abbe" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "#7c6cff" }} />KHCN
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "#34d399" }} />KHDN
            </span>
          </div>
        }
      >
        <DualSeriesBarChart
          data={monthlyTrend}
          seriesA="khcn"
          seriesB="khdn"
          colorA="#7c6cff"
          colorB="#34d399"
          formatValue={(v) => (v >= 1e6 ? (v / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + "tr" : v.toLocaleString("vi-VN"))}
        />
      </SectionCard>

      <SectionCard
        title="Danh sách khách hàng chi tiết"
        subtitle={`${selectedLabel} · ${rows.length} lượt phát sinh`}
        right={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={selected} onChange={(e) => setSelected(e.target.value)} style={selectStyle}>
              {CHANNEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
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
                <th style={thStyle}>Kênh</th>
                <th style={thStyle}>Tháng</th>
                <th style={{ ...thStyle, textAlign: "right" }}>SL</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Doanh thu</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Hoa hồng</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Lợi nhuận</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}>
                  <td style={tdStyle}>{r.khachHang}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 6, color: r.kenhColor, background: `${r.kenhColor}1f` }}>{r.kenh}</span>
                  </td>
                  <td style={tdStyle}>{r.thang}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right" }}>{r.soLuongStr}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{r.doanhThuStr}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", color: "#8a8fa6" }}>{r.hoaHongStr}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", color: "#34d399" }}>{r.loiNhuanStr}</td>
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
