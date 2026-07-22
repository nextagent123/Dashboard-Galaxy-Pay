"use client";

import { useState } from "react";
import { getChannelReport, getChannelDetail, CHANNEL_OPTIONS } from "@/lib/metrics";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import Icon from "@/components/ui/Icon";
import DualSeriesBarChart from "@/components/charts/DualSeriesBarChart";
import ContributionRing from "@/components/charts/ContributionRing";

const CHANNEL_ICONS = {
  KHCN: ["M17 20a4 4 0 0 0-10 0", "M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"],
  KHDN: ["M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", "M16 8h2a2 2 0 0 1 2 2v11", "M8 7h2M8 11h2M8 15h2"],
};

export default function ChannelReportPage() {
  const rpt = getChannelReport();
  const { channels, monthlyTrend, totalRevenueStr, totalProfitStr, totalMarginStr, totalUniqueCustomers, totalQuantity, periodLabel, momentumStr, momentum, peakMonthLabel, leadChannelLabel, leadChannelShareStr } = rpt;
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const rows = getChannelDetail(selected, query);
  const selectedLabel = CHANNEL_OPTIONS.find((o) => o.value === selected)?.label || "Tất cả kênh";

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · BÁO CÁO QUẢN LÝ KÊNH BÁN"
        title="Đóng góp theo kênh bán hàng"
        subtitle={`Kênh Khách hàng cá nhân (KHCN) & Khách hàng doanh nghiệp (KHDN) · ${periodLabel}`}
        right={<DateBadge>{totalUniqueCustomers} khách hàng</DateBadge>}
      />

      {/* ===== Hero — tổng đóng góp ===== */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 20,
          border: "1px solid rgba(124,108,255,0.28)",
          background:
            "radial-gradient(680px 300px at 88% -10%, rgba(52,211,153,0.18), transparent 60%), radial-gradient(620px 320px at 6% 120%, rgba(124,108,255,0.22), transparent 55%), linear-gradient(160deg, rgba(124,108,255,0.14), rgba(255,255,255,0.012))",
          padding: "28px 30px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ minWidth: 260 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.6, fontWeight: 800, color: "#b9a8ff", textTransform: "uppercase" }}>
              Tổng doanh thu kênh bán
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
              <span
                className="mono"
                style={{
                  fontSize: 46, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1,
                  background: "linear-gradient(120deg,#fff,#c3b9ff)", WebkitBackgroundClip: "text",
                  backgroundClip: "text", WebkitTextFillColor: "transparent",
                }}
              >
                {totalRevenueStr}
              </span>
              {momentumStr && (
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 800,
                    padding: "5px 11px", borderRadius: 9,
                    color: momentum >= 0 ? "#34d399" : "#fb7185",
                    background: momentum >= 0 ? "rgba(52,211,153,0.14)" : "rgba(251,113,133,0.14)",
                  }}
                >
                  {momentum >= 0 ? "▲" : "▼"} {momentumStr} kỳ gần nhất
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "#a7abbe", marginTop: 12, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
              <span>{totalUniqueCustomers} khách hàng</span>
              <span style={{ color: "#5b5f74" }}>•</span>
              <span>{totalQuantity.toLocaleString("vi-VN")} thiết bị</span>
              <span style={{ color: "#5b5f74" }}>•</span>
              <span>Lợi nhuận <b style={{ color: "#34d399" }}>{totalProfitStr}</b> · biên {totalMarginStr}</span>
            </div>
          </div>

          {/* Thanh phân bổ đóng góp KHCN / KHDN */}
          <div style={{ flex: 1, minWidth: 280, maxWidth: 460 }}>
            <div style={{ fontSize: 11, color: "#8a8fa6", fontWeight: 700, letterSpacing: 0.6, marginBottom: 10, textTransform: "uppercase" }}>
              Tỷ trọng đóng góp doanh thu
            </div>
            <div style={{ display: "flex", height: 34, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
              {channels.map((c) => (
                <div
                  key={c.key}
                  title={`${c.label}: ${c.shareStr}`}
                  style={{
                    width: `${c.sharePct}%`,
                    background: `linear-gradient(180deg, ${c.color}, ${c.color}bb)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: "#0a0b12", minWidth: 42,
                  }}
                >
                  {c.sharePct >= 8 ? c.shareStr : ""}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, gap: 12 }}>
              {channels.map((c) => (
                <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                  <span style={{ fontSize: 11.5, color: "#a7abbe" }}>{c.key} · <b style={{ color: "#ecedf5" }}>{c.revenueStr}</b></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Hai thẻ kênh — đóng góp chi tiết ===== */}
      <section className="grid-2">
        {channels.map((c) => {
          const isSelected = selected === c.key;
          return (
            <div
              key={c.key}
              onClick={() => setSelected(isSelected ? "all" : c.key)}
              style={{
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                borderRadius: 18,
                padding: "24px 26px",
                border: `1px solid ${isSelected ? c.color + "88" : "rgba(255,255,255,0.09)"}`,
                background: `linear-gradient(165deg, ${c.color}1c, rgba(255,255,255,0.012))`,
                transition: "border-color 0.18s, transform 0.18s",
              }}
            >
              <div style={{ position: "absolute", top: -50, right: -30, width: 150, height: 150, borderRadius: "50%", background: c.color, opacity: 0.14, filter: "blur(34px)", pointerEvents: "none" }} />

              <div style={{ display: "flex", gap: 22, alignItems: "center", position: "relative" }}>
                <ContributionRing pct={c.sharePct} color={c.color} size={116} sub="doanh thu" big />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${c.color}, ${c.color}66)`, flexShrink: 0 }}>
                      <Icon paths={CHANNEL_ICONS[c.key]} size={18} stroke="#0a0b12" strokeWidth={2.2} />
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: c.color }}>{c.key}</span>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "#ecedf5", lineHeight: 1.35 }}>{c.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
                    <span className="mono" style={{ fontSize: 26, fontWeight: 800, color: "#ecedf5", letterSpacing: -0.5 }}>{c.revenueStr}</span>
                    <span style={{ fontSize: 11.5, color: "#8a8fa6" }}>doanh thu</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 20, position: "relative" }}>
                {[
                  { k: "Khách hàng", v: c.uniqueCustomers },
                  { k: "Thiết bị", v: c.quantity.toLocaleString("vi-VN") },
                  { k: "Lợi nhuận", v: c.profitStr, accent: "#34d399" },
                  { k: "Biên LN", v: c.marginStr, accent: c.color },
                ].map((s) => (
                  <div key={s.k} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 11, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "#8a8fa6", textTransform: "uppercase", letterSpacing: 0.4 }}>{s.k}</div>
                    <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: s.accent || "#ecedf5", marginTop: 4 }}>{s.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 14, position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
                Phát sinh {c.activeMonths} tháng ({c.firstMonthLabel} → {c.lastMonthLabel}) · nhấn để lọc chi tiết
              </div>
            </div>
          );
        })}
      </section>

      {/* ===== Xu hướng theo tháng ===== */}
      <SectionCard
        title="Xu hướng doanh thu theo tháng"
        subtitle={`Đỉnh cao rơi vào ${peakMonthLabel} · dẫn dắt bởi ${leadChannelLabel} (${leadChannelShareStr})`}
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

      {/* ===== Chi tiết khách hàng ===== */}
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
        <div className="table-wrap" style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 720 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8a8fa6", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, background: "rgba(255,255,255,0.03)" }}>
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
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#ecedf5" }}>{r.khachHang}</td>
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

const thStyle = { padding: "10px 12px" };
const tdStyle = { padding: "10px 12px", color: "#c9cbd8" };
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
