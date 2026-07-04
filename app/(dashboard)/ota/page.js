import { getOtaReport } from "@/lib/metrics";
import { ReportHeader } from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import OtaDonutChart from "@/components/charts/OtaDonutChart";
import OtaBarCompare from "@/components/charts/OtaBarCompare";
import StackedMonthlyChart from "@/components/charts/StackedMonthlyChart";

export default function OtaPage() {
  const r = getOtaReport();

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · DỊCH VỤ OTA"
        title="Báo cáo Dịch vụ OTA"
        subtitle="Số lượng & Giá trị giao dịch — Chi tiết theo khách hàng · YTD 2026"
      />

      <div className="grid-4">
        {r.kpiCards.map((k, i) => (
          <StatCard key={i} {...k} />
        ))}
      </div>

      <section className="grid-ota-top card" style={{ padding: "22px 24px" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5", marginBottom: 10 }}>Cơ cấu GTGD theo KH</div>
          <OtaDonutChart customers={r.customers} grandGTGD={r.grandGTGD} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {r.legendItems.map((l) => (
              <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#c8ccd9" }}>
                <span style={{ width: 12, height: 10, background: l.color, borderRadius: 2 }} />
                <span style={{ flex: 1 }}>{l.name}</span>
                <span className="mono" style={{ color: l.color, fontWeight: 700 }}>{l.share}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5", marginBottom: 10 }}>So sánh SLGD &amp; GTGD theo KH</div>
          <OtaBarCompare customers={r.customers} />
        </div>
      </section>

      <section className="card" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5" }}>Xu hướng GTGD theo tháng (stacked by KH)</div>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#a7abbe", flexWrap: "wrap" }}>
            {r.legendItems.map((l) => (
              <span key={l.name} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 11, height: 9, background: l.color, borderRadius: 2 }} />{l.name}</span>
            ))}
          </div>
        </div>
        <StackedMonthlyChart months={r.months} customers={r.customers} valueKey="gtgd" />
      </section>

      <section className="card" style={{ padding: "22px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5", marginBottom: 12 }}>Chi tiết SLGD / GTGD theo KH &amp; tháng</div>
        <div className="table-wrap" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, minWidth: 900 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                <th style={{ padding: "9px 10px", textAlign: "left", color: "#8a8fa6", fontWeight: 700, fontSize: 10.5 }}>Khách hàng</th>
                {r.months.map((m) => (
                  <th key={m} style={{ padding: "9px 6px", textAlign: "center", color: "#c8ccd9", fontWeight: 700, fontSize: 10.5 }}>{m}</th>
                ))}
                <th style={{ padding: "9px 10px", textAlign: "center", color: "#fbbf24", fontWeight: 800, fontSize: 10.5 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {r.detailRows.map((row) => (
                <tr key={row.name}>
                  <td style={{ padding: 10, borderTop: "1px solid rgba(255,255,255,0.06)", color: row.color, fontWeight: 700 }}>{row.name}</td>
                  {row.monthCells.map((c, i) => (
                    <td key={i} className="mono" style={{ padding: "8px 4px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", lineHeight: 1.4 }}>
                      <div style={{ color: "#ecedf5", fontWeight: 600 }}>{c.gtgd}</div>
                      <div style={{ color: "#8a8fa6", fontSize: 10 }}>{c.slgd}</div>
                    </td>
                  ))}
                  <td className="mono" style={{ padding: "8px 10px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(251,191,36,0.08)" }}>
                    <div style={{ color: "#fbbf24", fontWeight: 800 }}>{row.totalGtgd}</div>
                    <div style={{ color: "#8a8fa6", fontSize: 10 }}>{row.totalSlgd}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: "#565a6e", marginTop: 8 }}>Mỗi ô: GTGD (Tỷ) trên · SLGD (Giao dịch) dưới</div>
      </section>
    </>
  );
}
