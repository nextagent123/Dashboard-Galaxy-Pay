import { getLoaReport } from "@/lib/metrics";
import { ReportHeader } from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import LoaGroupedBar from "@/components/charts/LoaGroupedBar";
import LoaComboTrend from "@/components/charts/LoaComboTrend";

export default function LoaPage() {
  const r = getLoaReport();

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · DV LOA THANH TOÁN"
        title="Báo cáo Dịch vụ Loa thanh toán"
        subtitle="Khách hàng · Loa deployed · GTGD — Chi tiết theo tháng 2026"
      />

      <div className="grid-4">
        {r.kpiCards.map((k, i) => (
          <StatCard key={i} {...k} />
        ))}
      </div>

      <section className="card" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5" }}>So sánh Khách hàng &amp; Loa deployed theo phân khúc</div>
            <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 2 }}>Snapshot cuối kỳ T6/2026 · Thanh mờ = số KH · Thanh đậm = số loa</div>
          </div>
        </div>
        <LoaGroupedBar customers={r.customers} />
      </section>

      <section className="card" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5" }}>Xu hướng GTGD (stacked) &amp; số KH theo tháng</div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#a7abbe", flexWrap: "wrap" }}>
            {r.legendItems.map((l) => (
              <span key={l.name} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 11, height: 9, background: l.color, borderRadius: 2 }} />{l.name}</span>
            ))}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 14, height: 2, background: "#fbbf24" }} />Số KH</span>
          </div>
        </div>
        <LoaComboTrend months={r.months} customers={r.customers} />
      </section>

      <section className="card" style={{ padding: "22px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5", marginBottom: 12 }}>Chi tiết theo KH — Số KH · Số loa · GTGD</div>
        <div className="table-wrap" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, minWidth: 1000 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                <th style={{ padding: "9px 10px", textAlign: "left", color: "#8a8fa6", fontWeight: 700, fontSize: 10.5 }}>Khách hàng</th>
                {r.months.map((m) => (
                  <th key={m} style={{ padding: "9px 6px", textAlign: "center", color: "#c8ccd9", fontWeight: 700, fontSize: 10.5 }}>{m}</th>
                ))}
                <th style={{ padding: "9px 10px", textAlign: "center", color: "#fbbf24", fontWeight: 800, fontSize: 10.5 }}>GTGD YTD</th>
              </tr>
            </thead>
            <tbody>
              {r.detailRows.map((row) => (
                <tr key={row.name}>
                  <td style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.06)", color: row.color, fontWeight: 700 }}>{row.name}</td>
                  {row.monthCells.map((c, i) => (
                    <td key={i} className="mono" style={{ padding: "7px 4px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", lineHeight: 1.35 }}>
                      <div style={{ color: "#ecedf5", fontWeight: 700, fontSize: 11 }}>{c.gtgd || "–"}</div>
                      {c.loas !== "" && <div style={{ color: "#c3b9ff", fontSize: 9.5 }}>{c.loas} loa</div>}
                      {c.cust !== "" && <div style={{ color: "#8a8fa6", fontSize: 9.5 }}>{c.cust} KH</div>}
                    </td>
                  ))}
                  <td className="mono" style={{ padding: 10, textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(251,191,36,0.08)", color: "#fbbf24", fontWeight: 800 }}>{row.totalGtgd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: "#565a6e", marginTop: 8 }}>Mỗi ô theo thứ tự: GTGD (Tỷ) · Số loa · Số KH</div>
      </section>
    </>
  );
}
