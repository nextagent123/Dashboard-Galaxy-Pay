"use client";

import { useState, useMemo } from "react";
import { ReportHeader } from "@/components/ui/PageHeader";
import {
  VENDOR_INTEGRATIONS,
  VENDOR_SUMMARY,
  VENDOR_STATUS_DATA,
  VENDOR_CRITICALITY_DATA,
  VENDOR_DOMAIN_DATA,
  VENDOR_FEATURE_MATRIX,
  VENDOR_CONCENTRATION,
} from "@/lib/data";

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
const statusColor = (s) => {
  if (!s) return "var(--text-faint)";
  const sl = s.toLowerCase();
  if (sl.includes("golive") || sl.includes("đang vận hành")) return "#34d399";
  if (sl.includes("ký")) return "#3B82F6";
  if (sl.includes("triển khai")) return "#F59E0B";
  if (sl.includes("xác minh")) return "#EF4444";
  if (sl.includes("đề xuất") || sl.includes("chưa")) return "#64748B";
  if (sl.includes("đóng")) return "#EC4899";
  return "var(--text-dim)";
};

const critColor = (c) => {
  if (c === "Critical") return "#EF4444";
  if (c === "High") return "#F59E0B";
  if (c === "Medium") return "#3B82F6";
  return "#64748B";
};

const depColor = (d) => {
  if (d === "Rất cao") return "#EF4444";
  if (d === "Trung bình") return "#F59E0B";
  return "#64748B";
};

// ═══════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════
function Badge({ text, color }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, color,
      background: `${color}18`, border: `1px solid ${color}30`,
      whiteSpace: "nowrap",
    }}>{text}</span>
  );
}

function Dot({ color, size = 8 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, borderRadius: "50%",
      background: color, marginRight: 8, flexShrink: 0,
    }} />
  );
}

// SVG Donut chart
function DonutChart({ data, size = 160, thickness = 22 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {data.map((d, i) => {
        const pct = d.value / total;
        const dash = circ * pct;
        const gap = circ - dash;
        const o = offset;
        offset += dash;
        return (
          <circle
            key={i} cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={d.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-o}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.4s ease" }}
          />
        );
      })}
      <text x={size / 2} y={size / 2 - 6} textAnchor="middle"
        fill="var(--text)" fontSize={24} fontWeight={700}>{total}</text>
      <text x={size / 2} y={size / 2 + 14} textAnchor="middle"
        fill="var(--text-dim)" fontSize={11}>tổng</text>
    </svg>
  );
}

