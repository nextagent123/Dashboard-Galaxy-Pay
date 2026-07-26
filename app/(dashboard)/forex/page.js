"use client";

import { useState, useEffect, useCallback } from "react";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

const BASE = "VND";
const MAJOR_CODES = ["USD", "EUR", "GBP", "JPY", "CNY", "KRW", "SGD", "THB", "AUD", "CAD", "CHF", "HKD"];

const CURRENCY_META = {
  USD: { name: "Đô la Mỹ", flag: "🇺🇸" },
  EUR: { name: "Euro", flag: "🇪🇺" },
  GBP: { name: "Bảng Anh", flag: "🇬🇧" },
  JPY: { name: "Yên Nhật", flag: "🇯🇵" },
  CNY: { name: "Nhân dân tệ", flag: "🇨🇳" },
  KRW: { name: "Won Hàn Quốc", flag: "🇰🇷" },
  SGD: { name: "Đô la Singapore", flag: "🇸🇬" },
  THB: { name: "Baht Thái", flag: "🇹🇭" },
  AUD: { name: "Đô la Úc", flag: "🇦🇺" },
  CAD: { name: "Đô la Canada", flag: "🇨🇦" },
  CHF: { name: "Franc Thụy Sĩ", flag: "🇨🇭" },
  HKD: { name: "Đô la Hồng Kông", flag: "🇭🇰" },
  TWD: { name: "Đô la Đài Loan", flag: "🇹🇼" },
  MYR: { name: "Ringgit Malaysia", flag: "🇲🇾" },
  IDR: { name: "Rupiah Indonesia", flag: "🇮🇩" },
  PHP: { name: "Peso Philippines", flag: "🇵🇭" },
  INR: { name: "Rupee Ấn Độ", flag: "🇮🇳" },
  NZD: { name: "Đô la New Zealand", flag: "🇳🇿" },
  SEK: { name: "Krona Thụy Điển", flag: "🇸🇪" },
  NOK: { name: "Krone Na Uy", flag: "🇳🇴" },
  DKK: { name: "Krone Đan Mạch", flag: "🇩🇰" },
};

function fmtVND(n) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1000) return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
  return n.toLocaleString("vi-VN", { maximumFractionDigits: 4 });
}

function pctChange(cur, prev) {
  if (!prev || !cur) return null;
  return ((cur - prev) / prev) * 100;
}

