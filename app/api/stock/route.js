import { supabase } from "@/lib/supabase";

async function tryFetch(url, timeout = 8000, extraHeaders = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
        ...extraHeaders,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

function parseIndexBars(code, resp) {
  const arr = resp?.data || (Array.isArray(resp) ? resp : []);
  if (!arr.length) return null;
  const cur = arr[arr.length - 1];
  const prev = arr.length > 1 ? arr[arr.length - 2] : null;
  const c = cur.close;
  const pc = prev ? prev.close : cur.open;
  return {
    code,
    value: +c.toFixed(2),
    change: +(c - pc).toFixed(2),
    changePercent: pc ? +((c - pc) / pc * 100).toFixed(2) : 0,
    volume: cur.volume || 0,
    high: cur.high || c,
    low: cur.low || c,
    open: cur.open || c,
  };
}

const BLUE = new Set([
  "MBB", "LPB", "CII", "FPT", "DPR", "VTO", "PNJ", "VJC",
  "TCB", "VCK", "QNS", "BSR", "VPB", "VCB", "BID", "HDB",
  "DXG", "GEX", "GEG", "TVS", "SCR", "LCG", "SAB", "DHC",
  "NLG", "VND", "CTG", "MSN", "HHV", "VIB", "TPB", "HUT",
  "TCT", "PDR", "HDG", "HPG", "ACB", "DPM", "NTL", "HAH",
  "TNG", "DBC", "SAS", "HAX", "FOC", "ACV", "VNM", "DGC",
  "CTD", "POW", "SSI", "CMN", "LSS", "SKG", "CKG", "SCS",
  "HNG", "MWG", "E1VFVN30", "FUEVFVND",
]);

function buildResult(stocks, indices, source) {
  const desc = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const asc = [...stocks].sort((a, b) => a.changePercent - b.changePercent);
  return {
    indices,
    topGainers: desc.filter((s) => s.changePercent > 0).slice(0, 10),
    topLosers: asc.filter((s) => s.changePercent < 0).slice(0, 10),
    blueChips: stocks.filter((s) => BLUE.has(s.ticker)),
    breadth: {
      advances: stocks.filter((s) => s.changePercent > 0).length,
      declines: stocks.filter((s) => s.changePercent < 0).length,
      unchanged: stocks.filter((s) => s.changePercent === 0).length,
      total: stocks.length,
    },
    source,
    updated: new Date().toISOString(),
  };
}

// Try fetching from Supabase (data populated by GitHub Actions cron)
async function fetchFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("dashboard_data")
      .select("data")
      .eq("key", "stock_live")
      .single();
    if (error || !data?.data) return null;
    const stockData = data.data;
    if (!stockData.indices?.length && !stockData.topGainers?.length) return null;
    return stockData;
  } catch {
    return null;
  }
}

