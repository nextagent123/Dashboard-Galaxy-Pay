"use client";

import React, { useState, useMemo } from "react";
import { ReportHeader } from "@/components/ui/PageHeader";
import { SKY_PARTNER_BLOCKS, SKY_PARTNER_PHASE1 } from "@/lib/data";

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function fmt(n) {
  if (n === 0 || n == null) return "—";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "k";
  return n.toLocaleString("vi-VN");
}
function fmtFull(n) {
  if (n === 0 || n == null) return "—";
  return n.toLocaleString("vi-VN");
}

// ═══════════════════════════════════════════════════
// FLOW STAGE WRAPPER (pipeline rail + content)
// ═══════════════════════════════════════════════════
const STAGE_COLORS = [
  { main: "#38bdf8", rgb: "56,189,248", grad: "linear-gradient(135deg, #38bdf8, #0ea5e9)" },    // 1 — sky blue
  { main: "#a78bfa", rgb: "167,139,250", grad: "linear-gradient(135deg, #a78bfa, #7c6cff)" },    // 2 — violet
  { main: "#fb923c", rgb: "251,146,60",  grad: "linear-gradient(135deg, #fb923c, #f97316)" },    // 3 — orange
  { main: "#f472b6", rgb: "244,114,182", grad: "linear-gradient(135deg, #f472b6, #ec4899)" },    // 4 — pink
  { main: "#34d399", rgb: "52,211,153",  grad: "linear-gradient(135deg, #34d399, #10b981)" },    // 5 — emerald
];

