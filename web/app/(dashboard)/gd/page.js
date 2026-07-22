"use client";

import { useState } from "react";
import { getLoaReport } from "@/lib/metrics";
import { ReportHeader } from "@/components/ui/PageHeader";
import Icon from "@/components/ui/Icon";
import LoaStatCard from "@/components/ui/LoaStatCard";
import SoundboxIcon from "@/components/ui/SoundboxIcon";

const ACCENT = "#f59e0b";
const ICONS = {
  users: ["M17 20a4 4 0 0 0-10 0", "M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M22 20a4 4 0 0 0-6.3-3.3", "M16 4.3a4 4 0 0 1 0 7.4"],
  gauge: ["M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z", "M12 12 16 8", "M12 8v1"],
  coin: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v10", "M9 9.5c0-1.4 1.3-2.5 3-2.5s3 1 3 2.2c0 2.8-6 1.3-6 4.1 0 1.2 1.3 2.2 3 2.2s3-1.1 3-2.5"],
};

const FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "processing", label: "Đang triển khai" },
  { value: "done", label: "Hoàn thành" },
];

export default function LoaPage() {
  const [filter, setFilter] = useState("all");
  const r = getLoaReport();
  const rows = filter === "all" ? r.rows : r.rows.filter((row) => row.status === filter);

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · DV LOA THANH TOÁN"
        title="Báo cáo theo Nguồn khách hàng"
        subtitle="Số thiết bị bán ra, doanh thu và lợi nhuận gộp theo từng nguồn khai thác khách hàng"
      />

      {/* Signal/broadcast hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 18,
          border: `1px solid ${ACCENT}33`,
          background: `linear-gradient(120deg, ${ACCENT}1e, rgba(255,255,255,0.02) 55%), radial-gradient(500px 260px at 100% 0%, ${ACCENT}22, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))`,
          padding: "26px 28px",
        }}
      >
        <div style={{ position: "absolute", top: -20, right: 10, opacity: 0.16 }}>
          <SoundboxIcon size={130} color={ACCENT} />
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 54, height: 54, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #0a0b12)`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              boxShadow: `0 8px 24px ${ACCENT}44`,
            }}
          >
            <SoundboxIcon size={26} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 10.5, color: ACCENT, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: 800 }}>Rollout · Thiết bị Loa thanh toán</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
              <span className="mono" style={{ fontSize: 34, fontWeight: 800, color: "#ecedf5", letterSpacing: -1 }}>{r.totalUnitsStr}</span>
              <span style={{ fontSize: 13, color: "#8a8fa6", fontWeight: 600 }}>thiết bị đã bán ra · {r.kpiCards[0].val} nguồn khách hàng</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid-4">
        <LoaStatCard icon={<Icon paths={ICONS.users} size={17} stroke={ACCENT} />} accent={ACCENT} label="Tổng nguồn KH" val={r.kpiCards[0].val} sub={r.kpiCards[0].sub} />
        <LoaStatCard icon={<SoundboxIcon size={18} color={ACCENT} waves={false} />} accent={ACCENT} label="Thiết bị bán ra" val={r.kpiCards[1].val} sub={r.kpiCards[1].sub} />
        <LoaStatCard icon={<Icon paths={ICONS.coin} size={17} stroke={ACCENT} />} accent={ACCENT} label="Doanh thu (chưa VAT)" val={r.kpiCards[2].val} sub={r.kpiCards[2].sub} />
        <LoaStatCard icon={<Icon paths={ICONS.gauge} size={17} stroke={ACCENT} />} accent={ACCENT} label="Đang triển khai" val={r.kpiCards[3].val} sub={r.kpiCards[3].sub} />
      </div>

      <section className="card" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5" }}>Chi tiết theo nguồn khách hàng</div>
            <div style={{ fontSize: 11, color: "#8a8fa6", marginTop: 2 }}>Theo đúng thứ tự sheet nguồn · Số liệu chưa gồm VAT</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  fontSize: 12, fontWeight: 700, padding: "7px 13px", borderRadius: 999,
                  border: `1px solid ${filter === f.value ? ACCENT : "rgba(255,255,255,0.12)"}`,
                  background: filter === f.value ? ACCENT : "transparent",
                  color: filter === f.value ? "#0a0b12" : "#8a8fa6",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 760 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                <th style={{ padding: "9px 10px", textAlign: "right", color: "#8a8fa6", fontWeight: 700, fontSize: 10.5, width: 40 }}>STT</th>
                <th style={{ padding: "9px 10px", textAlign: "left", color: "#8a8fa6", fontWeight: 700, fontSize: 10.5 }}>Nguồn khách hàng</th>
                <th style={{ padding: "9px 10px", textAlign: "right", color: "#8a8fa6", fontWeight: 700, fontSize: 10.5 }}>Số lượng thiết bị</th>
                <th style={{ padding: "9px 10px", textAlign: "right", color: "#8a8fa6", fontWeight: 700, fontSize: 10.5 }}>Doanh thu</th>
                <th style={{ padding: "9px 10px", textAlign: "right", color: "#8a8fa6", fontWeight: 700, fontSize: 10.5 }}>Lợi nhuận gộp</th>
                <th style={{ padding: "9px 10px", textAlign: "left", color: "#8a8fa6", fontWeight: 700, fontSize: 10.5 }}>Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.stt}>
                  <td className="mono" style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "right", color: "#8a8fa6" }}>{row.stt}</td>
                  <td style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", fontWeight: 700, color: "#ecedf5" }}>{row.name}</td>
                  <td className="mono" style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "right", fontWeight: 700 }}>{row.unitsStr}</td>
                  <td className="mono" style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "right", fontWeight: 800, color: ACCENT }}>{row.revenueStr}</td>
                  <td className="mono" style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "right", color: "#c9cbd8" }}>{row.grossProfitStr}</td>
                  <td style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 7, color: row.statusColor, background: row.statusBg }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: row.statusColor }} />
                      {row.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td></td>
                <td style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.09)", fontWeight: 800, color: "#8a8fa6" }}>Tổng cộng</td>
                <td className="mono" style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.09)", textAlign: "right", fontWeight: 800 }}>{r.totalUnitsStr}</td>
                <td className="mono" style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.09)", textAlign: "right", fontWeight: 800, color: ACCENT }}>{r.totalRevenueStr}</td>
                <td className="mono" style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.09)", textAlign: "right", fontWeight: 800, color: "#c9cbd8" }}>{r.totalGrossProfitStr}</td>
                <td style={{ borderTop: "1px solid rgba(255,255,255,0.09)" }}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </>
  );
}
