#!/usr/bin/env node
// Fetch live stock data from Vietnamese APIs and store in Supabase.
// Runs from GitHub Actions (whose IPs are not blocked by VN stock APIs).

import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("ENV check:");
console.log("  SUPABASE_URL:", URL ? `${URL.slice(0, 30)}...` : "MISSING");
console.log("  SUPABASE_KEY:", KEY ? `${KEY.slice(0, 10)}...` : "MISSING");

if (!URL || !KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_KEY");
  process.exit(1);
}

const supabase = createClient(URL, KEY);

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function tryFetch(url, timeout = 12000, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    console.log(`  Fetching: ${url.slice(0, 80)}...`);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "application/json", ...headers },
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

async function tryPost(url, body, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    console.log(`  POST: ${url.slice(0, 80)}...`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "User-Agent": UA, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(body),
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

// ── TradingView Scanner (international, not blocked by VN firewalls) ──
async function fetchTradingView() {
  console.log("[TradingView] Fetching...");
  const scanUrl = "https://scanner.tradingview.com/vietnam/scan";

  const [indexResp, stockResp] = await Promise.all([
    tryPost(scanUrl, {
      symbols: { tickers: ["HOSE:VNINDEX", "HNX:HNXINDEX", "UPCOM:UPCOMINDEX"] },
      columns: ["close", "change", "open", "high", "low", "volume"],
    }).catch((e) => { console.log(`  Index scan failed: ${e.message}`); return null; }),
    tryPost(scanUrl, {
      filter: [{ left: "exchange", operation: "equal", right: "HOSE" }],
      symbols: { query: { types: ["stock"] } },
      columns: ["close", "change", "volume"],
      sort: { sortBy: "volume", sortOrder: "desc" },
      range: [0, 500],
    }),
  ]);

  const indices = [];
  const indexMap = { VNINDEX: "VNINDEX", HNXINDEX: "HNX", UPCOMINDEX: "UPCOM" };
  if (indexResp?.data) {
    for (const item of indexResp.data) {
      const [close, changePct, open, high, low, volume] = item.d;
      if (!close) continue;
      const sym = item.s.split(":")[1];
      const code = indexMap[sym] || sym;
      const pct = Math.abs(changePct) > 1000 ? changePct : changePct;
      const absChange = +(close * pct / 100).toFixed(2);
      indices.push({
        code,
        value: +close.toFixed(2),
        change: absChange,
        changePercent: +pct.toFixed(2),
        volume: volume || 0,
        high: high || close,
        low: low || close,
        open: open || close,
      });
    }
  }

  const stocks = [];
  if (stockResp?.data) {
    for (const item of stockResp.data) {
      const [close, changePct, volume] = item.d;
      const ticker = item.s.split(":")[1];
      if (!close || !ticker) continue;
      const absChange = +(close * changePct / 100).toFixed(2);
      stocks.push({
        ticker,
        price: +close.toFixed(2),
        change: absChange,
        changePercent: +(changePct).toFixed(2),
        volume: volume || 0,
      });
    }
  }

  if (!stocks.length) throw new Error("No stock data from TradingView");
  console.log(`[TradingView] Got ${stocks.length} stocks, ${indices.length} indices`);
  return buildResult(stocks, indices, "TradingView (live)");
}

// ── TCBS ──
async function fetchTCBS() {
  console.log("[TCBS] Fetching...");
  const ts = Math.floor(Date.now() / 1000);
  const B = "https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/bars-long-term";
  const T = "https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/top-price-change";

  const hdrs = { "Origin": "https://tcinvest.tcbs.com.vn", "Referer": "https://tcinvest.tcbs.com.vn/" };
  const [vn, hnx, up, all] = await Promise.all([
    tryFetch(`${B}?ticker=VNINDEX&type=index&resolution=D&to=${ts}&countBack=2`, 12000, hdrs),
    tryFetch(`${B}?ticker=HNX&type=index&resolution=D&to=${ts}&countBack=2`, 12000, hdrs),
    tryFetch(`${B}?ticker=UPCOM&type=index&resolution=D&to=${ts}&countBack=2`, 12000, hdrs),
    tryFetch(`${T}?exchange=HOSE&limit=500`, 12000, hdrs).catch(() => null),
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

  return buildResult(stocks, indices, "TCBS (live)");
}

// ── VNDirect ──
async function fetchVNDirect() {
  console.log("[VNDirect] Fetching...");
  const d = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const url = `https://finfo-api.vndirect.com.vn/v4/stock_prices?sort=date%3Adesc&q=floor%3AHOSE~date%3Agte%3A${d}&size=500&page=1`;
  const data = await tryFetch(url);
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

  return buildResult(stocks, [], "VNDirect (live)");
}

// ── SSI (with proper auth) ──
async function fetchSSI() {
  console.log("[SSI] Fetching...");
  const url = "https://iboard-query.ssi.com.vn/v2/stock/exchange/hose";
  const resp = await tryFetch(url, 12000, {
    "Origin": "https://iboard.ssi.com.vn",
    "Referer": "https://iboard.ssi.com.vn/",
  });
  const items = resp?.data || resp || [];
  if (!Array.isArray(items) || !items.length) throw new Error("No data");

  const stocks = items
    .map((s) => {
      const lp = s.lastPrice || s.matchPrice || s.c || 0;
      const ref = s.refPrice || s.r || 0;
      const price = lp > 500 ? lp / 1000 : lp;
      const refP = ref > 500 ? ref / 1000 : ref;
      return {
        ticker: s.stockSymbol || s.ss || s.symbol || "",
        price,
        change: refP ? +(price - refP).toFixed(2) : 0,
        changePercent: refP ? +((price - refP) / refP * 100).toFixed(2) : 0,
        volume: (s.matchVol || s.lot || 0) * 10,
      };
    })
    .filter((s) => s.ticker && s.price > 0);

  return buildResult(stocks, [], "SSI (live)");
}

// ── Main ──
const SOURCES = [
  { name: "TradingView", fn: fetchTradingView },
  { name: "TCBS", fn: fetchTCBS },
  { name: "VNDirect", fn: fetchVNDirect },
  { name: "SSI", fn: fetchSSI },
];

async function main() {
  console.log("=== Fetch Stock Data ===");
  console.log(`Time: ${new Date().toISOString()}`);
  console.log("");

  const errors = [];
  let result = null;

  for (const source of SOURCES) {
    if (result) break;
    try {
      result = await source.fn();
      console.log(`[${source.name}] OK: ${result.breadth.total} stocks, ${result.indices.length} indices`);
    } catch (e) {
      const msg = `${source.name}: ${e.message}`;
      errors.push(msg);
      console.error(`[${source.name}] FAILED: ${e.message}`);
    }
  }

  if (!result) {
    console.error("\nAll APIs failed:");
    errors.forEach((e) => console.error(`  - ${e}`));
    console.error("\nStock data NOT updated.");
    process.exit(1);
  }

  // Save to Supabase
  console.log(`\nSaving to Supabase... (source: ${result.source})`);
  const { error } = await supabase
    .from("dashboard_data")
    .upsert(
      {
        key: "stock_live",
        description: "Live stock market data (auto-updated by GitHub Actions)",
        data: result,
      },
      { onConflict: "key" }
    );

  if (error) {
    console.error("Supabase upsert FAILED:", error.message, error.details, error.hint);
    process.exit(1);
  }
  console.log("Stock data saved to Supabase OK.");

  // Verify the save
  const { data: verify } = await supabase
    .from("dashboard_data")
    .select("key, data")
    .eq("key", "stock_live")
    .single();
  if (verify?.data?.source) {
    console.log(`Verified: source=${verify.data.source}, updated=${verify.data.updated}`);
  } else {
    console.error("Verification FAILED: could not read back data");
  }

  // Also fetch and save forex
  console.log("\n--- Forex ---");
  const forexAPIs = [
    {
      name: "ExchangeRate-API",
      url: "https://open.er-api.com/v6/latest/VND",
      parse: (d) => d.result === "success" ? { base: "VND", rates: d.rates, updated: d.time_last_update_utc, source: "ExchangeRate-API (live)" } : null,
    },
    {
      name: "Currency-API",
      url: "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
      parse: (d) => {
        if (!d.usd?.vnd) return null;
        const vndPerUsd = d.usd.vnd;
        const rates = { VND: 1 };
        for (const [code, rate] of Object.entries(d.usd)) {
          if (code === "vnd") continue;
          rates[code.toUpperCase()] = rate / vndPerUsd;
        }
        return { base: "VND", rates, updated: d.date || new Date().toISOString(), source: "Currency-API (live)" };
      },
    },
  ];

  for (const api of forexAPIs) {
    try {
      console.log(`[${api.name}] Fetching...`);
      const data = await tryFetch(api.url);
      const parsed = api.parse(data);
      if (parsed) {
        await supabase
          .from("dashboard_data")
          .upsert(
            { key: "forex_live", description: "Live forex rates (auto-updated)", data: parsed },
            { onConflict: "key" }
          );
        console.log(`[${api.name}] Forex saved to Supabase OK.`);
        break;
      }
    } catch (e) {
      console.error(`[${api.name}] FAILED: ${e.message}`);
    }
  }

  console.log("\n=== Done ===");
}

main();
