"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

const STOCK_META = {
  MBB: { name: "MB Bank", sector: "Ngân hàng" },
  LPB: { name: "LPBank", sector: "Ngân hàng" },
  CII: { name: "CII", sector: "Hạ tầng" },
  FPT: { name: "FPT Corp", sector: "Công nghệ" },
  DPR: { name: "Cao su Đồng Phú", sector: "Cao su" },
  VTO: { name: "Vitaco", sector: "Vận tải biển" },
  PNJ: { name: "PNJ", sector: "Bán lẻ" },
  VJC: { name: "Vietjet Air", sector: "Hàng không" },
  TCB: { name: "Techcombank", sector: "Ngân hàng" },
  VCK: { name: "Vĩnh Cửu", sector: "Vật liệu XD" },
  QNS: { name: "Đường Quảng Ngãi", sector: "Thực phẩm" },
  BSR: { name: "Lọc Hóa dầu Bình Sơn", sector: "Dầu khí" },
  VPB: { name: "VPBank", sector: "Ngân hàng" },
  VCB: { name: "Vietcombank", sector: "Ngân hàng" },
  BID: { name: "BIDV", sector: "Ngân hàng" },
  HDB: { name: "HDBank", sector: "Ngân hàng" },
  DXG: { name: "Đất Xanh", sector: "BĐS" },
  GEX: { name: "Gelex", sector: "Đa ngành" },
  GEG: { name: "Điện Gia Lai", sector: "Điện lực" },
  TVS: { name: "Chứng khoán Thiên Việt", sector: "Chứng khoán" },
  SCR: { name: "TTC Land", sector: "BĐS" },
  LCG: { name: "Licogi 16", sector: "Xây dựng" },
  SAB: { name: "Sabeco", sector: "Đồ uống" },
  DHC: { name: "Đông Hải Bến Tre", sector: "Giấy" },
  NLG: { name: "Nam Long", sector: "BĐS" },
  VND: { name: "VNDirect", sector: "Chứng khoán" },
  CTG: { name: "VietinBank", sector: "Ngân hàng" },
  MSN: { name: "Masan", sector: "Tiêu dùng" },
  HHV: { name: "Đầu tư Hạ tầng GT Đèo Cả", sector: "Hạ tầng" },
  VIB: { name: "VIB", sector: "Ngân hàng" },
  TPB: { name: "TPBank", sector: "Ngân hàng" },
  HUT: { name: "Tasco", sector: "Xây dựng" },
  TCT: { name: "CTCP Cáp treo Núi Bà Tây Ninh", sector: "Du lịch" },
  PDR: { name: "Phát Đạt", sector: "BĐS" },
  HDG: { name: "Hà Đô", sector: "BĐS" },
  HPG: { name: "Hòa Phát", sector: "Thép" },
  ACB: { name: "ACB", sector: "Ngân hàng" },
  DPM: { name: "Đạm Phú Mỹ", sector: "Hóa chất" },
  NTL: { name: "Từ Liêm", sector: "BĐS" },
  HAH: { name: "Hải An", sector: "Vận tải biển" },
  TNG: { name: "TNG", sector: "Dệt may" },
  DBC: { name: "Dabaco", sector: "Chăn nuôi" },
  SAS: { name: "Sasco", sector: "Dịch vụ HK" },
  HAX: { name: "Haxaco", sector: "Ô tô" },
  FOC: { name: "FPT Online", sector: "Công nghệ" },
  ACV: { name: "Cảng HK Việt Nam", sector: "Hàng không" },
  VNM: { name: "Vinamilk", sector: "Tiêu dùng" },
  DGC: { name: "Hóa chất Đức Giang", sector: "Hóa chất" },
  CTD: { name: "Coteccons", sector: "Xây dựng" },
  POW: { name: "PV Power", sector: "Điện lực" },
  SSI: { name: "SSI Securities", sector: "Chứng khoán" },
  CMN: { name: "CMN", sector: "Công nghệ" },
  LSS: { name: "Mía đường Lam Sơn", sector: "Thực phẩm" },
  SKG: { name: "Superdong Kiên Giang", sector: "Vận tải biển" },
  CKG: { name: "CK Gia Lai", sector: "BĐS" },
  SCS: { name: "Saigon Cargo", sector: "Logistics" },
  HNG: { name: "HAGL Agrico", sector: "Nông nghiệp" },
  MWG: { name: "Thế Giới Di Động", sector: "Bán lẻ" },
  E1VFVN30: { name: "ETF VN30", sector: "Quỹ ETF" },
  FUEVFVND: { name: "ETF VN Diamond", sector: "Quỹ ETF" },
};

