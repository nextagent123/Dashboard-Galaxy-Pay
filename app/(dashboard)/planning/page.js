"use client";

import { useAuth } from "@/components/AuthProvider";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

const M = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
const MF = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const REV = {
  upc:     [19.597,21.923,23.163,20.969,21.208,22.132,22.593,20.967,19.341,21.146,22.624,22.545],
  ewallet: [0.573,0.640,0.677,0.613,0.621,0.646,0.656,0.610,0.560,0.615,0.659,0.658],
  other:   [1.310,1.134,1.286,4.939,4.652,4.808,8.494,8.626,8.560,11.758,11.966,11.928],
};
const GP = {
  upc:     [4.510,5.048,5.331,4.825,4.878,5.097,5.210,4.831,4.463,4.873,5.212,5.192],
  ewallet: [0.382,0.431,0.457,0.410,0.418,0.438,0.440,0.408,0.373,0.414,0.447,0.441],
  other:   [0.749,0.607,0.677,0.785,0.569,0.649,0.809,0.897,0.853,0.724,0.838,0.834],
};
const MARGIN = [26.3,25.7,25.7,22.7,22.1,22.4,20.4,20.3,20.0,17.9,18.4,18.4];
const TXN = [293.1,326.5,343.8,313.4,316.7,331.0,339.0,315.9,294.9,319.3,340.0,339.0];

const SERIES = [
  { key: "upc", name: "UPC", color: "#3987e5" },
  { key: "ewallet", name: "Ewallet", color: "#d95926" },
  { key: "other", name: "Dịch vụ khác", color: "#199e70" },
];

const sum = (a) => a.reduce((s, v) => s + v, 0);
const REV_TOTAL = M.map((_, i) => REV.upc[i] + REV.ewallet[i] + REV.other[i]);
const GP_TOTAL = M.map((_, i) => GP.upc[i] + GP.ewallet[i] + GP.other[i]);

function fv(n, d = 1) {
  return n.toFixed(d).replace(".", ",");
}

const MERCH = [
  { grp: "UPC", name: "VietJet Air", rev: 255.98, cost: 197.21, c: "#3987e5" },
  { grp: "UPC", name: "Sovico", rev: 2.07, cost: 1.46, c: "#3987e5" },
  { grp: "UPC", name: "UPC khác", rev: 0.15, cost: 0.07, c: "#3987e5" },
  { grp: "Ewallet", name: "GalaxyPay", rev: 7.45, cost: 2.24, c: "#d95926" },
  { grp: "Ewallet", name: "SkyPoint", rev: 0.077, cost: 0, c: "#d95926" },
  { grp: "Ewallet", name: "Tap to Pay", rev: 0.0003, cost: 0, c: "#d95926" },
  { grp: "Ewallet", name: "Ví doanh nghiệp", rev: 0.001, cost: 0, c: "#d95926" },
  { grp: "Ewallet", name: "eKYC, SMS, Refer", rev: 0, cost: 0.23, c: "#d95926", costOnly: true },
  { grp: "DV khác", name: "OTA VMB", rev: 61.51, cost: 61.24, c: "#199e70" },
  { grp: "DV khác", name: "ID Check", rev: 10.99, cost: 3.67, c: "#199e70" },
  { grp: "DV khác", name: "BHXH", rev: 4.19, cost: 3.77, c: "#199e70" },
  { grp: "DV khác", name: "DV khác", rev: 2.70, cost: 1.72, c: "#199e70" },
  { grp: "DV khác", name: "Thu hộ điện", rev: 0.08, cost: 0.07, c: "#199e70" },
].map((m) => ({ ...m, gp: m.rev - m.cost }));

const GROUPS = [
  { key: "UPC", label: "UPC", color: "#3987e5" },
  { key: "Ewallet", label: "Ewallet", color: "#d95926" },
  { key: "DV khác", label: "Dịch vụ khác", color: "#199e70" },
];

