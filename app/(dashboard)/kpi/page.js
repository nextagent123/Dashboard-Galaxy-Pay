"use client";

import { useState } from "react";
import { getPersonalKpi, PERSON_PERIOD_OPTIONS } from "@/lib/metrics";
import { MONTHS_12 } from "@/lib/data";
import { vn } from "@/lib/format";
import { ReportHeader } from "@/components/ui/PageHeader";
import GroupedCompareChart from "@/components/charts/GroupedCompareChart";
import RadarHexagon from "@/components/charts/RadarHexagon";
import PersonMonthChart from "@/components/charts/PersonMonthChart";

const fmtForUnit = (unit) => (v) => (unit === "tỷ" ? vn(v, 1) : vn(Math.round(v), 0));

const PERIOD_GROUPS = ["Giai đoạn", "Theo tháng"];

export default function PersonalKpiPage() {
  const [period, setPeriod] = useState("year");
  const [bdm, setBdm] = useState("all");
  const { people: allPeople } = getPersonalKpi(period);
  const people = bdm === "all" ? allPeople : allPeople.filter((p) => p.name === bdm);
  const periodLabel = (PERSON_PERIOD_OPTIONS.find((o) => o.value === period) || {}).label || "Cả năm";

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · BÁO CÁO KPI CÁ NHÂN"
        title="KPI Khối Kinh doanh &amp; cá nhân"
        subtitle="GMV · Revenue · Gross Profit — Phân bổ theo Target đóng góp Khối"
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, color: "#8a8fa6", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "9px 13px", borderRadius: 11 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
            <span>Số liệu đến 30/06/2026 · KPI Theo BDM</span>
          </div>
        }
      />

      <section className="card" style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "end", padding: "16px 20px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#8a8fa6", textTransform: "uppercase" }}>BDM phụ trách</span>
          <select value={bdm} onChange={(e) => setBdm(e.target.value)} style={selectStyle}>
            <option value="all">Tất cả</option>
            {allPeople.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: "#8a8fa6", textTransform: "uppercase" }}>Thời gian đánh giá</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={selectStyle}>
            {PERIOD_GROUPS.map((g) => (
              <optgroup key={g} label={g}>
                {PERSON_PERIOD_OPTIONS.filter((o) => o.group === g).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </section>

      <section style={{ background: "linear-gradient(135deg, rgba(124,108,255,0.12), rgba(124,108,255,0.03))", border: "1px solid rgba(124,108,255,0.25)", borderRadius: 14, padding: "20px 24px", display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 18, alignItems: "center" }} className="khoi-strip">
        <div>
          <div style={{ fontSize: 11, color: "#c3b9ff", letterSpacing: 1.5, fontWeight: 700 }}>KPI KHỐI KINH DOANH · FY2026</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#ecedf5", marginTop: 6 }}>Chỉ tiêu tổng khối</div>
          <div style={{ fontSize: 12, color: "#8a8fa6", marginTop: 2 }}>Cơ sở tính đóng góp cá nhân</div>
        </div>
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 18 }}>
          <div style={{ fontSize: 11, color: "#8a8fa6" }}>GMV</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: "#7c6cff" }}>24.028 Tỷ</div>
        </div>
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 18 }}>
          <div style={{ fontSize: 11, color: "#8a8fa6" }}>Revenue</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: "#34d399" }}>345 Tỷ</div>
        </div>
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: 18 }}>
          <div style={{ fontSize: 11, color: "#8a8fa6" }}>Gross Profit</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b" }}>74 Tỷ</div>
        </div>
      </section>

      <section style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#ecedf5" }}>Mức độ hoàn thành KPI theo cá nhân</div>
            <div style={{ fontSize: 11.5, color: "#8a8fa6", marginTop: 3 }}>% Đạt — GMV / Revenue / Gross Profit · {periodLabel} · Mốc 100% = Đạt KPI</div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#a7abbe" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 10, background: "#7c6cff", borderRadius: 2 }} />GMV</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 10, background: "#34d399", borderRadius: 2 }} />Revenue</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 10, background: "#f59e0b", borderRadius: 2 }} />Gross Profit</span>
          </div>
        </div>
        <GroupedCompareChart people={people} />
      </section>

      {people.map((person) => (
        <section key={person.name} style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18, overflow: "hidden", position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="player-identity">
            <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, borderRadius: "50%", background: person.accent, filter: "blur(80px)", opacity: 0.16, pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
                <div style={{ width: 82, height: 82, borderRadius: 16, background: person.tier.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 26px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)", flexShrink: 0 }}>
                  <div className="mono" style={{ fontSize: 36, fontWeight: 900, color: "#0a0b12", letterSpacing: -1.2, lineHeight: 1 }}>{person.rating}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.4, color: "#0a0b12", opacity: 0.75, marginTop: 2 }}>OVR</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 6, background: person.tier.bg, fontSize: 10.5, fontWeight: 900, color: "#0a0b12", letterSpacing: 1.4, alignSelf: "flex-start" }}>★ {person.tier.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#ecedf5", letterSpacing: -0.3, lineHeight: 1.2 }}>{person.name}</div>
                  <div style={{ fontSize: 12.5, color: "#8a8fa6" }}>{person.role}</div>
                </div>
                <div style={{ width: 64, height: 64, borderRadius: 14, border: `2px solid ${person.accent}`, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: person.accent, flexShrink: 0 }} className="mono">{person.short}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6", letterSpacing: 0.5, textTransform: "uppercase" }}>% Đạt bình quân</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: "#ecedf5", marginTop: 2 }}>{person.overallPctStr}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6", letterSpacing: 0.5, textTransform: "uppercase" }}>Đóng góp Khối</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: person.accent, marginTop: 2 }}>{person.contribAvgStr}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: "#8a8fa6", marginBottom: 6 }}>CHỈ SỐ TỔNG QUAN · 6 TIÊU CHÍ</div>
              <div style={{ width: 220, maxWidth: "100%" }}>
                <RadarHexagon axes={person.axes} accent={person.accent} />
              </div>
            </div>
          </div>

          <div className="grid-3" style={{ padding: "20px 24px 12px" }}>
            {person.metricRows.map((m) => (
              <div key={m.key} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${m.color}`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: m.color, letterSpacing: 0.4, textTransform: "uppercase" }}>{m.label}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", fontSize: 10.5, fontWeight: 700, color: m.statusColor }}>{m.statusIcon} {m.statusLabel}</div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="mono" style={{ fontSize: 22, fontWeight: 800, color: "#ecedf5" }}>{m.actualYTDStr}</span>
                  <span style={{ fontSize: 11, color: "#8a8fa6" }}>/ KPI {m.kpiYTDStr}</span>
                </div>
                <div style={{ fontSize: 10, color: "#8a8fa6", marginTop: 2 }}>{periodLabel}</div>
                <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 5, overflow: "hidden", marginTop: 10 }}>
                  <div style={{ position: "absolute", inset: "0 auto 0 0", width: m.barWidth, background: m.barColor, borderRadius: 5, boxShadow: m.barGlow }} />
                  <div style={{ position: "absolute", top: 0, bottom: 0, left: "100%", width: 1, background: "#fbbf24" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10.5 }}>
                  <span style={{ color: "#8a8fa6" }}>Đóng góp Khối <span className="mono" style={{ color: "#c9cbd8", fontWeight: 700 }}>{m.contribStr}</span></span>
                  <span className="mono" style={{ color: m.statusColor, fontWeight: 800 }}>{m.pctStr}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "0 24px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            {person.metricRows.map((m) => (
              <div key={m.key} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "14px 16px 6px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a7abbe", letterSpacing: 0.4 }}>{m.label} · Kế hoạch vs Thực tế theo tháng ({m.unit})</div>
                  <div style={{ fontSize: 10.5, color: "#8a8fa6" }}>KPI cả năm: {m.kpiFYStr}</div>
                </div>
                <PersonMonthChart months={MONTHS_12} kpi={m.kpi} actual={m.actual} color={m.color} fmt={fmtForUnit(m.unit)} />
                <div style={{ display: "flex", gap: 12, marginTop: 2, fontSize: 9.5, color: "#8a8fa6" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, background: m.color, opacity: 0.2, borderRadius: 2 }} />Kế hoạch</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, background: m.color, borderRadius: 2 }} />Thực tế</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {people.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 24px", color: "#8a8fa6", fontSize: 13.5 }}>Không tìm thấy BDM phù hợp.</div>
      )}
    </>
  );
}

const selectStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "9px 12px",
  fontSize: 13,
  color: "#ecedf5",
  outline: "none",
  cursor: "pointer",
};
