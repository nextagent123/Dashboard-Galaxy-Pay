"use client";

import { useAuth } from "@/components/AuthProvider";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import Icon from "@/components/ui/Icon";

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
  { key: "upc", name: "UPC", color: "#3987e5", colorLight: "rgba(57,135,229,0.15)" },
  { key: "ewallet", name: "Ewallet", color: "#d95926", colorLight: "rgba(217,89,38,0.15)" },
  { key: "other", name: "Dịch vụ khác", color: "#199e70", colorLight: "rgba(25,158,112,0.15)" },
];

const sum = (a) => a.reduce((s, v) => s + v, 0);
const avg = (a) => sum(a) / a.length;
const REV_TOTAL = M.map((_, i) => REV.upc[i] + REV.ewallet[i] + REV.other[i]);
const GP_TOTAL = M.map((_, i) => GP.upc[i] + GP.ewallet[i] + GP.other[i]);
const COST_TOTAL = REV_TOTAL.map((r, i) => r - GP_TOTAL[i]);

function fv(n, d = 1) { return n.toFixed(d).replace(".", ","); }
function fvn(n) { return n.toLocaleString("vi-VN"); }

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

const QUARTERS = [
  { label: "Q1", months: [0, 1, 2] },
  { label: "Q2", months: [3, 4, 5] },
  { label: "Q3", months: [6, 7, 8] },
  { label: "Q4", months: [9, 10, 11] },
];