export default function PlanningPage() {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Không có quyền truy cập</div>
        <div style={{ fontSize: 14, color: "var(--text-dim)" }}>Trang này chỉ dành cho Admin.</div>
      </div>
    );
  }

  const totalRev = sum(REV_TOTAL);
  const totalGP = sum(GP_TOTAL);
  const totalMargin = (totalGP / totalRev) * 100;
  const totalTxn = sum(TXN);

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · KẾ HOẠCH KINH DOANH"
        title="Planning KPI — Năm tài chính 2026"
        subtitle="Kế hoạch doanh thu, lợi nhuận & giao dịch theo tháng"
        right={<DateBadge>FY 2026</DateBadge>}
      />

      {/* KPI Cards */}
      <section className="grid-4">
        <KpiCard label="Doanh thu" value={`${fv(totalRev)} tỷ VND`} data={REV_TOTAL} color="#3987e5" />
        <KpiCard label="Lợi nhuận gộp" value={`${fv(totalGP)} tỷ VND`} data={GP_TOTAL} color="#199e70" />
        <KpiCard label="Biên lợi nhuận" value={`${fv(totalMargin)}%`} data={MARGIN} color="#d95926" />
        <KpiCard label="Giao dịch" value={`${fv(totalTxn / 1000, 2)}M`} data={TXN} color="#3987e5" />
      </section>

      {/* Revenue Stacked Bar */}
      <SectionCard
        title="Doanh thu theo tháng (tỷ VND)"
        right={<Legend items={SERIES} />}
      >
        <RevenueChart />
      </SectionCard>

      {/* GP + Margin side by side */}
      <section className="grid-2">
        <SectionCard title="Lợi nhuận gộp theo tháng (tỷ VND)">
          <GPChart />
        </SectionCard>
        <SectionCard title="Biên lợi nhuận gộp (%)">
          <MarginChart />
        </SectionCard>
      </section>

      {/* Product Table */}
      <SectionCard title="Tổng hợp theo sản phẩm — FY 2026">
        <ProductTable />
      </SectionCard>

      {/* P&L Structure */}
      <SectionCard
        title="Cơ cấu Doanh thu — Chi phí — Lợi nhuận"
        right={
          <Legend items={[
            { name: "Chi phí biến đổi", color: "var(--text-dim)" },
            { name: "Lợi nhuận gộp", color: "#3987e5" },
          ]} />
        }
      >
        <PnLStructure />
      </SectionCard>

      {/* GP by Merchant */}
      <SectionCard title="Đóng góp lợi nhuận gộp theo Merchant">
        <GPMerchantChart />
      </SectionCard>

      {/* Merchant Detail */}
      <SectionCard title="Chi tiết P&L theo Merchant — FY 2026">
        <MerchantTable />
      </SectionCard>
    </>
  );
}

function Legend({ items }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {items.map((s) => (
        <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--text-dim)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2.5, background: s.color, flexShrink: 0 }} />
          {s.name}
        </div>
      ))}
    </div>
  );
}

function KpiCard({ label, value, data, color }) {
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const w = 120, h = 30, px = 2, py = 3;
  const pts = data.map((v, i) => {
    const x = px + (i / (data.length - 1)) * (w - 2 * px);
    const y = py + (1 - (v - mn) / rng) * (h - 2 * py);
    return { x, y };
  });
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = line + ` ${pts[pts.length - 1].x},${h - py} ${pts[0].x},${h - py}`;

  return (
    <div className="card" style={{ padding: "20px 22px 16px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-dim)", marginBottom: 6 }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.15, color: "var(--text)", marginBottom: 10 }}>{value}</div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 32, display: "block" }}>
        <polygon points={area} fill={color} opacity={0.1} />
        <polyline points={line} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.5} fill={color} />
      </svg>
    </div>
  );
}

function roundedTop(x, y, w, h, r) {
  if (h < r * 2) r = h / 2;
  return `M${x},${y + h}L${x},${y + r}Q${x},${y} ${x + r},${y}L${x + w - r},${y}Q${x + w},${y} ${x + w},${y + r}L${x + w},${y + h}Z`;
}

function RevenueChart() {
  const W = 800, H = 310, ml = 52, mr = 12, mt = 8, mb = 38;
  const pw = W - ml - mr, ph = H - mt - mb;
  const yMax = 40, yTicks = [0, 10, 20, 30, 40];
  const gw = pw / 12, bw = gw * 0.58, bo = (gw - bw) / 2;
  const ys = ph / yMax, gap = 1.5;

  const bars = [];
  const labels = [];
  const gridLines = [];

  for (const t of yTicks) {
    const y = mt + ph - t * ys;
    gridLines.push(<line key={`g${t}`} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="var(--border)" strokeWidth={1} />);
    gridLines.push(<text key={`l${t}`} x={ml - 8} y={y + 4} fill="var(--text-dim)" textAnchor="end" fontSize="11" fontFamily="inherit">{t}</text>);
  }

  for (let i = 0; i < 12; i++) {
    const x = ml + i * gw + bo;
    let baseY = mt + ph;
    const vals = [REV.upc[i], REV.ewallet[i], REV.other[i]];
    const colors = SERIES.map((s) => s.color);

    for (let s = 0; s < 3; s++) {
      const h = vals[s] * ys;
      if (h < 0.5) continue;
      const y = baseY - h;
      const g = s > 0 ? gap : 0;
      const isTop = s === 2;
      if (isTop) {
        bars.push(<path key={`b${i}-${s}`} d={roundedTop(x, y + g, bw, h - g, 3)} fill={colors[s]} opacity={0.85} />);
      } else {
        bars.push(<rect key={`b${i}-${s}`} x={x} y={y + g} width={bw} height={h - g} fill={colors[s]} opacity={0.85} />);
      }
      baseY = y;
    }

    labels.push(<text key={`x${i}`} x={x + bw / 2} y={mt + ph + 22} fill="var(--text-dim)" textAnchor="middle" fontSize="11" fontFamily="inherit">{M[i]}</text>);
    if (i === 0 || i === 2 || i === 5 || i === 8 || i === 11) {
      labels.push(<text key={`v${i}`} x={x + bw / 2} y={baseY - 4} fill="var(--text-dimmer)" textAnchor="middle" fontSize="10" fontFamily="inherit">{fv(REV_TOTAL[i])}</text>);
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxHeight: 310 }}>
      {gridLines}{bars}{labels}
    </svg>
  );
}

