"use client";

import { useMemo } from "react";
import { ReportHeader } from "@/components/ui/PageHeader";
import {
  VIKKI_BILL_SERVICES, VIKKI_BILL_QUARTERS, VIKKI_BILL_DATA,
  VIKKI_SVC_SERVICES, VIKKI_SVC_QUARTERS, VIKKI_SVC_DATA,
  VIKKI_USAGE_TODAY, VIKKI_USAGE_WEEK, VIKKI_USAGE_MONTH,
} from "@/lib/data";

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function fmt(n) {
  if (n === 0 || n == null) return "—";
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e4) return (n / 1e3).toFixed(1) + "k";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "k";
  return n.toLocaleString("vi-VN");
}

function fmtFull(n) {
  if (n === 0 || n == null) return "—";
  return n.toLocaleString("vi-VN") + " đ";
}

function fmtNum(n) {
  if (n === 0 || n == null) return "—";
  return n.toLocaleString("vi-VN");
}

function sumCol(rows, col) {
  return rows.reduce((s, r) => s + (r[col] || 0), 0);
}

// ═══════════════════════════════════════════════════
// WIDE TABLE COMPONENT
// ═══════════════════════════════════════════════════
function PivotTable({ title, subtitle, services, quarters, data }) {
  // Compute totals per service across all quarters
  const totals = useMemo(() =>
    services.map((_, si) => {
      let u = 0, t = 0, v = 0;
      data.forEach((qRow) => {
        const d = qRow[si];
        if (d) { u += d[0]; t += d[1]; v += d[2]; }
      });
      return [u, t, v];
    }), [services, data]);

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "20px 24px 12px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div style={{ overflowX: "auto", paddingBottom: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap", minWidth: services.length * 200 + 120 }}>
          <thead>
            <tr>
              <th rowSpan={2} style={thBase}>
                <span style={{ display: "block", color: "var(--text-faint)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>service_type</span>
              </th>
              {services.map((s) => (
                <th key={s} colSpan={3} style={{ ...thBase, textAlign: "center", borderBottom: "1px solid var(--border)", color: "var(--text)" }}>{s}</th>
              ))}
            </tr>
            <tr>
              {services.map((s) => (
                <React.Fragment key={s + "-sub"}>
                  <th style={subTh}>User</th>
                  <th style={subTh}>Trans</th>
                  <th style={subTh}>Value</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {quarters.map((q, qi) => (
              <tr key={q} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                <td style={{ ...tdBase, fontWeight: 600, color: "var(--text-dim)", position: "sticky", left: 0, background: "var(--bg)", zIndex: 1 }}>{q}</td>
                {services.map((s, si) => {
                  const d = data[qi]?.[si] || [0, 0, 0];
                  return (
                    <React.Fragment key={s}>
                      <td style={{ ...tdBase, textAlign: "right" }}>{fmt(d[0])}</td>
                      <td style={{ ...tdBase, textAlign: "right" }}>{fmt(d[1])}</td>
                      <td style={{ ...tdBase, textAlign: "right", color: "var(--green)" }}>{fmt(d[2])}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
            {/* Total row */}
            <tr style={{ background: "rgba(124,108,255,0.06)", fontWeight: 700 }}>
              <td style={{ ...tdBase, fontWeight: 700, color: "var(--accent-2)", position: "sticky", left: 0, background: "rgba(124,108,255,0.06)", zIndex: 1 }}>Total (Sum)</td>
              {services.map((s, si) => (
                <React.Fragment key={s + "-tot"}>
                  <td style={{ ...tdBase, textAlign: "right", fontWeight: 700 }}>{fmt(totals[si][0])}</td>
                  <td style={{ ...tdBase, textAlign: "right", fontWeight: 700 }}>{fmt(totals[si][1])}</td>
                  <td style={{ ...tdBase, textAlign: "right", fontWeight: 700, color: "var(--green)" }}>{fmt(totals[si][2])}</td>
                </React.Fragment>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thBase = {
  padding: "8px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-dim)",
  borderBottom: "1px solid var(--border)",
  position: "sticky",
  top: 0,
  background: "var(--bg)",
};

const subTh = {
  padding: "6px 10px",
  textAlign: "right",
  fontSize: 10,
  fontWeight: 500,
  color: "var(--text-faint)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  borderBottom: "2px solid var(--border)",
};

const tdBase = {
  padding: "8px 12px",
  fontSize: 12,
  color: "var(--text)",
};

// ═══════════════════════════════════════════════════
// USAGE TABLE
// ═══════════════════════════════════════════════════
function UsageTable({ title, data, showValue = true }) {
  const sumU = sumCol(data, "u");
  const sumT = sumCol(data, "t");
  const sumV = sumCol(data, "v");

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 10px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ padding: "6px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1 }}>service_type</th>
              <th style={{ padding: "6px 12px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase" }}>User</th>
              <th style={{ padding: "6px 12px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase" }}>Trans</th>
              {showValue && <th style={{ padding: "6px 16px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase" }}>Value</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                <td style={{ padding: "7px 16px", fontWeight: 500, color: "var(--text)" }}>{row.s}</td>
                <td style={{ padding: "7px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{fmtNum(row.u)}</td>
                <td style={{ padding: "7px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text)" }}>{fmtNum(row.t)}</td>
                {showValue && <td style={{ padding: "7px 16px", textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--green)" }}>{fmtFull(row.v)}</td>}
              </tr>
            ))}
            {/* Summary */}
            <tr style={{ background: "rgba(124,108,255,0.06)", fontWeight: 700 }}>
              <td style={{ padding: "8px 16px", fontWeight: 700, color: "var(--accent-2)", fontSize: 12 }}>Summary ⓘ</td>
              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtNum(sumU)}</td>
              <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmtNum(sumT)}</td>
              {showValue && <td style={{ padding: "8px 16px", textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--green)" }}>{fmtFull(sumV)}</td>}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// QUARTERLY BAR CHART
// ═══════════════════════════════════════════════════
function QuarterlyBars({ title, subtitle, data, color = "var(--accent)" }) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{title}</h3>
      {subtitle && <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>{subtitle}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)", width: 70, flexShrink: 0, textAlign: "right" }}>{d.label}</span>
            <div style={{ flex: 1, height: 22, background: "var(--border-faint)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: max > 0 ? `${(d.value / max) * 100}%` : "0%",
                background: color,
                borderRadius: 4,
                transition: "width 0.5s ease",
                minWidth: d.value > 0 ? 4 : 0,
              }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", width: 70, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════
import React from "react";

export default function VikkiPage() {
  // Compute KPI summaries from monthly usage
  const kpis = useMemo(() => {
    const mu = VIKKI_USAGE_MONTH.reduce((s, r) => s + r.u, 0);
    const mt = VIKKI_USAGE_MONTH.reduce((s, r) => s + r.t, 0);
    const mv = VIKKI_USAGE_MONTH.reduce((s, r) => s + r.v, 0);
    const wu = VIKKI_USAGE_WEEK.reduce((s, r) => s + r.u, 0);
    const wt = VIKKI_USAGE_WEEK.reduce((s, r) => s + r.t, 0);
    const wv = VIKKI_USAGE_WEEK.reduce((s, r) => s + r.v, 0);
    const tu = VIKKI_USAGE_TODAY.reduce((s, r) => s + r.u, 0);
    const tt = VIKKI_USAGE_TODAY.reduce((s, r) => s + r.t, 0);
    const tv = VIKKI_USAGE_TODAY.reduce((s, r) => s + r.v, 0);
    return { mu, mt, mv, wu, wt, wv, tu, tt, tv };
  }, []);

  // Quarterly aggregated data for comparison charts
  const qtrAgg = useMemo(() => {
    return VIKKI_BILL_QUARTERS.map((q, qi) => {
      const row = VIKKI_BILL_DATA[qi] || [];
      let users = 0, trans = 0, value = 0;
      row.forEach(([u, t, v]) => { users += u; trans += t; value += v; });
      return { label: q, users, trans, value };
    });
  }, []);

  return (
    <>
      <ReportHeader
        eyebrow="QUẢN LÝ SẢN PHẨM & DỊCH VỤ"
        title="Vikki – Performance of Services"
        subtitle="Hiệu suất dịch vụ Vikki Bank · Bill Payment · Service Payment · Usage Analytics"
      />

      {/* KPI CARDS */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="kpi-card" style={{ "--glow": "rgba(124,108,255,0.25)" }}>
          <div className="kpi-card__label">▸ USERS THÁNG NÀY</div>
          <div className="kpi-card__value">{fmtNum(kpis.mu)}</div>
          <div className="kpi-card__sub">Tuần: {fmtNum(kpis.wu)} · Hôm nay: {fmtNum(kpis.tu)}</div>
        </div>
        <div className="kpi-card" style={{ "--glow": "rgba(52,211,153,0.25)" }}>
          <div className="kpi-card__label">📊 GIAO DỊCH THÁNG</div>
          <div className="kpi-card__value">{fmtNum(kpis.mt)}</div>
          <div className="kpi-card__sub">Tuần: {fmtNum(kpis.wt)} · Hôm nay: {fmtNum(kpis.tt)}</div>
        </div>
        <div className="kpi-card" style={{ "--glow": "rgba(251,191,36,0.25)" }}>
          <div className="kpi-card__label">✅ GIÁ TRỊ THÁNG</div>
          <div className="kpi-card__value">{fmt(kpis.mv)}</div>
          <div className="kpi-card__sub">{fmtFull(kpis.mv)}</div>
        </div>
        <div className="kpi-card" style={{ "--glow": "rgba(251,113,133,0.25)" }}>
          <div className="kpi-card__label">⚡ DỊCH VỤ HOẠT ĐỘNG</div>
          <div className="kpi-card__value">{VIKKI_USAGE_MONTH.length}</div>
          <div className="kpi-card__sub">Bill: {VIKKI_BILL_SERVICES.length} · Service: {VIKKI_SVC_SERVICES.length}</div>
        </div>
      </div>

      {/* BILL PAYMENT TABLE */}
      <div style={{ marginBottom: 20 }}>
        <PivotTable
          title="Bill Payment"
          subtitle="Thanh toán hóa đơn theo loại dịch vụ"
          services={VIKKI_BILL_SERVICES}
          quarters={VIKKI_BILL_QUARTERS}
          data={VIKKI_BILL_DATA}
        />
      </div>

      {/* SERVICE PAYMENT TABLE */}
      <div style={{ marginBottom: 20 }}>
        <PivotTable
          title="Service Payment"
          subtitle="Thanh toán dịch vụ theo loại"
          services={VIKKI_SVC_SERVICES}
          quarters={VIKKI_SVC_QUARTERS}
          data={VIKKI_SVC_DATA}
        />
      </div>

      {/* COMPARISON CHARTS */}
      <div style={{ marginBottom: 20 }}>
        <QuarterlyBars
          title="Value Comparison"
          subtitle="Tổng giá trị Bill Payment theo quý"
          data={qtrAgg.map((q) => ({ label: q.label, value: q.value }))}
          color="var(--accent)"
        />
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <QuarterlyBars
          title="User Comparison"
          subtitle="Số người dùng Bill Payment theo quý"
          data={qtrAgg.map((q) => ({ label: q.label, value: q.users }))}
          color="var(--green)"
        />
        <QuarterlyBars
          title="Transactions Comparison"
          subtitle="Số giao dịch Bill Payment theo quý"
          data={qtrAgg.map((q) => ({ label: q.label, value: q.trans }))}
          color="var(--amber)"
        />
      </div>

      {/* USING SERVICES */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <UsageTable title="Using Services Today" data={VIKKI_USAGE_TODAY} />
        <UsageTable title="Using Services This Week" data={VIKKI_USAGE_WEEK} />
        <UsageTable title="Using Services This Month" data={VIKKI_USAGE_MONTH} />
      </div>
    </>
  );
}