const ICON = ["M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z", "M9 16l2 2 4-4"];

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
  const totalCost = sum(COST_TOTAL);
  const totalMargin = (totalGP / totalRev) * 100;
  const totalTxn = sum(TXN);
  const peakMonth = MF[REV_TOTAL.indexOf(Math.max(...REV_TOTAL))];
  const avgMonthlyRev = avg(REV_TOTAL);
  const h1Rev = sum(REV_TOTAL.slice(0, 6));
  const h2Rev = sum(REV_TOTAL.slice(6));
  const h1GP = sum(GP_TOTAL.slice(0, 6));
  const h2GP = sum(GP_TOTAL.slice(6));

  const revByProduct = SERIES.map((s) => ({ ...s, total: sum(REV[s.key]) }));

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · KẾ HOẠCH KINH DOANH"
        title="Planning KPI — Năm tài chính 2026"
        subtitle="Kế hoạch doanh thu, lợi nhuận & giao dịch"
        right={<DateBadge>FY 2026</DateBadge>}
      />

      {/* ── HERO ── */}
      <section style={{
        position: "relative", overflow: "hidden", borderRadius: 20,
        border: "1px solid rgba(57,135,229,0.28)",
        background: "radial-gradient(700px 300px at 80% -20%, rgba(57,135,229,0.22), transparent 60%), linear-gradient(160deg, rgba(57,135,229,0.10), rgba(255,255,255,0.012))",
        padding: "28px 30px",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <DonutChart data={revByProduct} size={100} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #3987e5, #3987e566)", flexShrink: 0 }}>
                  <Icon paths={ICON} size={18} stroke="#fff" strokeWidth={2.2} />
                </span>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: "#3987e5" }}>PLANNING KPI 2026</span>
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", lineHeight: 1.35 }}>Kế hoạch Kinh doanh năm 2026</div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.6, fontWeight: 800, color: "#6bb3f5", textTransform: "uppercase" }}>
              Tổng doanh thu kế hoạch
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
              <span className="mono" style={{
                fontSize: 42, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1,
                background: "linear-gradient(120deg,var(--text),#6bb3f5)", WebkitBackgroundClip: "text",
                backgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {fv(totalRev)} tỷ
              </span>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-dimmer)", marginTop: 12, display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
              <span>LN gộp <b style={{ color: "var(--text)" }}>{fv(totalGP)} tỷ</b></span>
              <span style={{ color: "var(--text-faint)" }}>•</span>
              <span>Biên LN <b style={{ color: "#199e70" }}>{fv(totalMargin)}%</b></span>
              <span style={{ color: "var(--text-faint)" }}>•</span>
              <span>{fv(totalTxn / 1000, 2)}M giao dịch</span>
              <span style={{ color: "var(--text-faint)" }}>•</span>
              <span>Đỉnh: {peakMonth}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI CARDS ── */}
      <section className="grid-4">
        <KpiCard
          label="Doanh thu" value={`${fv(totalRev)}`} unit="tỷ VND" data={REV_TOTAL}
          color="#3987e5" sub={`TB/tháng: ${fv(avgMonthlyRev)} tỷ`}
          h1={fv(h1Rev)} h2={fv(h2Rev)}
        />
        <KpiCard
          label="Lợi nhuận gộp" value={`${fv(totalGP)}`} unit="tỷ VND" data={GP_TOTAL}
          color="#199e70" sub={`Chi phí BĐ: ${fv(totalCost)} tỷ`}
          h1={fv(h1GP)} h2={fv(h2GP)}
        />
        <KpiCard
          label="Biên lợi nhuận" value={`${fv(totalMargin)}`} unit="%" data={MARGIN}
          color="#d95926" sub={`Cao nhất: ${fv(Math.max(...MARGIN))}% · Thấp nhất: ${fv(Math.min(...MARGIN))}%`}
          h1={fv(h1GP / h1Rev * 100)} h2={fv(h2GP / h2Rev * 100)}
        />
        <KpiCard
          label="Giao dịch" value={`${fv(totalTxn / 1000, 2)}`} unit="triệu" data={TXN}
          color="#3987e5" sub={`TB/tháng: ${fv(avg(TXN), 0)}K`}
          h1={fv(sum(TXN.slice(0, 6)) / 1000, 2)} h2={fv(sum(TXN.slice(6)) / 1000, 2)}
        />
      </section>

      {/* ── QUARTERLY STRIP ── */}
      <section className="grid-4">
        {QUARTERS.map((q) => {
          const qRev = sum(q.months.map((i) => REV_TOTAL[i]));
          const qGP = sum(q.months.map((i) => GP_TOTAL[i]));
          const qMargin = (qGP / qRev) * 100;
          const qTxn = sum(q.months.map((i) => TXN[i]));
          return (
            <div key={q.label} className="card" style={{ padding: "16px 18px", borderLeft: `3px solid #3987e5` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#3987e5" }}>{q.label}</span>
                <span style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{MF[q.months[0]].replace("Tháng ", "T")}–{MF[q.months[2]].replace("Tháng ", "T")}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 12 }}>
                <div>
                  <div style={{ color: "var(--text-dim)", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Doanh thu</div>
                  <div className="mono" style={{ fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{fv(qRev)} tỷ</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-dim)", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>LN gộp</div>
                  <div className="mono" style={{ fontWeight: 700, color: "#199e70", marginTop: 2 }}>{fv(qGP)} tỷ</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-dim)", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Biên LN</div>
                  <div className="mono" style={{ fontWeight: 700, color: "#d95926", marginTop: 2 }}>{fv(qMargin)}%</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-dim)", fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>Giao dịch</div>
                  <div className="mono" style={{ fontWeight: 700, color: "var(--text)", marginTop: 2 }}>{fv(qTxn, 0)}K</div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ── REVENUE STACKED BAR ── */}
      <SectionCard
        title="Doanh thu theo tháng"
        subtitle="Phân theo nhóm sản phẩm (tỷ VND)"
        right={<Legend items={SERIES} />}
      >
        <RevenueChart />
      </SectionCard>

      {/* ── GP + MARGIN ── */}
      <section className="grid-2">
        <SectionCard title="Lợi nhuận gộp theo tháng" subtitle="tỷ VND">
          <GPChart />
        </SectionCard>
        <SectionCard title="Biên lợi nhuận gộp" subtitle="% theo tháng">
          <MarginChart />
        </SectionCard>
      </section>

      {/* ── PRODUCT COMPOSITION ── */}
      <SectionCard title="Tổng hợp theo sản phẩm — FY 2026" subtitle="Cơ cấu doanh thu & lợi nhuận">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 20, marginTop: 12 }}>
          {revByProduct.map((s) => {
            const pct = (s.total / totalRev) * 100;
            const gp = sum(GP[s.key]);
            const margin = (gp / s.total) * 100;
            return (
              <div key={s.key} style={{
                flex: "1 1 180px", padding: "16px 18px", borderRadius: 14,
                background: s.colorLight, border: `1px solid ${s.color}33`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{s.name}</span>
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: s.color }}>{fv(pct)}%</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5 }}>
                  <div>
                    <div style={{ color: "var(--text-dim)", fontSize: 10 }}>Doanh thu</div>
                    <div className="mono" style={{ fontWeight: 700, color: "var(--text)" }}>{fv(s.total)} tỷ</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-dim)", fontSize: 10 }}>LN gộp</div>
                    <div className="mono" style={{ fontWeight: 700, color: "var(--text)" }}>{fv(gp)} tỷ</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-dim)", fontSize: 10 }}>Biên LN</div>
                    <div className="mono" style={{ fontWeight: 700, color: s.color }}>{fv(margin)}%</div>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-dim)", fontSize: 10 }}>Tỷ trọng DT</div>
                    <div className="mono" style={{ fontWeight: 700, color: s.color }}>{fv(pct)}%</div>
                  </div>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden", marginTop: 12 }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: s.color }} />
                </div>
              </div>
            );
          })}
        </div>
        <ProductTable />
      </SectionCard>

      {/* ── P&L STRUCTURE ── */}
      <SectionCard
        title="Cơ cấu Doanh thu — Chi phí — Lợi nhuận"
        subtitle="Phân bổ theo nhóm sản phẩm"
        right={
          <Legend items={[
            { name: "Chi phí biến đổi", color: "#6b6f85" },
            { name: "Lợi nhuận gộp", color: "#3987e5" },
          ]} />
        }
      >
        <PnLStructure />
      </SectionCard>

      {/* ── MONTHLY DETAIL TABLE ── */}
      <SectionCard title="Chi tiết theo tháng — FY 2026" subtitle="Doanh thu · Chi phí · LN gộp · Biên LN · Giao dịch">
        <MonthlyDetailTable />
      </SectionCard>

      {/* ── GP BY MERCHANT ── */}
      <SectionCard title="Đóng góp lợi nhuận gộp theo Merchant" subtitle="Xếp hạng theo LN gộp">
        <GPMerchantChart />
      </SectionCard>

      {/* ── MERCHANT DETAIL ── */}
      <SectionCard title="Chi tiết P&L theo Merchant — FY 2026" subtitle="Phân tích doanh thu, chi phí & biên LN">
        <MerchantTable />
      </SectionCard>
    </>
  );
}

