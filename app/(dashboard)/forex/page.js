"use client";

import { useState, useEffect, useCallback } from "react";
import { ReportHeader, DateBadge } from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";

const MAJOR_CODES = ["USD", "EUR", "GBP", "JPY", "CNY", "KRW", "SGD", "THB", "AUD", "CAD", "CHF", "HKD"];

const CURRENCY_META = {
  USD: { name: "Đô la Mỹ", flag: "\u{1F1FA}\u{1F1F8}" },
  EUR: { name: "Euro", flag: "\u{1F1EA}\u{1F1FA}" },
  GBP: { name: "Bảng Anh", flag: "\u{1F1EC}\u{1F1E7}" },
  JPY: { name: "Yên Nhật", flag: "\u{1F1EF}\u{1F1F5}" },
  CNY: { name: "Nhân dân tệ", flag: "\u{1F1E8}\u{1F1F3}" },
  KRW: { name: "Won Hàn Quốc", flag: "\u{1F1F0}\u{1F1F7}" },
  SGD: { name: "Đô la Singapore", flag: "\u{1F1F8}\u{1F1EC}" },
  THB: { name: "Baht Thái", flag: "\u{1F1F9}\u{1F1ED}" },
  AUD: { name: "Đô la Úc", flag: "\u{1F1E6}\u{1F1FA}" },
  CAD: { name: "Đô la Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  CHF: { name: "Franc Thụy Sĩ", flag: "\u{1F1E8}\u{1F1ED}" },
  HKD: { name: "Đô la Hồng Kông", flag: "\u{1F1ED}\u{1F1F0}" },
  TWD: { name: "Đô la Đài Loan", flag: "\u{1F1F9}\u{1F1FC}" },
  MYR: { name: "Ringgit Malaysia", flag: "\u{1F1F2}\u{1F1FE}" },
  IDR: { name: "Rupiah Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
  PHP: { name: "Peso Philippines", flag: "\u{1F1F5}\u{1F1ED}" },
  INR: { name: "Rupee Ấn Độ", flag: "\u{1F1EE}\u{1F1F3}" },
  NZD: { name: "Đô la New Zealand", flag: "\u{1F1F3}\u{1F1FF}" },
  SEK: { name: "Krona Thụy Điển", flag: "\u{1F1F8}\u{1F1EA}" },
  NOK: { name: "Krone Na Uy", flag: "\u{1F1F3}\u{1F1F4}" },
  DKK: { name: "Krone Đan Mạch", flag: "\u{1F1E9}\u{1F1F0}" },
  RUB: { name: "Rúp Nga", flag: "\u{1F1F7}\u{1F1FA}" },
  SAR: { name: "Riyal Ả Rập", flag: "\u{1F1F8}\u{1F1E6}" },
  AED: { name: "Dirham UAE", flag: "\u{1F1E6}\u{1F1EA}" },
  ZAR: { name: "Rand Nam Phi", flag: "\u{1F1FF}\u{1F1E6}" },
  BRL: { name: "Real Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
  MXN: { name: "Peso Mexico", flag: "\u{1F1F2}\u{1F1FD}" },
  LAK: { name: "Kip Lào", flag: "\u{1F1F1}\u{1F1E6}" },
  KHR: { name: "Riel Campuchia", flag: "\u{1F1F0}\u{1F1ED}" },
  MMK: { name: "Kyat Myanmar", flag: "\u{1F1F2}\u{1F1F2}" },
};

function fmtVND(n) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1000) return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
  if (n >= 1) return n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
  return n.toLocaleString("vi-VN", { maximumFractionDigits: 4 });
}

export default function ForexPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCcy, setSelectedCcy] = useState("USD");

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/forex");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRates(); }, [loadRates]);

  const rates = data?.rates;
  const source = data?.source;

  const toVND = (code) => {
    if (!rates || !rates[code]) return null;
    return 1 / rates[code];
  };

  const rows = rates
    ? MAJOR_CODES.map((code) => {
        const vnd = toVND(code);
        if (vnd == null) return null;
        return { code, vnd };
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
      const vnd = toVND(code);
      if (vnd == null) return null;
      return { code, vnd };
    })
    .filter(Boolean);

  const usdVnd = toVND("USD");
  const lastUpdateStr = data?.updated
    ? (() => { try { return new Date(data.updated).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return data.updated; } })()
    : null;

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · THỊ TRƯỜNG NGOẠI HỐI"
        title="Báo cáo Tỷ giá Ngoại tệ"
        subtitle={`Tỷ giá quy đổi sang VND${source ? ` · Nguồn: ${source}` : ""}`}
        right={
          <DateBadge>
            {lastUpdateStr ? `Cập nhật: ${lastUpdateStr}` : "Đang tải..."}
          </DateBadge>
        }
      />

      {error && (
        <section style={{
          background: "rgba(225,29,72,0.1)", border: "1px solid rgba(225,29,72,0.3)",
          borderRadius: 14, padding: "16px 22px", color: "#fb7185", fontSize: 13,
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <span>Không thể tải dữ liệu tỷ giá: {error}</span>
          <button
            onClick={loadRates}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "1px solid #fb7185",
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
              {"\u{1F1FA}\u{1F1F8}"} USD / VND {"\u{1F1FB}\u{1F1F3}"}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
              <span className="mono" style={{
                fontSize: 46, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1,
                background: "linear-gradient(120deg,#fff,#c3b9ff)", WebkitBackgroundClip: "text",
                backgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                {loading ? "—" : fmtVND(usdVnd)}
              </span>
              <span style={{ fontSize: 14, color: "#8a8fa6", fontWeight: 600 }}>VND</span>
            </div>
            <div style={{ fontSize: 13, color: "#a7abbe", marginTop: 12 }}>
              1 USD = {loading ? "..." : fmtVND(usdVnd)} VND
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Summary cards */}
      {!loading && rows.length > 0 && (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {rows.slice(0, 4).map((r) => {
            const meta = CURRENCY_META[r.code] || {};
            const isSelected = selectedCcy === r.code;
            const cardColors = { USD: "#7c6cff", EUR: "#9d8bff", GBP: "#34d399", JPY: "#fbbf24" };
            const accent = cardColors[r.code] || "#7c6cff";
            return (
              <div
                key={r.code}
                onClick={() => setSelectedCcy(r.code)}
                style={{
                  position: "relative", overflow: "hidden", cursor: "pointer",
                  borderRadius: 16, padding: "20px 22px",
                  border: `1px solid ${isSelected ? accent + "66" : "rgba(255,255,255,0.09)"}`,
                  background: `linear-gradient(165deg, ${accent}1c, rgba(255,255,255,0.012))`,
                  transition: "border-color 0.18s",
                }}
              >
                <div style={{ position: "absolute", top: -40, right: -20, width: 120, height: 120, borderRadius: "50%", background: accent, opacity: 0.1, filter: "blur(30px)", pointerEvents: "none" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
                  <span style={{ fontSize: 28 }}>{meta.flag || "\u{1F3F3}"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: accent }}>{r.code}</div>
                    <div style={{ fontSize: 13, color: "#a7abbe", marginTop: 2 }}>{meta.name || r.code}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: "#ecedf5" }}>{fmtVND(r.vnd)}</div>
                    <div style={{ fontSize: 10.5, color: "#8a8fa6", marginTop: 2 }}>VND</div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Major currencies table */}
      <SectionCard
        title="Tỷ giá các ngoại tệ chính"
        subtitle={`${rows.length} loại tiền tệ chủ chốt · Quy đổi sang VND`}
      >
        <div className="table-wrap" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 500 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#8a8fa6", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.4, background: "rgba(255,255,255,0.03)" }}>
                <th style={thStyle}>Ngoại tệ</th>
                <th style={thStyle}>Tên</th>
                <th style={{ ...thStyle, textAlign: "right" }}>1 đơn vị = VND</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Tỷ giá ngược</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#8a8fa6" }}>Đang tải dữ liệu...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#8a8fa6" }}>Không có dữ liệu</td></tr>
              ) : rows.map((r) => {
                const meta = CURRENCY_META[r.code] || {};
                const isSelected = selectedCcy === r.code;
                const inverse = rates[r.code];
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
                      <span style={{ marginRight: 8, fontSize: 16 }}>{meta.flag || "\u{1F3F3}"}</span>
                      {r.code}
                    </td>
                    <td style={{ ...tdStyle, color: "#a7abbe" }}>{meta.name || r.code}</td>
                    <td className="mono" style={{ ...tdStyle, textAlign: "right", fontWeight: 800, color: "#ecedf5", fontSize: 14 }}>
                      {fmtVND(r.vnd)}
                    </td>
                    <td className="mono" style={{ ...tdStyle, textAlign: "right", color: "#8a8fa6" }}>
                      {inverse != null ? inverse.toLocaleString("vi-VN", { maximumFractionDigits: 6 }) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Converter */}
      {!loading && usdVnd && <ConverterCard rates={rates} toVND={toVND} />}

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
                <th style={{ ...thStyle, textAlign: "right" }}>1 VND =</th>
              </tr>
            </thead>
            <tbody>
              {filteredAll.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#8a8fa6" }}>Không tìm thấy ngoại tệ phù hợp.</td></tr>
              ) : filteredAll.map((r) => {
                const meta = CURRENCY_META[r.code] || {};
                const inverse = rates[r.code];
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
                    <td className="mono" style={{ ...tdStyle, textAlign: "right", color: "#8a8fa6" }}>
                      {inverse != null ? inverse.toLocaleString("vi-VN", { maximumFractionDigits: 6 }) : "—"}
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
        <strong style={{ color: "#a7abbe" }}>Nguồn dữ liệu:</strong> {source || "Open Exchange Rates"} · Tỷ giá tham chiếu cập nhật hàng ngày. Dữ liệu chỉ mang tính tham khảo.
        {data?.nextUpdate && (
          <span> · Lần cập nhật tiếp: {(() => { try { return new Date(data.nextUpdate).toLocaleString("vi-VN"); } catch { return data.nextUpdate; } })()}</span>
        )}
      </section>
    </>
  );
}

function ConverterCard({ rates, toVND }) {
  const [fromCcy, setFromCcy] = useState("USD");
  const [amount, setAmount] = useState("1");

  const ccyList = rates ? Object.keys(rates).filter((c) => c !== "VND").sort() : [];
  const numericAmt = parseFloat(amount) || 0;
  const vndPerUnit = toVND(fromCcy);
  const result = vndPerUnit ? numericAmt * vndPerUnit : null;
  const meta = CURRENCY_META[fromCcy] || {};

  return (
    <SectionCard
      title="Quy đổi ngoại tệ"
      subtitle={`${meta.flag || ""} ${fromCcy} → VND \u{1F1FB}\u{1F1F3}`}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 180px" }}>
          <label style={{ display: "block", fontSize: 10.5, color: "#8a8fa6", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 6 }}>Số tiền</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "12px 14px", fontSize: 18, fontWeight: 700, color: "#ecedf5",
              outline: "none", fontFamily: "var(--font-mono)",
            }}
          />
        </div>
        <div style={{ flex: "0 0 140px" }}>
          <label style={{ display: "block", fontSize: 10.5, color: "#8a8fa6", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 6 }}>Ngoại tệ</label>
          <select
            value={fromCcy}
            onChange={(e) => setFromCcy(e.target.value)}
            style={{
              width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "12px 14px", fontSize: 14, color: "#ecedf5",
              outline: "none", cursor: "pointer",
            }}
          >
            {ccyList.map((c) => (
              <option key={c} value={c}>{(CURRENCY_META[c]?.flag || "") + " " + c}</option>
            ))}
          </select>
        </div>
        <div style={{
          flex: "1 1 220px", background: "linear-gradient(135deg,rgba(124,108,255,0.15),rgba(52,211,153,0.08))",
          border: "1px solid rgba(124,108,255,0.25)", borderRadius: 14, padding: "14px 18px",
        }}>
          <div style={{ fontSize: 10.5, color: "#8a8fa6", letterSpacing: 0.6, textTransform: "uppercase" }}>Kết quả (VND)</div>
          <div className="mono" style={{ fontSize: 26, fontWeight: 800, color: "#ecedf5", marginTop: 4 }}>
            {result != null ? fmtVND(result) : "—"}
          </div>
          {vndPerUnit && (
            <div style={{ fontSize: 11, color: "#a7abbe", marginTop: 4 }}>
              1 {fromCcy} = {fmtVND(vndPerUnit)} VND
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

const thStyle = { padding: "10px 12px" };
const tdStyle = { padding: "10px 12px", color: "#c9cbd8" };