function dateStr(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function isoDate(d) {
  return d.toISOString().split("T")[0];
}

const API_BASE = "https://api.frankfurter.dev";

async function fetchRates(base, date) {
  const url = date
    ? `${API_BASE}/${date}?base=${base}`
    : `${API_BASE}/latest?base=${base}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function fetchTimeSeries(base, target, startDate, endDate) {
  const url = `${API_BASE}/${startDate}..${endDate}?base=${base}&symbols=${target}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export default function ForexPage() {
  const [rates, setRates] = useState(null);
  const [prevRates, setPrevRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCcy, setSelectedCcy] = useState("USD");
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartRange, setChartRange] = useState("1M");

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const [current, prev] = await Promise.all([
        fetchRates("USD", null),
        fetchRates("USD", isoDate(yesterday)),
      ]);

      setRates(current.rates);
      setPrevRates(prev.rates);
      setLastUpdate(current.date);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRates(); }, [loadRates]);

  const loadChart = useCallback(async (ccy, range) => {
    setChartLoading(true);
    try {
      const end = new Date();
      const start = new Date();
      if (range === "1W") start.setDate(end.getDate() - 7);
      else if (range === "1M") start.setMonth(end.getMonth() - 1);
      else if (range === "3M") start.setMonth(end.getMonth() - 3);
      else if (range === "6M") start.setMonth(end.getMonth() - 6);
      else if (range === "1Y") start.setFullYear(end.getFullYear() - 1);

      const data = await fetchTimeSeries("USD", ccy, isoDate(start), isoDate(end));
      if (data.rates) {
        const points = Object.entries(data.rates)
          .map(([date, r]) => ({ date, value: r[ccy] }))
          .sort((a, b) => a.date.localeCompare(b.date));
        setChartData(points);
      }
    } catch {
      setChartData(null);
    } finally {
      setChartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCcy && selectedCcy !== "USD") {
      loadChart(selectedCcy, chartRange);
    } else {
      setChartData(null);
    }
  }, [selectedCcy, chartRange, loadChart]);

  const vndRate = rates?.VND;
  const prevVndRate = prevRates?.VND;

  const rows = rates
    ? MAJOR_CODES.map((code) => {
        if (code === "USD") {
          const vnd = vndRate;
          const prevVnd = prevVndRate;
          const chg = pctChange(vnd, prevVnd);
          return { code, vnd, prevVnd, chg };
        }
        const ratePerUSD = rates[code];
        const prevRatePerUSD = prevRates?.[code];
        if (!ratePerUSD) return null;
        const vnd = vndRate / ratePerUSD;
        const prevVnd = prevVndRate && prevRatePerUSD ? prevVndRate / prevRatePerUSD : null;
        const chg = pctChange(vnd, prevVnd);
        return { code, vnd, prevVnd, chg };
      }).filter(Boolean)
    : [];

  const allCodes = rates
    ? Object.keys(rates).filter((c) => c !== "VND").sort()
    : [];

  const filteredAll = allCodes
    .filter((code) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const meta = CURRENCY_META[code];
      return code.toLowerCase().includes(q) || (meta && meta.name.toLowerCase().includes(q));
    })
    .map((code) => {
      const ratePerUSD = code === "USD" ? 1 : rates[code];
      if (!ratePerUSD) return null;
      const vnd = vndRate / ratePerUSD;
      const prevRatePerUSD = code === "USD" ? 1 : prevRates?.[code];
      const prevVnd = prevVndRate && prevRatePerUSD ? prevVndRate / prevRatePerUSD : null;
      const chg = pctChange(vnd, prevVnd);
      return { code, vnd, prevVnd, chg };
    })
    .filter(Boolean);

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · THỊ TRƯỜNG NGOẠI HỐI"
        title="Báo cáo Tỷ giá Ngoại tệ"
        subtitle="Tỷ giá quy đổi sang VND theo thời gian thực · Nguồn: Frankfurter / ECB"
        right={
          <DateBadge>
            {lastUpdate ? `Cập nhật: ${lastUpdate}` : "Đang tải..."}
          </DateBadge>
        }
      />

      {error && (
        <section style={{
          background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.3)",
          borderRadius: 14, padding: "16px 22px", color: "#fb7185", fontSize: 13,
        }}>
          Không thể tải dữ liệu tỷ giá: {error}
          <button
            onClick={loadRates}
            style={{
              marginLeft: 14, padding: "6px 14px", borderRadius: 8, border: "1px solid #fb7185",
              background: "transparent", color: "#fb7185", cursor: "pointer", fontSize: 12, fontWeight: 700,
            }}
          >
            Thử lại
          </button>
        </section>
      )}

      {/* Hero — USD/VND */}
      <section
        style={{
          position: "relative", overflow: "hidden", borderRadius: 20,
          border: "1px solid rgba(124,108,255,0.28)",
          background: "radial-gradient(680px 300px at 88% -10%, rgba(52,211,153,0.18), transparent 60%), radial-gradient(620px 320px at 6% 120%, rgba(124,108,255,0.22), transparent 55%), linear-gradient(160deg, rgba(124,108,255,0.14), rgba(255,255,255,0.012))",
          padding: "28px 30px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ minWidth: 260 }}>
            <div style={{ fontSize: 11, letterSpacing: 1.6, fontWeight: 800, color: "#b9a8ff", textTransform: "uppercase" }}>
              🇺🇸 USD / VND 🇻🇳
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
              <span className="mono" style={{
                fontSize: 46, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1,
                background: "linear-gradient(120deg,#fff,#c3b9ff)", WebkitBackgroundClip: "text",
                backgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {loading ? "—" : fmtVND(vndRate)}
              </span>
              <span style={{ fontSize: 14, color: "#8a8fa6", fontWeight: 600 }}>VND</span>
              {!loading && vndRate && prevVndRate && (() => {
                const chg = pctChange(vndRate, prevVndRate);
                if (chg == null) return null;
                const up = chg >= 0;
                return (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 800,
                    padding: "5px 11px", borderRadius: 9,
                    color: up ? "#fb7185" : "#34d399",
                    background: up ? "rgba(251,113,133,0.14)" : "rgba(52,211,153,0.14)",
                  }}>
                    {up ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%
                  </span>
                );
              })()}
            </div>
            <div style={{ fontSize: 13, color: "#a7abbe", marginTop: 12 }}>
              1 USD = {loading ? "..." : fmtVND(vndRate)} VND · Tỷ giá liên ngân hàng ECB
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { code: "EUR", color: "#7c6cff" },
              { code: "GBP", color: "#34d399" },
              { code: "JPY", color: "#fbbf24" },
              { code: "CNY", color: "#f87171" },
            ].map(({ code, color }) => {
              const row = rows.find((r) => r.code === code);
              const meta = CURRENCY_META[code];
              return (
                <div
                  key={code}
                  onClick={() => setSelectedCcy(code)}
                  style={{
                    background: selectedCcy === code ? `linear-gradient(135deg,${color}22,${color}08)` : "rgba(0,0,0,0.35)",
                    border: selectedCcy === code ? `1px solid ${color}66` : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: "12px 16px", minWidth: 120, cursor: "pointer",
                    transition: "border-color 0.18s",
                  }}
                >
                  <div style={{ fontSize: 10, color: "#8a8fa6", letterSpacing: 0.8 }}>
                    {meta?.flag} {code}/VND
                  </div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: "#ecedf5", marginTop: 4 }}>
                    {loading || !row ? "—" : fmtVND(row.vnd)}
                  </div>
                  {row?.chg != null && (
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: row.chg >= 0 ? "#fb7185" : "#34d399", marginTop: 2 }}>
                      {row.chg >= 0 ? "▲" : "▼"} {Math.abs(row.chg).toFixed(2)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Chart — selected currency */}
      {selectedCcy && selectedCcy !== "USD" && (
        <SectionCard
          title={`Biểu đồ ${CURRENCY_META[selectedCcy]?.flag || ""} ${selectedCcy}/VND`}
          subtitle={`Xu hướng tỷ giá ${CURRENCY_META[selectedCcy]?.name || selectedCcy} trong khoảng thời gian đã chọn`}
          right={
            <div style={{ display: "flex", gap: 6 }}>
              {["1W", "1M", "3M", "6M", "1Y"].map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  style={{
                    border: "none", fontSize: 11.5, fontWeight: 700, padding: "6px 12px", borderRadius: 8,
                    background: chartRange === r ? "linear-gradient(135deg,#7c6cff,#5b4fd9)" : "rgba(255,255,255,0.04)",
                    color: chartRange === r ? "#fff" : "#a7abbe", cursor: "pointer",
                    transition: "all .2s",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          }
        >
          {chartLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#8a8fa6", fontSize: 13 }}>Đang tải biểu đồ...</div>
          ) : chartData && chartData.length > 1 ? (
            <MiniLineChart data={chartData} color="#7c6cff" />
          ) : (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#8a8fa6", fontSize: 13 }}>Không có dữ liệu biểu đồ</div>
          )}
        </SectionCard>
      )}

      {/* Major currencies table */}
      <SectionCard
        title="Tỷ giá các ngoại tệ chính"
        subtitle={`${rows.length} loại tiền tệ chủ chốt · Quy đổi sang VND`}
      >
        <div className="table-wrap" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 600 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8a8fa6", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, background: "rgba(255,255,255,0.03)" }}>
                <th style={thStyle}>Ngoại tệ</th>
                <th style={thStyle}>Tên</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Tỷ giá (VND)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Thay đổi</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#8a8fa6" }}>Đang tải dữ liệu...</td></tr>
              ) : rows.map((r) => {
                const meta = CURRENCY_META[r.code] || {};
                const up = r.chg != null && r.chg >= 0;
                const isSelected = selectedCcy === r.code;
                return (
                  <tr
                    key={r.code}
                    onClick={() => setSelectedCcy(r.code)}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.055)", cursor: "pointer",
                      background: isSelected ? "rgba(124,108,255,0.08)" : undefined,
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#ecedf5" }}>
                      <span style={{ marginRight: 8, fontSize: 16 }}>{meta.flag || "🏳"}</span>
                      {r.code}
                    </td>
                    <td style={{ ...tdStyle, color: "#a7abbe" }}>{meta.name || r.code}</td>
                    <td className="mono" style={{ ...tdStyle, textAlign: "right", fontWeight: 800, color: "#ecedf5", fontSize: 14 }}>
                      {fmtVND(r.vnd)}
                    </td>
                    <td className="mono" style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: r.chg == null ? "#8a8fa6" : up ? "#fb7185" : "#34d399" }}>
                      {r.chg == null ? "—" : `${up ? "+" : ""}${r.chg.toFixed(2)}%`}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {r.chg == null ? "—" : (
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 8, fontSize: 10.5, fontWeight: 700,
                          color: up ? "#fb7185" : "#34d399",
                          background: up ? "rgba(251,113,133,0.12)" : "rgba(52,211,153,0.12)",
                        }}>
                          {up ? "▲ Tăng" : "▼ Giảm"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* All currencies */}
      <SectionCard
        title="Bảng tỷ giá đầy đủ"
        subtitle={`Tất cả ngoại tệ được hỗ trợ · ${filteredAll.length} loại tiền tệ`}
        right={
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm ngoại tệ (VD: EUR, Bảng Anh)..."
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "9px 14px", fontSize: 12.5, color: "#ecedf5",
              outline: "none", minWidth: 220,
            }}
          />
        }
      >
        <div className="table-wrap" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, maxHeight: 520, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 500 }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr style={{ textAlign: "left", color: "#8a8fa6", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, background: "var(--card-bg, #14151f)" }}>
                <th style={thStyle}>Mã</th>
                <th style={thStyle}>Tên</th>
                <th style={{ ...thStyle, textAlign: "right" }}>1 đơn vị = VND</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Thay đổi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#8a8fa6" }}>Đang tải...</td></tr>
              ) : filteredAll.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#8a8fa6" }}>Không tìm thấy ngoại tệ phù hợp.</td></tr>
              ) : filteredAll.map((r) => {
                const meta = CURRENCY_META[r.code] || {};
                const up = r.chg != null && r.chg >= 0;
                return (
                  <tr
                    key={r.code}
                    onClick={() => setSelectedCcy(r.code)}
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.04)", cursor: "pointer",
                      background: selectedCcy === r.code ? "rgba(124,108,255,0.08)" : undefined,
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700, color: "#ecedf5" }}>
                      {meta.flag && <span style={{ marginRight: 6 }}>{meta.flag}</span>}
                      {r.code}
                    </td>
                    <td style={{ ...tdStyle, color: "#a7abbe" }}>{meta.name || r.code}</td>
                    <td className="mono" style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#ecedf5" }}>
                      {fmtVND(r.vnd)}
                    </td>
                    <td className="mono" style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: r.chg == null ? "#8a8fa6" : up ? "#fb7185" : "#34d399" }}>
                      {r.chg == null ? "—" : `${up ? "+" : ""}${r.chg.toFixed(2)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <section style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: "14px 20px", fontSize: 11.5, color: "#8a8fa6", lineHeight: 1.6,
      }}>
        <strong style={{ color: "#a7abbe" }}>Nguồn dữ liệu:</strong> Frankfurter API (European Central Bank) · Tỷ giá tham chiếu liên ngân hàng, cập nhật hàng ngày vào 16:00 CET. Tỷ giá VND quy đổi gián tiếp qua USD. Dữ liệu chỉ mang tính tham khảo.
      </section>
    </>
  );
}

function MiniLineChart({ data, color = "#7c6cff" }) {
  if (!data || data.length < 2) return null;

  const W = 800, H = 220, PX = 50, PY = 30;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * (W - 2 * PX),
    y: PY + (1 - (d.value - min) / range) * (H - 2 * PY),
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaD = pathD + ` L${points[points.length - 1].x},${H - PY} L${points[0].x},${H - PY} Z`;

  const first = values[0];
  const last = values[values.length - 1];
  const chg = ((last - first) / first) * 100;
  const up = chg >= 0;

  const yTicks = 5;
  const yLines = Array.from({ length: yTicks }, (_, i) => {
    const val = min + (range * i) / (yTicks - 1);
    const y = PY + (1 - (val - min) / range) * (H - 2 * PY);
    return { y, label: fmtVND(val) };
  });

  const xStep = Math.max(1, Math.floor(data.length / 6));

  return (
    <div>
      <div style={{ display: "flex", gap: 18, marginBottom: 14, fontSize: 12.5, color: "#a7abbe" }}>
        <span>Bắt đầu: <b className="mono" style={{ color: "#ecedf5" }}>{fmtVND(first)}</b></span>
        <span>Hiện tại: <b className="mono" style={{ color: "#ecedf5" }}>{fmtVND(last)}</b></span>
        <span style={{ color: up ? "#fb7185" : "#34d399", fontWeight: 700 }}>
          {up ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", maxHeight: 240 }}>
        {yLines.map((yl, i) => (
          <g key={i}>
            <line x1={PX} y1={yl.y} x2={W - PX} y2={yl.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={PX - 8} y={yl.y + 4} textAnchor="end" fill="#8a8fa6" fontSize="10" fontFamily="var(--font-mono)">{yl.label}</text>
          </g>
        ))}

        {points.filter((_, i) => i % xStep === 0 || i === data.length - 1).map((p, i) => (
          <text key={i} x={p.x} y={H - 8} textAnchor="middle" fill="#8a8fa6" fontSize="9" fontFamily="var(--font-mono)">
            {p.date.substring(5)}
          </text>
        ))}

        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        <circle cx={points[0].x} cy={points[0].y} r="4" fill={color} stroke="#14151f" strokeWidth="2" />
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={color} stroke="#14151f" strokeWidth="2" />
      </svg>
    </div>
  );
}

const thStyle = { padding: "10px 12px" };
const tdStyle = { padding: "10px 12px", color: "#c9cbd8" };