// Horizontal bar group for domain comparison
function DomainBars({ data }) {
  const max = Math.max(...data.map(d => d.hdb + d.vikki));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => {
        const total = d.hdb + d.vikki;
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--text-dim)" }}>{d.domain}</span>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{total}</span>
            </div>
            <div style={{ display: "flex", gap: 2, height: 8, borderRadius: 4, overflow: "hidden", background: "var(--border)" }}>
              <div style={{
                width: `${(d.hdb / max) * 100}%`, background: "#7c6cff",
                borderRadius: "4px 0 0 4px", transition: "width 0.4s ease",
              }} />
              <div style={{
                width: `${(d.vikki / max) * 100}%`, background: "#22D3EE",
                borderRadius: "0 4px 4px 0", transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 20, marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#7c6cff", display: "flex", alignItems: "center", gap: 4 }}>
          <Dot color="#7c6cff" size={6} />HDBank
        </span>
        <span style={{ fontSize: 11, color: "#22D3EE", display: "flex", alignItems: "center", gap: 4 }}>
          <Dot color="#22D3EE" size={6} />Vikki Bank
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// VENDOR DETAIL PANEL (slide-over)
// ═══════════════════════════════════════════════════
function VendorDetailPanel({ vendorName, onClose }) {
  const integrations = useMemo(
    () => VENDOR_INTEGRATIONS.filter((i) => i.vendor === vendorName),
    [vendorName],
  );
  const summary = VENDOR_SUMMARY.find((v) => v.name === vendorName);
  const [expandedId, setExpandedId] = useState(null);

  const statusSplit = useMemo(() => {
    const map = {};
    integrations.forEach((i) => { map[i.status] = (map[i.status] || 0) + 1; });
    return Object.entries(map).map(([k, v]) => ({ name: k, value: v, color: statusColor(k) }));
  }, [integrations]);

  const domains = useMemo(() => {
    const map = {};
    integrations.forEach((i) => {
      const d = i.domain.split(" / ")[0].split(" & ")[0];
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ domain: k, count: v }));
  }, [integrations]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        zIndex: 998, backdropFilter: "blur(4px)",
      }} />
      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(680px, 92vw)", background: "var(--bg)", zIndex: 999,
        borderLeft: "1px solid var(--border)", overflowY: "auto",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 2, background: "var(--bg)",
          padding: "24px 32px 20px", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Vendor Detail</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", margin: 0 }}>{vendorName}</h2>
              <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "4px 0 0" }}>{summary?.group || "—"}</p>
            </div>
            <button onClick={onClose} style={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-dim)", fontSize: 18,
            }}>✕</button>
          </div>

          {/* Quick KPIs */}
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { label: "Integrations", val: integrations.length, col: "var(--accent)" },
              { label: "Golive", val: integrations.filter((i) => i.status === "Golive").length, col: "#34d399" },
              { label: "Critical/High", val: integrations.filter((i) => i.criticality === "Critical" || i.criticality === "High").length, col: "#F59E0B" },
              { label: "Phụ thuộc", val: summary?.dependency || "—", col: depColor(summary?.dependency) },
            ].map((k, i) => (
              <div key={i} style={{
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
                padding: "12px 18px", flex: "1 1 0", minWidth: 80, textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: k.col, marginTop: 4 }}>{k.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 32px 40px" }}>
          {/* Charts Row */}
          <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            {/* Status Split */}
            <div style={{ flex: "1 1 220px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Trạng thái</div>
              {statusSplit.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                  <Dot color={s.color} />
                  <span style={{ flex: 1, fontSize: 12, color: "var(--text-dim)" }}>{s.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Domain Coverage */}
            <div style={{ flex: "1 1 220px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Domain Coverage</div>
              {domains.map((d, i) => {
                const pct = Math.round((d.count / integrations.length) * 100);
                return (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginBottom: 3 }}>
                      <span>{d.domain}</span><span style={{ color: "var(--text)", fontWeight: 600 }}>{d.count}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "var(--border)" }}>
                      <div style={{ height: "100%", borderRadius: 2, width: `${pct}%`, background: `hsl(${210 + i * 30}, 70%, 55%)` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Integration List */}
          <div style={{ fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Danh sách Integration ({integrations.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {integrations.map((intg) => {
              const isOpen = expandedId === intg.id;
              return (
                <div key={intg.id} className="card" style={{
                  padding: 0, borderRadius: 12, overflow: "hidden",
                  borderColor: isOpen ? "rgba(124,108,255,0.3)" : undefined,
                  transition: "border-color 0.2s",
                }}>
                  {/* Row Header */}
                  <div
                    onClick={() => setExpandedId(isOpen ? null : intg.id)}
                    style={{
                      padding: "14px 18px", cursor: "pointer", display: "flex",
                      alignItems: "center", gap: 12,
                    }}
                  >
                    <span className="mono" style={{
                      fontSize: 10, fontWeight: 700, color: "var(--text-faint)",
                      background: "var(--surface-soft)", padding: "3px 8px", borderRadius: 6, flexShrink: 0,
                    }}>{intg.id}</span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {intg.feature}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>{intg.channel}</div>
                    </div>

                    <Badge text={intg.criticality} color={critColor(intg.criticality)} />
                    <Badge text={intg.status} color={statusColor(intg.status)} />

                    <span style={{ fontSize: 14, color: "var(--text-faint)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                  </div>

                  {/* Expanded Detail */}
                  {isOpen && (
                    <div style={{
                      padding: "0 18px 18px", borderTop: "1px solid var(--border)",
                      paddingTop: 16,
                    }}>
                      <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: "12px 24px", fontSize: 13,
                      }}>
                        {[
                          ["Ngân hàng", intg.bank],
                          ["Kênh / Ứng dụng", intg.channel],
                          ["Chủ thể phát triển", intg.dev],
                          ["Business Domain", intg.domain],
                          ["Vai trò Provider", intg.role],
                          ["API / Protocol", intg.api],
                          ["Integration Layer", intg.layer],
                          ["Go-live", intg.goLive],
                          ["Chính sách phí", intg.fee],
                          ["Tình trạng hợp đồng", intg.contract],
                        ].map(([label, val], i) => (
                          <div key={i}>
                            <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
                            <div style={{ color: "var(--text)", lineHeight: 1.4 }}>{val || "—"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════
function OverviewTab({ onSelectVendor }) {
  return (
    <>
      {/* KPI Row */}
      <div className="grid-4" style={{ marginBottom: 0 }}>
        {[
          { icon: "⚡", label: "Tổng Integration", value: "60", sub: "23 HDBank · 34 Vikki · 3 chung", accent: "var(--accent)" },
          { icon: "🏢", label: "Vendors", value: "17", sub: "VNPAY chiếm 67%", accent: "#F59E0B" },
          { icon: "✅", label: "Golive", value: "30", sub: "50% tổng inventory", accent: "#34d399" },
          { icon: "⚠️", label: "Cần xác minh", value: "15", sub: "25% chưa verified", accent: "#EF4444" },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-card__glow" style={{ "--glow": k.accent }} />
            <div style={{ fontSize: 12, color: "var(--text-faint)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{k.icon} {k.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>{k.value}</div>
            {k.sub && <div style={{ fontSize: 12, color: k.accent, marginTop: 6 }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Row 2: Concentration + Status */}
      <div className="grid-2">
        {/* Concentration */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>Vendor Concentration</h3>
            <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "4px 0 0" }}>Rủi ro tập trung vendor</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <DonutChart data={[
              { value: 40, color: "#7c6cff" },
              { value: 5, color: "#22D3EE" },
              { value: 15, color: "rgba(255,255,255,0.12)" },
            ]} size={160} thickness={22} />
            <div style={{ flex: 1, minWidth: 160 }}>
              {VENDOR_CONCENTRATION.map((item, i) => {
                const colors = ["#7c6cff", "#22D3EE", "var(--text-faint)"];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                    <Dot color={colors[i]} size={10} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{item.value} integrations</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: colors[i] }}>{Math.round((item.value / 60) * 100)}%</div>
                  </div>
                );
              })}
              <div style={{
                marginTop: 14, padding: "10px 14px", borderRadius: 10,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                fontSize: 12, color: "#EF4444", lineHeight: 1.5,
              }}>
                ⚠ VNPAY nắm toàn bộ function Critical: Payment Gateway, QR, Mobile Banking, Biometric
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Status */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>Deployment Status</h3>
            <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "4px 0 0" }}>Phân bổ trạng thái triển khai</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {VENDOR_STATUS_DATA.map((item, i) => {
              const pct = Math.round((item.value / 60) * 100);
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{item.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.value}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--border)" }}>
                    <div style={{ height: "100%", borderRadius: 3, background: item.color, width: `${pct}%`, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Domain + Criticality */}
      <div className="grid-home-split">
        {/* Domain Comparison */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>Business Domain Comparison</h3>
            <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "4px 0 0" }}>HDBank vs Vikki Bank theo domain</p>
          </div>
          <DomainBars data={VENDOR_DOMAIN_DATA} />
        </div>

        {/* Criticality */}
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>Criticality</h3>
            <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "4px 0 0" }}>Mức độ quan trọng vận hành</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <DonutChart data={VENDOR_CRITICALITY_DATA} size={180} thickness={26} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {VENDOR_CRITICALITY_DATA.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Dot color={item.color} size={8} />
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Vendor Table */}
      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>Vendor Detail Table</h3>
          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "4px 0 0" }}>Click vào vendor để xem chi tiết integration</p>
        </div>
        <div className="table-wrap">
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", fontSize: 13 }}>
            <thead>
              <tr>
                {["Vendor", "Nhóm", "Tổng", "HDBank", "Vikki", "Golive", "HĐ đã ký", "Phụ thuộc", ""].map((h, i) => (
                  <th key={i} style={{
                    textAlign: (i >= 2 && i <= 6) ? "center" : "left", padding: "10px 14px",
                    color: "var(--text-faint)", fontWeight: 500, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    borderBottom: "1px solid var(--border)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VENDOR_SUMMARY.map((v, i) => (
                <tr key={i} style={{
                  background: i % 2 === 0 ? "transparent" : "var(--surface-hover)",
                  cursor: "pointer",
                }}
                  onClick={() => onSelectVendor(v.name)}
                >
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--accent)" }}>{v.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--text-dim)", fontSize: 12 }}>{v.group}</td>
                  {[v.total, v.hdb, v.vikki, v.golive, v.signed].map((val, j) => (
                    <td key={j} style={{ padding: "10px 14px", textAlign: "center", color: "var(--text-dim)" }}>
                      {val > 0 ? <span style={{ fontWeight: 600, color: "var(--text)" }}>{val}</span> : <span style={{ color: "var(--text-faint)" }}>—</span>}
                    </td>
                  ))}
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <Badge text={v.dependency} color={depColor(v.dependency)} />
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <span style={{ fontSize: 16, color: "var(--accent)" }}>→</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════
// FEATURE TAB
// ═══════════════════════════════════════════════════
function FeatureTab() {
  return (
    <>
      <div className="card">
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>Feature Parity — HDBank vs Vikki Bank</h3>
          <p style={{ fontSize: 12, color: "var(--text-faint)", margin: "4px 0 0" }}>Mỗi ô thể hiện số integration cho tính năng đó tại mỗi ngân hàng</p>
        </div>
        <div className="table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Feature", "HDBank", "Vikki Bank", "Trạng thái"].map((h, i) => (
                  <th key={i} style={{
                    padding: "12px 16px", fontWeight: 600, fontSize: 11,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    color: "var(--text-faint)", borderBottom: "2px solid var(--border)",
                    textAlign: i > 0 && i < 3 ? "center" : "left",
                    minWidth: i === 0 ? 160 : i === 3 ? 110 : 90,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VENDOR_FEATURE_MATRIX.map((f, i) => (
                <tr key={i}>
                  <td style={{
                    padding: "12px 16px", color: "var(--text)", fontWeight: 500,
                    borderBottom: "1px solid var(--border)",
                    background: i % 2 === 0 ? "transparent" : "var(--surface-hover)",
                  }}>{f.feature}</td>
                  {[f.hdb, f.vikki].map((val, j) => (
                    <td key={j} style={{
                      padding: "12px 16px", textAlign: "center",
                      borderBottom: "1px solid var(--border)",
                      background: i % 2 === 0 ? "transparent" : "var(--surface-hover)",
                    }}>
                      {val > 0 ? (
                        <div style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 32, height: 32, borderRadius: 8,
                          background: val >= 2 ? "linear-gradient(135deg, var(--accent), #A78BFA)" : "var(--accent-soft-bg)",
                          color: val >= 2 ? "#fff" : "var(--accent-light)",
                          fontWeight: 700, fontSize: 14,
                        }}>{val}</div>
                      ) : (
                        <span style={{ color: "var(--text-faint)", fontSize: 16 }}>—</span>
                      )}
                    </td>
                  ))}
                  <td style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: i % 2 === 0 ? "transparent" : "var(--surface-hover)",
                  }}>
                    <Badge
                      text={f.status === "live" ? "✓ Golive" : "◐ Partial"}
                      color={f.status === "live" ? "#34d399" : "#F59E0B"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{
          marginTop: 24, padding: 20, borderRadius: 12,
          background: "var(--accent-soft-bg)", border: "1px solid rgba(124,108,255,0.12)",
          display: "flex", gap: 40, flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Chỉ HDBank có</div>
            <div style={{ fontSize: 14, color: "var(--text)", marginTop: 4 }}>SMS / MMS Notification, Mobile Banking Platform</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Chỉ Vikki có</div>
            <div style={{ fontSize: 14, color: "var(--text)", marginTop: 4 }}>Golf Booking, Waterway Ticket, Biometric/C06, Omnichannel</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Vikki nhiều provider hơn</div>
            <div style={{ fontSize: 14, color: "var(--text)", marginTop: 4 }}>Data Top-up (3 vs 1), Flight Booking (2 vs 1), Bill Payment (2 vs 1)</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════
const TABS = ["Tổng quan", "Feature Matrix"];

export default function VendorPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState(null);

  return (
    <>
      <ReportHeader
        eyebrow="QUẢN LÝ ĐẦU VÀO"
        title="Vendor & Provider Inventory"
        subtitle="HDBank × Vikki Bank — Sovico Group Ecosystem · 60 integrations · 17 vendors"
        right={
          <div className="seg-tabs">
            {TABS.map((t, i) => (
              <button
                key={i}
                className={`seg-tab${activeTab === i ? " active" : ""}`}
                onClick={() => setActiveTab(i)}
              >{t}</button>
            ))}
          </div>
        }
      />

      {activeTab === 0 && <OverviewTab onSelectVendor={setSelectedVendor} />}
      {activeTab === 1 && <FeatureTab />}

      {/* Vendor Detail Slide-over */}
      {selectedVendor && (
        <VendorDetailPanel vendorName={selectedVendor} onClose={() => setSelectedVendor(null)} />
      )}
    </>
  );
}