/* ── DONUT CHART ── */
function DonutChart({ data, size = 100 }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = sum(data.map((d) => d.total));
  let cumOffset = 0;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-soft)" strokeWidth={stroke} />
        {data.map((d) => {
          const pct = d.total / total;
          const dashLen = c * pct - 2;
          const gapLen = c - dashLen;
          const offset = -cumOffset * c;
          cumOffset += pct;
          return (
            <circle
              key={d.key} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={d.color} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={`${Math.max(dashLen, 0)} ${gapLen}`}
              strokeDashoffset={offset}
              style={{ filter: `drop-shadow(0 0 4px ${d.color}44)` }}
            />
          );
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span className="mono" style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5, lineHeight: 1 }}>FY26</span>
      </div>
    </div>
  );
}

/* ── LEGEND ── */
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

/* ── KPI CARD ── */
function KpiCard({ label, value, unit, data, color, sub, h1, h2 }) {
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const w = 140, h = 36, px = 2, py = 4;
  const pts = data.map((v, i) => ({
    x: px + (i / (data.length - 1)) * (w - 2 * px),
    y: py + (1 - (v - mn) / rng) * (h - 2 * py),
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = line + ` ${pts[pts.length - 1].x},${h - py} ${pts[0].x},${h - py}`;

  return (
    <div className="card" style={{ padding: "18px 20px 14px" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: "var(--text-dim)", marginBottom: 4 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
        <span className="mono" style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15, color: "var(--text)" }}>{value}</span>
        <span style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dimmer)", marginBottom: 10 }}>{sub}</div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: 36, display: "block" }}>
        <polygon points={area} fill={color} opacity={0.12} />
        <polyline points={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={3} fill={color} />
      </svg>
      <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 10.5 }}>
        <div style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "var(--surface-soft)", border: "1px solid var(--border-soft)" }}>
          <span style={{ color: "var(--text-dim)" }}>H1 </span>
          <span className="mono" style={{ fontWeight: 700, color: "var(--text)" }}>{h1}</span>
        </div>
        <div style={{ flex: 1, padding: "5px 8px", borderRadius: 6, background: "var(--surface-soft)", border: "1px solid var(--border-soft)" }}>
          <span style={{ color: "var(--text-dim)" }}>H2 </span>
          <span className="mono" style={{ fontWeight: 700, color: "var(--text)" }}>{h2}</span>
        </div>
      </div>
    </div>
  );
}

