#!/usr/bin/env node
// Fetch live stock data from Vietnamese APIs and store in Supabase.
// Runs from GitHub Actions (whose IPs are not blocked by VN stock APIs).

import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !KEY) {
  console.error("Missing SUPABASE_URL / SUPABASE_KEY");
  process.exit(1);
}

const supabase = createClient(URL, KEY);

async function tryFetch(url, timeout = 10000, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "application/json",
        ...headers,
      },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

// ── TCBS ──
async function fetchTCBS() {
  const ts = Math.floor(Date.now() / 1000);
  const B = "https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/bars-long-term";
  const T = "https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/top-price-change";

  const [vn, hnx, up, all] = await Promise.all([
    tryFetch(`${B}?ticker=VNINDEX&type=index&resolution=D&to=${ts}&countBack=2`),
    tryFetch(`${B}?ticker=HNX&type=index&resolution=D&to=${ts}&countBack=2`),
    tryFetch(`${B}?ticker=UPCOM&type=index&resolution=D&to=${ts}&countBack=2`),
    tryFetch(`${T}?exchange=HOSE&limit=500`).catch(() => null),
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

// ── Main ──
async function main() {
  const errors = [];
  let result = null;

  // Try TCBS first (has index data)
  try {
    console.log("Trying TCBS...");
    result = await fetchTCBS();
    console.log(`TCBS OK: ${result.breadth.total} stocks, ${result.indices.length} indices`);
  } catch (e) {
    errors.push(`tcbs: ${e.message}`);
    console.error("TCBS failed:", e.message);
  }

  // Fallback to VNDirect
  if (!result) {
    try {
      console.log("Trying VNDirect...");
      result = await fetchVNDirect();
      console.log(`VNDirect OK: ${result.breadth.total} stocks`);
    } catch (e) {
      errors.push(`vndirect: ${e.message}`);
      console.error("VNDirect failed:", e.message);
    }
  }

  if (!result) {
    console.error("All APIs failed:", errors);
    process.exit(1);
  }

  // Save to Supabase
  console.log(`Saving to Supabase... (source: ${result.source})`);
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
    console.error("Supabase save failed:", error.message);
    process.exit(1);
  }

  console.log("Done! Stock data saved to Supabase.");

  // Also fetch and save forex
  try {
    console.log("Fetching forex...");
    const forexRes = await tryFetch("https://open.er-api.com/v6/latest/VND");
    if (forexRes.result === "success") {
      const forexData = {
        base: "VND",
        rates: forexRes.rates,
        updated: forexRes.time_last_update_utc,
        source: "ExchangeRate-API (live)",
      };
      await supabase
        .from("dashboard_data")
        .upsert(
          {
            key: "forex_live",
            description: "Live forex rates (auto-updated by GitHub Actions)",
            data: forexData,
          },
          { onConflict: "key" }
        );
      console.log("Forex data saved to Supabase.");
    }
  } catch (e) {
    console.error("Forex fetch failed:", e.message);
  }
}

main();