function GPChart() {
  const W = 400, H = 260, ml = 44, mr = 12, mt = 8, mb = 38;
  const pw = W - ml - mr, ph = H - mt - mb;
  const yMax = 8, yTicks = [0, 2, 4, 6, 8];
  const gw = pw / 12, bw = gw * 0.55, bo = (gw - bw) / 2;
  const ys = ph / yMax;

  const els = [];
  for (const t of yTicks) {
    const y = mt + ph - t * ys;
    els.push(<line key={`g${t}`} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="var(--border)" strokeWidth={1} />);
    els.push(<text key={`l${t}`} x={ml - 6} y={y + 4} fill="var(--text-dim)" textAnchor="end" fontSize="10" fontFamily="inherit">{t}</text>);
  }
  for (let i = 0; i < 12; i++) {
    const v = GP_TOTAL[i];
    const x = ml + i * gw + bo;
    const h = v * ys;
    const y = mt + ph - h;
    els.push(<path key={`b${i}`} d={roundedTop(x, y, bw, h, 2.5)} fill="#3987e5" opacity={0.85} />);
    els.push(<text key={`x${i}`} x={x + bw / 2} y={mt + ph + 20} fill="var(--text-dim)" textAnchor="middle" fontSize="10" fontFamily="inherit">{M[i]}</text>);
    if (i === 0 || i === 2 || i === 5 || i === 8 || i === 11) {
      els.push(<text key={`v${i}`} x={x + bw / 2} y={y - 4} fill="var(--text-dimmer)" textAnchor="middle" fontSize="9.5" fontFamily="inherit">{fv(v)}</text>);
    }
  }
  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxHeight: 260 }}>{els}</svg>;
}

function MarginChart() {
  const W = 400, H = 260, ml = 44, mr = 16, mt = 8, mb = 38;
  const pw = W - ml - mr, ph = H - mt - mb;
  const yMin = 14, yMax = 30, yTicks = [15, 20, 25, 30];
  const ys = ph / (yMax - yMin);

  const els = [];
  for (const t of yTicks) {
    const y = mt + ph - (t - yMin) * ys;
    els.push(<line key={`g${t}`} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="var(--border)" strokeWidth={1} />);
    els.push(<text key={`l${t}`} x={ml - 6} y={y + 4} fill="var(--text-dim)" textAnchor="end" fontSize="10" fontFamily="inherit">{t}%</text>);
  }

  const pts = MARGIN.map((v, i) => ({
    x: ml + i * (pw / 11),
    y: mt + ph - (v - yMin) * ys,
    v,
  }));

  const areaPath = `M${pts[0].x},${mt + ph} ${pts.map((p) => `L${p.x},${p.y}`).join(" ")} L${pts[11].x},${mt + ph}Z`;
  els.push(<path key="area" d={areaPath} fill="#d95926" opacity={0.08} />);
  els.push(<polyline key="line" points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#d95926" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />);

  pts.forEach((p, i) => {
    els.push(<circle key={`c${i}`} cx={p.x} cy={p.y} r={3.5} fill="var(--bg, #0a0b12)" stroke="#d95926" strokeWidth={2} />);
    if (i === 0 || i === 11) {
      const anchor = i === 0 ? "start" : "end";
      const dx = i === 0 ? 8 : -8;
      els.push(<text key={`t${i}`} x={p.x + dx} y={p.y + 4} fill="var(--text)" textAnchor={anchor} fontSize="11" fontWeight="600" fontFamily="inherit">{fv(p.v)}%</text>);
    }
    els.push(<text key={`x${i}`} x={p.x} y={mt + ph + 20} fill="var(--text-dim)" textAnchor="middle" fontSize="10" fontFamily="inherit">{M[i]}</text>);
  });

  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxHeight: 260 }}>{els}</svg>;
}

