"use client";

import { useState } from "react";
import { getOtaReport, getOtaAgentOptions, getOtaPeriodOptions } from "@/lib/metrics";
import { vnLoc } from "@/lib/format";
import { ReportHeader } from "@/components/ui/PageHeader";
import TicketStatCard from "@/components/ui/TicketStatCard";
import PlaneIcon from "@/components/ui/PlaneIcon";
import SimpleLineChart from "@/components/charts/SimpleLineChart";
import SimpleBarChart from "@/components/charts/SimpleBarChart";

const ICONS = {
  doc: ["M6 3h9l4 4v14H6z", "M15 3v4h4", "M9 12h6M9 16h6"],
  check: ["M12 2a10 10 0 1 0 0.01 0Z", "M8 12l3 3 5-6"],
  cancel: ["M12 2a10 10 0 1 0 0.01 0Z", "M9 9l6 6M15 9l-6 6"],
  wallet: ["M3 7h18v12H3z", "M3 7l3-4h10l3 4", "M16.5 13a1.5 1.5 0 1 0 0.01 0Z"],
};

const ACCENT = "#38bdf8";

export default function OtaPage() {
  const agentOptions = getOtaAgentOptions();
  const [agent, setAgent] = useState(agentOptions[0]?.value || "");
  const periodOptions = getOtaPeriodOptions(agent);
  const [periodKey, setPeriodKey] = useState(periodOptions[0]?.value || "");
  const r = getOtaReport(agent, periodKey || undefined);

  function handleAgentChange(next) {
    setAgent(next);
    const nextPeriods = getOtaPeriodOptions(next);
    setPeriodKey(nextPeriods[0]?.value || "");
  }

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · DỊCH VỤ OTA"
        title="Báo cáo Dịch vụ OTA"
        subtitle="Số lượng & Giá trị giao dịch vé máy bay — Chi tiết theo đối tác"
      />

      {/* Boarding-pass style hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 18,
          border: `1px solid ${ACCENT}33`,
          background: `linear-gradient(120deg, ${ACCENT}22, rgba(255,255,255,0.02) 55%), radial-gradient(500px 260px at 100% 0%, ${ACCENT}22, transparent 60%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005))`,
        }}
      >
        <div style={{ position: "absolute", top: -18, right: -10, opacity: 0.14, transform: "rotate(35deg)" }}>
          <PlaneIcon size={140} color={ACCENT} />
        </div>
        <div style={{ position: "relative" }} className="ota-hero-grid">
          <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 46, height: 46, borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #0a0b12)`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: `0 8px 20px ${ACCENT}44`,
                }}
              >
                <PlaneIcon size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: ACCENT, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: 800 }}>Boarding · Đối tác OTA</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "#ecedf5", marginTop: 2 }}>{r.agent}</div>
                <div style={{ fontSize: 11.5, color: "#8a8fa6", marginTop: 2 }}>Mã đối tác: {r.agentCode}</div>
              </div>
            </div>
          </div>

          {/* Dashed perforation divider */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "22px 26px",
              borderLeft: `1px dashed ${ACCENT}55`,
            }}
            className="ota-filter-col"
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 140 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: "#8a8fa6", textTransform: "uppercase" }}>Đối tác</span>
              <select value={agent} onChange={(e) => handleAgentChange(e.target.value)} style={selectStyle}>
                {agentOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 140 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, color: "#8a8fa6", textTransform: "uppercase" }}>Kỳ báo cáo</span>
              <select value={periodKey} onChange={(e) => setPeriodKey(e.target.value)} style={selectStyle}>
                {periodOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      <div className="grid-4">
        <TicketStatCard icon={ICONS.doc} iconBg={`${ACCENT}22`} iconColor={ACCENT} accent={ACCENT} label="Total Bookings" val={r.kpiCards[0].val} sub={r.kpiCards[0].sub} />
        <TicketStatCard icon={ICONS.check} iconBg="rgba(52,211,153,0.16)" iconColor="#34d399" accent="#34d399" label="Successful Bookings" val={r.kpiCards[1].val} sub={r.kpiCards[1].sub} />
        <TicketStatCard icon={ICONS.cancel} iconBg="rgba(251,113,133,0.16)" iconColor="#fb7185" accent="#fb7185" label="Cancelled Bookings" val={r.kpiCards[2].val} sub={r.kpiCards[2].sub} />
        <TicketStatCard icon={ICONS.wallet} iconBg="rgba(251,191,36,0.16)" iconColor="#fbbf24" accent="#fbbf24" label="Total Revenue" val={r.kpiCards[3].val} sub={r.kpiCards[3].sub} />
      </div>

      <section className="card" style={{ padding: "22px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5", marginBottom: 4 }}>Booking Count</div>
        <div style={{ fontSize: 11.5, color: "#8a8fa6", marginBottom: 6 }}>Số lượng đơn đặt theo ngày · {r.periodLabel}</div>
        <SimpleLineChart labels={r.labels} values={r.dailyBookings} color={ACCENT} />
      </section>

      <section className="card" style={{ padding: "22px 24px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#ecedf5", marginBottom: 4 }}>Revenue Report</div>
        <div style={{ fontSize: 11.5, color: "#8a8fa6", marginBottom: 6 }}>Doanh thu theo ngày (VND) · {r.periodLabel}</div>
        <SimpleBarChart labels={r.labels} values={r.dailyRevenue} color={ACCENT} formatValue={(v) => (v >= 1e6 ? vnLoc(v / 1e6, 0) + "tr" : vnLoc(v, 0))} />
      </section>

      <div style={{ fontSize: 11, color: "#565a6e" }}>
        Số liệu chi tiết theo ngày được quy đổi tỷ lệ từ báo cáo gốc để khớp đúng 4 số tổng đã xác nhận (Total/Successful/Cancelled Bookings, Total Revenue) — sẽ cập nhật số chính xác từng ngày khi có dữ liệu gốc.
      </div>
    </>
  );
}

const selectStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 9,
  padding: "9px 10px",
  fontSize: 12.5,
  color: "#ecedf5",
  outline: "none",
  cursor: "pointer",
};
