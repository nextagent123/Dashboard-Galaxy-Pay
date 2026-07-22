"use client";

import { useState } from "react";
import { getPipelineGroups, PIPELINE_TABS } from "@/lib/metrics";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import PipelineLineChart from "@/components/charts/PipelineLineChart";
import WaterfallChart from "@/components/charts/WaterfallChart";

export default function PipelinePage() {
  const [filter, setFilter] = useState("all");
  const groups = getPipelineGroups(filter);
  const activeLabel = (PIPELINE_TABS.find((t) => t.id === filter) || {}).label || "Tất cả";

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · STRATEGIC PIPELINE"
        title={`Chiến lược Pipeline 2026 · ${activeLabel}`}
        subtitle="3 vùng chiến lược: GMV — Doanh thu — Lợi nhuận · Runrate & dự án trọng điểm theo trạng thái go-live"
        right={<DateBadge>Số liệu lũy kế đến 16/07/2026</DateBadge>}
      />

      <section style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card-bg-soft)", border: "1px solid var(--border)", borderRadius: 14, padding: 8, flexWrap: "wrap" }}>
        <div style={{ padding: "0 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, fontWeight: 700, color: "#8a8fa6", letterSpacing: 1.2, textTransform: "uppercase", borderRight: "1px solid rgba(255,255,255,0.06)", marginRight: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16M4 12h16M4 20h10" /></svg>
          <span>Lọc theo chiến lược</span>
        </div>
        {PIPELINE_TABS.map((t) => {
          const active = filter === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                border: "none", fontSize: 12.5, fontWeight: 700, padding: "8px 16px", borderRadius: 9, transition: "all .2s",
                background: active ? `linear-gradient(135deg,${t.color},#7c6cff)` : "transparent",
                color: active ? "#0a0b12" : "#a7abbe",
                boxShadow: active ? `0 6px 18px ${t.color}55` : "none",
              }}
            >
              {t.short} · {t.label}
            </button>
          );
        })}
      </section>

      {groups.map((g) => (
        <section
          key={g.key}
          style={{
            background: `${g.zoneBg}, linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))`,
            border: `1px solid ${g.zoneBorder}`,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ padding: "24px 26px 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, borderBottom: `1px solid ${g.zoneBorder}`, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: 14, background: `linear-gradient(135deg,${g.color},#0a0b12)`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff",
                  fontSize: 16, letterSpacing: 0.6, boxShadow: `0 8px 24px ${g.color}55, inset 0 1px 0 rgba(255,255,255,0.2)`, flexShrink: 0,
                }}
              >
                {g.short}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.6, color: g.color }}>ZONE · {g.zoneTag}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#ecedf5", letterSpacing: -0.3, lineHeight: 1.2, marginTop: 4 }}>Chỉ tiêu {g.label}</div>
                <div style={{ fontSize: 12.5, color: "#a7abbe", marginTop: 5, lineHeight: 1.45, maxWidth: 620 }}>{g.zoneNarrative}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "stretch", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", minWidth: 112 }}>
                <div style={{ fontSize: 10, color: "#8a8fa6", letterSpacing: 0.8, textTransform: "uppercase" }}>Thực đạt YTD</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: "#ecedf5", marginTop: 2 }}>{g.actYTDStr} <span style={{ fontSize: 11, color: "#8a8fa6" }}>{g.unit}</span></div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", minWidth: 112 }}>
                <div style={{ fontSize: 10, color: "#8a8fa6", letterSpacing: 0.8, textTransform: "uppercase" }}>Runrate FY</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: g.color, marginTop: 2 }}>{g.runrateStr} <span style={{ fontSize: 11, color: "#8a8fa6" }}>{g.unit}</span></div>
              </div>
              <div style={{ background: `linear-gradient(135deg,${g.color}22,transparent)`, border: `1px solid ${g.zoneBorder}`, borderRadius: 10, padding: "10px 14px", minWidth: 112 }}>
                <div style={{ fontSize: 10, color: g.color, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700 }}>APP · Achievement</div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 900, color: g.appColor, marginTop: 2 }}>{g.appStr}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="grid-pipeline-highlight" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px", overflow: "visible" }}>
              <div style={{ width: "100%", alignSelf: "center" }}>
                <PipelineLineChart monthlyTargets={g.monthlyTargets} prevYear={g.prevYear} runrate={g.runrate} target={g.target} unit={g.unit} color={g.color} />
              </div>

              {g.featured.map((f, fi) => (
                <div key={fi} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 150, width: "100%", justifyContent: "center" }}>
                    <div
                      style={{
                        width: 56, height: f.barH,
                        background: fi === 0 ? `linear-gradient(180deg,${g.barCol},${g.barCol}dd)` : `linear-gradient(180deg,${g.barCol}cc,${g.barCol}88)`,
                        borderRadius: "7px 7px 0 0",
                        boxShadow: fi === 0 ? `0 4px 14px ${g.barCol}33` : `0 4px 14px ${g.barCol}22`,
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 6, lineHeight: 1.35 }}>
                      <div style={{ fontSize: 11, color: "#a7abbe" }}>{f.kind}</div>
                      <div className="mono" style={{ fontSize: 17, fontWeight: 800, color: "#ecedf5", marginTop: 2 }}>{f.valStr}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#a7abbe", textAlign: "center", lineHeight: 1.45, padding: "0 4px", textWrap: "balance" }}>{f.title}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", padding: "2px 4px" }}>
              <div style={{ whiteSpace: "nowrap" }}><span style={{ fontSize: 11, color: "#8a8fa6" }}>Thực đạt T1–T5: </span><span className="mono" style={{ fontWeight: 700, color: "#ecedf5" }}>{g.actYTDStr} {g.unit}</span></div>
              <div style={{ whiteSpace: "nowrap" }}><span style={{ fontSize: 11, color: "#8a8fa6" }}>Runrate cả năm: </span><span className="mono" style={{ fontWeight: 700, color: g.color }}>{g.runrateStr} {g.unit}</span></div>
              <div style={{ whiteSpace: "nowrap" }}><span style={{ fontSize: 11, color: "#8a8fa6" }}>{g.gapLabel}: </span><span className="mono" style={{ fontWeight: 700, color: g.appColor }}>{g.gapStr}</span></div>
              <div style={{ whiteSpace: "nowrap" }}><span style={{ fontSize: 11, color: "#8a8fa6" }}>APP: </span><span className="mono" style={{ fontWeight: 700, color: g.appColor }}>{g.appStr}</span></div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ecedf5" }}>Dự án trọng điểm — {g.label}</div>
                <div style={{ fontSize: 11.5, color: "#8a8fa6" }}>Tổng đóng góp: <span className="mono" style={{ color: "#ecedf5", fontWeight: 700 }}>{g.totProjStr} {g.unit}</span></div>
              </div>
              <div className="table-wrap" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 11, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 760 }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                      <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "#8a8fa6", letterSpacing: 0.6, width: 40 }}>#</th>
                      <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "#8a8fa6", letterSpacing: 0.6 }}>Dự án</th>
                      <th style={{ padding: "11px 14px", textAlign: "right", fontSize: 10.5, fontWeight: 700, color: "#8a8fa6", letterSpacing: 0.6 }}>Doanh số mục tiêu</th>
                      <th style={{ padding: "11px 14px", textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "#8a8fa6", letterSpacing: 0.6 }}>Go-live dự kiến</th>
                      <th style={{ padding: "11px 14px", textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "#8a8fa6", letterSpacing: 0.6 }}>Trạng thái</th>
                      <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "#8a8fa6", letterSpacing: 0.6 }}>Ghi chú tiến độ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.projRows.map((p) => (
                      <tr key={p.idx}>
                        <td className="mono" style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", color: "#8a8fa6" }}>{p.idx}</td>
                        <td style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", color: "#ecedf5", fontWeight: 600 }}>{p.name}</td>
                        <td className="mono" style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "right", color: "#ecedf5", fontWeight: 700 }}>{p.targetStr}</td>
                        <td className="mono" style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center", color: "#a7abbe" }}>{p.goLive}</td>
                        <td style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center" }}>
                          <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, color: p.statusColor, background: p.statusBg, border: `1px solid ${p.statusColor}`, whiteSpace: "nowrap" }}>{p.status}</span>
                        </td>
                        <td style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.04)", color: "#a7abbe", fontSize: 12, lineHeight: 1.45 }}>{p.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "22px 24px 18px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#ecedf5" }}>Biểu đồ Waterfall — Lấp GAP {g.label}</div>
                  <div style={{ fontSize: 11.5, color: "#8a8fa6", marginTop: 3 }}>Từ Current Runrate cộng dồn đóng góp từng dự án đến Tổng dự kiến, đối chiếu Target 2026</div>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#a7abbe", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 10, background: "#64748b", borderRadius: 2 }} />Runrate</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 10, background: "#34d399", borderRadius: 2 }} />On Processing</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 10, background: "#fbbf24", borderRadius: 2 }} />Risk</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 10, background: "#e11d48", borderRadius: 2 }} />Miss Deadline</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 12, height: 2, background: "#e11d48" }} />Target</span>
                </div>
              </div>
              <div style={{ width: "100%" }}>
                <WaterfallChart runrate={g.runrate} target={g.target} projects={g.projects} unit={g.unit} barCol={g.barCol} />
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
