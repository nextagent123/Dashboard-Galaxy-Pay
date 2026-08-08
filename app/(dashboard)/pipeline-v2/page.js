"use client";

import { useState } from "react";
import { getPipelineGroups, PIPELINE_TABS } from "@/lib/metrics";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import ErrorBoundary from "@/components/ErrorBoundary";
import PipelineLineChart from "@/components/charts/PipelineLineChart";
import WaterfallChart from "@/components/charts/WaterfallChart";
import { STATUS_COLORS } from "@/lib/data";

// V2 featured overrides — extra items per zone
const V2_FEATURED_EXTRA = {
  gmv: [
    { title: "DA. Payment Ecom - 2C2P", kind: "Quy mô tiềm năng", value: 765, valStr: "765 Tỷ", isNew: true },
    { title: "DA. Payment DAM", kind: "Quy mô tiềm năng", value: 1275, valStr: "1.275 Tỷ", isNew: true },
  ],
  dt: [
    { title: "DA. SkyAgent OTA", kind: "Quy mô dự kiến", value: 61, valStr: "~61 Tỷ" },
    { title: "Dự án Cybs VCB", sub: "High Priority", kind: "Quy mô tiềm năng", value: 24, valStr: "~24 Tỷ", priority: "high" },
    { title: "Gói thầu thiết bị HDFG", kind: "Quy mô dự kiến", value: 5, valStr: "~5 Tỷ", priority: "high" },
    { title: "Thu hộ BHXH & 2c2p", kind: "Quy mô dự kiến", value: 4, valStr: "~4 Tỷ", priority: "high" },
    { title: "DA. Payment Hub", sub: "Medium Priority", kind: "Quy mô tiềm năng", value: 8.7, valStr: "~8,7 Tỷ" },
  ],
  ln: [
    { title: "Dự án Cybs VCB", sub: "High Priority", kind: "Quy mô tiềm năng", value: 5, valStr: "~5 Tỷ" },
    { title: "Dự án Vikki Đông Á", sub: "High Priority", kind: "Quy mô tiềm năng", value: 1.3, valStr: "~1,3 Tỷ", priority: "high" },
    { title: "Gói thầu thiết bị & hoạt động thanh toán với HDFG", kind: "Quy mô dự kiến", value: 1, valStr: "~1 Tỷ" },
  ],
};

// V2 project table overrides for REV & LN — matches featured blocks
const V2_PROJECTS = {
  dt: [
    { name: "DA. SkyAgent OTA", target: 61, goLive: "05/2026", status: "On Processing", note: "Đã qua mốc T5 nhưng đang chạy tiếp — cần theo dõi doanh số & biên phí" },
    { name: "Dự án Cybs VCB (High Priority)", target: 24, goLive: "08/2026", status: "Risk", note: "Rủi ro trượt deadline T8 — cần chốt sớm ký kết Cybs Vietcombank & lên production" },
    { name: "Gói thầu thiết bị HDFG", target: 5, goLive: "09/2026", status: "On Processing", note: "Đang triển khai theo tiến độ, target chốt gói thầu T9" },
    { name: "Thu hộ BHXH & 2c2p", target: 4, goLive: "TBD", status: "On Processing", note: "Dự án thu hộ BHXH kết hợp 2C2P — đang trong giai đoạn triển khai" },
    { name: "DA. Payment Hub (Medium Priority)", target: 8.7, goLive: "08/2026", status: "Risk", note: "Rủi ro deadline T8 — nhiều đối tác (Smartro, Alipay, Azupay, PayU) cần đồng bộ" },
  ],
  ln: [
    { name: "Dự án Cybs VCB (High Priority)", target: 5, goLive: "08/2026", status: "Risk", note: "Rủi ro trượt deadline T8 — cần chốt sớm ký kết & lên production" },
    { name: "Dự án Vikki Đông Á (High Priority)", target: 1.3, goLive: "09/2026", status: "On Processing", note: "Đang triển khai Payment Hub cho Vikki Đông Á — mục tiêu nâng biên lợi nhuận" },
    { name: "Gói thầu thiết bị & hoạt động thanh toán với HDFG", target: 1, goLive: "09/2026", status: "On Processing", note: "Gói thầu thiết bị & dịch vụ thanh toán HDFG — đang triển khai theo tiến độ" },
  ],
};

function vnTy(v) {
  if (v >= 1000) return new Intl.NumberFormat("vi-VN").format(Math.round(v));
  if (v >= 100) return new Intl.NumberFormat("vi-VN").format(+v.toFixed(0));
  if (v >= 10) return new Intl.NumberFormat("vi-VN").format(+v.toFixed(1));
  return new Intl.NumberFormat("vi-VN").format(+v.toFixed(2));
}

