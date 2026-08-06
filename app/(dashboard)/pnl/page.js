"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getPnlReport } from "@/lib/metrics";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import { vn, vnLoc } from "@/lib/format";

const VIEWS = [
  { value: "overview", label: "Tổng quan" },
  { value: "cong", label: "Cổng TT" },
  { value: "vi", label: "Ví điện tử" },
  { value: "khac", label: "Dịch vụ khác" },
];

/* ---------- shared helpers / small components ---------- */

function pFmt(v, d) {
  return v >= 1 || v <= -1 ? vnLoc(v, d || 1) : vnLoc(v, d || 2);
}

function StatTile({ label, value, sub, accent, trend, trendColor }) {
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: accent || "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>
          {value}
        </span>
        {trend != null && (
          <span style={{ fontSize: 12, fontWeight: 700, color: trendColor || "var(--text-dim)" }}>
            {trend >= 0 ? "+" : ""}{vn(trend, 1)}%
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ pct, color, label }) {
  const w = Math.min(Math.max(pct, 0), 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 50 ? color : "#fb7185", fontVariantNumeric: "tabular-nums" }}>{vn(pct, 1)}%</span>
      </div>
      <div style={{ height: 6, background: "var(--surface-raised)", borderRadius: 3 }}>
        <div style={{ height: "100%", width: w + "%", background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function MiniBar({ data, labels, color, height = 120 }) {
  const max = Math.max(...data.map(Math.abs), 0.001);
  const w = 100 / data.length;
  const hasNeg = data.some((v) => v < 0);
  const zeroY = hasNeg ? height * 0.6 : height;
  return (
    <svg viewBox={`0 0 ${data.length * 40} ${height + 20}`} width="100%" style={{ display: "block" }}>
      {hasNeg && <line x1="0" x2={data.length * 40} y1={zeroY} y2={zeroY} stroke="#3a3f52" strokeWidth="1" />}
      {data.map((v, i) => {
        const barH = (Math.abs(v) / max) * (hasNeg ? zeroY - 8 : height - 8);
        const x = i * 40 + 6;
        const barW = 28;
        const y = v >= 0 ? zeroY - barH : zeroY;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={Math.max(barH, 2)} fill={v < 0 ? "#fb7185" : color} rx={3} opacity={0.85} />
            <text x={x + barW / 2} y={y - 4} fontSize="9" fill="var(--text-dim)" textAnchor="middle" fontWeight="600" className="mono">
              {pFmt(v)}
            </text>
            {labels && (
              <text x={x + barW / 2} y={height + 14} fontSize="9" fill="var(--text-faint)" textAnchor="middle">
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function WaterfallPnL({ waterfall, accent }) {
  const W = 500, H = 200, padL = 10, padR = 10, padT = 30, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const vals = waterfall.map((w) => Math.abs(w.value));
  const maxVal = Math.max(...vals, 0.001) * 1.2;
  const barW = innerW / waterfall.length * 0.55;
  const gap = innerW / waterfall.length * 0.45;
  const stepW = barW + gap;
  const y = (v) => padT + innerH - (v / maxVal) * innerH;
  const x = (i) => padL + gap / 2 + i * stepW;

  let running = 0;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
      <line x1={padL} x2={W - padR} y1={y(0)} y2={y(0)} stroke="#3a3f52" strokeWidth="1" />
      {waterfall.map((w, i) => {
        let barTop, barBot, fill;
        if (w.type === "revenue") {
          barBot = y(0); barTop = y(w.value); fill = accent;
          running = w.value;
        } else if (w.type === "cost") {
          barTop = y(running);
          running += w.value;
          barBot = y(running);
          fill = "#fb7185";
        } else if (w.type === "subtotal") {
          barBot = y(0); barTop = y(w.value); fill = "#fbbf24";
          running = w.value;
        } else {
          barBot = y(0);
          barTop = w.value >= 0 ? y(w.value) : y(0);
          const barH = w.value >= 0 ? y(0) - y(w.value) : y(Math.abs(w.value)) - y(0);
          fill = w.value >= 0 ? "#34d399" : "#fb7185";
          return (
            <g key={i}>
              <rect x={x(i)} y={w.value >= 0 ? barTop : y(0)} width={barW} height={Math.max(barH, 2)} fill={fill} rx={3} />
              <text x={x(i) + barW / 2} y={(w.value >= 0 ? barTop : y(0) + barH) - 5} fontSize="10" fill="var(--text-strong)" fontWeight="700" textAnchor="middle" className="mono">
                {pFmt(w.value)}
              </text>
              <text x={x(i) + barW / 2} y={H - 8} fontSize="9" fill="var(--text-dim)" textAnchor="middle" fontWeight="600">{w.label}</text>
            </g>
          );
        }
        return (
          <g key={i}>
            <rect x={x(i)} y={Math.min(barTop, barBot)} width={barW} height={Math.max(Math.abs(barBot - barTop), 2)} fill={fill} rx={3} />
            <text x={x(i) + barW / 2} y={Math.min(barTop, barBot) - 5} fontSize="10" fill="var(--text-strong)" fontWeight="700" textAnchor="middle" className="mono">
              {pFmt(Math.abs(w.value))}
            </text>
            <text x={x(i) + barW / 2} y={H - 8} fontSize="9" fill="var(--text-dim)" textAnchor="middle" fontWeight="600">{w.label}</text>
            {i < waterfall.length - 1 && (
              <line x1={x(i) + barW} x2={x(i + 1)} y1={y(running)} y2={y(running)} stroke="#5b5f74" strokeWidth="1" strokeDasharray="3,3" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function PnlTable({ product }) {
  const m = product.monthly;
  const labels = product.labels;
  const rows = [
    { label: "Doanh thu", data: m.revenue, bold: true, color: product.accent },
    { label: "(-) COGS", data: m.cogs.map((v) => -v), color: "#fb7185" },
    { label: "Lợi nhuận gộp", data: m.grossProfit, bold: true, color: "#fbbf24", border: true },
    { label: "(-) OPEX", data: m.opex.map((v) => -v), color: "#fb7185" },
    { label: "Lợi nhuận ròng", data: m.netProfit, bold: true, color: "#34d399", border: true },
    { label: "Biên LN gộp (%)", data: product.monthlyGrossMargin, isPct: true, color: "#fbbf24" },
    { label: "Biên LN ròng (%)", data: product.monthlyNetMargin, isPct: true, color: "#34d399" },
  ];

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
        <thead>
          <tr>
            <th style={{ ...TH, minWidth: 140, textAlign: "left" }}>Chỉ tiêu</th>
            {labels.map((l) => <th key={l} style={{ ...TH, textAlign: "right", minWidth: 70 }}>{l}</th>)}
            <th style={{ ...TH, textAlign: "right", minWidth: 90, color: "var(--accent-light)" }}>Lũy kế</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const total = row.isPct
              ? pnlMarginCalc(row.label.includes("gộp") ? product.totalGrossProfit : product.totalNetProfit, product.totalRevenue)
              : row.data.reduce((a, b) => a + b, 0);
            return (
              <tr key={row.label} style={{ borderTop: row.border ? "2px solid var(--border)" : "1px solid var(--border-faint)" }}>
                <td style={{ ...TD, fontWeight: row.bold ? 700 : 500, color: row.bold ? "var(--text-strong)" : "var(--text-dim)" }}>
                  {row.label}
                </td>
                {row.data.map((v, i) => (
                  <td key={i} style={{ ...TD, textAlign: "right", color: row.isPct ? row.color : v < 0 ? "#fb7185" : "var(--text)", fontWeight: row.bold ? 700 : 400 }}>
                    {row.isPct ? vn(v, 1) + "%" : pFmt(Math.abs(v))}
                  </td>
                ))}
                <td style={{ ...TD, textAlign: "right", fontWeight: 800, color: row.isPct ? row.color : total < 0 ? "#fb7185" : row.color || "var(--text-strong)" }}>
                  {row.isPct ? vn(total, 1) + "%" : pFmt(Math.abs(total))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function pnlMarginCalc(profit, revenue) {
  return revenue > 0 ? (profit / revenue) * 100 : 0;
}

/* ---------- Sub-item detail for "Dịch vụ khác" ---------- */

function SubItemDetail({ sub }) {
  return (
    <div style={{
      background: `${sub.accent}08`,
      border: `1px solid ${sub.accent}22`,
      borderRadius: 14,
      padding: "18px 20px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${sub.accent}18`, border: `1px solid ${sub.accent}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 800, color: sub.accent,
        }}>
          {sub.name.slice(0, 2)}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)" }}>{sub.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{sub.description}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 9.5, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>Doanh thu</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: sub.accent, fontVariantNumeric: "tabular-nums" }}>{sub.totalRevenueStr} <span style={{ fontSize: 10, color: "var(--text-faint)" }}>tỷ</span></div>
        </div>
        <div>
          <div style={{ fontSize: 9.5, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>LN gộp</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fbbf24", fontVariantNumeric: "tabular-nums" }}>{sub.totalGrossProfitStr} <span style={{ fontSize: 10, color: "var(--text-faint)" }}>tỷ</span></div>
        </div>
        <div>
          <div style={{ fontSize: 9.5, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>LN ròng</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: sub.totalNetProfit >= 0 ? "#34d399" : "#fb7185", fontVariantNumeric: "tabular-nums" }}>{sub.totalNetProfitStr} <span style={{ fontSize: 10, color: "var(--text-faint)" }}>tỷ</span></div>
        </div>
        <div>
          <div style={{ fontSize: 9.5, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>Biên LN gộp</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fbbf24", fontVariantNumeric: "tabular-nums" }}>{sub.grossMarginStr}</div>
        </div>
        {sub.totalMerchants > 0 && (
          <div>
            <div style={{ fontSize: 9.5, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>Merchant</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#60a5fa", fontVariantNumeric: "tabular-nums" }}>{sub.totalMerchants}</div>
          </div>
        )}
      </div>

      {/* Mini revenue chart for sub-item */}
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 10.5, color: "var(--text-dim)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Doanh thu theo tháng</div>
        <MiniBar data={sub.monthly.revenue} labels={sub.labels} color={sub.accent} height={80} />
      </div>

      {/* Target progress if targets exist */}
      {sub.targets && sub.targets.revenue > 0 && (
        <div style={{ marginTop: 12, padding: "10px 0 0", borderTop: "1px solid var(--border-faint)" }}>
          <ProgressBar
            pct={sub.totalRevenue > 0 && sub.targets.revenue > 0 ? (sub.totalRevenue / sub.targets.revenue) * 100 : 0}
            color={sub.accent}
            label={`Target DT: ${pFmt(sub.targets.revenue)} tỷ`}
          />
        </div>
      )}
    </div>
  );
}

/* ---------- Product detail view ---------- */

function ProductDetail({ product }) {
  const [showSub, setShowSub] = useState(false);
  const hasMerchants = product.totalMerchants > 0;
  const hasSubItems = product.subItems && product.subItems.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
      {/* KPI tiles */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: 12 }}>
        <StatTile
          label="Doanh thu lũy kế"
          value={product.totalRevenueStr + " tỷ"}
          sub={`Target: ${pFmt(product.targets.revenue)} tỷ · ${product.revPctStr}`}
          accent={product.accent}
          trend={product.lastRevMoM}
          trendColor={product.lastRevMoM >= 0 ? "#34d399" : "#fb7185"}
        />
        <StatTile
          label="Lợi nhuận gộp"
          value={product.totalGrossProfitStr + " tỷ"}
          sub={`Biên LN gộp: ${product.grossMarginStr}`}
          accent="#fbbf24"
          trend={product.lastGpMoM}
          trendColor={product.lastGpMoM >= 0 ? "#34d399" : "#fb7185"}
        />
        <StatTile
          label="Lợi nhuận ròng"
          value={product.totalNetProfitStr + " tỷ"}
          sub={`Biên LN ròng: ${product.netMarginStr}`}
          accent={product.totalNetProfit >= 0 ? "#34d399" : "#fb7185"}
        />
        {hasMerchants && (
          <StatTile
            label="Merchant hoạt động"
            value={String(product.totalMerchants)}
            sub={`${product.totalTransactions.toLocaleString("vi-VN")} giao dịch`}
            accent="#60a5fa"
          />
        )}
      </div>

      {/* Target progress */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Hoàn thành Target năm 2026</div>
        {product.targets.revenue > 0 && (
          <ProgressBar pct={product.revPct} color={product.accent} label="Doanh thu" />
        )}
        {product.targets.grossProfit > 0 && (
          <ProgressBar pct={product.gpPct} color="#fbbf24" label="Lợi nhuận gộp" />
        )}
        {product.targets.netProfit !== 0 && (
          <ProgressBar pct={product.npPct} color="#34d399" label="Lợi nhuận ròng" />
        )}
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8 }}>
          Runrate doanh thu: <strong style={{ color: "var(--text)" }}>{pFmt(product.revRunrate)} tỷ/năm</strong>
          {product.targets.revenue > 0 && (
            <> · {product.revRunrate >= product.targets.revenue
              ? <span style={{ color: "#34d399" }}>Vượt target</span>
              : <span style={{ color: "#fb7185" }}>Thiếu {pFmt(product.targets.revenue - product.revRunrate)} tỷ</span>}
            </>
          )}
        </div>
      </div>

      {/* Waterfall P&L */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>P&L Waterfall (tỷ VND)</div>
        <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 14 }}>Doanh thu &rarr; COGS &rarr; LN gộp &rarr; OPEX &rarr; LN ròng</div>
        <WaterfallPnL waterfall={product.waterfall} accent={product.accent} />
      </div>

      {/* Revenue trend chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dim)", marginBottom: 10 }}>DOANH THU THEO THÁNG</div>
          <MiniBar data={product.monthly.revenue} labels={product.labels} color={product.accent} />
        </div>
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dim)", marginBottom: 10 }}>LỢI NHUẬN RÒNG THEO THÁNG</div>
          <MiniBar data={product.monthly.netProfit} labels={product.labels} color="#34d399" />
        </div>
      </div>

      {/* P&L Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-soft)", fontSize: 13, fontWeight: 700 }}>
          Bảng P&L chi tiết — {product.name} (tỷ VND)
        </div>
        <div style={{ padding: "0 4px 8px" }}>
          <PnlTable product={product} />
        </div>
      </div>

      {/* Cost structure */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Cơ cấu chi phí</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <CostPie label="COGS / Doanh thu" pct={product.cogsRatio} color="#fb7185" />
          <CostPie label="OPEX / Doanh thu" pct={product.opexRatio} color="#f59e0b" />
          <CostPie label="Biên LN gộp" pct={product.grossMargin} color="#34d399" />
        </div>
      </div>

      {/* Expandable sub-items for "Dịch vụ khác" */}
      {hasSubItems && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <button
            onClick={() => setShowSub(!showSub)}
            style={{
              display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", border: "none", background: "transparent",
              cursor: "pointer", borderBottom: showSub ? "1px solid var(--border-soft)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)" }}>
                Chi tiết dịch vụ con
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: product.accent,
                background: product.accentLight, padding: "2px 8px", borderRadius: 6,
              }}>
                {product.subItems.length} dịch vụ
              </span>
            </div>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: "transform 0.2s", transform: showSub ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showSub && (
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {product.subItems.map((sub) => (
                <SubItemDetail key={sub.key} sub={sub} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CostPie({ label, pct, color }) {
  const r = 36, cx = 40, cy = 40, stroke = 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(Math.max(pct, 0), 100) / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-soft)" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        <text x={cx} y={cy + 4} fontSize="14" fontWeight="800" fill="var(--text-strong)" textAnchor="middle" className="mono">
          {vn(pct, 1)}%
        </text>
      </svg>
      <div style={{ fontSize: 10.5, color: "var(--text-dim)", textAlign: "center" }}>{label}</div>
    </div>
  );
}

/* ---------- Overview ---------- */

function OverviewView({ data }) {
  const { products, consolidatedRevenue, consolidatedGP, consolidatedNP, consolidatedGrossMargin, consolidatedNetMargin, consolidatedMonthly } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
      {/* Consolidated KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <StatTile label="Tổng doanh thu" value={data.consolidatedRevenueStr + " tỷ"} sub="Lũy kế T1–T7/2026" accent="#7c6cff" />
        <StatTile label="Tổng LN gộp" value={data.consolidatedGPStr + " tỷ"} sub={`Biên: ${data.consolidatedGrossMarginStr}`} accent="#fbbf24" />
        <StatTile label="Tổng LN ròng" value={data.consolidatedNPStr + " tỷ"} sub={`Biên: ${data.consolidatedNetMarginStr}`} accent={consolidatedNP >= 0 ? "#34d399" : "#fb7185"} />
      </div>

      {/* Product comparison cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {products.map((p) => {
          const hasMerchants = p.totalMerchants > 0;
          return (
            <div key={p.key} className="card" style={{ padding: "20px", position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${p.accent}, ${p.accent}88)`,
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: p.accentLight, border: `1px solid ${p.accent}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: p.accent,
                }}>
                  {p.shortName.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{p.description.split("—")[0]}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>Doanh thu</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: p.accent, fontVariantNumeric: "tabular-nums" }}>{p.totalRevenueStr}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>tỷ VND</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>LN ròng</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: p.totalNetProfit >= 0 ? "#34d399" : "#fb7185", fontVariantNumeric: "tabular-nums" }}>
                    {p.totalNetProfitStr}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>tỷ VND</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
                <MiniMetric label="Biên LN gộp" value={p.grossMarginStr} color="#fbbf24" />
                <MiniMetric label="Biên LN ròng" value={p.netMarginStr} color={p.totalNetProfit >= 0 ? "#34d399" : "#fb7185"} />
                {hasMerchants && <MiniMetric label="KH" value={String(p.totalMerchants)} color="#60a5fa" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue share */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Đóng góp doanh thu theo nhóm sản phẩm</div>
        {products.map((p) => {
          const share = consolidatedRevenue > 0 ? (p.totalRevenue / consolidatedRevenue) * 100 : 0;
          return (
            <div key={p.key} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: p.accent }}>{p.name}</span>
                <span style={{ fontSize: 12, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                  {p.totalRevenueStr} tỷ · <strong>{vn(share, 1)}%</strong>
                </span>
              </div>
              <div style={{ height: 8, background: "var(--surface-raised)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: Math.min(share, 100) + "%", background: `linear-gradient(90deg, ${p.accent}, ${p.accent}aa)`, borderRadius: 4, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Consolidated monthly trend */}
      <div className="card" style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Xu hướng doanh thu & lợi nhuận ròng hợp nhất</div>
        <svg viewBox="0 0 300 140" width="100%" style={{ display: "block" }}>
          {consolidatedMonthly.map((m, i) => {
            const maxR = Math.max(...consolidatedMonthly.map((m) => m.revenue), 0.001);
            const barH = maxR > 0 ? (m.revenue / maxR) * 95 : 0;
            const x = i * 42 + 8;
            return (
              <g key={i}>
                <rect x={x} y={110 - barH} width={28} height={barH} fill="#7c6cff" rx={3} opacity={0.7} />
                <text x={x + 14} y={110 - barH - 5} fontSize="9" fill="var(--text)" textAnchor="middle" fontWeight="600" className="mono">
                  {pFmt(m.revenue)}
                </text>
                <text x={x + 14} y={128} fontSize="9" fill="var(--text-faint)" textAnchor="middle">{m.label}</text>
              </g>
            );
          })}
          {/* Net profit line */}
          {(() => {
            const maxR = Math.max(...consolidatedMonthly.map((m) => m.revenue), 0.001);
            const points = consolidatedMonthly.map((m, i) => {
              const x = i * 42 + 22;
              const yVal = maxR > 0 ? 110 - (m.netProfit / maxR) * 95 : 110;
              return `${x},${yVal}`;
            }).join(" ");
            return <polyline points={points} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;
          })()}
          {consolidatedMonthly.map((m, i) => {
            const maxR = Math.max(...consolidatedMonthly.map((m) => m.revenue), 0.001);
            const x = i * 42 + 22;
            const yVal = maxR > 0 ? 110 - (m.netProfit / maxR) * 95 : 110;
            return <circle key={"d" + i} cx={x} cy={yVal} r="3" fill="#34d399" />;
          })}
        </svg>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "#7c6cff", display: "inline-block" }} /> Doanh thu
          </span>
          <span style={{ fontSize: 11, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 2, background: "#34d399", display: "inline-block" }} /> LN ròng
          </span>
        </div>
      </div>

      {/* P&L summary table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-soft)", fontSize: 13, fontWeight: 700 }}>
          Bảng P&L hợp nhất (tỷ VND)
        </div>
        <div style={{ overflowX: "auto", padding: "0 4px 8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr>
                <th style={{ ...TH, textAlign: "left", minWidth: 130 }}>Chỉ tiêu</th>
                {products.map((p) => (
                  <th key={p.key} style={{ ...TH, textAlign: "right", minWidth: 100, color: p.accent }}>{p.shortName}</th>
                ))}
                <th style={{ ...TH, textAlign: "right", minWidth: 100, color: "var(--accent-light)" }}>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Doanh thu", key: "totalRevenue", bold: true },
                { label: "(-) COGS", key: "totalCogs", neg: true },
                { label: "Lợi nhuận gộp", key: "totalGrossProfit", bold: true, border: true },
                { label: "(-) OPEX", key: "totalOpex", neg: true },
                { label: "Lợi nhuận ròng", key: "totalNetProfit", bold: true, border: true },
              ].map((row) => {
                const total = products.reduce((a, p) => a + p[row.key], 0);
                return (
                  <tr key={row.key} style={{ borderTop: row.border ? "2px solid var(--border)" : "1px solid var(--border-faint)" }}>
                    <td style={{ ...TD, fontWeight: row.bold ? 700 : 500, color: row.bold ? "var(--text-strong)" : "var(--text-dim)" }}>{row.label}</td>
                    {products.map((p) => {
                      const v = row.neg ? -p[row.key] : p[row.key];
                      return (
                        <td key={p.key} style={{ ...TD, textAlign: "right", color: v < 0 ? "#fb7185" : row.bold ? "var(--text-strong)" : "var(--text)", fontWeight: row.bold ? 700 : 400 }}>
                          {pFmt(Math.abs(p[row.key]))}
                        </td>
                      );
                    })}
                    <td style={{ ...TD, textAlign: "right", fontWeight: 800, color: (row.neg ? -total : total) < 0 ? "#fb7185" : "var(--accent-light)" }}>
                      {pFmt(Math.abs(total))}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: "1px solid var(--border-soft)" }}>
                <td style={{ ...TD, fontWeight: 600, color: "#fbbf24" }}>Biên LN gộp</td>
                {products.map((p) => (
                  <td key={p.key} style={{ ...TD, textAlign: "right", color: "#fbbf24" }}>{p.grossMarginStr}</td>
                ))}
                <td style={{ ...TD, textAlign: "right", color: "#fbbf24", fontWeight: 700 }}>{data.consolidatedGrossMarginStr}</td>
              </tr>
              <tr style={{ borderTop: "1px solid var(--border-faint)" }}>
                <td style={{ ...TD, fontWeight: 600, color: "#34d399" }}>Biên LN ròng</td>
                {products.map((p) => (
                  <td key={p.key} style={{ ...TD, textAlign: "right", color: p.totalNetProfit >= 0 ? "#34d399" : "#fb7185" }}>{p.netMarginStr}</td>
                ))}
                <td style={{ ...TD, textAlign: "right", color: consolidatedNP >= 0 ? "#34d399" : "#fb7185", fontWeight: 700 }}>{data.consolidatedNetMarginStr}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, color }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 9.5, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

const TH = {
  padding: "10px 12px", fontSize: 10.5, fontWeight: 700, color: "var(--text-dim)",
  textTransform: "uppercase", letterSpacing: 0.8,
  borderBottom: "1px solid var(--border)",
};
const TD = { padding: "9px 12px" };

/* ---------- Main page ---------- */

export default function PnlPage() {
  const { isAdmin } = useAuth();
  const [view, setView] = useState("overview");
  const data = getPnlReport();
  const selectedProduct = view !== "overview" ? data.products.find((p) => p.key === view) : null;

  if (!isAdmin) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div className="card" style={{ padding: "40px 48px", textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>&#128274;</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>Không có quyền truy cập</div>
          <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
            Trang Phân tích P&amp;L chỉ dành cho tài khoản Admin.<br />
            Vui lòng liên hệ quản trị viên để được cấp quyền.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · PHÂN TÍCH LỢI NHUẬN"
        title="Báo cáo P&L theo nhóm sản phẩm"
        subtitle="Phân tích Doanh thu — Chi phí — Lợi nhuận cho Cổng thanh toán, Ví điện tử và Dịch vụ khác · T1–T7/2026"
        right={<DateBadge>Số liệu đến 05/08/2026</DateBadge>}
      />

      {/* View tabs */}
      <div style={{
        display: "flex", gap: 4, marginTop: 20, padding: 4,
        background: "var(--surface-hover)", borderRadius: 12,
        border: "1px solid var(--border-soft)", width: "fit-content",
      }}>
        {VIEWS.map((v) => {
          const prod = v.value !== "overview" ? data.products.find((p) => p.key === v.value) : null;
          const accent = prod ? prod.accent : "#7c6cff";
          const isActive = view === v.value;
          return (
            <button
              key={v.value}
              onClick={() => setView(v.value)}
              style={{
                padding: "8px 16px", border: "none", borderRadius: 9,
                background: isActive ? `${accent}22` : "transparent",
                color: isActive ? accent : "var(--text-faint)",
                fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                cursor: "pointer", transition: "all 0.2s",
                borderWidth: 1, borderStyle: "solid",
                borderColor: isActive ? `${accent}44` : "transparent",
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {view === "overview" ? (
        <OverviewView data={data} />
      ) : selectedProduct ? (
        <ProductDetail product={selectedProduct} />
      ) : null}
    </>
  );
}