/* ── HELPERS ── */
function roundedTop(x, y, w, h, r) {
  if (h < r * 2) r = h / 2;
  return `M${x},${y + h}L${x},${y + r}Q${x},${y} ${x + r},${y}L${x + w - r},${y}Q${x + w},${y} ${x + w},${y + r}L${x + w},${y + h}Z`;
}

/* ── REVENUE STACKED BAR ── */
function RevenueChart() {
  const W = 820, H = 320, ml = 52, mr = 14, mt = 14, mb = 38;
  const pw = W - ml - mr, ph = H - mt - mb;
  const yMax = 40, yTicks = [0, 10, 20, 30, 40];
  const gw = pw / 12, bw = gw * 0.56, bo = (gw - bw) / 2;
  const ys = ph / yMax, gap = 1.5;
  const els = [];

  for (const t of yTicks) {
    const y = mt + ph - t * ys;
    els.push(<line key={`g${t}`} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="var(--border)" strokeWidth={1} strokeDasharray={t === 0 ? "none" : "3,3"} opacity={t === 0 ? 1 : 0.5} />);
    els.push(<text key={`l${t}`} x={ml - 8} y={y + 4} fill="var(--text-dim)" textAnchor="end" fontSize="10.5" fontFamily="inherit">{t}</text>);
  }

  for (let q = 0; q < 4; q++) {
    const x = ml + q * 3 * gw;
    if (q > 0) els.push(<line key={`qs${q}`} x1={x} y1={mt} x2={x} y2={mt + ph} stroke="var(--border)" strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />);
    els.push(<text key={`ql${q}`} x={x + 1.5 * gw} y={mt - 2} fill="var(--text-dim)" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="inherit" opacity={0.5}>Q{q + 1}</text>);
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
      if (s === 2) {
        els.push(<path key={`b${i}-${s}`} d={roundedTop(x, y + g, bw, h - g, 3)} fill={colors[s]} opacity={0.88} />);
      } else {
        els.push(<rect key={`b${i}-${s}`} x={x} y={y + g} width={bw} height={h - g} fill={colors[s]} opacity={0.88} />);
      }
      baseY = y;
    }

    els.push(<text key={`x${i}`} x={x + bw / 2} y={mt + ph + 22} fill="var(--text-dim)" textAnchor="middle" fontSize="10.5" fontFamily="inherit">{M[i]}</text>);
    els.push(<text key={`v${i}`} x={x + bw / 2} y={baseY - 5} fill="var(--text-dimmer)" textAnchor="middle" fontSize="9.5" fontWeight="600" fontFamily="inherit">{fv(REV_TOTAL[i])}</text>);
  }

  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxHeight: 320 }}>{els}</svg>;
}

