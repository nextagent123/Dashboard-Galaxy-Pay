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
function FlowStage({ num, label, note, last, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "68px 1fr" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: "rgba(124,108,255,0.10)", border: "2px solid var(--accent-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "var(--accent-2)",
          marginTop: 14, flexShrink: 0, boxShadow: "0 0 12px rgba(124,108,255,0.15)",
        }}>{num}</div>
        <div style={{
          fontSize: 8.5, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--accent-2)",
          marginTop: 4, textAlign: "center",
        }}>{label}</div>
        {!last && (
          <>
            <div style={{ width: 2, flex: 1, background: "linear-gradient(to bottom, rgba(124,108,255,0.22), rgba(124,108,255,0.08))", minHeight: 14 }} />
            <div style={{
              width: 0, height: 0, flexShrink: 0,
              borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
              borderTop: "6px solid rgba(124,108,255,0.18)",
            }} />
          </>
        )}
      </div>
      <div style={{ padding: "8px 0 14px 16px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 10, fontSize: 10, color: "var(--text-faint)",
          letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600,
        }}>
          <span style={{ width: 12, height: 1, background: "rgba(124,108,255,0.30)", flexShrink: 0 }} />
          {note}
        </div>
        {children}
      </div>
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

  const totals = useMemo(() => {
    const t = { gdMonth: 0, dtC: 0, dtB: 0, dtO: 0, dt2: 0, dtY: 0 };
    data.forEach((r) => { t.gdMonth += r.gdMonth; t.dtC += r.dtThangCautious; t.dtB += r.dtThangBase; t.dtO += r.dtThangOptimistic; t.dt2 += r.dt2Month; t.dtY += r.dtYear1; });
    return t;
  }, [data]);

  const fixedItems = data.filter((r) => r.feeType === "fixed");
  const pctItems = data.filter((r) => r.feeType === "percent");
  const fixedTotal = { gdMonth: 0, dtB: 0, dtY: 0 };
  fixedItems.forEach((r) => { fixedTotal.gdMonth += r.gdMonth; fixedTotal.dtB += r.dtThangBase; fixedTotal.dtY += r.dtYear1; });
  const pctTotal = { gdMonth: 0, dtB: 0, dtY: 0 };
  pctItems.forEach((r) => { pctTotal.gdMonth += r.gdMonth; pctTotal.dtB += r.dtThangBase; pctTotal.dtY += r.dtYear1; });

  // Top products by Year 1 revenue
  const top5 = [...data].sort((a, b) => b.dtYear1 - a.dtYear1).slice(0, 5);

  return (
    <>
      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom: 0 }}>
        <div className="kpi-card" style={{ "--glow": "rgba(124,108,255,0.25)" }}>
          <div className="kpi-card__label">📊 GD DỰ KIẾN / THÁNG</div>
          <div className="kpi-card__value">{fmtFull(totals.gdMonth)}</div>
          <div className="kpi-card__sub">{data.length} sản phẩm</div>
        </div>
        <div className="kpi-card" style={{ "--glow": "rgba(52,211,153,0.25)" }}>
          <div className="kpi-card__label">✅ DT CƠ SỞ / THÁNG</div>
          <div className="kpi-card__value">{fmt(totals.dtB)}</div>
          <div className="kpi-card__sub">{fmtFull(totals.dtB)} đ</div>
        </div>
        <div className="kpi-card" style={{ "--glow": "rgba(251,191,36,0.25)" }}>
          <div className="kpi-card__label">📅 DT 2 THÁNG GĐ1</div>
          <div className="kpi-card__value">{fmt(totals.dt2)}</div>
          <div className="kpi-card__sub">{fmtFull(totals.dt2)} đ</div>
        </div>
        <div className="kpi-card" style={{ "--glow": "rgba(251,113,133,0.25)" }}>
          <div className="kpi-card__label">🎯 DT NĂM 1 (12T)</div>
          <div className="kpi-card__value">{fmt(totals.dtY)}</div>
          <div className="kpi-card__sub">{fmtFull(totals.dtY)} đ</div>
        </div>
      </div>

      {/* Revenue split */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div className="card" style={{ borderLeft: "3px solid var(--accent)" }}>
          <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>A. Phí cố định / GD</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginTop: 8 }}>{fmt(fixedTotal.dtB)}<span style={{ fontSize: 13, color: "var(--text-dim)" }}>/tháng</span></div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{fmtFull(fixedTotal.gdMonth)} GD/tháng · Year 1: {fmt(fixedTotal.dtY)}</div>
        </div>
        <div className="card" style={{ borderLeft: "3px solid var(--green)" }}>
          <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>B. Hoa hồng % trên GTGD</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginTop: 8 }}>{fmt(pctTotal.dtB)}<span style={{ fontSize: 13, color: "var(--text-dim)" }}>/tháng</span></div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{fmtFull(pctTotal.gdMonth)} GD/tháng · Year 1: {fmt(pctTotal.dtY)}</div>
        </div>
      </div>

      {/* Top 5 */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>Top 5 sản phẩm — Doanh thu Year 1</h3>
        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 16px" }}>Kịch bản cơ sở (×1.0)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {top5.map((p, i) => {
            const maxVal = top5[0].dtYear1;
            const blockColor = SKY_PARTNER_BLOCKS.find((b) => b.id === p.block)?.color || "var(--accent)";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-faint)", width: 20, textAlign: "right" }}>{i + 1}</span>
                <span style={{ fontSize: 12, color: "var(--text)", width: 200, flexShrink: 0 }}>{p.name}</span>
                <div style={{ flex: 1, height: 22, background: "var(--border-faint)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(p.dtYear1 / maxVal) * 100}%`, background: blockColor, borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", width: 80, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(p.dtYear1)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>3 kịch bản doanh thu</h3>
        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "0 0 16px" }}>Thận trọng (×0.7) · Cơ sở (×1.0) · Lạc quan (×1.4)</p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { label: "Thận trọng", val: totals.dtC, color: "#64748B", bg: "rgba(100,116,139,0.08)" },
            { label: "Cơ sở", val: totals.dtB, color: "var(--accent-2)", bg: "rgba(124,108,255,0.08)" },
            { label: "Lạc quan", val: totals.dtO, color: "var(--green)", bg: "rgba(52,211,153,0.08)" },
          ].map((s, i) => (
            <div key={i} style={{ flex: "1 1 160px", padding: "16px 20px", borderRadius: 12, background: s.bg, border: `1px solid ${typeof s.color === 'string' && s.color.startsWith('#') ? s.color + '20' : 'var(--border)'}`, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{fmt(s.val)}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>/tháng</div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Detail Table */}
      <div className="card" style={{ marginTop: 20, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 12px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Chi tiết dự phóng doanh thu</h3>
          <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>Baseline: Vikki Bank thực tế · Phí: iMedia T7/2026 & Benchmark TT · Đơn vị: VNĐ</p>
        </div>
        <div style={{ overflowX: "auto", paddingBottom: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap", minWidth: 1200 }}>
            <thead>
              <tr>
                {["TT", "Sản phẩm / Dịch vụ", "Baseline Vikki", "Hệ số", "GD/tháng", "GTGD TB", "Phí/HH", "Nguồn", "DT Thận trọng", "DT Cơ sở", "DT Lạc quan", "DT 2T GĐ1", "DT Year 1"].map((h, i) => (
                  <th key={i} style={{
                    padding: "8px 12px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)",
                    textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)",
                    textAlign: i >= 2 ? "right" : "left", position: i <= 1 ? "sticky" : undefined,
                    left: i === 0 ? 0 : i === 1 ? 32 : undefined, background: "var(--bg)", zIndex: i <= 1 ? 1 : undefined,
                    minWidth: i === 1 ? 180 : undefined,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => {
                const blockColor = SKY_PARTNER_BLOCKS.find((b) => b.id === r.block)?.color || "var(--text)";
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                    <td style={{ padding: "8px 12px", color: "var(--text-faint)", fontWeight: 600, position: "sticky", left: 0, background: "var(--bg)", zIndex: 1, width: 32 }}>{r.stt}</td>
                    <td style={{ padding: "8px 12px", color: "var(--text)", fontWeight: 500, position: "sticky", left: 32, background: "var(--bg)", zIndex: 1 }}>
                      <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: blockColor, marginRight: 8 }} />
                      {r.name}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: r.baseline > 0 ? "var(--text)" : "var(--text-faint)" }}>{r.baseline > 0 ? fmtFull(r.baseline) : "—"}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--accent-2)" }}>×{r.factor}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{fmtFull(r.gdMonth)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--text-dim)" }}>{fmtFull(r.avgValue)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: r.feeType === "fixed" ? "var(--accent-2)" : "var(--green)" }}>{r.fee}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontSize: 11, color: r.source.includes("iMedia") ? "#378ADD" : "var(--amber)" }}>{r.source}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--text-dim)" }}>{fmtFull(r.dtThangCautious)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{fmtFull(r.dtThangBase)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--green)" }}>{fmtFull(r.dtThangOptimistic)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{fmtFull(r.dt2Month)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--green)" }}>{fmtFull(r.dtYear1)}</td>
                  </tr>
                );
              })}
              {/* Totals */}
              <tr style={{ background: "rgba(124,108,255,0.06)", fontWeight: 700 }}>
                <td colSpan={2} style={{ padding: "10px 12px", fontWeight: 700, color: "var(--accent-2)", position: "sticky", left: 0, background: "rgba(124,108,255,0.06)", zIndex: 1 }}>TỔNG CỘNG</td>
                <td style={{ padding: "8px 12px" }} />
                <td style={{ padding: "8px 12px" }} />
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>{fmtFull(totals.gdMonth)}</td>
                <td style={{ padding: "8px 12px" }} />
                <td style={{ padding: "8px 12px" }} />
                <td style={{ padding: "8px 12px" }} />
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>{fmtFull(totals.dtC)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>{fmtFull(totals.dtB)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--green)" }}>{fmtFull(totals.dtO)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>{fmtFull(totals.dt2)}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--green)" }}>{fmtFull(totals.dtY)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions */}
      <div className="card" style={{ marginTop: 20, background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--amber)", margin: "0 0 10px" }}>📌 Giả định & Ghi chú</h3>
        {[
          "Baseline: Dữ liệu thực tế Vikki Bank (85.4K users, 164.8K trans, ~56.7 tỷ GTGD/tháng)",
          "Hệ số mở rộng kênh GĐ1: ×2.0–3.0 khi thêm HDBank App, POS trạm xăng pilot (50–100 điểm), Kiosk CDS",
          "3 kịch bản: Thận trọng (×0.7), Cơ sở (×1.0), Lạc quan (×1.4)",
          "Dự phóng Year 1: Tăng trưởng lũy tiến qua 6 chu kỳ 2 tháng (×1.0 → ×1.15 → ×1.3 → ×1.5 → ×1.7 → ×2.0)",
          "Phí nguồn iMedia T7/2026: căn cứ chính sách phí hợp tác kênh thanh toán — Cty CNGH & DV iMedia",
          "Chưa bao gồm chi phí vận hành, hạ tầng, nhân sự",
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