const INDEX_LABELS = {
  VNINDEX: "VN-Index",
  HNX: "HNX-Index",
  UPCOM: "UPCOM-Index",
};
const INDEX_COLORS = {
  VNINDEX: "#7c6cff",
  HNX: "#34d399",
  UPCOM: "#f59e0b",
};

const fmtNum = (v, d = 2) =>
  v != null
    ? v.toLocaleString("vi-VN", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";
const fmtVol = (v) => {
  if (!v) return "—";
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(0) + "K";
  return String(v);
};
const chgColor = (v) => {
  if (v > 6) return "#a78bfa";
  if (v > 0) return "#34d399";
  if (v < -6) return "#67e8f9";
  if (v < 0) return "#ef4444";
  return "#f59e0b";
};
const chgSign = (v) => (v > 0 ? "+" : "");
const chgBg = (v) => {
  if (v > 6) return "rgba(167,139,250,0.25)";
  if (v > 0) return "rgba(34,197,94,0.2)";
  if (v < -6) return "rgba(103,232,249,0.2)";
  if (v < 0) return "rgba(239,68,68,0.2)";
  return "rgba(245,158,11,0.2)";
};
const chgArrow = (v) => (v > 0 ? "▲" : v < 0 ? "▼" : "—");

const CARD = {
  background: "var(--surface)",
  borderRadius: 16,
  border: "1px solid var(--border)",
  padding: "20px 24px",
  backdropFilter: "blur(12px)",
};
const TABLE_HEADER = {
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  borderBottom: "1px solid var(--border-soft)",
  textAlign: "left",
};
const TABLE_CELL = {
  padding: "10px 12px",
  fontSize: 14,
  borderBottom: "1px solid var(--border-faint)",
};

function Skeleton({ h = 20, w = "100%", r = 8 }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: r,
        background: "linear-gradient(90deg, var(--surface-soft) 25%, var(--surface-raised) 50%, var(--surface-soft) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

function IndexCard({ idx }) {
  const color = INDEX_COLORS[idx.code] || "#7c6cff";
  const cc = chgColor(idx.change);
  return (
    <div
      style={{
        ...CARD,
        flex: "1 1 280px",
        minWidth: 260,
        borderLeft: `4px solid ${color}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `${color}11` }} />
      <div style={{ fontSize: 13, color: "var(--text-dim)", fontWeight: 600, marginBottom: 4 }}>
        {INDEX_LABELS[idx.code] || idx.code}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: "var(--text)" }}>{fmtNum(idx.value)}</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: cc }}>
          {chgArrow(idx.change)} {chgSign(idx.change)}{fmtNum(idx.change)} ({chgSign(idx.changePercent)}{fmtNum(idx.changePercent)}%)
        </span>
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-dim)" }}>
        <span>Mở: <b style={{ color: "var(--text-strong)" }}>{fmtNum(idx.open)}</b></span>
        <span>Cao: <b style={{ color: "#34d399" }}>{fmtNum(idx.high)}</b></span>
        <span>Thấp: <b style={{ color: "#ef4444" }}>{fmtNum(idx.low)}</b></span>
        <span>KL: <b style={{ color: "var(--text-strong)" }}>{fmtVol(idx.volume)}</b></span>
      </div>
    </div>
  );
}

function BreadthBar({ breadth }) {
  if (!breadth || !breadth.total) return null;
  const { advances, declines, unchanged, total } = breadth;
  const aP = (advances / total) * 100;
  const dP = (declines / total) * 100;
  const uP = (unchanged / total) * 100;
  return (
    <div style={{ ...CARD, padding: "16px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 13, fontWeight: 600 }}>
        <span style={{ color: "#34d399" }}>{"▲"} Tăng: {advances}</span>
        <span style={{ color: "var(--text-dim)" }}>{"—"} Đứng: {unchanged}</span>
        <span style={{ color: "#ef4444" }}>{"▼"} Giảm: {declines}</span>
      </div>
      <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", background: "var(--surface-soft)" }}>
        <div style={{ width: `${aP}%`, background: "linear-gradient(90deg, #22c55e, #34d399)", transition: "width 0.5s" }} />
        <div style={{ width: `${uP}%`, background: "var(--text-faint)", transition: "width 0.5s" }} />
        <div style={{ width: `${dP}%`, background: "linear-gradient(90deg, #ef4444, #dc2626)", transition: "width 0.5s" }} />
      </div>
      <div style={{ textAlign: "center", marginTop: 6, fontSize: 12, color: "var(--text-faint)" }}>
        Tổng {total} mã trên sàn HOSE
      </div>
    </div>
  );
}

function StockTable({ title, icon, stocks, accentColor, onTickerClick }) {
  if (!stocks?.length) return null;
  return (
    <div style={{ ...CARD, flex: "1 1 400px", minWidth: 340, padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 20px",
          background: `linear-gradient(135deg, ${accentColor}18, transparent)`,
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{title}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={TABLE_HEADER}>#</th>
              <th style={TABLE_HEADER}>Mã</th>
              <th style={{ ...TABLE_HEADER, textAlign: "right" }}>Giá (nghìn)</th>
              <th style={{ ...TABLE_HEADER, textAlign: "right" }}>+/-</th>
              <th style={{ ...TABLE_HEADER, textAlign: "right" }}>%</th>
              <th style={{ ...TABLE_HEADER, textAlign: "right" }}>KL</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s, i) => {
              const cc = chgColor(s.changePercent);
              const meta = STOCK_META[s.ticker];
              return (
                <tr key={s.ticker} style={{ transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ ...TABLE_CELL, color: "var(--text-faint)", fontWeight: 500, width: 32 }}>{i + 1}</td>
                  <td style={TABLE_CELL}>
                    <div
                      onClick={() => onTickerClick?.(s.ticker)}
                      style={{ fontWeight: 700, color: onTickerClick ? "var(--accent-soft)" : "var(--text)", fontSize: 14, cursor: onTickerClick ? "pointer" : "default" }}
                    >
                      {s.ticker}
                    </div>
                    {meta && <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 1 }}>{meta.name}</div>}
                  </td>
                  <td style={{ ...TABLE_CELL, textAlign: "right", fontWeight: 600, color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>
                    {fmtNum(s.price)}
                  </td>
                  <td style={{ ...TABLE_CELL, textAlign: "right", color: cc, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {chgSign(s.change)}{fmtNum(s.change)}
                  </td>
                  <td style={{ ...TABLE_CELL, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text)",
                        background: chgBg(s.changePercent),
                      }}
                    >
                      {chgSign(s.changePercent)}{fmtNum(s.changePercent)}%
                    </span>
                  </td>
                  <td style={{ ...TABLE_CELL, textAlign: "right", color: "var(--text-dim)", fontVariantNumeric: "tabular-nums" }}>
                    {fmtVol(s.volume)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortArrows({ colKey, sortKey, sortDir, onSort }) {
  const isActive = sortKey === colKey;
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        marginLeft: 4,
        lineHeight: 0,
        verticalAlign: "middle",
        cursor: "pointer",
      }}
    >
      <span
        onClick={(e) => { e.stopPropagation(); onSort(colKey, 1); }}
        style={{
          fontSize: 8,
          lineHeight: "9px",
          color: isActive && sortDir > 0 ? "var(--accent-soft)" : "var(--text-faintest)",
          transition: "color 0.15s",
        }}
      >
        ▲
      </span>
      <span
        onClick={(e) => { e.stopPropagation(); onSort(colKey, -1); }}
        style={{
          fontSize: 8,
          lineHeight: "9px",
          color: isActive && sortDir < 0 ? "var(--accent-soft)" : "var(--text-faintest)",
          transition: "color 0.15s",
        }}
      >
        ▼
      </span>
    </span>
  );
}

const SORT_PRESETS = [
  { key: "changePercent", dir: -1, label: "% Tăng", icon: "📈" },
  { key: "changePercent", dir: 1, label: "% Giảm", icon: "📉" },
  { key: "volume", dir: -1, label: "KL cao", icon: "🔥" },
  { key: "price", dir: -1, label: "Giá cao", icon: "💰" },
  { key: "ticker", dir: 1, label: "A → Z", icon: "🔤" },
];

function BlueChipSection({ stocks, onTickerClick }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("ticker");
  const [sortDir, setSortDir] = useState(1);

  const filtered = useMemo(() => {
    let list = (stocks || []).filter((s) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const meta = STOCK_META[s.ticker];
      return (
        s.ticker.toLowerCase().includes(q) ||
        (meta && meta.name.toLowerCase().includes(q)) ||
        (meta && meta.sector.toLowerCase().includes(q))
      );
    });
    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "ticker") return va.localeCompare(vb) * sortDir;
      if (sortKey === "name") {
        va = STOCK_META[a.ticker]?.name || "";
        vb = STOCK_META[b.ticker]?.name || "";
        return va.localeCompare(vb) * sortDir;
      }
      return ((va || 0) - (vb || 0)) * sortDir;
    });
    return list;
  }, [stocks, search, sortKey, sortDir]);

  const setSort = (key, dir) => {
    if (sortKey === key && sortDir === dir) return;
    setSortKey(key);
    setSortDir(dir);
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => -d);
    else { setSortKey(key); setSortDir(key === "ticker" ? 1 : -1); }
  };

  if (!stocks?.length) return null;

  return (
    <div style={{ ...CARD, padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(124,108,255,0.1), transparent)",
          borderBottom: "1px solid var(--border-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{"\u{1F4BC}"}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Danh mục của Hải Bùi</span>
          <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 500 }}>({filtered.length} mã)</span>
        </div>
        <input
          type="text"
          placeholder="Tìm mã, tên, ngành..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 13,
            color: "var(--text-strong)",
            outline: "none",
            width: 200,
          }}
        />
      </div>
      {/* Sort presets toolbar */}
      <div
        style={{
          padding: "8px 20px",
          borderBottom: "1px solid var(--border-faint)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          background: "var(--surface-hover)",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600, marginRight: 4 }}>Sắp xếp:</span>
        {SORT_PRESETS.map((p) => {
          const active = sortKey === p.key && sortDir === p.dir;
          return (
            <button
              key={p.label}
              onClick={() => setSort(p.key, p.dir)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 6,
                border: active ? "1px solid rgba(124,108,255,0.5)" : "1px solid var(--border)",
                background: active ? "rgba(124,108,255,0.15)" : "var(--surface-soft)",
                color: active ? "var(--accent-soft)" : "var(--text-dim)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 12 }}>{p.icon}</span>
              {p.label}
            </button>
          );
        })}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...TABLE_HEADER, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("ticker")}>
                <span style={{ display: "inline-flex", alignItems: "center" }}>Mã<SortArrows colKey="ticker" sortKey={sortKey} sortDir={sortDir} onSort={setSort} /></span>
              </th>
              <th style={{ ...TABLE_HEADER, cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("name")}>
                <span style={{ display: "inline-flex", alignItems: "center" }}>Tên<SortArrows colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={setSort} /></span>
              </th>
              <th style={TABLE_HEADER}>Ngành</th>
              <th style={{ ...TABLE_HEADER, textAlign: "right", cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("price")}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>Giá (nghìn)<SortArrows colKey="price" sortKey={sortKey} sortDir={sortDir} onSort={setSort} /></span>
              </th>
              <th style={{ ...TABLE_HEADER, textAlign: "right", cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("change")}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>+/-<SortArrows colKey="change" sortKey={sortKey} sortDir={sortDir} onSort={setSort} /></span>
              </th>
              <th style={{ ...TABLE_HEADER, textAlign: "right", cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("changePercent")}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>%<SortArrows colKey="changePercent" sortKey={sortKey} sortDir={sortDir} onSort={setSort} /></span>
              </th>
              <th style={{ ...TABLE_HEADER, textAlign: "right", cursor: "pointer", userSelect: "none" }} onClick={() => toggleSort("volume")}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>KL<SortArrows colKey="volume" sortKey={sortKey} sortDir={sortDir} onSort={setSort} /></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const cc = chgColor(s.changePercent);
              const meta = STOCK_META[s.ticker];
              return (
                <tr key={s.ticker} style={{ transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ ...TABLE_CELL, fontWeight: 700, color: onTickerClick ? "var(--accent-soft)" : "var(--text)", cursor: onTickerClick ? "pointer" : "default" }} onClick={() => onTickerClick?.(s.ticker)}>{s.ticker}</td>
                  <td style={{ ...TABLE_CELL, color: "var(--text-strong)" }}>{meta?.name || s.ticker}</td>
                  <td style={TABLE_CELL}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "var(--accent-soft-bg)", color: "var(--accent-soft)", fontWeight: 600 }}>
                      {meta?.sector || "—"}
                    </span>
                  </td>
                  <td style={{ ...TABLE_CELL, textAlign: "right", fontWeight: 600, color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>
                    {fmtNum(s.price)}
                  </td>
                  <td style={{ ...TABLE_CELL, textAlign: "right", color: cc, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {chgSign(s.change)}{fmtNum(s.change)}
                  </td>
                  <td style={{ ...TABLE_CELL, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text)",
                        background: chgBg(s.changePercent),
                      }}
                    >
                      {chgSign(s.changePercent)}{fmtNum(s.changePercent)}%
                    </span>
                  </td>
                  <td style={{ ...TABLE_CELL, textAlign: "right", color: "var(--text-dim)", fontVariantNumeric: "tabular-nums" }}>
                    {fmtVol(s.volume)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniChart({ history, width = 480, height = 160 }) {
  if (!history?.length) return null;
  const prices = history.map((h) => h.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const padY = 8;
  const padX = 4;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = prices
    .map((p, i) => {
      const x = padX + (i / (prices.length - 1)) * chartW;
      const y = padY + chartH - ((p - min) / range) * chartH;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padX},${height} ${points} ${padX + chartW},${height}`;
  const last = prices[prices.length - 1];
  const first = prices[0];
  const trending = last >= first;
  const stroke = trending ? "#34d399" : "#ef4444";
  const fill = trending ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", maxWidth: width, height: "auto" }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGrad)" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {prices.length > 0 && (() => {
        const lx = padX + ((prices.length - 1) / (prices.length - 1)) * chartW;
        const ly = padY + chartH - ((last - min) / range) * chartH;
        return <circle cx={lx} cy={ly} r="4" fill={stroke} stroke="var(--surface)" strokeWidth="2" />;
      })()}
      <text x={padX} y={padY - 1} fill="var(--text-faint)" fontSize="10" fontFamily="sans-serif">{fmtNum(max, 1)}</text>
      <text x={padX} y={height - 2} fill="var(--text-faint)" fontSize="10" fontFamily="sans-serif">{fmtNum(min, 1)}</text>
    </svg>
  );
}

function StockDetailPanel({ detail, onClose, loading: detLoading, error }) {
  if (detLoading) {
    return (
      <div style={{ ...CARD, marginBottom: 24, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <Skeleton h={28} w={200} />
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 20 }}>{"✕"}</button>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px" }}><Skeleton h={160} /><div style={{ marginTop: 12 }}><Skeleton h={20} /></div></div>
          <div style={{ flex: "1 1 300px" }}>{[1,2,3,4].map(i => <div key={i} style={{ marginBottom: 10 }}><Skeleton h={18} /></div>)}</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ ...CARD, marginBottom: 24, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#ef4444", fontWeight: 600 }}>{error}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 20 }}>{"✕"}</button>
        </div>
      </div>
    );
  }
  if (!detail) return null;

  const cc = chgColor(detail.change);
  const stats = [
    { label: "Vốn hóa", value: detail.marketCap ? `${fmtNum(detail.marketCap, 0)} tỷ` : "—" },
    { label: "P/E", value: detail.pe != null ? fmtNum(detail.pe) : "—" },
    { label: "P/B", value: detail.pb != null ? fmtNum(detail.pb) : "—" },
    { label: "EPS", value: detail.eps != null ? fmtNum(detail.eps, 0) : "—" },
    { label: "ROE", value: detail.roe != null ? `${fmtNum(detail.roe * 100, 1)}%` : "—" },
    { label: "SHNN", value: detail.foreignOwnership != null ? `${fmtNum(detail.foreignOwnership, 1)}%` : "—" },
    { label: "Cổ tức", value: detail.dividend != null ? `${fmtNum(detail.dividend, 1)}%` : "—" },
    { label: "Beta", value: detail.beta != null ? fmtNum(detail.beta) : "—" },
    { label: "52W High", value: detail.week52High != null ? fmtNum(detail.week52High) : "—" },
    { label: "52W Low", value: detail.week52Low != null ? fmtNum(detail.week52Low) : "—" },
    { label: "KL CP lưu hành", value: detail.outstandingShares != null ? fmtVol(detail.outstandingShares) : "—" },
  ];

  return (
    <section style={{ ...CARD, marginBottom: 24, position: "relative", overflow: "hidden", borderLeft: `4px solid ${cc}` }}>
      <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: `${cc}11` }} />
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{detail.ticker}</span>
              <span style={{ fontSize: 13, padding: "3px 10px", borderRadius: 8, background: "rgba(124,108,255,0.15)", color: "var(--accent-soft)", fontWeight: 600 }}>
                {detail.exchange}
              </span>
            </div>
            <div style={{ fontSize: 15, color: "var(--text-strong)", fontWeight: 500 }}>{detail.companyName}</div>
            {detail.industry && <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>{detail.industry}</div>}
          </div>
          <button onClick={onClose} style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-dim)", cursor: "pointer", fontSize: 18, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>{"✕"}</button>
        </div>

        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: "var(--text)" }}>{fmtNum(detail.price)}</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: cc }}>
            {chgArrow(detail.change)} {chgSign(detail.change)}{fmtNum(detail.change)} ({chgSign(detail.changePercent)}{fmtNum(detail.changePercent)}%)
          </span>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 20, fontSize: 13, color: "var(--text-dim)", flexWrap: "wrap" }}>
          <span>Mở: <b style={{ color: "var(--text-strong)" }}>{fmtNum(detail.open)}</b></span>
          <span>Cao: <b style={{ color: "#34d399" }}>{fmtNum(detail.high)}</b></span>
          <span>Thấp: <b style={{ color: "#ef4444" }}>{fmtNum(detail.low)}</b></span>
          <span>KL: <b style={{ color: "var(--text-strong)" }}>{fmtVol(detail.volume)}</b></span>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-soft)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Biểu đồ 30 ngày
            </div>
            <div style={{ background: "var(--surface-hover)", borderRadius: 12, padding: 12, border: "1px solid var(--border-faint)" }}>
              <MiniChart history={detail.history} />
            </div>
            {detail.history?.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-faint)", marginTop: 6, padding: "0 4px" }}>
                <span>{detail.history[0].date?.slice(0, 10)}</span>
                <span>{detail.history[detail.history.length - 1].date?.slice(0, 10)}</span>
              </div>
            )}
          </div>
          <div style={{ flex: "1 1 280px", minWidth: 240 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-soft)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Chỉ số tài chính
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--surface-soft)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--border-faint)" }}>
              {stats.map((s) => (
                <div key={s.label} style={{ padding: "10px 14px", background: "var(--surface)" }}>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {detail.source && (
          <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-faint)", textAlign: "right" }}>
            Nguồn: {detail.source} | {new Date(detail.updated).toLocaleString("vi-VN")}
          </div>
        )}
      </div>
    </section>
  );
}