function augmentGroups(groups) {
  return groups.map((g) => {
    const extra = V2_FEATURED_EXTRA[g.key];
    if (!extra) return g;

    // Featured: GMV appends, REV/LN replace entirely
    const allFeatured = g.key === "gmv" ? [...g.featured, ...extra] : extra;
    const featMax = Math.max(...allFeatured.map((f) => f.value || 0));
    const featured = allFeatured.map((f) => ({
      ...f,
      barH: Math.max(35, featMax > 0 ? ((f.value || 0) / featMax) * 140 : 35),
    }));

    // Projects: override for REV/LN
    const v2Projects = V2_PROJECTS[g.key];
    if (!v2Projects) return { ...g, featured };

    const totProj = v2Projects.reduce((s, p) => s + (p.target || 0), 0);
    const projRows = v2Projects.map((p, i) => ({
      ...p,
      idx: i + 1,
      targetStr: vnTy(p.target || 0) + " " + (g.unit || ""),
      statusColor: STATUS_COLORS[p.status] || "#8a8fa6",
      statusBg: (STATUS_COLORS[p.status] || "#8a8fa6") + "22",
    }));

    return {
      ...g,
      featured,
      projects: v2Projects,
      projRows,
      totProjStr: vnTy(totProj),
    };
  });
}