/* ── GP BAR CHART ── */
function GPChart() {
  const W = 400, H = 260, ml = 44, mr = 12, mt = 12, mb = 38;
  const pw = W - ml - mr, ph = H - mt - mb;
  const yMax = 8, yTicks = [0, 2, 4, 6, 8];
  const gw = pw / 12, bw = gw * 0.52, bo = (gw - bw) / 2;
  const ys = ph / yMax;
  const avgVal = avg(GP_TOTAL);
  const els = [];

  for (const t of yTicks) {
    const y = mt + ph - t * ys;
    els.push(<line key={`g${t}`} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="var(--border)" strokeWidth={1} strokeDasharray={t === 0 ? "none" : "3,3"} opacity={t === 0 ? 1 : 0.5} />);
    els.push(<text key={`l${t}`} x={ml - 6} y={y + 4} fill="var(--text-dim)" textAnchor="end" fontSize="10" fontFamily="inherit">{t}</text>);
  }

  const avgY = mt + ph - avgVal * ys;
  els.push(<line key="avg" x1={ml} y1={avgY} x2={ml + pw} y2={avgY} stroke="#199e70" strokeWidth={1.5} strokeDasharray="6,4" opacity={0.6} />);
  els.push(<text key="avgl" x={ml + pw + 2} y={avgY + 4} fill="#199e70" fontSize="9" fontWeight="600" fontFamily="inherit">TB</text>);

  for (let i = 0; i < 12; i++) {
    const v = GP_TOTAL[i];
    const x = ml + i * gw + bo;
    const h = v * ys;
    const y = mt + ph - h;
    const above = v >= avgVal;
    els.push(<path key={`b${i}`} d={roundedTop(x, y, bw, h, 2.5)} fill={above ? "#199e70" : "#3987e5"} opacity={0.85} />);
    els.push(<text key={`x${i}`} x={x + bw / 2} y={mt + ph + 20} fill="var(--text-dim)" textAnchor="middle" fontSize="10" fontFamily="inherit">{M[i]}</text>);
    els.push(<text key={`v${i}`} x={x + bw / 2} y={y - 4} fill="var(--text-dimmer)" textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="inherit">{fv(v)}</text>);
  }

  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxHeight: 260 }}>{els}</svg>;
}

/* ── MARGIN LINE CHART ── */
function MarginChart() {
  const W = 400, H = 260, ml = 44, mr = 16, mt = 12, mb = 38;
  const pw = W - ml - mr, ph = H - mt - mb;
  const yMin = 14, yMax = 30, yTicks = [15, 20, 25, 30];
  const ys = ph / (yMax - yMin);
  const els = [];

  for (const t of yTicks) {
    const y = mt + ph - (t - yMin) * ys;
    els.push(<line key={`g${t}`} x1={ml} y1={y} x2={ml + pw} y2={y} stroke="var(--border)" strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />);
    els.push(<text key={`l${t}`} x={ml - 6} y={y + 4} fill="var(--text-dim)" textAnchor="end" fontSize="10" fontFamily="inherit">{t}%</text>);
  }

  const pts = MARGIN.map((v, i) => ({
    x: ml + i * (pw / 11),
    y: mt + ph - (v - yMin) * ys,
    v,
  }));

  const grad = `margin-grad-${Date.now()}`;
  els.push(
    <defs key="defs">
      <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d95926" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#d95926" stopOpacity="0" />
      </linearGradient>
    </defs>
  );

  const areaPath = `M${pts[0].x},${mt + ph} ${pts.map((p) => `L${p.x},${p.y}`).join(" ")} L${pts[11].x},${mt + ph}Z`;
  els.push(<path key="area" d={areaPath} fill={`url(#${grad})`} />);
  els.push(<polyline key="line" points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#d95926" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />);

  pts.forEach((p, i) => {
    els.push(<circle key={`c${i}`} cx={p.x} cy={p.y} r={4} fill="var(--bg, #0a0b12)" stroke="#d95926" strokeWidth={2.5} />);
    els.push(<text key={`v${i}`} x={p.x} y={p.y - 8} fill="var(--text-dimmer)" textAnchor="middle" fontSize="9" fontWeight="600" fontFamily="inherit">{fv(p.v)}%</text>);
    els.push(<text key={`x${i}`} x={p.x} y={mt + ph + 20} fill="var(--text-dim)" textAnchor="middle" fontSize="10" fontFamily="inherit">{M[i]}</text>);
  });

  return <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxHeight: 260 }}>{els}</svg>;
}

