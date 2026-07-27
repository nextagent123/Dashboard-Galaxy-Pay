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
  "VNM", "FPT", "VCB", "HPG", "MWG", "VHM", "VIC", "MSN",
  "MBB", "TCB", "ACB", "VPB", "BID", "CTG", "SSI", "GAS",
  "PLX", "SAB", "REE", "POW",
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
    { ticker: "VNM", price: 85.50, change: 2.30, changePercent: 2.76, volume: 5000000 },
    { ticker: "FPT", price: 152.80, change: 6.90, changePercent: 4.73, volume: 8200000 },
    { ticker: "VCB", price: 98.20, change: 0.80, changePercent: 0.82, volume: 4300000 },
    { ticker: "HPG", price: 28.90, change: 0.70, changePercent: 2.48, volume: 15000000 },
    { ticker: "MWG", price: 62.30, change: 1.10, changePercent: 1.80, volume: 3200000 },
    { ticker: "VHM", price: 38.50, change: -0.50, changePercent: -1.28, volume: 2800000 },
    { ticker: "VIC", price: 42.10, change: -1.90, changePercent: -4.32, volume: 2100000 },
    { ticker: "MSN", price: 78.60, change: 0.40, changePercent: 0.51, volume: 1500000 },
    { ticker: "MBB", price: 26.50, change: 0.30, changePercent: 1.15, volume: 9800000 },
    { ticker: "TCB", price: 45.60, change: 0.90, changePercent: 2.01, volume: 7500000 },
    { ticker: "ACB", price: 25.80, change: -0.10, changePercent: -0.39, volume: 4200000 },
    { ticker: "VPB", price: 22.30, change: 0.20, changePercent: 0.90, volume: 8900000 },
    { ticker: "BID", price: 48.90, change: 0.60, changePercent: 1.24, volume: 3100000 },
    { ticker: "CTG", price: 36.70, change: -0.20, changePercent: -0.54, volume: 5500000 },
    { ticker: "SSI", price: 35.40, change: 0.50, changePercent: 1.43, volume: 6700000 },
    { ticker: "GAS", price: 82.30, change: 1.20, changePercent: 1.48, volume: 2400000 },
    { ticker: "PLX", price: 38.20, change: -1.20, changePercent: -3.05, volume: 1800000 },
    { ticker: "SAB", price: 55.00, change: -1.50, changePercent: -2.65, volume: 900000 },
    { ticker: "REE", price: 67.40, change: -1.20, changePercent: -1.75, volume: 1200000 },
    { ticker: "POW", price: 12.80, change: -0.30, changePercent: -2.29, volume: 6000000 },
  ],
  breadth: { advances: 250, declines: 120, unchanged: 30, total: 400 },
  source: "Dữ liệu tham khảo",
  updated: new Date().toISOString(),
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "1";

  if (_cache && Date.now() - _cacheTime < CACHE_MS && !debug) {
    return Response.json(_cache);
  }

  const log = [];

  // 1. Try Supabase first (populated by GitHub Actions cron)
  try {
    const start = Date.now();
    const sbData = await fetchFromSupabase();
    const ms = Date.now() - start;
    if (sbData) {
      log.push({ source: "supabase", status: "ok", ms });
      if (debug) sbData._debug = { winner: "supabase", ms, log };
      _cache = sbData;
      _cacheTime = Date.now();
      return Response.json(sbData);
    }
    log.push({ source: "supabase", status: "empty", ms });
  } catch (e) {
    log.push({ source: "supabase", status: "fail", error: e.message });
  }

  // 2. Try direct APIs (may be blocked from Cloudflare Workers)
  const directAPIs = [
    { name: "tcbs", fn: fetchFromTCBS },
    { name: "vndirect", fn: fetchFromVNDirect },
  ];

  const results = await Promise.allSettled(
    directAPIs.map(async (api) => {
      const start = Date.now();
      const result = await api.fn();
      return { name: api.name, result, ms: Date.now() - start };
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value?.result) {
      const data = r.value.result;
      log.push({ source: r.value.name, status: "ok", ms: r.value.ms });
      if (debug) data._debug = { winner: r.value.name, ms: r.value.ms, log };
      _cache = data;
      _cacheTime = Date.now();
      return Response.json(data);
    }
    if (r.status === "rejected") {
      const info = r.reason || {};
      log.push({ source: info.name || "unknown", status: "fail", error: String(info.message || info) });
    }
  }

  // 3. Fallback
  const fallback = { ...FALLBACK, updated: new Date().toISOString() };
  if (debug) fallback._debug = { winner: "fallback", log };
  return Response.json(fallback);
}