function FlowStage({ num, label, note, last, children }) {
  const c = STAGE_COLORS[(num - 1) % STAGE_COLORS.length];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "82px 1fr", position: "relative" }}>
      {/* ── Rail column ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        {/* Outer glow ring */}
        <div style={{
          width: 54, height: 54, borderRadius: "50%", marginTop: 10, flexShrink: 0,
          background: `radial-gradient(circle, rgba(${c.rgb},0.12) 0%, transparent 70%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          {/* Pulsing ring */}
          <div style={{
            position: "absolute", inset: 2, borderRadius: "50%",
            border: `2px solid rgba(${c.rgb},0.25)`,
            animation: "pulse-ring 3s ease-in-out infinite",
          }} />
          {/* Main node */}
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: c.grad,
            boxShadow: `0 0 20px rgba(${c.rgb},0.35), 0 0 40px rgba(${c.rgb},0.12), inset 0 1px 0 rgba(255,255,255,0.20)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "#fff",
            letterSpacing: "-0.02em",
            position: "relative", zIndex: 2,
          }}>{num}</div>
        </div>
        {/* Label badge */}
        <div style={{
          marginTop: 6,
          background: `rgba(${c.rgb},0.10)`,
          border: `1px solid rgba(${c.rgb},0.20)`,
          borderRadius: 8, padding: "3px 10px",
          fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
          textTransform: "uppercase", color: c.main,
          textAlign: "center", whiteSpace: "nowrap",
        }}>{label}</div>
        {/* Connecting rail */}
        {!last && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            flex: 1, minHeight: 18, marginTop: 8,
          }}>
            <div style={{
              width: 3, flex: 1, borderRadius: 2,
              background: `linear-gradient(to bottom, rgba(${c.rgb},0.30), rgba(${c.rgb},0.06))`,
            }} />
            {/* Chevron arrow */}
            <svg width="14" height="10" viewBox="0 0 14 10" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M1 1L7 8L13 1" fill="none" stroke={c.main} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
            </svg>
          </div>
        )}
      </div>
      {/* ── Content column ── */}
      <div style={{ padding: "8px 0 18px 12px" }}>
        {/* Stage annotation line */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          marginBottom: 12, marginTop: 6,
        }}>
          <span style={{
            width: 24, height: 2, borderRadius: 1,
            background: `linear-gradient(90deg, ${c.main}, transparent)`, flexShrink: 0,
          }} />
          <span style={{
            fontSize: 10.5, color: c.main, fontWeight: 600,
            letterSpacing: "0.06em", textTransform: "uppercase", opacity: 0.85,
          }}>{note}</span>
        </div>
        {children}
      </div>
      {/* Keyframes (injected once per stage for scoping, browser deduplicates) */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// TAB 1: 6 KHỐI THƯƠNG MẠI
// ═══════════════════════════════════════════════════
function BlocksTab() {
  const blockRev = useMemo(() => {
    const m = {};
    SKY_PARTNER_PHASE1.forEach((r) => { m[r.block] = (m[r.block] || 0) + r.dtThangBase; });
    return m;
  }, []);
  const totalBase = useMemo(() => SKY_PARTNER_PHASE1.reduce((s, r) => s + r.dtThangBase, 0), []);

  const chipSty = { fontSize: 11, padding: "3px 10px", borderRadius: 14, background: "rgba(255,255,255,0.05)", color: "var(--text-dim)", whiteSpace: "nowrap" };
  const sovPartners = ["Vietjet Air", "HDBank", "Vikki", "HD Insurance", "Galaxy Telecom", "Phú Long"];
  const extPartners = ["iMedia", "Vexere", "Got It", "Urbox", "EVN", "VETC", "C06", "Starlink", "eSIM Go", "Petrolimex", "PV Oil"];

  const REV_META = [
    { block: 1, fee: "Phí cố định", range: "1–7K / GD", color: "var(--accent-2)", bg: "rgba(124,108,255,0.10)" },
    { block: 2, fee: "Hoa hồng %", range: "1.5–15% TPV", color: "var(--green)", bg: "rgba(52,211,153,0.10)" },
    { block: 3, fee: "Hoa hồng %", range: "10–35% HH", color: "var(--green)", bg: "rgba(52,211,153,0.10)" },
    { block: 4, fee: "Referral + FX", range: "CPA + spread", color: "#D4537E", bg: "rgba(212,83,126,0.10)" },
    { block: 5, fee: "Chiết khấu MG", range: "3–30% MG", color: "var(--accent-2)", bg: "rgba(124,108,255,0.10)" },
    { block: 6, fee: "Platform fee", range: "Phí nền tảng", color: "#639922", bg: "rgba(99,153,34,0.10)" },
  ];

  const segments = [
    { icon: "👤", title: "B2C — Cá nhân", desc: "Hành khách Vietjet, KH HDBank, người dùng Vikki, SkyJoy member", metric: "~5M", label: "User tiềm năng Year 1" },
    { icon: "🏪", title: "B2B — Merchant", desc: "DN KH của HDBank & Vikki — bán dịch vụ platform qua POS / app merchant", metric: "~50K", label: "Merchant HDBank + Vikki" },
    { icon: "⛽", title: "B2B2C — Đại lý", desc: "POS trạm xăng, chuỗi bán lẻ, đại lý Petrolimex & PV Oil, Kiosk CDS", metric: "~10K", label: "Điểm bán O2O" },
    { icon: "🏛️", title: "Nội bộ HST", desc: "CBNV Sovico Group, cư dân Phú Long, CĐ SkyJoy, CĐ HDBank", metric: "~200K", label: "Thành viên nội bộ" },
  ];

  return (
    <>
      {/* ── STAGE 1: ĐẦU VÀO ── */}
      <FlowStage num={1} label="Đầu vào" note="Nguồn cung dịch vụ & sản phẩm">
        <div className="grid-2" style={{ marginBottom: 0 }}>
          <div className="card" style={{ borderTop: "3px solid var(--green)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--green)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>🏢 Sovico Ecosystem</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {sovPartners.map((p) => <span key={p} style={chipSty}>{p}</span>)}
            </div>
          </div>
          <div className="card" style={{ borderTop: "3px solid var(--amber)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--amber)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>🌍 External Partners</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {extPartners.map((p) => <span key={p} style={chipSty}>{p}</span>)}
            </div>
          </div>
        </div>
      </FlowStage>

      {/* ── STAGE 2: NỀN TẢNG ── */}
      <FlowStage num={2} label="Nền tảng" note="Xử lý, điều phối & đối soát">
        <div className="card" style={{
          textAlign: "center", padding: "22px 24px",
          background: "linear-gradient(135deg, rgba(124,108,255,0.12), rgba(157,139,255,0.04))",
          border: "1px solid rgba(124,108,255,0.25)",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-2)", margin: 0 }}>⚙️ Sky Partner Platform</h2>
          <p style={{ fontSize: 12.5, color: "var(--text-dim)", margin: "6px 0 0" }}>Invisible back-end orchestrator · PaaS · API gateway</p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {["Galaxy Pay", "Split Settlement", "Auto-Recon", "API Gateway", "Agent Orchestration"].map((f) => (
              <span key={f} style={{
                fontSize: 11, padding: "4px 12px", borderRadius: 20,
                background: "rgba(124,108,255,0.10)", color: "var(--accent-2)",
                border: "1px solid rgba(124,108,255,0.12)",
              }}>{f}</span>
            ))}
          </div>
        </div>
      </FlowStage>

      {/* ── STAGE 3: DỊCH VỤ ── */}
      <FlowStage num={3} label="Dịch vụ" note="6 khối thương mại · 37 sản phẩm · 14 nhóm">
        <div className="grid-3" style={{ marginBottom: 0 }}>
          {SKY_PARTNER_BLOCKS.map((b) => (
            <div key={b.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ height: 3, background: b.color }} />
              <div style={{ padding: "14px 18px" }}>
                <span style={{
                  display: "inline-block", fontSize: 10, fontWeight: 700,
                  padding: "2px 8px", borderRadius: 4, marginBottom: 8,
                  background: `${b.color}18`, color: b.color,
                }}>Khối 0{b.id}</span>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 10px" }}>{b.name}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {b.items.map((item, i) => (
                    <li key={i} style={{ fontSize: 12, color: "var(--text-dim)", padding: "2.5px 0", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{
                  marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border-faint)",
                  fontSize: 11, color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5,
                }}>💰 {b.rev}</div>
              </div>
            </div>
          ))}
        </div>
      </FlowStage>

      {/* ── STAGE 4: KÊNH PHÂN PHỐI ── */}
      <FlowStage num={4} label="Kênh" note="Kênh phân phối đến khách hàng">
        <div className="grid-2" style={{ marginBottom: 0 }}>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>📱 Digital</h3>
            <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>Vietjet App, SkyJoy, HDBank, Vikki, Trạm công dân số</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>🏪 O2O Network</h3>
            <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, margin: 0 }}>~10.000 POS trạm xăng, chuỗi tiện lợi, siêu thị</p>
          </div>
        </div>
      </FlowStage>

      {/* ── STAGE 5: ĐẦU RA ── */}
      <FlowStage num={5} label="Đầu ra" note="Kết quả kinh doanh & giá trị phân phối" last>
        <div style={{
          border: "1px solid rgba(52,211,153,0.15)", borderRadius: 16,
          background: "rgba(52,211,153,0.03)", padding: 24,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--green)", margin: "0 0 20px", display: "flex", alignItems: "center", gap: 10 }}>
            💎 Đầu ra nền tảng
          </h3>

          {/* A: Khách hàng cuối */}
          <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 10 }}>A · Khách hàng cuối</div>
          <div className="grid-2" style={{ marginBottom: 20 }}>
            {segments.map((seg, i) => (
              <div key={i} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{seg.icon}</div>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 4px" }}>{seg.title}</h4>
                <p style={{ fontSize: 11.5, color: "var(--text-dim)", margin: 0, lineHeight: 1.5, minHeight: 36 }}>{seg.desc}</p>
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{seg.metric}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{seg.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* B: Mô hình doanh thu */}
          <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, margin: "20px 0 10px" }}>B · Mô hình doanh thu</div>
          <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap" }}>
                <thead>
                  <tr>
                    {["Khối", "Cơ chế thu", "Biên", "DT Base/tháng"].map((h, i) => (
                      <th key={i} style={{
                        padding: "8px 14px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)",
                        textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)",
                        textAlign: i >= 2 ? "right" : "left",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REV_META.map((rm) => {
                    const block = SKY_PARTNER_BLOCKS.find((b) => b.id === rm.block);
                    const rev = blockRev[rm.block] || 0;
                    return (
                      <tr key={rm.block} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                        <td style={{ padding: "9px 14px", color: "var(--text)", fontWeight: 500 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: block?.color, flexShrink: 0 }} />
                            {block?.name}
                          </span>
                        </td>
                        <td style={{ padding: "9px 14px" }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: rm.bg, color: rm.color }}>{rm.fee}</span>
                        </td>
                        <td style={{ padding: "9px 14px", textAlign: "right", color: "var(--text-dim)" }}>{rm.range}</td>
                        <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 600, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{rev > 0 ? fmt(rev) : "—"}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderBottom: "1px solid var(--border-faint)" }}>
                    <td style={{ padding: "9px 14px", color: "var(--text)", fontWeight: 500 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2A9DF4", flexShrink: 0 }} />
                        Merchant HDBank/Vikki
                      </span>
                    </td>
                    <td style={{ padding: "9px 14px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "rgba(42,157,244,0.10)", color: "#2A9DF4" }}>Phí kênh bán</span>
                    </td>
                    <td style={{ padding: "9px 14px", textAlign: "right", color: "var(--text-dim)" }}>0.3–1% GTGD</td>
                    <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 600, color: "var(--text-faint)", fontVariantNumeric: "tabular-nums" }}>TBD</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
            <span style={{ fontSize: 11, color: "var(--text-faint)" }}>Tổng DT Base/tháng</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmt(totalBase)}</span>
          </div>

          {/* C: Giá trị hệ sinh thái */}
          <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, margin: "24px 0 10px" }}>C · Giá trị hệ sinh thái</div>
          <div className="grid-2" style={{ marginBottom: 0 }}>
            <div className="card">
              <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>💎 Cho Galaxy Pay</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Doanh thu hoa hồng & phí dịch vụ đa dạng", "Nền tảng PaaS — mở rộng không cần tuyến tính nhân sự", "Data insights từ toàn hệ sinh thái", "Vị thế trung tâm thanh toán Sovico Group"].map((item, i) => (
                  <li key={i} style={{ fontSize: 12, color: "var(--text-dim)", padding: "3px 0", display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent-2)", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>🤝 Cho đối tác</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Mở rộng kênh phân phối (Digital + 10K POS + 50K Merchant)", "Tự động đối soát & thanh toán T+1/T+2", "Cross-sell qua hệ sinh thái 5M+ users", "Merchant HDBank/Vikki bán dịch vụ — thêm nguồn thu phí kênh", "Tích hợp chuẩn hóa qua 1 API duy nhất"].map((item, i) => (
                  <li key={i} style={{ fontSize: 12, color: "var(--text-dim)", padding: "3px 0", display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </FlowStage>

      {/* Stats Summary */}
      <div className="grid-4" style={{ marginTop: 20 }}>
        {[
          { n: "37", l: "sản phẩm" },
          { n: "6", l: "khối thương mại" },
          { n: "14", l: "nhóm dịch vụ" },
          { n: "9", l: "tháng triển khai" },
        ].map((s, i) => (
          <div key={i} className="kpi-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>{s.n}</div>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════
// TAB 2: TRIỂN KHAI GIAI ĐOẠN 1
// ═══════════════════════════════════════════════════
function Phase1Tab() {
  const goals = [
    { icon: "🎯", title: "Kinh doanh", items: ["Hệ sinh thái bán chéo đa dịch vụ", "Tăng doanh thu hoa hồng & phí dịch vụ", "Mở rộng kênh phân phối số & O2O", "Nền tảng hợp tác đối tác bên ngoài"] },
    { icon: "⚙️", title: "Công nghệ", items: ["Chuẩn hóa tích hợp qua API platform", "Kiến trúc mở, dễ mở rộng", "Hạ tầng dùng chung toàn hệ sinh thái", "An toàn bảo mật & mở rộng quy mô lớn"] },
    { icon: "📋", title: "Vận hành", items: ["Chuẩn hóa quy trình giao dịch", "Tự động đối soát & thanh toán", "Quản lý tập trung dữ liệu & báo cáo", "Kiểm soát rủi ro hiệu quả"] },
  ];

  const phase1Products = ["Topup", "Điện", "Nước", "Internet", "Postpaid", "Data Card", "Loan", "Vietlott"];

  const techLayers = [
    { layer: "Layer 1", name: "API Gateway & Open Platform", color: "#378ADD" },
    { layer: "Layer 2", name: "Channel Access & POS Agent", color: "#1D9E75" },
    { layer: "Layer 3", name: "Core Commerce & Agent Orchestration", color: "#D85A30" },
    { layer: "Layer 4", name: "Financial Operations & Double-Entry Ledger", color: "#D4537E" },
    { layer: "Layer 5", name: "Canonical Domain Adapters (6 core)", color: "#534AB7" },
  ];

  return (
    <>
      {/* Project Overview */}
      <div className="card" style={{
        padding: "24px 28px",
        background: "linear-gradient(135deg, rgba(124,108,255,0.08), rgba(52,211,153,0.04))",
        border: "1px solid rgba(124,108,255,0.15)",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Tờ trình</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
          Dự án nền tảng Sky Partner Platform
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
          Digital Commerce Orchestration Platform theo mô hình PaaS — hạ tầng trung gian kết nối nguồn cung dịch vụ, kênh phân phối và khách hàng cuối cho toàn hệ sinh thái Sovico.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(124,108,255,0.12)", color: "var(--accent-2)" }}>Galaxy Pay chủ trì</span>
          <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(52,211,153,0.12)", color: "var(--green)" }}>Omni-Channel Orchestration</span>
          <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(251,191,36,0.12)", color: "var(--amber)" }}>Invisible Back-end</span>
        </div>
      </div>

      {/* Objectives */}
      <div className="grid-3" style={{ marginTop: 20 }}>
        {goals.map((g, i) => (
          <div key={i} className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>{g.icon} Mục tiêu {g.title}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {g.items.map((item, j) => (
                <li key={j} style={{ fontSize: 12, color: "var(--text-dim)", padding: "4px 0", display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Technology Architecture */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>Kiến trúc công nghệ</h3>
        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 16px" }}>Composite Dual-Layer Architecture · API First · Modular & Scalable</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {techLayers.map((l, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
              borderRadius: 10, background: `${l.color}0a`, border: `1px solid ${l.color}20`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: l.color, width: 60, flexShrink: 0 }}>{l.layer}</span>
              <div style={{ width: 3, height: 24, borderRadius: 2, background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{l.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 1 Scope */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>
          Giai đoạn 1 — Sản phẩm trọng tâm
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 16px" }}>
          08 nhóm sản phẩm trọng tâm · Nền tảng dùng chung · Omni-channel distribution
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {phase1Products.map((p, i) => (
            <div key={i} style={{
              padding: "10px 20px", borderRadius: 10,
              background: "var(--surface)", border: "1px solid var(--border)",
              fontSize: 13, fontWeight: 500, color: "var(--text)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--accent-soft-bg)", color: "var(--accent-2)", fontSize: 11, fontWeight: 700,
              }}>{i + 1}</span>
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Distribution Model */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>📱 Kênh số (Owned Digital)</h3>
          {["Vietjet Air App", "HDBank App", "Vikki Bank App", "SkyJoy", "Trạm công dân số"].map((ch, i) => (
            <div key={i} style={{ fontSize: 12, color: "var(--text-dim)", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
              {ch}
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>🏪 Kênh vật lý (O2O Network)</h3>
          {["Smart POS / màn hình thu ngân", "Trạm công dân số (offline)", "Hệ thống cây xăng Petrolimex, PV Oil", "Chuỗi bán lẻ đối tác"].map((ch, i) => (
            <div key={i} style={{ fontSize: 12, color: "var(--text-dim)", padding: "4px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--amber)", flexShrink: 0 }} />
              {ch}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════
// TAB 3: KỊCH BẢN TÀI CHÍNH
// ═══════════════════════════════════════════════════
function FinanceTab() {
  const data = SKY_PARTNER_PHASE1;

  // ── Core financial aggregates ──
  const totals = useMemo(() => {
    const t = { gdMonth: 0, gmv: 0, dtC: 0, dtB: 0, dtO: 0, dt2: 0, dtY: 0, gmvY: 0 };
    data.forEach((r) => {
      t.gdMonth += r.gdMonth;
      t.gmv += r.gdMonth * r.avgValue;
      t.dtC += r.dtThangCautious;
      t.dtB += r.dtThangBase;
      t.dtO += r.dtThangOptimistic;
      t.dt2 += r.dt2Month;
      t.dtY += r.dtYear1;
    });
    // Year 1 GMV with progressive growth (same 6-cycle multiplier as revenue)
    const growthCycles = [1.0, 1.15, 1.3, 1.5, 1.7, 2.0];
    t.gmvY = growthCycles.reduce((s, m) => s + t.gmv * m * 2, 0);
    t.takeRate = t.gmv > 0 ? (t.dtB / t.gmv) * 100 : 0;
    return t;
  }, [data]);

  // ── Block-level breakdown ──
  const blockAnalysis = useMemo(() => {
    const map = {};
    data.forEach((r) => {
      if (!map[r.block]) map[r.block] = { gmv: 0, rev: 0, revY: 0, gd: 0 };
      map[r.block].gmv += r.gdMonth * r.avgValue;
      map[r.block].rev += r.dtThangBase;
      map[r.block].revY += r.dtYear1;
      map[r.block].gd += r.gdMonth;
    });
    return SKY_PARTNER_BLOCKS.map((b) => {
      const d = map[b.id] || { gmv: 0, rev: 0, revY: 0, gd: 0 };
      return { ...b, ...d, takeRate: d.gmv > 0 ? (d.rev / d.gmv) * 100 : 0 };
    });
  }, [data]);

  const maxBlockGmv = Math.max(...blockAnalysis.map((b) => b.gmv));
  const maxBlockRev = Math.max(...blockAnalysis.map((b) => b.rev));

  // ── Fee-type split ──
  const feeSplit = useMemo(() => {
    const fixed = { gd: 0, gmv: 0, rev: 0, revY: 0 };
    const pct = { gd: 0, gmv: 0, rev: 0, revY: 0 };
    data.forEach((r) => {
      const t = r.feeType === "fixed" ? fixed : pct;
      t.gd += r.gdMonth; t.gmv += r.gdMonth * r.avgValue;
      t.rev += r.dtThangBase; t.revY += r.dtYear1;
    });
    return { fixed, pct };
  }, [data]);

  // ── Top products ──
  const top5 = useMemo(() => [...data].sort((a, b) => b.dtYear1 - a.dtYear1).slice(0, 5), [data]);

  // ── Section header helper ──
  const SectionHead = ({ num, title, sub }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28, marginBottom: 14 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: "linear-gradient(135deg, rgba(124,108,255,0.15), rgba(124,108,255,0.05))",
        border: "1px solid rgba(124,108,255,0.20)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 800, color: "var(--accent-2)", flexShrink: 0,
      }}>{num}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <>
      {/* ════════════════════════════════════════════════
          HERO: Executive Financial Summary
         ════════════════════════════════════════════════ */}
      <div style={{
        padding: "24px 28px", borderRadius: 16, marginBottom: 4,
        background: "linear-gradient(135deg, rgba(124,108,255,0.06) 0%, rgba(52,211,153,0.04) 50%, rgba(251,191,36,0.03) 100%)",
        border: "1px solid rgba(124,108,255,0.12)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent-2)" }}>Phân tích tài chính dự án</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(52,211,153,0.12)", color: "var(--green)", fontWeight: 600 }}>Giai đoạn 1 · 17 sản phẩm</span>
        </div>

        {/* 3 hero metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* GMV */}
          <div style={{
            padding: "20px 24px", borderRadius: 14,
            background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#38bdf8" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#38bdf8" }}>GMV / Tháng</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{fmt(totals.gmv)}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>Tổng GTGD dự kiến · {fmtFull(totals.gdMonth)} GD</div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(56,189,248,0.10)" }}>
              <span style={{ fontSize: 10, color: "var(--text-faint)" }}>Year 1: </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8" }}>{fmt(totals.gmvY)}</span>
            </div>
          </div>
          {/* Revenue */}
          <div style={{
            padding: "20px 24px", borderRadius: 14,
            background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#34d399" }}>Doanh thu / Tháng</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{fmt(totals.dtB)}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>Phí & hoa hồng · Kịch bản cơ sở</div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(52,211,153,0.10)" }}>
              <span style={{ fontSize: 10, color: "var(--text-faint)" }}>Year 1: </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>{fmt(totals.dtY)}</span>
            </div>
          </div>
          {/* Take Rate */}
          <div style={{
            padding: "20px 24px", borderRadius: 14,
            background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a78bfa" }}>Take Rate bình quân</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{totals.takeRate.toFixed(2)}%</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>Revenue / GMV · Weighted avg</div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(167,139,250,0.10)" }}>
              <span style={{ fontSize: 10, color: "var(--text-faint)" }}>DT 2T GĐ1: </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>{fmt(totals.dt2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          SECTION 1: 3 Kịch bản doanh thu
         ════════════════════════════════════════════════ */}
      <SectionHead num="1" title="Kịch bản doanh thu" sub="Thận trọng (×0.7) · Cơ sở (×1.0) · Lạc quan (×1.4)" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 12 }}>
        {[
          { label: "Thận trọng", factor: "×0.7", val: totals.dtC, y1: totals.dtC * 17.3, color: "#64748B", rgb: "100,116,139", icon: "🛡️" },
          { label: "Cơ sở", factor: "×1.0", val: totals.dtB, y1: totals.dtY, color: "#a78bfa", rgb: "167,139,250", icon: "📊", hero: true },
          { label: "Lạc quan", factor: "×1.4", val: totals.dtO, y1: totals.dtO * 17.3, color: "#34d399", rgb: "52,211,153", icon: "🚀" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: s.hero ? "22px 24px" : "18px 20px", borderRadius: 14, textAlign: "center",
            background: `rgba(${s.rgb},${s.hero ? 0.08 : 0.04})`,
            border: `${s.hero ? 2 : 1}px solid rgba(${s.rgb},${s.hero ? 0.30 : 0.15})`,
            transform: s.hero ? "scale(1.02)" : "none", position: "relative", zIndex: s.hero ? 1 : 0,
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: s.color, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 10 }}>{s.factor}</div>
            <div style={{ fontSize: s.hero ? 26 : 22, fontWeight: 800, color: s.color, fontVariantNumeric: "tabular-nums" }}>{fmt(s.val)}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>/tháng</div>
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid rgba(${s.rgb},0.12)`, fontSize: 11 }}>
              <span style={{ color: "var(--text-faint)" }}>Year 1 ≈ </span>
              <span style={{ fontWeight: 700, color: s.color }}>{fmt(s.y1)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          SECTION 2: GMV & Revenue theo khối
         ════════════════════════════════════════════════ */}
      <SectionHead num="2" title="GMV & Doanh thu theo khối" sub="So sánh tổng giá trị giao dịch và phí thu được" />
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap" }}>
            <thead>
              <tr>
                {["Khối", "GD/tháng", "GMV/tháng", "", "DT/tháng", "", "Take Rate", "DT Year 1"].map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 14px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)",
                    textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)",
                    textAlign: i >= 1 ? "right" : "left",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blockAnalysis.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 500, color: "var(--text)" }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color, flexShrink: 0 }} />
                      {b.name}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtFull(b.gd)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: "#38bdf8", fontVariantNumeric: "tabular-nums" }}>{fmt(b.gmv)}</td>
                  <td style={{ padding: "10px 14px", width: 120 }}>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--border-faint)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: maxBlockGmv > 0 ? `${(b.gmv / maxBlockGmv) * 100}%` : "0%", borderRadius: 3, background: `linear-gradient(90deg, ${b.color}88, ${b.color})` }} />
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: "#34d399", fontVariantNumeric: "tabular-nums" }}>{b.rev > 0 ? fmt(b.rev) : "—"}</td>
                  <td style={{ padding: "10px 14px", width: 120 }}>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--border-faint)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: maxBlockRev > 0 ? `${(b.rev / maxBlockRev) * 100}%` : "0%", borderRadius: 3, background: "linear-gradient(90deg, rgba(52,211,153,0.5), #34d399)" }} />
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: b.takeRate > 3 ? "var(--amber)" : "var(--text-dim)", fontVariantNumeric: "tabular-nums" }}>
                    {b.takeRate > 0 ? b.takeRate.toFixed(1) + "%" : "—"}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{b.revY > 0 ? fmt(b.revY) : "—"}</td>
                </tr>
              ))}
              {/* Totals */}
              <tr style={{ background: "rgba(124,108,255,0.05)" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--accent-2)" }}>Tổng cộng</td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtFull(totals.gdMonth)}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#38bdf8", fontVariantNumeric: "tabular-nums" }}>{fmt(totals.gmv)}</td>
                <td />
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#34d399", fontVariantNumeric: "tabular-nums" }}>{fmt(totals.dtB)}</td>
                <td />
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "var(--accent-2)", fontVariantNumeric: "tabular-nums" }}>{totals.takeRate.toFixed(2)}%</td>
                <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmt(totals.dtY)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          SECTION 3: Revenue Mix — Fee model
         ════════════════════════════════════════════════ */}
      <SectionHead num="3" title="Cơ cấu doanh thu" sub="Phân tích theo mô hình thu phí" />
      <div className="grid-2" style={{ marginBottom: 0 }}>
        {/* Fixed fee */}
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, var(--accent-2), rgba(124,108,255,0.3))",
          }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent-2)" }}>Phí cố định / GD</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{data.filter((r) => r.feeType === "fixed").length} sản phẩm · 1K–20K₫/GD</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
              background: "rgba(124,108,255,0.10)", color: "var(--accent-2)",
            }}>{totals.dtB > 0 ? ((feeSplit.fixed.rev / totals.dtB) * 100).toFixed(0) : 0}% DT</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
            {fmt(feeSplit.fixed.rev)}<span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-dim)" }}>/tháng</span>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: "var(--text-dim)" }}>
            <span>GMV: <strong style={{ color: "#38bdf8" }}>{fmt(feeSplit.fixed.gmv)}</strong></span>
            <span>Year 1: <strong style={{ color: "var(--text)" }}>{fmt(feeSplit.fixed.revY)}</strong></span>
          </div>
        </div>
        {/* Percent commission */}
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, var(--green), rgba(52,211,153,0.3))",
          }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--green)" }}>Hoa hồng % trên GTGD</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{data.filter((r) => r.feeType === "percent").length} sản phẩm · 3–25% TPV</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
              background: "rgba(52,211,153,0.10)", color: "var(--green)",
            }}>{totals.dtB > 0 ? ((feeSplit.pct.rev / totals.dtB) * 100).toFixed(0) : 0}% DT</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
            {fmt(feeSplit.pct.rev)}<span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-dim)" }}>/tháng</span>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: "var(--text-dim)" }}>
            <span>GMV: <strong style={{ color: "#38bdf8" }}>{fmt(feeSplit.pct.gmv)}</strong></span>
            <span>Year 1: <strong style={{ color: "var(--text)" }}>{fmt(feeSplit.pct.revY)}</strong></span>
          </div>
        </div>
      </div>

      {/* Revenue mix bar */}
      <div style={{ marginTop: 10, height: 10, borderRadius: 5, overflow: "hidden", display: "flex" }}>
        <div style={{ width: `${totals.dtB > 0 ? (feeSplit.fixed.rev / totals.dtB) * 100 : 50}%`, height: "100%", background: "var(--accent-2)", transition: "width 0.5s" }} />
        <div style={{ flex: 1, height: "100%", background: "var(--green)" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "var(--text-faint)" }}>
        <span>Phí cố định</span>
        <span>Hoa hồng %</span>
      </div>

      {/* ════════════════════════════════════════════════
          SECTION 4: Top 5 sản phẩm
         ════════════════════════════════════════════════ */}
      <SectionHead num="4" title="Top 5 sản phẩm doanh thu cao nhất" sub="Kịch bản cơ sở · Year 1" />
      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {top5.map((p, i) => {
            const maxVal = top5[0].dtYear1;
            const blk = SKY_PARTNER_BLOCKS.find((b) => b.id === p.block);
            const gmv = p.gdMonth * p.avgValue;
            return (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: `${blk?.color || "var(--accent)"}15`,
                    color: blk?.color || "var(--accent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: `${blk?.color || "#888"}14`, color: blk?.color, fontWeight: 600 }}>Khối 0{p.block}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums", width: 80, textAlign: "right" }}>{fmt(p.dtYear1)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, height: 8, background: "var(--border-faint)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      width: `${(p.dtYear1 / maxVal) * 100}%`,
                      background: `linear-gradient(90deg, ${blk?.color || "var(--accent)"}88, ${blk?.color || "var(--accent)"})`,
                    }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: 10.5, color: "var(--text-faint)" }}>
                  <span>GMV: <strong style={{ color: "#38bdf8" }}>{fmt(gmv)}</strong>/tháng</span>
                  <span>DT: <strong style={{ color: "#34d399" }}>{fmt(p.dtThangBase)}</strong>/tháng</span>
                  <span>{fmtFull(p.gdMonth)} GD · {p.fee}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          SECTION 5: Chi tiết dự phóng
         ════════════════════════════════════════════════ */}
      <SectionHead num="5" title="Chi tiết dự phóng doanh thu" sub="Baseline: Vikki Bank thực tế · Phí: iMedia T7/2026 & Benchmark TT" />
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto", paddingBottom: 4 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap", minWidth: 1300 }}>
            <thead>
              <tr>
                {["TT", "Sản phẩm / Dịch vụ", "GD/tháng", "GTGD TB", "GMV/tháng", "Phí/HH", "Nguồn", "DT Thận trọng", "DT Cơ sở", "DT Lạc quan", "DT Year 1"].map((h, i) => (
                  <th key={i} style={{
                    padding: "10px 12px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)",
                    textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)",
                    textAlign: i >= 2 ? "right" : "left",
                    position: i <= 1 ? "sticky" : undefined,
                    left: i === 0 ? 0 : i === 1 ? 36 : undefined,
                    background: "var(--card-bg)", zIndex: i <= 1 ? 1 : undefined,
                    minWidth: i === 1 ? 200 : undefined,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => {
                const blk = SKY_PARTNER_BLOCKS.find((b) => b.id === r.block);
                const gmv = r.gdMonth * r.avgValue;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                    <td style={{ padding: "8px 12px", color: "var(--text-faint)", fontWeight: 600, textAlign: "center", position: "sticky", left: 0, background: "var(--card-bg)", zIndex: 1, width: 36 }}>{r.stt}</td>
                    <td style={{ padding: "8px 12px", color: "var(--text)", fontWeight: 500, position: "sticky", left: 36, background: "var(--card-bg)", zIndex: 1 }}>
                      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 2, background: blk?.color, marginRight: 8, verticalAlign: "middle" }} />
                      {r.name}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtFull(r.gdMonth)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--text-dim)", fontVariantNumeric: "tabular-nums" }}>{fmtFull(r.avgValue)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, color: "#38bdf8", fontVariantNumeric: "tabular-nums" }}>{fmt(gmv)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 8, background: r.feeType === "fixed" ? "rgba(124,108,255,0.10)" : "rgba(52,211,153,0.10)", color: r.feeType === "fixed" ? "var(--accent-2)" : "var(--green)" }}>{r.fee}</span>
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontSize: 10.5, color: r.source.includes("iMedia") ? "#378ADD" : "var(--amber)" }}>{r.source}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--text-dim)", fontVariantNumeric: "tabular-nums" }}>{fmtFull(r.dtThangCautious)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmtFull(r.dtThangBase)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmtFull(r.dtThangOptimistic)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmtFull(r.dtYear1)}</td>
                  </tr>
                );
              })}
              <tr style={{ background: "rgba(124,108,255,0.05)" }}>
                <td colSpan={2} style={{ padding: "10px 12px", fontWeight: 700, color: "var(--accent-2)", position: "sticky", left: 0, background: "rgba(124,108,255,0.05)", zIndex: 1 }}>TỔNG CỘNG</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtFull(totals.gdMonth)}</td>
                <td />
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#38bdf8", fontVariantNumeric: "tabular-nums" }}>{fmt(totals.gmv)}</td>
                <td />
                <td />
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtFull(totals.dtC)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtFull(totals.dtB)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmtFull(totals.dtO)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--green)", fontVariantNumeric: "tabular-nums" }}>{fmtFull(totals.dtY)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          SECTION 6: Assumptions
         ════════════════════════════════════════════════ */}
      <div className="card" style={{ marginTop: 24, background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--amber)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>📌 Giả định & Ghi chú</h3>
        {[
          "Baseline: Dữ liệu thực tế Vikki Bank (85.4K users, 164.8K trans, ~56.7 tỷ GTGD/tháng)",
          "Hệ số mở rộng kênh GĐ1: ×2.0–3.0 khi thêm HDBank App, POS trạm xăng pilot (50–100 điểm), Kiosk CDS",
          "3 kịch bản: Thận trọng (×0.7), Cơ sở (×1.0), Lạc quan (×1.4)",
          "GMV = GD/tháng × GTGD trung bình — tổng giá trị giao dịch qua nền tảng (chưa trừ phí)",
          "Take Rate = DT / GMV — tỷ lệ phí thu được trên tổng GTGD, phụ thuộc cơ cấu sản phẩm",
          "Dự phóng Year 1: Tăng trưởng lũy tiến qua 6 chu kỳ 2 tháng (×1.0 → ×1.15 → ×1.3 → ×1.5 → ×1.7 → ×2.0)",
          "Phí nguồn iMedia T7/2026: căn cứ chính sách phí hợp tác kênh thanh toán — Cty CNGH & DV iMedia",
          "Chưa bao gồm chi phí vận hành, hạ tầng, nhân sự — đây là dự phóng doanh thu gộp (Gross Revenue)",
        ].map((note, i) => (
          <p key={i} style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 6px", lineHeight: 1.6, display: "flex", gap: 8 }}>
            <span style={{ color: "var(--amber)", flexShrink: 0 }}>•</span> {note}
          </p>
        ))}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════
const TABS = ["6 Khối thương mại", "Triển khai GĐ1", "Kịch bản tài chính"];

export default function PartnerPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <ReportHeader
        eyebrow="QUẢN LÝ ĐẦU VÀO"
        title="Dự án Partner Platform"
        subtitle="Sky Partner Platform — Digital Commerce Orchestration · Sovico Group · Galaxy Pay"
        right={
          <div className="seg-tabs">
            {TABS.map((t, i) => (
              <button key={i} className={`seg-tab${activeTab === i ? " active" : ""}`} onClick={() => setActiveTab(i)}>{t}</button>
            ))}
          </div>
        }
      />
      {activeTab === 0 && <BlocksTab />}
      {activeTab === 1 && <Phase1Tab />}
      {activeTab === 2 && <FinanceTab />}
    </>
  );
}