// TradingView Scanner (international, works from Cloudflare Workers)
async function fetchFromTradingView() {
  const scanUrl = "https://scanner.tradingview.com/vietnam/scan";
  const post = async (body) => {
    const res = await fetch(scanUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return res.json();
  };

  const watchlistTickers = [...BLUE].flatMap((t) => [
    `HOSE:${t}`, `HNX:${t}`, `UPCOM:${t}`,
  ]);

  const [indexResp, stockResp, watchResp] = await Promise.all([
    post({
      symbols: { tickers: ["HOSE:VNINDEX", "HNX:HNXINDEX", "UPCOM:UPCOMINDEX"] },
      columns: ["close", "change", "open", "high", "low", "volume"],
    }).catch(() => null),
    post({
      filter: [{ left: "exchange", operation: "equal", right: "HOSE" }],
      symbols: { query: { types: ["stock"] } },
      columns: ["close", "change", "volume"],
      sort: { sortBy: "volume", sortOrder: "desc" },
      range: [0, 500],
    }),
    post({
      symbols: { tickers: watchlistTickers },
      columns: ["close", "change", "volume"],
    }).catch(() => null),
  ]);

  const indices = [];
  const indexMap = { VNINDEX: "VNINDEX", HNXINDEX: "HNX", UPCOMINDEX: "UPCOM" };
  if (indexResp?.data) {
    for (const item of indexResp.data) {
      const [close, changePct, open, high, low, volume] = item.d;
      if (!close) continue;
      const sym = item.s.split(":")[1];
      const code = indexMap[sym] || sym;
      indices.push({
        code, value: +close.toFixed(2),
        change: +(close * changePct / 100).toFixed(2),
        changePercent: +changePct.toFixed(2),
        volume: volume || 0, high: high || close, low: low || close, open: open || close,
      });
    }
  }

  const stockMap = new Map();
  const parseStockItems = (items) => {
    if (!items) return;
    for (const item of items) {
      const [close, changePct, volume] = item.d;
      const ticker = item.s.split(":")[1];
      if (!close || !ticker || stockMap.has(ticker)) continue;
      stockMap.set(ticker, {
        ticker, price: +close.toFixed(2),
        change: +(close * changePct / 100).toFixed(2),
        changePercent: +changePct.toFixed(2),
        volume: volume || 0,
      });
    }
  };
  parseStockItems(stockResp?.data);
  parseStockItems(watchResp?.data);
  const stocks = Array.from(stockMap.values());

  if (!stocks.length) throw new Error("No data");
  return buildResult(stocks, indices, "TradingView");
}

// Direct API calls (fallback — may be blocked from Cloudflare Workers)
async function fetchFromTCBS() {
  const ts = Math.floor(Date.now() / 1000);
  const B = "https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/bars-long-term";
  const T = "https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/top-price-change";
  const hdrs = {
    "Origin": "https://tcinvest.tcbs.com.vn",
    "Referer": "https://tcinvest.tcbs.com.vn/",
  };

  const [vn, hnx, up, all] = await Promise.all([
    tryFetch(`${B}?ticker=VNINDEX&type=index&resolution=D&to=${ts}&countBack=2`, 8000, hdrs),
    tryFetch(`${B}?ticker=HNX&type=index&resolution=D&to=${ts}&countBack=2`, 8000, hdrs),
    tryFetch(`${B}?ticker=UPCOM&type=index&resolution=D&to=${ts}&countBack=2`, 8000, hdrs),
    tryFetch(`${T}?exchange=HOSE&limit=500`, 8000, hdrs).catch(() => null),
  ]);

  const indices = [
    parseIndexBars("VNINDEX", vn),
    parseIndexBars("HNX", hnx),
    parseIndexBars("UPCOM", up),
  ].filter(Boolean);
  if (!indices.length) throw new Error("No index data");

  const raw = all ? (all.data || all) : [];
  const stocks = (Array.isArray(raw) ? raw : [])
    .map((s) => ({
      ticker: s.ticker || s.symbol || "",
      price: s.close ?? s.price ?? 0,
      change: s.priceChange ?? s.changePrice ?? 0,
      changePercent: s.percentChange ?? s.changePricePct ?? 0,
      volume: s.volume ?? 0,
    }))
    .filter((s) => s.ticker);

  return buildResult(stocks, indices, "TCBS");
}

async function fetchFromVNDirect() {
  const d = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const url = `https://finfo-api.vndirect.com.vn/v4/stock_prices?sort=date%3Adesc&q=floor%3AHOSE~date%3Agte%3A${d}&size=500&page=1`;
  const data = await tryFetch(url, 8000, {
    "Origin": "https://dstock.vndirect.com.vn",
    "Referer": "https://dstock.vndirect.com.vn/",
  });
  if (!data.data?.length) throw new Error("No data");

  const latest = {};
  for (const s of data.data) {
    if (!latest[s.code]) latest[s.code] = s;
  }

  const stocks = Object.values(latest)
    .map((s) => ({
      ticker: s.code || "",
      price: s.close || 0,
      change: s.change || (s.close || 0) - (s.basicPrice || 0),
      changePercent: s.pctChange || 0,
      volume: s.nmVolume || 0,
    }))
    .filter((s) => s.ticker);

  return buildResult(stocks, [], "VNDirect");
}

let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 3 * 60 * 1000;

const FALLBACK = {
  indices: [
    { code: "VNINDEX", value: 1285.50, change: 12.30, changePercent: 0.97, volume: 850000000, high: 1290.30, low: 1275.20, open: 1273.20 },
    { code: "HNX", value: 235.20, change: 1.50, changePercent: 0.64, volume: 120000000, high: 237.10, low: 233.80, open: 233.70 },
    { code: "UPCOM", value: 95.30, change: -0.20, changePercent: -0.21, volume: 50000000, high: 96.10, low: 94.80, open: 95.50 },
  ],
  topGainers: [
    { ticker: "FPT", price: 152.80, change: 6.90, changePercent: 4.73, volume: 8200000 },
    { ticker: "VNM", price: 85.50, change: 2.30, changePercent: 2.76, volume: 5000000 },
    { ticker: "HPG", price: 28.90, change: 0.70, changePercent: 2.48, volume: 15000000 },
    { ticker: "TCB", price: 45.60, change: 0.90, changePercent: 2.01, volume: 7500000 },
    { ticker: "MWG", price: 62.30, change: 1.10, changePercent: 1.80, volume: 3200000 },
  ],
  topLosers: [
    { ticker: "VIC", price: 42.10, change: -1.90, changePercent: -4.32, volume: 2100000 },
    { ticker: "PLX", price: 38.20, change: -1.20, changePercent: -3.05, volume: 1800000 },
    { ticker: "SAB", price: 55.00, change: -1.50, changePercent: -2.65, volume: 900000 },
    { ticker: "POW", price: 12.80, change: -0.30, changePercent: -2.29, volume: 6000000 },
    { ticker: "REE", price: 67.40, change: -1.20, changePercent: -1.75, volume: 1200000 },
  ],
  blueChips: [
    { ticker: "MBB", price: 26.50, change: 0.30, changePercent: 1.15, volume: 9800000 },
    { ticker: "LPB", price: 18.20, change: 0.20, changePercent: 1.11, volume: 5200000 },
    { ticker: "CII", price: 22.80, change: -0.30, changePercent: -1.30, volume: 1800000 },
    { ticker: "FPT", price: 152.80, change: 6.90, changePercent: 4.73, volume: 8200000 },
    { ticker: "DPR", price: 42.50, change: 0.50, changePercent: 1.19, volume: 350000 },
    { ticker: "VTO", price: 8.90, change: 0.10, changePercent: 1.14, volume: 1200000 },
    { ticker: "PNJ", price: 96.50, change: 1.50, changePercent: 1.58, volume: 1400000 },
    { ticker: "VJC", price: 108.00, change: -1.20, changePercent: -1.10, volume: 2100000 },
    { ticker: "TCB", price: 45.60, change: 0.90, changePercent: 2.01, volume: 7500000 },
    { ticker: "VCK", price: 14.50, change: 0.30, changePercent: 2.11, volume: 280000 },
    { ticker: "QNS", price: 42.80, change: 0.60, changePercent: 1.42, volume: 620000 },
    { ticker: "BSR", price: 18.90, change: -0.40, changePercent: -2.07, volume: 3400000 },
    { ticker: "VPB", price: 22.30, change: 0.20, changePercent: 0.90, volume: 8900000 },
    { ticker: "VCB", price: 98.20, change: 0.80, changePercent: 0.82, volume: 4300000 },
    { ticker: "BID", price: 48.90, change: 0.60, changePercent: 1.24, volume: 3100000 },
    { ticker: "HDB", price: 28.40, change: 0.40, changePercent: 1.43, volume: 3800000 },
    { ticker: "DXG", price: 18.60, change: -0.20, changePercent: -1.06, volume: 4500000 },
    { ticker: "GEX", price: 24.30, change: 0.30, changePercent: 1.25, volume: 5600000 },
    { ticker: "GEG", price: 16.80, change: 0.20, changePercent: 1.20, volume: 1100000 },
    { ticker: "TVS", price: 32.50, change: 0.50, changePercent: 1.56, volume: 780000 },
    { ticker: "SCR", price: 9.80, change: -0.10, changePercent: -1.01, volume: 2200000 },
    { ticker: "LCG", price: 12.40, change: 0.10, changePercent: 0.81, volume: 1600000 },
    { ticker: "SAB", price: 55.00, change: -1.50, changePercent: -2.65, volume: 900000 },
    { ticker: "DHC", price: 38.20, change: 0.80, changePercent: 2.14, volume: 450000 },
    { ticker: "NLG", price: 32.10, change: -0.30, changePercent: -0.93, volume: 1900000 },
    { ticker: "VND", price: 18.50, change: 0.20, changePercent: 1.09, volume: 7200000 },
    { ticker: "CTG", price: 36.70, change: -0.20, changePercent: -0.54, volume: 5500000 },
    { ticker: "MSN", price: 78.60, change: 0.40, changePercent: 0.51, volume: 1500000 },
    { ticker: "HHV", price: 5.20, change: 0.05, changePercent: 0.97, volume: 3100000 },
    { ticker: "VIB", price: 24.80, change: 0.30, changePercent: 1.22, volume: 2400000 },
    { ticker: "TPB", price: 22.60, change: 0.10, changePercent: 0.44, volume: 4800000 },
    { ticker: "HUT", price: 16.90, change: 0.20, changePercent: 1.20, volume: 2600000 },
    { ticker: "TCT", price: 85.00, change: 1.00, changePercent: 1.19, volume: 120000 },
    { ticker: "PDR", price: 28.50, change: -0.50, changePercent: -1.72, volume: 3200000 },
    { ticker: "HDG", price: 36.40, change: 0.60, changePercent: 1.68, volume: 1300000 },
    { ticker: "HPG", price: 28.90, change: 0.70, changePercent: 2.48, volume: 15000000 },
    { ticker: "ACB", price: 25.80, change: -0.10, changePercent: -0.39, volume: 4200000 },
    { ticker: "DPM", price: 28.80, change: 0.30, changePercent: 1.05, volume: 2800000 },
    { ticker: "NTL", price: 18.50, change: -0.20, changePercent: -1.07, volume: 380000 },
    { ticker: "HAH", price: 42.00, change: 0.80, changePercent: 1.94, volume: 950000 },
    { ticker: "TNG", price: 22.40, change: 0.40, changePercent: 1.82, volume: 1700000 },
    { ticker: "DBC", price: 28.60, change: -0.40, changePercent: -1.38, volume: 2100000 },
    { ticker: "SAS", price: 75.00, change: 1.50, changePercent: 2.04, volume: 150000 },
    { ticker: "HAX", price: 15.80, change: 0.20, changePercent: 1.28, volume: 680000 },
    { ticker: "FOC", price: 36.00, change: 0.50, changePercent: 1.41, volume: 90000 },
    { ticker: "ACV", price: 82.50, change: 1.20, changePercent: 1.48, volume: 1200000 },
    { ticker: "VNM", price: 85.50, change: 2.30, changePercent: 2.76, volume: 5000000 },
    { ticker: "DGC", price: 88.00, change: 1.00, changePercent: 1.15, volume: 1800000 },
    { ticker: "CTD", price: 68.50, change: -0.80, changePercent: -1.15, volume: 520000 },
    { ticker: "POW", price: 12.80, change: -0.30, changePercent: -2.29, volume: 6000000 },
    { ticker: "SSI", price: 35.40, change: 0.50, changePercent: 1.43, volume: 6700000 },
    { ticker: "CMN", price: 12.00, change: 0.10, changePercent: 0.84, volume: 180000 },
    { ticker: "LSS", price: 28.50, change: 0.30, changePercent: 1.06, volume: 420000 },
    { ticker: "SKG", price: 32.80, change: -0.20, changePercent: -0.61, volume: 250000 },
    { ticker: "CKG", price: 15.60, change: 0.20, changePercent: 1.30, volume: 580000 },
    { ticker: "SCS", price: 128.00, change: 2.00, changePercent: 1.59, volume: 85000 },
    { ticker: "HNG", price: 8.50, change: -0.10, changePercent: -1.16, volume: 4800000 },
    { ticker: "MWG", price: 62.30, change: 1.10, changePercent: 1.80, volume: 3200000 },
    { ticker: "E1VFVN30", price: 18.20, change: 0.15, changePercent: 0.83, volume: 3500000 },
    { ticker: "FUEVFVND", price: 22.50, change: 0.20, changePercent: 0.90, volume: 1800000 },
  ],
  breadth: { advances: 250, declines: 120, unchanged: 30, total: 400 },
  source: "Dữ liệu tham khảo",
  updated: new Date().toISOString(),
};

async function ensureWatchlist(data) {
  const existing = new Set((data.blueChips || []).map((s) => s.ticker));
  const missing = [...BLUE].filter((t) => !existing.has(t));
  if (missing.length === 0) {
    data.blueChips = (data.blueChips || []).filter((s) => BLUE.has(s.ticker));
    return data;
  }
  try {
    const scanUrl = "https://scanner.tradingview.com/vietnam/scan";
    const tickers = missing.flatMap((t) => [`HOSE:${t}`, `HNX:${t}`, `UPCOM:${t}`]);
    const res = await fetch(scanUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ symbols: { tickers }, columns: ["close", "change", "volume"] }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const json = await res.json();
      const seen = new Set();
      for (const item of json.data || []) {
        const [close, changePct, volume] = item.d;
        const ticker = item.s.split(":")[1];
        if (!close || !ticker || seen.has(ticker)) continue;
        seen.add(ticker);
        data.blueChips.push({
          ticker,
          price: +close.toFixed(2),
          change: +(close * changePct / 100).toFixed(2),
          changePercent: +changePct.toFixed(2),
          volume: volume || 0,
        });
      }
    }
  } catch {}
  data.blueChips = (data.blueChips || []).filter((s) => BLUE.has(s.ticker));
  return data;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "1";

  if (_cache && Date.now() - _cacheTime < CACHE_MS && !debug) {
    return Response.json(_cache);
  }

  const log = [];
  let result = null;

  // 1. Try Supabase first (populated by GitHub Actions cron)
  try {
    const start = Date.now();
    const sbData = await fetchFromSupabase();
    const ms = Date.now() - start;
    if (sbData) {
      log.push({ source: "supabase", status: "ok", ms });
      if (debug) sbData._debug = { winner: "supabase", ms, log };
      result = sbData;
    } else {
      log.push({ source: "supabase", status: "empty", ms });
    }
  } catch (e) {
    log.push({ source: "supabase", status: "fail", error: e.message });
  }

  // 2. Try direct APIs if Supabase didn't work
  if (!result) {
    const directAPIs = [
      { name: "tradingview", fn: fetchFromTradingView },
      { name: "tcbs", fn: fetchFromTCBS },
      { name: "vndirect", fn: fetchFromVNDirect },
    ];

    const results = await Promise.allSettled(
      directAPIs.map(async (api) => {
        const start = Date.now();
        const r = await api.fn();
        return { name: api.name, result: r, ms: Date.now() - start };
      })
    );

    for (const r of results) {
      if (r.status === "fulfilled" && r.value?.result) {
        result = r.value.result;
        log.push({ source: r.value.name, status: "ok", ms: r.value.ms });
        if (debug) result._debug = { winner: r.value.name, ms: r.value.ms, log };
        break;
      }
      if (r.status === "rejected") {
        const info = r.reason || {};
        log.push({ source: info.name || "unknown", status: "fail", error: String(info.message || info) });
      }
    }
  }

  // 3. Fallback
  if (!result) {
    result = { ...FALLBACK, updated: new Date().toISOString() };
    if (debug) result._debug = { winner: "fallback", log };
  }

  // Always ensure watchlist has all BLUE tickers
  await ensureWatchlist(result);

  _cache = result;
  _cacheTime = Date.now();
  return Response.json(result);
}