/* ── PRODUCT TABLE ── */
function ProductTable() {
  const products = SERIES.map((s) => ({
    name: s.name, color: s.color,
    rev: sum(REV[s.key]), gp: sum(GP[s.key]),
    txn: s.key === "upc" ? sum(TXN) * 0.75 : s.key === "ewallet" ? sum(TXN) * 0.05 : sum(TXN) * 0.20,
  }));
  const totalRev = sum(REV_TOTAL), totalGP = sum(GP_TOTAL);

  return (
    <div className="table-wrap" style={{ border: "1px solid var(--border)", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.6, background: "var(--surface-hover)" }}>
            <th style={TH}>Sản phẩm</th>
            <th style={{ ...TH, textAlign: "right" }}>Doanh thu (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>LN gộp (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>Biên LN</th>
            <th style={{ ...TH, textAlign: "right" }}>Tỷ trọng DT</th>
            <th style={{ ...TH, textAlign: "right" }}>Tỷ trọng LN</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.name} style={{ borderTop: "1px solid var(--border-soft)" }}>
              <td style={TD}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, color: "var(--text)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color, flexShrink: 0 }} />
                  {p.name}
                </div>
              </td>
              <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fv(p.rev)}</td>
              <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600, color: "#199e70" }}>{fv(p.gp)}</td>
              <td className="mono" style={{ ...TD, textAlign: "right" }}>{fv(p.gp / p.rev * 100)}%</td>
              <td style={{ ...TD, textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  <div style={{ width: 50, height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{ width: `${(p.rev / totalRev * 100)}%`, height: "100%", borderRadius: 3, background: p.color }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11 }}>{fv(p.rev / totalRev * 100)}%</span>
                </div>
              </td>
              <td style={{ ...TD, textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  <div style={{ width: 50, height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{ width: `${(p.gp / totalGP * 100)}%`, height: "100%", borderRadius: 3, background: p.color }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11 }}>{fv(p.gp / totalGP * 100)}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid var(--border)" }}>
            <td style={{ ...TD, fontWeight: 700, color: "var(--text)" }}>Tổng cộng</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalRev)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700, color: "#199e70" }}>{fv(totalGP)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalGP / totalRev * 100)}%</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>100%</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── P&L STRUCTURE ── */
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
        const wTotal = Math.max((g.rev / maxRev) * 100, 8);
        const costPct = (g.cost / g.rev) * 100;
        const gpPct = 100 - costPct;
        return (
          <div key={g.label} style={{ padding: "14px 0", borderTop: "1px solid var(--border-soft)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 100, flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{g.label}</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--text-dimmer)", marginTop: 2 }}>{fv(g.rev)} tỷ</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", width: `${wTotal.toFixed(1)}%`, minWidth: 60, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, color: "#fff",
                      background: "#6b6f85",
                      width: `${costPct.toFixed(1)}%`,
                    }}>
                      {costPct > 15 && wTotal > 20 ? `${fv(g.cost)}` : ""}
                    </div>
                    <div style={{
                      height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 600, color: "#fff",
                      background: g.color,
                      width: `${gpPct.toFixed(1)}%`,
                    }}>
                      {gpPct > 15 && wTotal > 20 ? `${fv(g.gp)}` : ""}
                    </div>
                  </div>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: g.color, marginLeft: 10, whiteSpace: "nowrap" }}>
                    Biên LN {fv(g.margin)}%
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 10.5, color: "var(--text-dimmer)", marginTop: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: "#6b6f85" }} />CP: {fv(g.cost)} tỷ ({fv(costPct)}%)
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />LN: {fv(g.gp)} tỷ ({fv(gpPct)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── MONTHLY DETAIL TABLE ── */
function MonthlyDetailTable() {
  const totalRev = sum(REV_TOTAL);
  const totalGP = sum(GP_TOTAL);
  const totalCost = sum(COST_TOTAL);
  const totalTxn = sum(TXN);

  return (
    <div className="table-wrap" style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 780 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, background: "var(--surface-hover)" }}>
            <th style={TH}>Tháng</th>
            <th style={{ ...TH, textAlign: "right" }}>DT (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>CP BĐ (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>LN gộp (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>Biên LN</th>
            <th style={{ ...TH, textAlign: "right" }}>GD (nghìn)</th>
            <th style={{ ...TH, textAlign: "right" }}>DT/GD (tr)</th>
            <th style={{ ...TH, textAlign: "center", width: 120 }}>Tỷ trọng DT</th>
          </tr>
        </thead>
        <tbody>
          {M.map((m, i) => {
            const isQEnd = i === 2 || i === 5 || i === 8 || i === 11;
            return (
              <tr key={i} style={{
                borderTop: "1px solid var(--border-soft)",
                background: isQEnd ? "rgba(57,135,229,0.04)" : undefined,
              }}>
                <td style={{ ...TD, fontWeight: 600, color: "var(--text)" }}>
                  {MF[i]}
                  {isQEnd && <span style={{ fontSize: 9, color: "#3987e5", marginLeft: 6, fontWeight: 700 }}>Q{Math.floor(i / 3) + 1}</span>}
                </td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fv(REV_TOTAL[i])}</td>
                <td className="mono" style={{ ...TD, textAlign: "right" }}>{fv(COST_TOTAL[i])}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600, color: "#199e70" }}>{fv(GP_TOTAL[i])}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", color: MARGIN[i] >= 22 ? "#199e70" : MARGIN[i] >= 19 ? "#d95926" : "var(--text-dimmer)" }}>{fv(MARGIN[i])}%</td>
                <td className="mono" style={{ ...TD, textAlign: "right" }}>{fv(TXN[i], 0)}</td>
                <td className="mono" style={{ ...TD, textAlign: "right" }}>{fv(REV_TOTAL[i] / TXN[i] * 1000, 0)}</td>
                <td style={{ ...TD, textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                    <div style={{ width: 60, height: 5, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                      <div style={{ width: `${(REV_TOTAL[i] / Math.max(...REV_TOTAL) * 100)}%`, height: "100%", borderRadius: 3, background: "#3987e5" }} />
                    </div>
                    <span className="mono" style={{ fontSize: 10, minWidth: 28 }}>{fv(REV_TOTAL[i] / totalRev * 100)}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid var(--border)" }}>
            <td style={{ ...TD, fontWeight: 700, color: "var(--text)" }}>Tổng FY 2026</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalRev)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalCost)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700, color: "#199e70" }}>{fv(totalGP)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalGP / totalRev * 100)}%</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalTxn, 0)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(totalRev / totalTxn * 1000, 0)}</td>
            <td className="mono" style={{ ...TD, textAlign: "center", fontWeight: 700 }}>100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── GP BY MERCHANT CHART ── */
function GPMerchantChart() {
  const sorted = MERCH.filter((m) => m.gp > 0.005).sort((a, b) => b.gp - a.gp);
  const maxGP = sorted[0].gp;
  const totalGP = sum(GP_TOTAL);

  return (
    <div style={{ padding: "8px 0" }}>
      {sorted.map((m, idx) => {
        const w = Math.max((m.gp / maxGP) * 100, 0.5);
        const pct = (m.gp / totalGP) * 100;
        return (
          <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderTop: idx > 0 ? "1px solid var(--border-soft)" : "none" }}>
            <div style={{ width: 24, fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textAlign: "right", flexShrink: 0 }}>#{idx + 1}</div>
            <div style={{ width: 110, flexShrink: 0, textAlign: "right", fontSize: 12.5, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
            <div style={{ flex: 1, height: 22, position: "relative", borderRadius: 4, overflow: "hidden", background: "var(--border-soft)" }}>
              <div style={{ height: "100%", borderRadius: 4, width: `${w.toFixed(1)}%`, background: `linear-gradient(90deg, ${m.c}cc, ${m.c})`, transition: "width 0.3s" }} />
            </div>
            <div className="mono" style={{ minWidth: 65, fontSize: 12, fontWeight: 700, color: "var(--text)", textAlign: "right" }}>
              {m.gp >= 1 ? fv(m.gp) : fv(m.gp, 2)} tỷ
            </div>
            <div className="mono" style={{ minWidth: 40, fontSize: 11, color: m.c, fontWeight: 600, textAlign: "right" }}>
              {fv(pct)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── MERCHANT DETAIL TABLE ── */
function MerchantTable() {
  const totalRev = sum(REV_TOTAL);
  const totalCost = MERCH.reduce((s, m) => s + m.cost, 0);
  const totalGP = sum(GP_TOTAL);

  return (
    <div className="table-wrap" style={{ marginTop: 14, border: "1px solid var(--border)", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 700 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--text-dim)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, background: "var(--surface-hover)" }}>
            <th style={TH}>Merchant</th>
            <th style={{ ...TH, textAlign: "right" }}>Doanh thu (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>Chi phí BĐ (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>LN gộp (tỷ)</th>
            <th style={{ ...TH, textAlign: "right" }}>Biên LN</th>
            <th style={{ ...TH, textAlign: "right" }}>Tỷ trọng DT</th>
            <th style={{ ...TH, textAlign: "right" }}>Tỷ trọng LN</th>
          </tr>
        </thead>
        <tbody>
          {GROUPS.map((g) => {
            const items = MERCH.filter((m) => m.grp === g.key);
            const gRev = items.reduce((s, m) => s + m.rev, 0);
            const gCost = items.reduce((s, m) => s + m.cost, 0);
            const gGP = gRev - gCost;
            return [
              <tr key={`h-${g.key}`} style={{ background: "var(--surface-hover)" }}>
                <td colSpan={7} style={{ padding: "8px 12px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--text-dim)", borderBottom: "1.5px solid var(--border)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />
                    {g.label}
                    <span className="mono" style={{ fontWeight: 400, fontSize: 10, marginLeft: 6 }}>{fv(gRev)} tỷ DT · {fv(gGP)} tỷ LN</span>
                  </span>
                </td>
              </tr>,
              ...items.map((m) => {
                const margin = m.rev > 0 ? `${fv(m.gp / m.rev * 100)}%` : "—";
                const share = m.rev > 0 ? `${fv(m.rev / totalRev * 100)}%` : "—";
                const gpShare = m.gp > 0 ? `${fv(m.gp / totalGP * 100)}%` : "—";
                const revStr = m.rev > 0 ? (m.rev >= 1 ? fv(m.rev) : fv(m.rev, 3)) : "—";
                const gpStr = m.costOnly ? fv(m.gp, 2) : (m.gp >= 1 ? fv(m.gp) : fv(m.gp, 3));
                return (
                  <tr key={m.name} style={{ borderTop: "1px solid var(--border-soft)", opacity: m.costOnly ? 0.55 : 1 }}>
                    <td style={TD}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 500, color: "var(--text)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: 1.5, background: m.c, flexShrink: 0 }} />
                        {m.name}
                      </div>
                    </td>
                    <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{revStr}</td>
                    <td className="mono" style={{ ...TD, textAlign: "right" }}>{m.cost >= 1 ? fv(m.cost) : fv(m.cost, 2)}</td>
                    <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 600, color: m.gp > 0 ? "#199e70" : "#fb7185" }}>{gpStr}</td>
                    <td className="mono" style={{ ...TD, textAlign: "right" }}>{margin}</td>
                    <td className="mono" style={{ ...TD, textAlign: "right" }}>{share}</td>
                    <td className="mono" style={{ ...TD, textAlign: "right" }}>{gpShare}</td>
                  </tr>
                );
              }),
              <tr key={`s-${g.key}`} style={{ borderTop: "1.5px solid var(--border)", background: "var(--surface-hover)" }}>
                <td style={{ ...TD, fontWeight: 700, color: g.color }}>Subtotal {g.label}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(gRev)}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(gCost)}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700, color: "#199e70" }}>{fv(gGP)}</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(gGP / gRev * 100)}%</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(gRev / totalRev * 100)}%</td>
                <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 700 }}>{fv(gGP / totalGP * 100)}%</td>
              </tr>,
            ];
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid var(--border)" }}>
            <td style={{ ...TD, fontWeight: 800, color: "var(--text)" }}>Tổng cộng</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 800 }}>{fv(totalRev)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 800 }}>{fv(totalCost)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 800, color: "#199e70" }}>{fv(totalGP)}</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 800 }}>{fv(totalGP / totalRev * 100)}%</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 800 }}>100%</td>
            <td className="mono" style={{ ...TD, textAlign: "right", fontWeight: 800 }}>100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

const TH = { padding: "10px 12px" };
const TD = { padding: "10px 12px", color: "var(--text-dimmer)" };
