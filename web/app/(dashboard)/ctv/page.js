"use client";

import { useState } from "react";
import { getNvkdSummary, getNvkdList, getNvkdMonthlyTrend, getNvkdDetail } from "@/lib/metrics";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import SimpleBarChart from "@/components/charts/SimpleBarChart";

const ACCENT = "#7c6cff";
const fmtVndShort = (v) => (v >= 1e6 ? (v / 1e6).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) + "tr" : v.toLocaleString("vi-VN"));
const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_ORDER = [1, 0, 2]; // silver, gold, bronze — gold in the middle

export default function CtvReportPage() {
  const summary = getNvkdSummary();
  const list = getNvkdList();
  const monthlyTrend = getNvkdMonthlyTrend();
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const rows = getNvkdDetail(selected, query);

  const top3 = list.slice(0, 3);
  const nonZero = monthlyTrend.filter((m) => m.revenue > 0);
  const momentum = nonZero.length >= 2 && nonZero[nonZero.length - 2].revenue > 0
    ? (nonZero[nonZero.length - 1].revenue / nonZero[nonZero.length - 2].revenue - 1) * 100
    : null;

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · BÁO CÁO CỘNG TÁC VIÊN"
        title="Hiệu quả cộng tác viên (NVKD)"
        subtitle="Số lượng khách hàng giới thiệu, doanh thu phát sinh & hoa hồng nhận được"
        right={<DateBadge>{summary.totalCtv} cộng tác viên</DateBadge>}
      />

      {/* ===== Hero — tổng đóng góp ===== */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 20,
          border: "1px solid rgba(124,108,255,0.28)",
          background:
            "radial-gradient(640px 300px at 90% -20%, rgba(251,191,36,0.16), transparent 60%), radial-gradient(620px 320px at 4% 130%, rgba(124,108,255,0.24), transparent 55%), linear-gradient(160deg, rgba(124,108,255,0.14), rgba(255,255,255,0.012))",
          padding: "28px 30px",
          display: "flex",
          flexWrap: "wrap",
          gap: 26,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 260 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.6, fontWeight: 800, color: "#b9a8ff", textTransform: "uppercase" }}>
            Doanh thu phát sinh từ cộng tác viên
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
              {summary.totalRevenueStr}
            </span>
            {momentum != null && (
              <span
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 800,
                  padding: "5px 11px", borderRadius: 9,
                  color: momentum >= 0 ? "#34d399" : "#fb7185",
                  background: momentum >= 0 ? "rgba(52,211,153,0.14)" : "rgba(251,113,133,0.14)",
                }}
              >
                {momentum >= 0 ? "▲" : "▼"} {(momentum >= 0 ? "+" : "") + momentum.toFixed(1)}% kỳ gần nhất
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: "#a7abbe", marginTop: 12, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
            <span><b style={{ color: "#ecedf5" }}>{summary.totalCtv}</b> cộng tác viên</span>
            <span style={{ color: "#5b5f74" }}>•</span>
            <span><b style={{ color: "#ecedf5" }}>{summary.totalCustomers}</b> lượt giới thiệu</span>
            <span style={{ color: "#5b5f74" }}>•</span>
            <span>Hoa hồng <b style={{ color: "#fbbf24" }}>{summary.totalCommissionStr}</b></span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10.5, color: "#8a8fa6", textTransform: "uppercase", letterSpacing: 0.6 }}>TB / cộng tác viên</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: "#ecedf5", marginTop: 4 }}>{summary.avgRevenueStr}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10.5, color: "#8a8fa6", textTransform: "uppercase", letterSpacing: 0.6 }}>Lợi nhuận gộp</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: "#34d399", marginTop: 4 }}>{summary.totalProfitStr}</div>
          </div>
        </div>
      </section>

      {/* ===== Bục vinh danh Top 3 ===== */}
      <section>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#ecedf5", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span>⭐</span> Top cộng tác viên xuất sắc
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "end" }} className="grid-3">
          {PODIUM_ORDER.map((idx) => {
            const c = top3[idx];
            if (!c) return <div key={idx} />;
            const isGold = idx === 0;
            return (
              <div
                key={c.name}
                onClick={() => setSelected(c.name)}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                  borderRadius: 18,
                  padding: isGold ? "26px 22px 24px" : "20px 20px",
                  border: `1px solid ${c.tier.color}55`,
                  background: `linear-gradient(180deg, ${c.tier.color}1e, rgba(255,255,255,0.012))`,
                  transform: isGold ? "translateY(-6px)" : "none",
                  boxShadow: isGold ? `0 16px 40px -18px ${c.tier.color}aa` : "none",
                }}
              >
                <div style={{ position: "absolute", top: -40, right: -30, width: 130, height: 130, borderRadius: "50%", background: c.tier.color, opacity: 0.16, filter: "blur(30px)", pointerEvents: "none" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", gap: 10 }}>
                  <div style={{ fontSize: isGold ? 34 : 28 }}>{MEDALS[idx]}</div>
                  <div
                    style={{
                      width: isGold ? 66 : 54, height: isGold ? 66 : 54, borderRadius: "50%",
                      background: c.tier.bg, display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 900, color: "#0a0b12", fontSize: isGold ? 22 : 18,
                      boxShadow: `0 6px 18px ${c.tier.color}55, inset 0 1px 0 rgba(255,255,255,0.4)`,
                    }}
                    className="mono"
                  >
                    {c.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: isGold ? 16 : 14, fontWeight: 800, color: "#ecedf5", lineHeight: 1.25 }}>{c.name}</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 9.5, fontWeight: 900, letterSpacing: 1, color: "#0a0b12", background: c.tier.bg, padding: "2px 9px", borderRadius: 6 }}>
                      ★ {c.tier.label}
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: isGold ? 24 : 20, fontWeight: 800, color: c.tier.color, letterSpacing: -0.5 }}>{c.revenueStr}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#8a8fa6" }}>
                    <span>{c.shareStr} tổng DT</span>
                    <span>{c.uniqueCustomers} KH</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== KPI strip ===== */}
      <div className="grid-4">
        {[
          { label: "Tổng số CTV", val: String(summary.totalCtv), sub: "Đang phát sinh doanh thu", accent: ACCENT },
          { label: "Lượt KH giới thiệu", val: String(summary.totalCustomers), sub: "Tổng lượt phát sinh", accent: "#38bdf8" },
          { label: "Doanh thu phát sinh", val: summary.totalRevenueStr, sub: "Cộng dồn tất cả CTV", accent: "#34d399" },
          { label: "Hoa hồng chi trả", val: summary.totalCommissionStr, sub: "Cộng dồn tất cả CTV", accent: "#fbbf24" },
        ].map((s) => (
          <div key={s.label} style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 100, height: 100, borderRadius: "50%", background: s.accent, opacity: 0.14, filter: "blur(22px)" }} />
            <div style={{ fontSize: 10.5, color: "#8a8fa6", letterSpacing: 1.1, fontWeight: 700, textTransform: "uppercase", position: "relative" }}>{s.label}</div>
            <div className="mono" style={{ fontSize: 26, fontWeight: 800, color: "#ecedf5", marginTop: 6, letterSpacing: -0.5, position: "relative" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 4, position: "relative" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ===== Xu hướng theo tháng ===== */}
      <SectionCard title="Doanh thu theo tháng" subtitle="Toàn bộ cộng tác viên · theo tháng phát sinh">
        <SimpleBarChart
          labels={monthlyTrend.map((m) => m.label)}
          values={monthlyTrend.map((m) => m.revenue)}
          color={ACCENT}
          formatValue={fmtVndShort}
        />
      </SectionCard>

      {/* ===== Bảng xếp hạng ===== */}
      <SectionCard title="Bảng xếp hạng cộng tác viên" subtitle={`${list.length} CTV · sắp xếp theo doanh thu đóng góp`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
          {list.map((n) => {
            const isSelected = selected === n.name;
            return (
              <div
                key={n.name}
                onClick={() => setSelected(n.name)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "34px 40px 1fr 128px 100px 96px",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  border: `1px solid ${isSelected ? ACCENT + "66" : "rgba(255,255,255,0.05)"}`,
                  background: isSelected ? "rgba(124,108,255,0.08)" : "rgba(255,255,255,0.02)",
                }}
                className="ctv-rank-row"
              >
                <span className="mono" style={{ fontSize: 13, fontWeight: 800, color: n.rank <= 3 ? n.tier.color : "#565a6e", textAlign: "center" }}>
                  {n.rank <= 3 ? MEDALS[n.rank - 1] : n.rank}
                </span>
                <span
                  className="mono"
                  style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#0a0b12", background: n.tier.bg, flexShrink: 0 }}
                >
                  {n.initials}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "#ecedf5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.6, color: n.tier.color, border: `1px solid ${n.tier.color}55`, borderRadius: 5, padding: "1px 6px", flexShrink: 0 }}>{n.tier.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 3 }}>{n.uniqueCustomers} KH · {n.quantity.toLocaleString("vi-VN")} thiết bị</div>
                </div>
                <div>
                  <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.max(n.revenueBarPct, 2)}%`, borderRadius: 4, background: `linear-gradient(90deg, ${n.tier.color}, ${n.tier.color}aa)` }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#8a8fa6", marginTop: 4 }}>{n.shareStr} tổng DT</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 13.5, fontWeight: 800, color: "#ecedf5" }}>{n.revenueStr}</div>
                  <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 2 }}>HH {n.commissionStr}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: ACCENT, background: `${ACCENT}1a`, border: `1px solid ${ACCENT}44`, borderRadius: 8, padding: "5px 10px" }}>
                    Chi tiết
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ===== Chi tiết khách hàng ===== */}
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
        <div className="table-wrap" style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 720 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8a8fa6", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, background: "rgba(255,255,255,0.03)" }}>
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
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#ecedf5" }}>{r.khachHang}</td>
                  {selected === "all" && <td style={tdStyle}>{r.nvkd}</td>}
                  <td style={tdStyle}>{r.thang}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right" }}>{r.soLuongStr}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{r.doanhThuStr}</td>
                  <td className="mono" style={{ ...tdStyle, textAlign: "right", color: "#fbbf24" }}>{r.hoaHongStr}</td>
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