function ProductTable() {
  const products = [
    { name: "UPC", color: "#3987e5", rev: sum(REV.upc), gp: sum(GP.upc) },
    { name: "Ewallet", color: "#d95926", rev: sum(REV.ewallet), gp: sum(GP.ewallet) },
    { name: "Dịch vụ khác", color: "#199e70", rev: sum(REV.other), gp: sum(GP.other) },
  ];
  const totalRev = sum(REV_TOTAL), totalGP = sum(GP_TOTAL);
  const maxRev = Math.max(...products.map((p) => p.rev));
  const maxGP = Math.max(...products.map((p) => p.gp));

  return (
    <div className="table-wrap" style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, background: "rgba(255,255,255,0.03)" }}>
            <th style={TH}>Sản phẩm</th>
            <th style={{ ...TH, textAlign: "right" }}>Doanh thu (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>LN gộp (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>Biên LN</th>
            <th style={{ ...TH, textAlign: "right" }}>Tỷ trọng</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.name} style={{ borderTop: "1px solid var(--border-soft)" }}>
              <td style={TD}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, color: "var(--text)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                  {p.name}
                </div>
              </td>
              <td className="mono" style={{ ...TD, textAlign: "right" }}>
                {fv(p.rev)}
                <div style={{ height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden", marginTop: 5 }}>
                  <div style={{ width: `${(p.rev / maxRev * 100).toFixed(1)}%`, height: "100%", borderRadius: 3, background: p.color }} />
                </div>
              </td>
              <td className="mono" style={{ ...TD, textAlign: "right" }}>
                {fv(p.gp)}
                <div style={{ height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden", marginTop: 5 }}>
                  <div style={{ width: `${(p.gp / maxGP * 100).toFixed(1)}%`, height: "100%", borderRadius: 3, background: p.color }} />
                </div>
              </td>
              <td className="mono" style={{ ...TD, textAlign: "right" }}>{fv(p.gp / p.rev * 100)}%</td>
              <td className="mono" style={{ ...TD, textAlign: "right" }}>{fv(p.rev / totalRev * 100)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid var(--border)" }}>
            <td style={{ ...TD, fontWeight: 700, color: "var(--text)" }}>Tổng cộng</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalRev)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalGP)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalGP / totalRev * 100)}%</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function PnLStructure() {
  const grpData = GROUPS.map((g) => {
    const items = MERCH.filter((m) => m.grp === g.key);
    const rev = items.reduce((s, m) => s + m.rev, 0);
    const cost = items.reduce((s, m) => s + m.cost, 0);
    const gp = rev - cost;
    return { label: g.label, rev, cost, gp, color: g.color, margin: (gp / rev) * 100 };
  });
  const maxRev = Math.max(...grpData.map((g) => g.rev));

  return (
    <div style={{ padding: "8px 0" }}>
      {grpData.map((g) => {
        const wTotal = Math.max((g.rev / maxRev) * 100, 6);
        const costPct = (g.cost / g.rev) * 100;
        const gpPct = 100 - costPct;
        return (
          <div key={g.label} style={{ padding: "12px 0", borderTop: "1px solid var(--border-soft)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 90, flexShrink: 0, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{g.label}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", width: `${wTotal.toFixed(1)}%`, minWidth: 40 }}>
                    <div style={{
                      height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, color: "#fff",
                      background: "var(--text-dim)", borderRadius: "4px 0 0 4px",
                      width: `${costPct.toFixed(1)}%`, overflow: "hidden",
                    }}>
                      {costPct > 12 && wTotal > 20 ? fv(g.cost) : ""}
                    </div>
                    <div style={{
                      height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, color: "#fff",
                      background: g.color, borderRadius: "0 4px 4px 0",
                      width: `${gpPct.toFixed(1)}%`, overflow: "hidden",
                    }}>
                      {gpPct > 12 && wTotal > 20 ? fv(g.gp) : ""}
                    </div>
                  </div>
                  {wTotal < 20 && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginLeft: 8, whiteSpace: "nowrap" }}>
                      CP {fv(g.cost)} · LN {fv(g.gp)}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-dimmer)", marginTop: 3, width: `${wTotal.toFixed(1)}%`, minWidth: 120 }}>
                  <span>DT: {fv(g.rev)} tỷ</span>
                  <span>Biên LN: {fv(g.margin)}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GPMerchantChart() {
  const sorted = MERCH.filter((m) => m.gp > 0.005).sort((a, b) => b.gp - a.gp);
  const maxGP = sorted[0].gp;

  return (
    <div style={{ padding: "8px 0" }}>
      {sorted.map((m) => {
        const w = Math.max((m.gp / maxGP) * 100, 0.5);
        return (
          <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
            <div style={{ width: 110, flexShrink: 0, textAlign: "right", fontSize: 12, color: "var(--text-dimmer)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
            <div style={{ flex: 1, height: 20, position: "relative" }}>
              <div style={{ height: "100%", borderRadius: 3, minWidth: 2, width: `${w.toFixed(1)}%`, background: m.c, opacity: 0.85 }} />
            </div>
            <div className="mono" style={{ minWidth: 70, fontSize: 12, fontWeight: 600, color: "var(--text)", textAlign: "right" }}>
              {m.gp >= 1 ? fv(m.gp) : fv(m.gp, 2)} tỷ
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MerchantTable() {
  const totalRev = sum(REV_TOTAL);
  const totalCost = MERCH.reduce((s, m) => s + m.cost, 0);
  const totalGP = sum(GP_TOTAL);

  return (
    <div className="table-wrap" style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 640 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, background: "rgba(255,255,255,0.03)" }}>
            <th style={TH}>Merchant</th>
            <th style={{ ...TH, textAlign: "right" }}>Doanh thu (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>Chi phí BĐ (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>LN gộp (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>Biên LN</th>
            <th style={{ ...TH, textAlign: "right" }}>Tỷ trọng DT</th>
          </tr>
        </thead>
        <tbody>
          {GROUPS.map((g) => {
            const items = MERCH.filter((m) => m.grp === g.key);
            const gRev = items.reduce((s, m) => s + m.rev, 0);
            const gCost = items.reduce((s, m) => s + m.cost, 0);
            const gGP = gRev - gCost;
            return [
              <tr key={`h-${g.key}`} style={{ background: "rgba(255,255,255,0.02)" }}>
                <td colSpan={6} style={{ padding: "8px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-dim)", borderBottom: "1.5px solid var(--border)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 1.5, background: g.color }} />
                    {g.label}
                  </span>
                </td>
              </tr>,
              ...items.map((m) => {
                const margin = m.rev > 0 ? `${fv(m.gp / m.rev * 100)}%` : "—";
                const share = m.rev > 0 ? `${fv(m.rev / totalRev * 100)}%` : "—";
                const revStr = m.rev > 0 ? (m.rev >= 1 ? fv(m.rev) : fv(m.rev, 3)) : "—";
                const gpStr = m.costOnly ? fv(m.gp, 2) : (m.gp >= 1 ? fv(m.gp) : fv(m.gp, 3));
                return (
                  <tr key={m.name} style={{ borderTop: "1px solid var(--border-soft)", opacity: m.costOnly ? 0.6 : 1 }}>
                    <td style={TD}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 500, color: "var(--text)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: 1.5, background: m.c, flexShrink: 0 }} />
                        {m.name}
                      </div>
                    </td>
                    <td className="mono" style={{ ...TD, textAlign: "right" }}>{revStr}</td>
                    <td className="mono" style={{ ...TD, textAlign: "right" }}>{m.cost >= 1 ? fv(m.cost) : fv(m.cost, 2)}</td>
                    <td className="mono" style={{ ...TD, textAlign: "right" }}>{gpStr}</td>
                    <td className="mono" style={{ ...TD, textAlign: "right", color: m.gp < 0 ? "var(--text-dim)" : undefined }}>{margin}</td>
                    <td className="mono" style={{ ...TD, textAlign: "right" }}>{share}</td>
                  </tr>
                );
              }),
              <tr key={`s-${g.key}`} style={{ borderTop: "1px solid var(--border)", borderBottom: "1.5px solid var(--border)" }}>
                <td style={{ ...TD, fontWeight: 600, color: "var(--text)" }}>Subtotal {g.label}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fv(gRev)}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fv(gCost)}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fv(gGP)}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fv(gGP / gRev * 100)}%</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fv(gRev / totalRev * 100)}%</td>
              </tr>,
            ];
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid var(--border)" }}>
            <td style={{ ...TD, fontWeight: 700, color: "var(--text)" }}>Tổng cộng</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalRev)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalCost)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalGP)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalGP / totalRev * 100)}%</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const TH = { padding: "10px 12px" };
const TD = { padding: "10px 12px", color: "var(--text-dimmer)" };
