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
  // 8 dịch vụ chào giá cho Vikki/HDBank GĐ1
  // vnpayPrice: để trống cho user bổ sung sau
  const serviceOffering = [
    {
      stt: 1, service: "Topup (Nạp tiền trả trước)", category: "Telco",
      subItems: [
        { carrier: "Viettel", gpPrice: "CK 3.6%", vnpayPrice: null, unit: "% mệnh giá" },
        { carrier: "VinaPhone", gpPrice: "CK 4.6%", vnpayPrice: null, unit: "% mệnh giá" },
        { carrier: "MobiFone", gpPrice: "CK 3.7%", vnpayPrice: null, unit: "% mệnh giá" },
        { carrier: "Vietnamobile", gpPrice: "CK 6.5%", vnpayPrice: null, unit: "% mệnh giá" },
      ],
      gpSource: "Imedia", note: "Chiết khấu đã gồm VAT",
    },
    {
      stt: 2, service: "Điện (EVN)", category: "Công ích",
      gpPrice: "400đ/GD", vnpayPrice: null, unit: "VND/GD",
      gpSource: "Imedia", note: "Tất cả NCC điện",
    },
    {
      stt: 3, service: "Nước (245+ NCC)", category: "Công ích",
      gpPrice: "400đ/GD", vnpayPrice: null, unit: "VND/GD",
      gpSource: "Imedia", note: "245+ nhà cung cấp nước",
    },
    {
      stt: 4, service: "Internet (FPT, VNPT, Viettel)", category: "Công ích",
      gpPrice: "400đ/GD", vnpayPrice: null, unit: "VND/GD",
      gpSource: "Imedia", note: "",
    },
    {
      stt: 5, service: "Postpaid (Nạp tiền trả sau)", category: "Telco",
      gpPrice: "~400đ/GD", vnpayPrice: null, unit: "VND/GD",
      gpSource: "Imedia", note: "Tất cả nhà mạng",
    },
    {
      stt: 6, service: "Data Card (Thẻ cào / Gói dữ liệu)", category: "Telco",
      subItems: [
        { carrier: "Viettel (Sponsor)", gpPrice: "CK 10.0%", vnpayPrice: null, unit: "% mệnh giá" },
        { carrier: "MobiFone (Thông thường)", gpPrice: "CK 17.0%", vnpayPrice: null, unit: "% mệnh giá" },
        { carrier: "MobiFone (DC_ON)", gpPrice: "CK 10.0%", vnpayPrice: null, unit: "% mệnh giá" },
        { carrier: "VinaPhone", gpPrice: "CK 14.0%", vnpayPrice: null, unit: "% mệnh giá" },
      ],
      gpSource: "Imedia", note: "Chiết khấu đã gồm VAT",
    },
    {
      stt: 7, service: "Loan (Vay trả góp)", category: "Tài chính",
      gpPrice: null, vnpayPrice: null, unit: "",
      gpSource: "", note: "Đang triển khai",
    },
    {
      stt: 8, service: "Vietlott (Xổ số)", category: "Giải trí",
      gpPrice: null, vnpayPrice: null, unit: "",
      gpSource: "", note: "Đang triển khai",
    },
  ];

  const CATEGORY_COLORS = {
    Telco: { bg: "rgba(124,108,255,0.08)", color: "#a78bfa" },
    "Công ích": { bg: "rgba(56,138,221,0.08)", color: "#378ADD" },
    "Tài chính": { bg: "rgba(216,90,48,0.08)", color: "#D85A30" },
    "Giải trí": { bg: "rgba(251,191,36,0.08)", color: "#fbbf24" },
  };

  function CompareTag({ gp, vnpay }) {
    if (!gp || !vnpay) return <span style={{ fontSize: 11, color: "var(--text-faint)" }}>—</span>;
    // parse numeric for comparison
    const gpNum = parseFloat(gp.replace(/[^\d.]/g, ""));
    const vnNum = parseFloat(vnpay.replace(/[^\d.]/g, ""));
    if (isNaN(gpNum) || isNaN(vnNum)) return <span style={{ fontSize: 11, color: "var(--text-faint)" }}>—</span>;
    const isLower = gpNum < vnNum;
    const isEqual = gpNum === vnNum;
    if (isEqual) return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: "rgba(124,108,255,0.10)", color: "var(--accent-2)" }}>Bằng</span>;
    return (
      <span style={{
        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8,
        background: isLower ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.10)",
        color: isLower ? "#34d399" : "#f87171",
      }}>
        {isLower ? "▼ Thấp hơn" : "▲ Cao hơn"}
      </span>
    );
  }

  const cellStyle = { padding: "10px 14px", fontSize: 12, fontVariantNumeric: "tabular-nums" };
  const headerStyle = { padding: "10px 14px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)" };

  return (
    <>
      {/* Header */}
      <div className="card" style={{
        padding: "24px 28px",
        background: "linear-gradient(135deg, rgba(124,108,255,0.08), rgba(52,211,153,0.04))",
        border: "1px solid rgba(124,108,255,0.15)",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Bảng chào dịch vụ · Giai đoạn 1</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
          Chào giá dịch vụ cho Vikki / HDBank
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
          So sánh biểu phí Galaxy Pay đề xuất với VNPay (đối tác hiện tại) — 08 dịch vụ trọng tâm Giai đoạn 1 trên nền tảng Sky Partner Platform.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(124,108,255,0.12)", color: "var(--accent-2)" }}>Galaxy Pay · Nguồn cung Imedia</span>
          <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(251,191,36,0.12)", color: "var(--amber)" }}>VNPay · Đối tác hiện tại Vikki</span>
          <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(52,211,153,0.12)", color: "var(--green)" }}>08 Dịch vụ GĐ1</span>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid-3" style={{ marginTop: 20 }}>
        <div className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
          <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 6 }}>Số dịch vụ GĐ1</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--accent-2)" }}>08</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>nhóm sản phẩm</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
          <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 6 }}>Nguồn cung GP</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#378ADD" }}>Imedia</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>Aggregator chính</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "20px 16px" }}>
          <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 6 }}>Đối thủ so sánh</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--amber)" }}>VNPay</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>Đang phục vụ Vikki</div>
        </div>
      </div>

      {/* Main comparison table */}
      <div className="card" style={{ marginTop: 20, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0 }}>Bảng so sánh biểu phí dịch vụ</h3>
            <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "4px 0 0" }}>Galaxy Pay đề xuất vs VNPay hiện tại · Đơn vị: VND hoặc % mệnh giá</p>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-2)" }} /> Galaxy Pay</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)" }} /> VNPay</span>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap", minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ ...headerStyle, textAlign: "center", width: 40 }}>TT</th>
                <th style={{ ...headerStyle, textAlign: "left", minWidth: 200 }}>Dịch vụ</th>
                <th style={{ ...headerStyle, textAlign: "center" }}>Phân loại</th>
                <th style={{ ...headerStyle, textAlign: "center" }}>Đơn vị</th>
                <th style={{ ...headerStyle, textAlign: "center", background: "rgba(124,108,255,0.04)" }}>
                  <span style={{ color: "var(--accent-2)" }}>Giá Galaxy Pay</span>
                </th>
                <th style={{ ...headerStyle, textAlign: "center", background: "rgba(251,191,36,0.04)" }}>
                  <span style={{ color: "var(--amber)" }}>Giá VNPay cho Vikki</span>
                </th>
                <th style={{ ...headerStyle, textAlign: "center" }}>So sánh GP</th>
                <th style={{ ...headerStyle, textAlign: "left" }}>Nguồn GP</th>
                <th style={{ ...headerStyle, textAlign: "left" }}>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {serviceOffering.map((s) => {
                if (s.subItems) {
                  // Topup with carrier breakdown
                  return (
                    <React.Fragment key={s.stt}>
                      {/* Group header row */}
                      <tr style={{ background: "rgba(124,108,255,0.03)" }}>
                        <td style={{ ...cellStyle, textAlign: "center", fontWeight: 700, color: "var(--accent-2)", borderBottom: "none", verticalAlign: "top", paddingTop: 14 }} rowSpan={s.subItems.length + 1}>{s.stt}</td>
                        <td colSpan={8} style={{ ...cellStyle, fontWeight: 700, color: "var(--text)", borderBottom: "1px solid var(--border-faint)" }}>
                          {s.service}
                          {s.note && <span style={{ fontSize: 10, color: "var(--text-faint)", fontWeight: 400, marginLeft: 8 }}>({s.note})</span>}
                        </td>
                      </tr>
                      {s.subItems.map((sub, j) => {
                        const catStyle = CATEGORY_COLORS[s.category] || {};
                        return (
                          <tr key={`${s.stt}-${j}`} style={{ borderBottom: j === s.subItems.length - 1 ? "2px solid var(--border)" : "1px solid var(--border-faint)" }}>
                            <td style={{ ...cellStyle, paddingLeft: 24, color: "var(--text-dim)" }}>
                              <span style={{ fontSize: 11 }}>└</span> {sub.carrier}
                            </td>
                            <td style={{ ...cellStyle, textAlign: "center" }}>
                              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: catStyle.bg, color: catStyle.color, fontWeight: 600 }}>{s.category}</span>
                            </td>
                            <td style={{ ...cellStyle, textAlign: "center", fontSize: 11, color: "var(--text-dim)" }}>{sub.unit}</td>
                            <td style={{ ...cellStyle, textAlign: "center", fontWeight: 700, color: "var(--accent-2)", background: "rgba(124,108,255,0.02)" }}>
                              {sub.gpPrice || <span style={{ color: "var(--text-faint)" }}>—</span>}
                            </td>
                            <td style={{ ...cellStyle, textAlign: "center", fontWeight: 700, color: "var(--amber)", background: "rgba(251,191,36,0.02)" }}>
                              {sub.vnpayPrice || <span style={{ color: "var(--text-faint)", fontWeight: 400, fontStyle: "italic" }}>Chờ bổ sung</span>}
                            </td>
                            <td style={{ ...cellStyle, textAlign: "center" }}>
                              <CompareTag gp={sub.gpPrice} vnpay={sub.vnpayPrice} />
                            </td>
                            <td style={{ ...cellStyle, fontSize: 11, color: "#378ADD" }}>{s.gpSource}</td>
                            <td style={{ ...cellStyle, fontSize: 11, color: "var(--text-faint)" }}></td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                }

                // Normal row
                const catStyle = CATEGORY_COLORS[s.category] || {};
                return (
                  <tr key={s.stt} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                    <td style={{ ...cellStyle, textAlign: "center", fontWeight: 700, color: "var(--accent-2)" }}>{s.stt}</td>
                    <td style={{ ...cellStyle, fontWeight: 600, color: "var(--text)" }}>{s.service}</td>
                    <td style={{ ...cellStyle, textAlign: "center" }}>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: catStyle.bg, color: catStyle.color, fontWeight: 600 }}>{s.category}</span>
                    </td>
                    <td style={{ ...cellStyle, textAlign: "center", fontSize: 11, color: "var(--text-dim)" }}>{s.unit || "—"}</td>
                    <td style={{ ...cellStyle, textAlign: "center", fontWeight: 700, color: "var(--accent-2)", background: "rgba(124,108,255,0.02)" }}>
                      {s.gpPrice || <span style={{ color: "var(--text-faint)", fontWeight: 400, fontStyle: "italic" }}>Đang triển khai</span>}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "center", fontWeight: 700, color: "var(--amber)", background: "rgba(251,191,36,0.02)" }}>
                      {s.vnpayPrice || <span style={{ color: "var(--text-faint)", fontWeight: 400, fontStyle: "italic" }}>Chờ bổ sung</span>}
                    </td>
                    <td style={{ ...cellStyle, textAlign: "center" }}>
                      <CompareTag gp={s.gpPrice} vnpay={s.vnpayPrice} />
                    </td>
                    <td style={{ ...cellStyle, fontSize: 11, color: s.gpSource ? "#378ADD" : "var(--text-faint)" }}>{s.gpSource || "—"}</td>
                    <td style={{ ...cellStyle, fontSize: 11, color: "var(--text-faint)" }}>{s.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border-faint)", fontSize: 11, color: "var(--text-faint)", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ color: "#378ADD" }}>ℹ</span>
          Giá Galaxy Pay: nguồn Imedia (Cty CNGH & DV iMedia) · Giá VNPay: đối tác hiện tại của Vikki — <em style={{ marginLeft: 2 }}>chờ bổ sung</em>
        </div>
      </div>

      {/* Distribution Model */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", margin: "0 0 12px" }}>📱 Kênh số (Owned Digital)</h3>
          {["Vikki Bank App", "HDBank App", "Vietjet Air App", "SkyJoy", "Trạm công dân số"].map((ch, i) => (
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
  const [showAppendix, setShowAppendix] = useState(false);
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
          SECTION 6: Topup carrier breakdown
         ════════════════════════════════════════════════ */}
      {(() => {
        const topupRow = data.find((r) => r.topupCarriers);
        if (!topupRow) return null;
        const carriers = topupRow.topupCarriers;
        const maxDt = Math.max(...carriers.map((c) => c.dtBase));
        const CARRIER_COLORS = { Viettel: "#e11d48", VinaPhone: "#2563eb", MobiFone: "#16a34a", Vietnamobile: "#f59e0b" };
        return (
          <>
            <SectionHead num="6" title="Chi tiết chiết khấu Topup theo nhà mạng" sub="Nguồn: Imedia · Chiết khấu đã gồm VAT" />
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap" }}>
                  <thead>
                    <tr>
                      {["Nhà mạng", "Thị phần GD", "GD/tháng", "Chiết khấu", "GMV/tháng", "DT Base/tháng", "Tỷ trọng DT"].map((h, i) => (
                        <th key={i} style={{
                          padding: "10px 14px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)",
                          textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)",
                          textAlign: i >= 2 ? "right" : "left",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {carriers.map((c, i) => {
                      const gmv = c.gdMonth * topupRow.avgValue;
                      const dtPct = topupRow.dtThangBase > 0 ? (c.dtBase / topupRow.dtThangBase * 100) : 0;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: CARRIER_COLORS[c.carrier], marginRight: 10, verticalAlign: "middle" }} />
                            {c.carrier}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: "rgba(124,108,255,0.08)", color: "var(--accent-2)" }}>{(c.share * 100).toFixed(0)}%</span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtFull(c.gdMonth)}</td>
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "rgba(52,211,153,0.10)", color: "var(--green)" }}>{c.ck}%</span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#38bdf8", fontWeight: 600 }}>{fmt(gmv)}</td>
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                              <div style={{ width: 80, height: 6, borderRadius: 3, background: "var(--border-faint)", overflow: "hidden" }}>
                                <div style={{ width: `${(c.dtBase / maxDt) * 100}%`, height: "100%", borderRadius: 3, background: CARRIER_COLORS[c.carrier] }} />
                              </div>
                              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", minWidth: 70, textAlign: "right" }}>{fmt(c.dtBase)}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: "var(--text-dim)", fontVariantNumeric: "tabular-nums" }}>{dtPct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: "rgba(124,108,255,0.05)", borderTop: "2px solid var(--border)" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--accent-2)" }}>TỔNG CỘNG</td>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--text-dim)" }}>100%</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtFull(topupRow.gdMonth)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "rgba(251,191,36,0.10)", color: "var(--amber)" }}>~4.07%</span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#38bdf8", fontVariantNumeric: "tabular-nums" }}>{fmt(topupRow.gdMonth * topupRow.avgValue)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(topupRow.dtThangBase)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "var(--accent-2)" }}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-faint)", fontSize: 11, color: "var(--text-faint)", display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "#378ADD" }}>ℹ</span>
                CK bình quân gia quyền ~4.07% (dựa trên thị phần GD ước tính) · Nguồn cung: <strong style={{ color: "#378ADD", marginLeft: 2 }}>Imedia</strong>
              </div>
            </div>
          </>
        );
      })()}

      {/* ════════════════════════════════════════════════
          SECTION 7: Data Card carrier breakdown
         ════════════════════════════════════════════════ */}
      {(() => {
        const dcRow = data.find((r) => r.dataCardCarriers);
        if (!dcRow) return null;
        const carriers = dcRow.dataCardCarriers;
        const maxDt = Math.max(...carriers.map((c) => c.dtBase));
        const DC_COLORS = { "Viettel (Sponsor)": "#e11d48", VinaPhone: "#2563eb", "MobiFone (Thông thường)": "#16a34a", "MobiFone (DC_ON)": "#059669" };
        return (
          <>
            <SectionHead num="7" title="Chi tiết chiết khấu Data Card theo nhà mạng" sub="Nguồn: Imedia · HĐ 1010/2022 · Phụ lục 01" />
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap" }}>
                  <thead>
                    <tr>
                      {["Nhà mạng / Loại gói", "Thị phần GD", "GD/tháng", "Chiết khấu", "GMV/tháng", "DT Base/tháng", "Tỷ trọng DT"].map((h, i) => (
                        <th key={i} style={{
                          padding: "10px 14px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)",
                          textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)",
                          textAlign: i >= 2 ? "right" : "left",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {carriers.map((c, i) => {
                      const gmv = c.gdMonth * dcRow.avgValue;
                      const dtPct = dcRow.dtThangBase > 0 ? (c.dtBase / dcRow.dtThangBase * 100) : 0;
                      const dotColor = DC_COLORS[c.carrier] || "#8b5cf6";
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: dotColor, marginRight: 10, verticalAlign: "middle" }} />
                            {c.carrier}
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 8, background: "rgba(124,108,255,0.08)", color: "var(--accent-2)" }}>{(c.share * 100).toFixed(0)}%</span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtFull(c.gdMonth)}</td>
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: c.ck >= 14 ? "rgba(52,211,153,0.15)" : "rgba(52,211,153,0.10)", color: "var(--green)" }}>{c.ck}%</span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#38bdf8", fontWeight: 600 }}>{fmt(gmv)}</td>
                          <td style={{ padding: "10px 14px", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                              <div style={{ width: 80, height: 6, borderRadius: 3, background: "var(--border-faint)", overflow: "hidden" }}>
                                <div style={{ width: `${(c.dtBase / maxDt) * 100}%`, height: "100%", borderRadius: 3, background: dotColor }} />
                              </div>
                              <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", minWidth: 70, textAlign: "right" }}>{fmt(c.dtBase)}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, color: "var(--text-dim)", fontVariantNumeric: "tabular-nums" }}>{dtPct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: "rgba(124,108,255,0.05)", borderTop: "2px solid var(--border)" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--accent-2)" }}>TỔNG CỘNG</td>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--text-dim)" }}>100%</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtFull(dcRow.gdMonth)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8, background: "rgba(251,191,36,0.10)", color: "var(--amber)" }}>~12%</span>
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#38bdf8", fontVariantNumeric: "tabular-nums" }}>{fmt(dcRow.gdMonth * dcRow.avgValue)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(dcRow.dtThangBase)}</td>
                      <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "var(--accent-2)" }}>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-faint)", fontSize: 11, color: "var(--text-faint)", display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ color: "#378ADD" }}>ℹ</span>
                CK bình quân gia quyền ~12% · MobiFone Gói Thông thường có CK cao nhất (17%) · Nguồn cung: <strong style={{ color: "#378ADD", marginLeft: 2 }}>Imedia</strong>
              </div>
            </div>
          </>
        );
      })()}

      {/* ════════════════════════════════════════════════
          APPENDIX: Imedia pricing detail (collapsible)
         ════════════════════════════════════════════════ */}
      <div className="card" style={{ marginTop: 20, overflow: "hidden", border: "1px solid rgba(55,138,221,0.15)" }}>
        <button
          onClick={() => setShowAppendix(!showAppendix)}
          style={{
            width: "100%", background: "none", border: "none", cursor: "pointer",
            padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
            textAlign: "left",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#378ADD", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontWeight: 600 }}>
              📎 Phụ lục hợp đồng Imedia
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
              Bảng giá chi tiết dịch vụ Topup & Data Card
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
              HĐ 1010/2022/HĐKT/PTKD/IMEDIA–GALAXYPAY · Phụ lục 01, Phần II · Ký 10/10/2022
            </div>
          </div>
          <span style={{
            fontSize: 18, color: "#378ADD", transition: "transform 0.2s",
            transform: showAppendix ? "rotate(180deg)" : "rotate(0deg)",
          }}>▼</span>
        </button>

        {showAppendix && (
          <div style={{ borderTop: "1px solid var(--border-faint)", padding: "20px" }}>

            {/* ── 1. Direct Topup ── */}
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 3, height: 16, borderRadius: 2, background: "#378ADD" }} />
              1. Chính sách Dịch vụ Topup (Direct Topup)
            </h4>
            <div style={{ overflowX: "auto", marginBottom: 28 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap" }}>
                <thead>
                  <tr>
                    {["TT", "Nhà mạng", "Mệnh giá (VNĐ)", "Chiết khấu (đã gồm VAT)"].map((h, i) => (
                      <th key={i} style={{ padding: "8px 14px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)", textAlign: i >= 2 ? "center" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tt: 1, carrier: "VinaPhone", price: "Tất cả", ck: "4.6%", color: "#2563eb" },
                    { tt: 2, carrier: "MobiFone", price: "Tất cả", ck: "3.7%", color: "#16a34a" },
                    { tt: 3, carrier: "Viettel", price: "Tất cả", ck: "3.6%", color: "#e11d48" },
                    { tt: 4, carrier: "Vietnamobile", price: "Tất cả", ck: "6.5%", color: "#f59e0b" },
                  ].map((r) => (
                    <tr key={r.tt} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                      <td style={{ padding: "8px 14px", fontWeight: 600, color: "var(--accent-2)", textAlign: "center", width: 40 }}>{r.tt}</td>
                      <td style={{ padding: "8px 14px", fontWeight: 600 }}>
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: r.color, marginRight: 8, verticalAlign: "middle" }} />
                        {r.carrier}
                      </td>
                      <td style={{ padding: "8px 14px", textAlign: "center", color: "var(--text-dim)" }}>{r.price}</td>
                      <td style={{ padding: "8px 14px", textAlign: "center" }}>
                        <span style={{ fontWeight: 700, padding: "3px 12px", borderRadius: 8, background: "rgba(52,211,153,0.10)", color: "var(--green)" }}>{r.ck}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── 2. TopupData ── */}
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 3, height: 16, borderRadius: 2, background: "#378ADD" }} />
              2. Chính sách TopupData (Data Card)
            </h4>

            {/* ── Viettel Sponsor ── */}
            {[
              {
                carrier: "Viettel (Gói Sponsor)", ck: "10.0%", color: "#e11d48",
                packages: [
                  { stt: 1, sys: "DataVTT2 5000", name: "ST5KDS", data: "500MB", price: "5,000", days: "01 ngày" },
                  { stt: 2, sys: "DataVTT2 9000", name: "G3DS", data: "3GB", price: "9,000", days: "03 giờ" },
                  { stt: 3, sys: "DataVTT2 10000", name: "ST10KDS", data: "2GB", price: "10,000", days: "01 ngày" },
                  { stt: 4, sys: "DataVTT2 15000", name: "ST15KDS", data: "3GB", price: "15,000", days: "03 ngày" },
                  { stt: 5, sys: "DataVTT2 17000", name: "1G7N", data: "1GB", price: "17,000", days: "07 ngày" },
                  { stt: 6, sys: "DataVTT2 20000", name: "ECOD20DS", data: "1.5GB", price: "20,000", days: "30 ngày" },
                  { stt: 7, sys: "DataVTT2 24000", name: "1G30N", data: "1GB", price: "24,000", days: "30 ngày" },
                  { stt: 8, sys: "DataVTT2 29000", name: "2G7N", data: "2GB", price: "29,000", days: "07 ngày" },
                  { stt: 9, sys: "DataVTT2 30000", name: "ST30KDS", data: "7GB", price: "30,000", days: "07 ngày" },
                  { stt: 10, sys: "DataVTT2 38000", name: "3G7N", data: "3GB", price: "38,000", days: "07 ngày" },
                  { stt: 11, sys: "DataVTT2 42000", name: "2G30N", data: "2GB", price: "42,000", days: "30 ngày" },
                  { stt: 12, sys: "DataVTT2 55000", name: "3G30N", data: "3GB", price: "55,000", days: "30 ngày" },
                  { stt: 13, sys: "DataVTT2 63000", name: "4G30N", data: "4GB", price: "63,000", days: "30 ngày" },
                  { stt: 14, sys: "DataVTT2 69000", name: "5G30N", data: "5GB", price: "69,000", days: "30 ngày" },
                  { stt: 15, sys: "DataVTT2 70000", name: "ST70KDS", data: "500MB/Ngày", price: "70,000", days: "30 ngày" },
                  { stt: 16, sys: "DataVTT2 90000", name: "ST90KDS", data: "1GB/Ngày", price: "90,000", days: "30 ngày" },
                  { stt: 17, sys: "DataVTT2 120000", name: "ST120KDS", data: "2GB/Ngày", price: "120,000", days: "30 ngày" },
                  { stt: 18, sys: "DataVTT2 150000", name: "ST150KDS", data: "3GB/Ngày", price: "150,000", days: "30 ngày" },
                ],
              },
              {
                carrier: "MobiFone (Gói Thông thường)", ck: "17.0%", color: "#16a34a",
                packages: [
                  { stt: 1, sys: "DataVMS 1000", name: "DC1", data: "50 MB", price: "1,000", days: "24 giờ" },
                  { stt: 2, sys: "DataVMS 2000", name: "DC2", data: "100 MB", price: "2,000", days: "24 giờ" },
                  { stt: 3, sys: "DataVMS 3000", name: "DC3", data: "150 MB", price: "3,000", days: "24 giờ" },
                  { stt: 4, sys: "DataVMS 5000", name: "DC5", data: "250 MB", price: "5,000", days: "24 giờ" },
                  { stt: 5, sys: "DataVMS 10000", name: "DC10", data: "1,000 MB", price: "10,000", days: "10 ngày" },
                  { stt: 6, sys: "DataVMS 14000", name: "DataQT14", data: "1,400 MB", price: "14,000", days: "10 ngày" },
                  { stt: 7, sys: "DataVMS 20000", name: "DC20", data: "1,500 MB", price: "20,000", days: "10 ngày" },
                  { stt: 8, sys: "DataVMS 28000", name: "DataQT28", data: "2,800 MB", price: "28,000", days: "30 ngày" },
                  { stt: 9, sys: "DataVMS 42000", name: "DataQT42", data: "4,000 MB", price: "42,000", days: "30 ngày" },
                  { stt: 10, sys: "DataVMS 56000", name: "DataQT56", data: "5,000 MB", price: "56,000", days: "30 ngày" },
                  { stt: 11, sys: "DataVMS 84000", name: "DataQT84", data: "8,000 MB", price: "84,000", days: "30 ngày" },
                ],
              },
              {
                carrier: "MobiFone (DC_ON)", ck: "10.0%", color: "#059669",
                packages: [
                  { stt: 1, sys: "", name: "DC_ON1", data: "1 GB", price: "20,000", days: "30 ngày" },
                  { stt: 2, sys: "", name: "DC_ON3", data: "3 GB", price: "45,000", days: "30 ngày" },
                  { stt: 3, sys: "", name: "DC_ON5", data: "5 GB", price: "70,000", days: "30 ngày" },
                  { stt: 4, sys: "", name: "DC_ON8", data: "8 GB", price: "100,000", days: "30 ngày" },
                  { stt: 5, sys: "", name: "DC_ON15", data: "15 GB", price: "180,000", days: "30 ngày" },
                  { stt: 6, sys: "", name: "DC_ON20", data: "18 GB", price: "200,000", days: "30 ngày" },
                ],
              },
              {
                carrier: "VinaPhone (TopupData)", ck: "14.0%", color: "#2563eb",
                packages: [
                  { stt: 1, sys: "DataVNP 150", name: "MD5", data: "5 MB", price: "150", days: "24 giờ" },
                  { stt: 2, sys: "DataVNP 300", name: "MD10", data: "10 MB", price: "300", days: "24 giờ" },
                  { stt: 3, sys: "DataVNP 600", name: "MD20", data: "20 MB", price: "600", days: "24 giờ" },
                  { stt: 4, sys: "DataVNP 900", name: "MD30", data: "30 MB", price: "900", days: "24 giờ" },
                  { stt: 5, sys: "DataVNP 1500", name: "MD50", data: "50 MB", price: "1,500", days: "7 ngày" },
                  { stt: 6, sys: "DataVNP 3000", name: "MD100", data: "100 MB", price: "3,000", days: "7 ngày" },
                  { stt: 7, sys: "DataVNP 5200", name: "MD200", data: "200 MB", price: "5,200", days: "7 ngày" },
                  { stt: 8, sys: "DataVNP 7800", name: "MD300", data: "300 MB", price: "7,800", days: "7 ngày" },
                  { stt: 9, sys: "DataVNP 13000", name: "MD500", data: "500 MB", price: "13,000", days: "7 ngày" },
                  { stt: 10, sys: "DataVNP 20000", name: "MD1G", data: "1 GB", price: "20,000", days: "30 ngày" },
                  { stt: 11, sys: "DataVNP 60000", name: "MD3G", data: "3 GB", price: "60,000", days: "30 ngày" },
                  { stt: 12, sys: "DataVNP 100000", name: "MD5G", data: "5 GB", price: "100,000", days: "30 ngày" },
                  { stt: 13, sys: "DataVNP 160000", name: "MD8G", data: "8 GB", price: "160,000", days: "30 ngày" },
                  { stt: 14, sys: "DataVNP 185000", name: "MD10G", data: "10 GB", price: "185,000", days: "30 ngày" },
                  { stt: 15, sys: "DataVNP 220000", name: "MD12G", data: "12 GB", price: "220,000", days: "30 ngày" },
                  { stt: 16, sys: "DataVNP 275000", name: "MD15G", data: "15 GB", price: "275,000", days: "30 ngày" },
                ],
              },
            ].map((group) => (
              <div key={group.carrier} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "8px 14px", background: "rgba(124,108,255,0.03)", borderRadius: 8 }}>
                  <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: group.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{group.carrier}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 8, background: "rgba(52,211,153,0.12)", color: "var(--green)", marginLeft: "auto" }}>CK {group.ck}</span>
                  <span style={{ fontSize: 11, color: "var(--text-faint)" }}>{group.packages.length} gói</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, whiteSpace: "nowrap" }}>
                    <thead>
                      <tr>
                        {["STT", "Mã hệ thống iMedia", "Tên gói", "Dung lượng", "Mệnh giá (VND)", "Thời hạn"].map((h, i) => (
                          <th key={i} style={{
                            padding: "6px 12px", fontSize: 9, fontWeight: 600, color: "var(--text-faint)",
                            textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid var(--border)",
                            textAlign: i === 0 ? "center" : i >= 3 ? "right" : "left",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.packages.map((p) => (
                        <tr key={p.stt} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                          <td style={{ padding: "5px 12px", textAlign: "center", color: "var(--text-faint)", fontSize: 10 }}>{p.stt}</td>
                          <td style={{ padding: "5px 12px", color: "#378ADD", fontSize: 10, fontFamily: "monospace" }}>{p.sys || "—"}</td>
                          <td style={{ padding: "5px 12px", fontWeight: 600, color: "var(--text)" }}>{p.name}</td>
                          <td style={{ padding: "5px 12px", textAlign: "right", color: "var(--accent-2)", fontWeight: 600 }}>{p.data}</td>
                          <td style={{ padding: "5px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{p.price}</td>
                          <td style={{ padding: "5px 12px", textAlign: "right", color: "var(--text-dim)" }}>{p.days}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div style={{ padding: "10px 14px", background: "rgba(55,138,221,0.05)", borderRadius: 8, fontSize: 11, color: "var(--text-faint)", lineHeight: 1.7 }}>
              <strong style={{ color: "#378ADD" }}>Nguồn:</strong> HĐ cung cấp dịch vụ Topup số 1010/2022/HĐKT/PTKD/IMEDIA–GALAXYPAY, ký ngày 10/10/2022 giữa CTCP CNGH & DV Imedia và Công ty TNHH Galaxy Pay.
              Phụ lục 01, Phần II: Quy định chính sách bán hàng. Giá bán sản phẩm của Bên B do Bên B tự xây dựng, nhưng không được vượt quá mệnh giá do nhà phát hành quy định.
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          SECTION 8: Assumptions
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
          "Topup Direct: CK từ Imedia — Viettel 3.6%, VinaPhone 4.6%, MobiFone 3.7%, Vietnamobile 6.5% (đã gồm VAT). Bình quân gia quyền ~4.07%",
          "Thị phần GD Topup ước tính: Viettel 50%, VinaPhone 22%, MobiFone 20%, Vietnamobile 8% — dùng để tính CK bình quân",
          "Data Card (TopupData): CK từ Imedia — Viettel Sponsor 10%, MobiFone TT 17%, MobiFone DC_ON 10%, VinaPhone 14% (đã gồm VAT). Bình quân gia quyền ~12%",
          "Thị phần GD Data Card ước tính: Viettel 50%, VinaPhone 25%, MobiFone TT 15%, MobiFone DC_ON 10%",
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