export default function StockPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stockDetail, setStockDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/stock");
        const j = await r.json();
        if (!cancelled) {
          if (j.error) setErr(j.error);
          else { setData(j); setErr(null); }
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setErr("Lỗi kết nối đến server");
          setLoading(false);
        }
      }
    };
    load();
    const iv = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(iv);
    };
  }, []);

  const allTickers = useMemo(() => {
    if (!data) return [];
    const map = new Map();
    const add = (list) => {
      (list || []).forEach((s) => {
        if (!map.has(s.ticker)) map.set(s.ticker, s);
      });
    };
    add(data.blueChips);
    add(data.topGainers);
    add(data.topLosers);
    return Array.from(map.values());
  }, [data]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toUpperCase();
    return allTickers
      .filter((s) => {
        const meta = STOCK_META[s.ticker];
        return (
          s.ticker.includes(q) ||
          (meta && meta.name.toUpperCase().includes(q))
        );
      })
      .slice(0, 8);
  }, [searchQuery, allTickers]);

  const loadDetail = useCallback(async (ticker) => {
    const t = ticker.toUpperCase().trim();
    if (!t) return;
    setSearchQuery(t);
    setShowSuggestions(false);
    setDetailLoading(true);
    setDetailError(null);
    setStockDetail(null);
    try {
      const r = await fetch(`/api/stock/detail?ticker=${encodeURIComponent(t)}`);
      const j = await r.json();
      if (j.error) setDetailError(j.error);
      else setStockDetail(j);
    } catch {
      setDetailError("Lỗi kết nối khi tải chi tiết mã " + t);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) loadDetail(searchQuery);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Hero Header */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, rgba(124,108,255,0.08) 100%)",
          borderRadius: 20,
          padding: "28px 32px",
          marginBottom: 24,
          border: "1px solid rgba(124,108,255,0.15)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
          background: "radial-gradient(ellipse at 80% 30%, rgba(124,108,255,0.1), transparent 70%)",
        }}/>
        <div style={{ position: "relative" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "var(--accent-soft)",
            textTransform: "uppercase", marginBottom: 8,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              width: 16, height: 2, borderRadius: 1,
              background: "linear-gradient(90deg, #7c6cff, #a78bfa)",
              display: "inline-block",
            }}/>
            THỊ TRƯỜNG CHỨNG KHOÁN
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.2,
            color: "var(--text)",
          }}>
            Báo cáo Thị trường Chứng khoán Việt Nam
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-faint)", margin: "8px 0 0", maxWidth: 600, lineHeight: 1.5 }}>
            Theo dõi chỉ số VN-Index, HNX, UPCOM và biến động cổ phiếu trên sàn HOSE.
            Dữ liệu tự động cập nhật mỗi 5 phút.
          </p>
          {data?.updated && (
            <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--text-faintest)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px rgba(52,211,153,0.5)", display: "inline-block" }}/>
              Cập nhật: {new Date(data.updated).toLocaleString("vi-VN")}
              {data.source && <span style={{ marginLeft: 4 }}>| Nguồn: {data.source}</span>}
            </div>
          )}
        </div>
      </section>

      {/* Search Bar */}
      <section style={{ marginBottom: 24 }}>
        <div ref={searchRef} style={{ position: "relative", maxWidth: 560 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                placeholder="Nhập mã chứng khoán (VD: FPT, VNM, VCB...)"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                style={{
                  width: "100%",
                  background: "var(--surface)",
                  border: "1px solid rgba(124,108,255,0.3)",
                  borderRadius: 12,
                  padding: "12px 16px 12px 42px",
                  fontSize: 15,
                  color: "var(--text-strong)",
                  outline: "none",
                  backdropFilter: "blur(12px)",
                  boxSizing: "border-box",
                }}
              />
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 18, height: 18 }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #7c6cff, #a78bfa)",
                border: "none",
                borderRadius: 12,
                padding: "0 24px",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Xem chi tiết
            </button>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 72,
              marginTop: 4,
              background: "var(--surface)",
              border: "1px solid rgba(124,108,255,0.25)",
              borderRadius: 12,
              overflow: "hidden",
              zIndex: 50,
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
              {suggestions.map((s) => {
                const meta = STOCK_META[s.ticker];
                const cc = chgColor(s.changePercent);
                return (
                  <div
                    key={s.ticker}
                    onClick={() => loadDetail(s.ticker)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border-faint)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,108,255,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14, minWidth: 44 }}>{s.ticker}</span>
                      {meta && <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{meta.name}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 600, color: "var(--text-strong)", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{fmtNum(s.price)}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: cc, fontVariantNumeric: "tabular-nums" }}>
                        {chgSign(s.changePercent)}{fmtNum(s.changePercent)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Stock Detail Panel */}
      {(stockDetail || detailLoading || detailError) && (
        <StockDetailPanel
          detail={stockDetail}
          loading={detailLoading}
          error={detailError}
          onClose={() => { setStockDetail(null); setDetailError(null); setSearchQuery(""); }}
        />
      )}

      {/* Loading */}
      {loading && (
        <section style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ ...CARD, flex: "1 1 280px", minWidth: 260 }}>
              <Skeleton h={14} w={100} />
              <div style={{ marginTop: 12 }}><Skeleton h={36} w={180} /></div>
              <div style={{ marginTop: 12 }}><Skeleton h={14} w="80%" /></div>
            </div>
          ))}
        </section>
      )}

      {/* Error */}
      {err && !loading && (
        <section style={{ ...CARD, borderColor: "rgba(239,68,68,0.3)", marginBottom: 24, textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>{"⚠️"}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>{err}</div>
          <div style={{ fontSize: 13, color: "var(--text-faint)" }}>
            Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.
          </div>
        </section>
      )}

      {data && !loading && (
        <>
          {/* Index Cards */}
          {data.indices?.length > 0 && (
            <section style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              {data.indices.map((idx) => (
                <IndexCard key={idx.code} idx={idx} />
              ))}
            </section>
          )}

          {/* Market Breadth */}
          {data.breadth && (
            <section style={{ marginBottom: 24 }}>
              <BreadthBar breadth={data.breadth} />
            </section>
          )}

          {/* Top Gainers & Losers */}
          <section style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <StockTable
              title="Top Tăng giá"
              icon={"\u{1F4C8}"}
              stocks={data.topGainers}
              accentColor="#34d399"
              onTickerClick={loadDetail}
            />
            <StockTable
              title="Top Giảm giá"
              icon={"\u{1F4C9}"}
              stocks={data.topLosers}
              accentColor="#ef4444"
              onTickerClick={loadDetail}
            />
          </section>

          {/* Blue-chip Watchlist */}
          {data.blueChips?.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <BlueChipSection stocks={data.blueChips} onTickerClick={loadDetail} />
            </section>
          )}

          {/* Footer */}
          <section
            style={{
              ...CARD,
              padding: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              fontSize: 12,
              color: "var(--text-faint)",
            }}
          >
            <div>
              Nguồn dữ liệu: <b style={{ color: "var(--accent-soft)" }}>{data.source}</b> | Tự động làm mới mỗi 5 phút
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#34d399",
                  display: "inline-block",
                  animation: "shimmer 2s infinite",
                }}
              />
              <span>
                Cập nhật lúc {new Date(data.updated).toLocaleTimeString("vi-VN")}
              </span>
            </div>
          </section>
        </>
      )}
    </>
  );
}