export default function PipelineV2Page() {
  const [filter, setFilter] = useState("all");
  const rawGroups = getPipelineGroups(filter);
  const groups = augmentGroups(rawGroups);
  const activeLabel = (PIPELINE_TABS.find((t) => t.id === filter) || {}).label || "Tất cả";

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · STRATEGIC PIPELINE V2"
        title={`Chiến lược Pipeline 2026 · ${activeLabel}`}
        subtitle="3 vùng chiến lược: GMV — Doanh thu — Lợi nhuận · Runrate & dự án trọng điểm theo trạng thái go-live"
        right={<DateBadge>Số liệu lũy kế đến 05/08/2026</DateBadge>}
      />

      <section style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card-bg-soft)", border: "1px solid var(--border)", borderRadius: 14, padding: 8, flexWrap: "wrap" }}>
        <div style={{ padding: "0 14px", display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 1.2, textTransform: "uppercase", borderRight: "1px solid var(--border-soft)", marginRight: 4 }}>
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
                color: active ? "#0a0b12" : "var(--text-dim)",
                boxShadow: active ? `0 6px 18px ${t.color}55` : "none",
              }}
            >
              {t.short} · {t.label}
            </button>
          );
        })}
      </section>

      {groups.map((g) => (
        <ErrorBoundary key={g.key}>
        <section
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
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-strong)", letterSpacing: -0.3, lineHeight: 1.2, marginTop: 4 }}>Chỉ tiêu {g.label}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 5, lineHeight: 1.45, maxWidth: 620 }}>{g.zoneNarrative}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "stretch", gap: 10, flexShrink: 0, flexWrap: "wrap", width: "100%" }}>
              <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: "10px 14px", flex: "1 1 100px", minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: 0.8, textTransform: "uppercase" }}>Thực đạt YTD</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-strong)", marginTop: 2 }}>{g.actYTDStr} <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{g.unit}</span></div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.35)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: "10px 14px", flex: "1 1 100px", minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: 0.8, textTransform: "uppercase" }}>Runrate FY</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: g.color, marginTop: 2 }}>{g.runrateStr} <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{g.unit}</span></div>
              </div>
              <div style={{ background: `linear-gradient(135deg,${g.color}22,transparent)`, border: `1px solid ${g.zoneBorder}`, borderRadius: 10, padding: "10px 14px", flex: "1 1 100px", minWidth: 0 }}>
                <div style={{ fontSize: 10, color: g.color, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700 }}>APP · Achievement</div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 900, color: g.appColor, marginTop: 2 }}>{g.appStr}</div>
              </div>
            </div>
          </div>

          <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="grid-pipeline-highlight" data-feat={g.featured.length > 2 ? g.featured.length : undefined} style={{
              background: "var(--surface-hover)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: "22px 24px", overflow: "visible",
            }}>
              <div style={{ width: "100%", alignSelf: "center" }}>
                <PipelineLineChart monthlyTargets={g.monthlyTargets} prevYear={g.prevYear} runrate={g.runrate} target={g.target} unit={g.unit} color={g.color} />
              </div>

              {g.featured.map((f, fi) => {
                const isNew = f.isNew;
                const hasPriority = !!f.priority;
                return (
                <div key={fi} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, justifyContent: "flex-end", position: "relative" }}>
                  {hasPriority && (
                    <div style={{ position: "absolute", top: 0, right: 8, width: 22, height: 22, borderRadius: 6, background: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(225,29,72,0.4)", zIndex: 1 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 150, width: "100%", justifyContent: "center" }}>
                    <div
                      style={{
                        width: 48, height: f.barH,
                        background: isNew
                          ? `linear-gradient(180deg, #38bdf8, #7c6cff)`
                          : `linear-gradient(180deg,${g.barCol},${g.barCol}${fi === 0 ? "" : "aa"})`,
                        borderRadius: "7px 7px 0 0",
                        boxShadow: isNew ? `0 4px 14px #38bdf855` : `0 4px 14px ${g.barCol}33`,
                        border: isNew ? "1px solid rgba(56,189,248,0.4)" : "none",
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 6, lineHeight: 1.35, minWidth: 0 }}>
                      <div style={{ fontSize: 10.5, color: "var(--text-dim)", whiteSpace: "nowrap" }}>{f.kind}</div>
                      <div className="mono" style={{ fontSize: 15, fontWeight: 800, color: isNew ? "#38bdf8" : "var(--text-strong)", marginTop: 2, whiteSpace: "nowrap" }}>{f.valStr}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: isNew ? "#38bdf8" : "var(--text-dim)", textAlign: "center", lineHeight: 1.4, padding: "0 2px", textWrap: "balance", fontWeight: isNew ? 600 : 400 }}>
                    {isNew && <span style={{ display: "inline-block", fontSize: 9, background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8", padding: "1px 6px", borderRadius: 4, marginBottom: 3, fontWeight: 700, letterSpacing: 0.5 }}>MỚI</span>}
                    {isNew && <br />}
                    {f.title}
                    {f.sub && <><br /><span style={{ fontSize: 10, color: f.priority === "high" ? "#e11d48" : "#fbbf24", fontWeight: 600, fontStyle: "italic" }}>({f.sub})</span></>}
                  </div>
                </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", padding: "2px 4px" }}>
              <div style={{ whiteSpace: "nowrap" }}><span style={{ fontSize: 11, color: "var(--text-dim)" }}>Thực đạt T1–T7:</span><span className="mono" style={{ fontWeight: 700, color: "var(--text-strong)" }}>{g.actYTDStr} {g.unit}</span></div>
              <div style={{ whiteSpace: "nowrap" }}><span style={{ fontSize: 11, color: "var(--text-dim)" }}>Runrate cả năm: </span><span className="mono" style={{ fontWeight: 700, color: g.color }}>{g.runrateStr} {g.unit}</span></div>
              <div style={{ whiteSpace: "nowrap" }}><span style={{ fontSize: 11, color: "var(--text-dim)" }}>{g.gapLabel}: </span><span className="mono" style={{ fontWeight: 700, color: g.appColor }}>{g.gapStr}</span></div>
              <div style={{ whiteSpace: "nowrap" }}><span style={{ fontSize: 11, color: "var(--text-dim)" }}>APP: </span><span className="mono" style={{ fontWeight: 700, color: g.appColor }}>{g.appStr}</span></div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)" }}>Dự án trọng điểm — {g.label}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>Tổng đóng góp: <span className="mono" style={{ color: "var(--text-strong)", fontWeight: 700 }}>{g.totProjStr} {g.unit}</span></div>
              </div>
              <div className="table-wrap" style={{ border: "1px solid var(--border-soft)", borderRadius: 11, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 760 }}>
                  <thead>
                    <tr style={{ background: "var(--surface-hover)" }}>
                      <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 0.6, width: 40 }}>#</th>
                      <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 0.6 }}>Dự án</th>
                      <th style={{ padding: "11px 14px", textAlign: "right", fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 0.6 }}>Doanh số mục tiêu</th>
                      <th style={{ padding: "11px 14px", textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 0.6 }}>Go-live dự kiến</th>
                      <th style={{ padding: "11px 14px", textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 0.6 }}>Trạng thái</th>
                      <th style={{ padding: "11px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)", letterSpacing: 0.6 }}>Ghi chú tiến độ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.projRows.map((p) => (
                      <tr key={p.idx}>
                        <td className="mono" style={{ padding: "12px 14px", borderTop: "1px solid var(--border-faint)", color: "var(--text-dim)" }}>{p.idx}</td>
                        <td style={{ padding: "12px 14px", borderTop: "1px solid var(--border-faint)", color: "var(--text-strong)", fontWeight: 600 }}>{p.name}</td>
                        <td className="mono" style={{ padding: "12px 14px", borderTop: "1px solid var(--border-faint)", textAlign: "right", color: "var(--text-strong)", fontWeight: 700 }}>{p.targetStr}</td>
                        <td className="mono" style={{ padding: "12px 14px", borderTop: "1px solid var(--border-faint)", textAlign: "center", color: "var(--text-dim)" }}>{p.goLive}</td>
                        <td style={{ padding: "12px 14px", borderTop: "1px solid var(--border-faint)", textAlign: "center" }}>
                          <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, color: p.statusColor, background: p.statusBg, border: `1px solid ${p.statusColor}`, whiteSpace: "nowrap" }}>{p.status}</span>
                        </td>
                        <td style={{ padding: "12px 14px", borderTop: "1px solid var(--border-faint)", color: "var(--text-dim)", fontSize: 12, lineHeight: 1.45 }}>{p.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: "var(--surface-hover)", border: "1px solid var(--border-soft)", borderRadius: 14, padding: "22px 24px 18px" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)" }}>Biểu đồ Waterfall — Lấp GAP {g.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 3 }}>Từ Current Runrate cộng dồn đóng góp từng dự án đến Tổng dự kiến, đối chiếu Target 2026</div>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--text-dim)", alignItems: "center", flexWrap: "wrap" }}>
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
        </ErrorBoundary>
      ))}
    </>
  );
}
