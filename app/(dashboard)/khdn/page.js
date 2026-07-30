"use client";

import { useState } from "react";
import { getSingleChannelReport, getChannelDetail } from "@/lib/metrics";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import Icon from "@/components/ui/Icon";
import ContributionRing from "@/components/charts/ContributionRing";

const ICON = ["M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", "M16 8h2a2 2 0 0 1 2 2v11", "M8 7h2M8 11h2M8 15h2"];

export default function KhdnPage() {
  const rpt = getSingleChannelReport("KHDN");
  const [query, setQuery] = useState("");
  const rows = getChannelDetail("KHDN", query);

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · BÁO CÁO KÊNH BÁN KHDN"
        title="Báo cáo Kênh Khách hàng Doanh nghiệp"
        subtitle={`Kênh KHDN · ${rpt.periodLabel}`}
        right={<DateBadge>{rpt.uniqueCustomers} khách hàng</DateBadge>}
      />

      {/* Hero */}
      <section
        style={{
          position: "relative", overflow: "hidden", borderRadius: 20,
          border: "1px solid rgba(52,211,153,0.28)",
          background: "radial-gradient(600px 280px at 80% -10%, rgba(52,211,153,0.22), transparent 60%), linear-gradient(160deg, rgba(52,211,153,0.12), rgba(255,255,255,0.012))",
          padding: "28px 30px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <ContributionRing pct={100} color={rpt.color} size={90} sub="KHDN" big />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${rpt.color}, ${rpt.color}66)`, flexShrink: 0 }}>
                  <Icon paths={ICON} size={18} stroke="#0a0b12" strokeWidth={2.2} />
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: rpt.color }}>KHDN</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", lineHeight: 1.35 }}>Khách hàng Doanh nghiệp</div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.6, fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase" }}>
              Tổng doanh thu KHDN
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
              <span className="mono" style={{
                fontSize: 42, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1,
                background: "linear-gradient(120deg,var(--text),#6ee7b7)", WebkitBackgroundClip: "text",
                backgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {rpt.revenueStr}
              </span>
              {rpt.momentumStr && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 800,
                  padding: "5px 11px", borderRadius: 9,
                  color: rpt.momentum >= 0 ? "#34d399" : "#fb7185",
                  background: rpt.momentum >= 0 ? "rgba(52,211,153,0.14)" : "rgba(251,113,133,0.14)",
                }}>
                  {rpt.momentum >= 0 ? "▲" : "▼"} {rpt.momentumStr}
                </span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dimmer)", marginTop: 12, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
              <span>{rpt.uniqueCustomers} khách hàng</span>
              <span style={{ color: "var(--text-faint)" }}>•</span>
              <span>{rpt.quantity.toLocaleString("vi-VN")} thiết bị</span>
              <span style={{ color: "var(--text-faint)" }}>•</span>
              <span>Hoa hồng {rpt.commissionStr}</span>
              <span style={{ color: "var(--text-faint)" }}>•</span>
              <span>TB/KH {rpt.avgRevenueStr}</span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid-4">
        {[
          { label: "Khách hàng", value: rpt.uniqueCustomers, icon: "🏢" },
          { label: "Thiết bị", value: rpt.quantity.toLocaleString("vi-VN"), icon: "📱" },
          { label: "Hoa hồng", value: rpt.commissionStr, icon: "💰" },
          { label: "TB / Khách hàng", value: rpt.avgRevenueStr, icon: "📊" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>
              {s.label}
            </div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>{s.value}</div>
          </div>
        ))}
      </section>

      {/* Monthly Trend */}
      <SectionCard
        title="Xu hướng doanh thu theo tháng"
        subtitle={rpt.peakMonth ? `Đỉnh: ${rpt.peakMonth}` : ""}
      >
        <MonthlyBarChart data={rpt.monthlyTrend} color={rpt.color} />
      </SectionCard>

      {/* Top Customers */}
      <SectionCard title="Top 10 khách hàng" subtitle="Theo doanh thu">
        <div className="table-wrap" style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 520 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, background: "var(--surface-hover)" }}>
                <th style={TH}>#</th>
                <th style={TH}>Khách hàng</th>
                <th style={{ ...TH, textAlign: "right" }}>SL</th>
                <th style={{ ...TH, textAlign: "right" }}>Doanh thu</th>
                <th style={{ ...TH, textAlign: "right" }}>Tỷ trọng</th>
                <th style={{ ...TH, textAlign: "right" }}>Tháng</th>
              </tr>
            </thead>
            <tbody>
              {rpt.topCustomers.map((c) => (
                <tr key={c.rank} style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ ...TD, fontWeight: 700, color: rpt.color }}>{c.rank}</td>
                  <td style={{ ...TD, fontWeight: 600, color: "var(--text)" }}>{c.name}</td>
                  <td className="mono" style={{ ...TD, textAlign: "right" }}>{c.quantityStr}</td>
                  <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{c.revenueStr}</td>
                  <td style={{ ...TD, textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      <div style={{ width: 50, height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(c.sharePct, 100)}%`, height: "100%", borderRadius: 3, background: rpt.color }} />
                      </div>
                      <span className="mono" style={{ fontSize: 11 }}>{c.sharePct.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="mono" style={{ ...TD, textAlign: "right" }}>{c.months}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Customer List */}
      <SectionCard
        title="Danh sách chi tiết"
        subtitle={`${rows.length} lượt phát sinh`}
        right={
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm khách hàng..."
            style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: "var(--text)", outline: "none", minWidth: 180 }}
          />
        }
      >
        <div className="table-wrap" style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 520 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, background: "var(--surface-hover)" }}>
                <th style={TH}>Khách hàng</th>
                <th style={TH}>Tháng</th>
                <th style={{ ...TH, textAlign: "right" }}>SL</th>
                <th style={{ ...TH, textAlign: "right" }}>Doanh thu</th>
                <th style={{ ...TH, textAlign: "right" }}>Hoa hồng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--border-soft)" }}>
                  <td style={{ ...TD, fontWeight: 600, color: "var(--text)" }}>{r.khachHang}</td>
                  <td style={TD}>{r.thang}</td>
                  <td className="mono" style={{ ...TD, textAlign: "right" }}>{r.soLuongStr}</td>
                  <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{r.doanhThuStr}</td>
                  <td className="mono" style={{ ...TD, textAlign: "right", color: "var(--text-dim)" }}>{r.hoaHongStr}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-dim)", fontSize: 13 }}>Không tìm thấy khách hàng phù hợp.</div>
          )}
        </div>
      </SectionCard>
    </>
  );
}

function MonthlyBarChart({ data, color }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const w = 600, h = 200, pad = { t: 10, b: 30, l: 0, r: 0 };
  const plotW = w - pad.l - pad.r, plotH = h - pad.t - pad.b;
  const barW = Math.min(32, (plotW / data.length) * 0.6);
  const gap = plotW / data.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", maxHeight: 200 }}>
      {data.map((d, i) => {
        const bh = (d.revenue / max) * plotH;
        const x = pad.l + i * gap + (gap - barW) / 2;
        const y = pad.t + plotH - bh;
        const fmt = d.revenue >= 1e6 ? (d.revenue / 1e6).toFixed(1) + "tr" : Math.round(d.revenue / 1e3) + "k";
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={4} fill={color} opacity={0.85} />
            {bh > 18 && <text x={x + barW / 2} y={y + bh - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0a0b12">{fmt}</text>}
            <text x={x + barW / 2} y={h - 8} textAnchor="middle" fontSize="9.5" fill="var(--text-dim)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

const TH = { padding: "10px 12px" };
const TD = { padding: "10px 12px", color: "var(--text-dimmer)" };
