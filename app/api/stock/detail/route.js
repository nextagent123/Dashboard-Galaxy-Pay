import { supabase } from "@/lib/supabase";

async function tryFetch(url, timeout = 8000, extraHeaders = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
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

const TCBS_HEADERS = {
  "Origin": "https://tcinvest.tcbs.com.vn",
  "Referer": "https://tcinvest.tcbs.com.vn/",
};

// ── TradingView Scanner (works from Cloudflare Workers) ──
async function fetchFromTradingView(ticker) {
  const scanUrl = "https://scanner.tradingview.com/vietnam/scan";
  for (const exchange of ["HOSE", "HNX"]) {
    const res = await fetch(scanUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        symbols: { tickers: [`${exchange}:${ticker}`] },
        columns: [
          "close", "change", "open", "high", "low", "volume",
          "market_cap_basic", "price_earnings_ttm", "price_book_fq",
          "earnings_per_share_basic_ttm", "return_on_equity",
          "beta_1_year", "description", "dividend_yield_recent",
          "total_shares_outstanding",
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) continue;
    const json = await res.json();
    if (!json.data?.length) continue;
    const d = json.data[0].d;
    const close = d[0];
    if (!close) continue;

    const changePct = d[1] || 0;
    return {
      ticker,
      companyName: d[12] || ticker,
      exchange,
      industry: "",
      marketCap: d[6] ? Math.round(d[6] / 1e9) : null,
      pe: d[7] ? +d[7].toFixed(2) : null,
      pb: d[8] ? +d[8].toFixed(2) : null,
      eps: d[9] ? Math.round(d[9]) : null,
      roe: d[10] != null ? d[10] / 100 : null,
      foreignOwnership: null,
      dividend: d[13] != null ? +d[13].toFixed(2) : null,
      beta: d[11] ? +d[11].toFixed(2) : null,
      week52High: null,
      week52Low: null,
      outstandingShares: d[14] || null,
      price: +close.toFixed(2),
      change: +(close * changePct / 100).toFixed(2),
      changePercent: +changePct.toFixed(2),
      volume: d[5] || 0,
      high: d[3] || close,
      low: d[4] || close,
      open: d[2] || close,
      history: [],
      source: "TradingView",
      updated: new Date().toISOString(),
    };
  }
  throw new Error("No data from TradingView");
}

// ── TCBS (with proper headers) ──
async function fetchFromTCBS(ticker) {
  const ts = Math.floor(Date.now() / 1000);
  const [overview, bars] = await Promise.all([
    tryFetch(
      `https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/${ticker}/overview`,
      8000,
      TCBS_HEADERS,
    ).catch(() => null),
    tryFetch(
      `https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/bars-long-term?ticker=${ticker}&type=stock&resolution=D&to=${ts}&countBack=30`,
      8000,
      TCBS_HEADERS,
    ),
  ]);

  const hist = bars?.data || (Array.isArray(bars) ? bars : []);
  if (!hist.length) throw new Error("No price data");

  const latest = hist[hist.length - 1];
  const prev = hist.length > 1 ? hist[hist.length - 2] : null;
  const c = latest.close;
  const pc = prev ? prev.close : latest.open;

  return {
    ticker,
    companyName: overview?.companyName || overview?.shortName || ticker,
    exchange: overview?.exchange || "HOSE",
    industry: overview?.industry || overview?.industryEn || "",
    marketCap: overview?.marketCap
      ? +(overview.marketCap / 1e9).toFixed(0)
      : null,
    pe: overview?.pe ?? overview?.priceToEarning ?? null,
    pb: overview?.pb ?? overview?.priceToBook ?? null,
    eps: overview?.eps ?? null,
    roe: overview?.roe ?? null,
    foreignOwnership:
      overview?.foreignPercent ?? overview?.foreignOwnership ?? null,
    dividend: overview?.dividend ?? overview?.dividendYield ?? null,
    beta: overview?.beta ?? null,
    week52High: overview?.week52High ?? null,
    week52Low: overview?.week52Low ?? null,
    outstandingShares: overview?.outstandingShare ?? null,
    price: +c.toFixed(2),
    change: +(c - pc).toFixed(2),
    changePercent: pc ? +((c - pc) / pc * 100).toFixed(2) : 0,
    volume: latest.volume || 0,
    high: latest.high || c,
    low: latest.low || c,
    open: latest.open || c,
    history: hist.map((h) => ({
      date: h.tradingDate,
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close,
      volume: h.volume || 0,
    })),
    source: "TCBS",
    updated: new Date().toISOString(),
  };
}

// ── Supabase (from stored live data updated by GitHub Actions) ──
async function fetchFromSupabase(ticker) {
  if (!supabase) throw new Error("No Supabase client");
  const { data, error } = await supabase
    .from("dashboard_data")
    .select("data")
    .eq("key", "stock_live")
    .single();
  if (error || !data?.data?.allStocks) throw new Error("No stored data");

  const stock = data.data.allStocks.find((s) => s.t === ticker);
  if (!stock) throw new Error(`${ticker} not found`);

  return {
    ticker,
    companyName: ticker,
    exchange: "HOSE",
    industry: "",
    marketCap: null, pe: null, pb: null, eps: null, roe: null,
    foreignOwnership: null, dividend: null, beta: null,
    week52High: null, week52Low: null, outstandingShares: null,
    price: stock.p,
    change: +(stock.p * stock.c / 100).toFixed(2),
    changePercent: stock.c,
    volume: stock.v || 0,
    high: stock.p,
    low: stock.p,
    open: stock.p,
    history: [],
    source: "Supabase",
    updated: data.data.updated || new Date().toISOString(),
  };
}

// ── VNDirect ──
async function fetchFromVNDirect(ticker) {
  const d = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const url = `https://finfo-api.vndirect.com.vn/v4/stock_prices?sort=date%3Aasc&q=code%3A${ticker}~date%3Agte%3A${d}&size=30&page=1`;
  const data = await tryFetch(url, 8000, {
    "Origin": "https://dstock.vndirect.com.vn",
    "Referer": "https://dstock.vndirect.com.vn/",
  });
  if (!data.data?.length) throw new Error("No data");

  const hist = data.data;
  const latest = hist[hist.length - 1];
  const prev = hist.length > 1 ? hist[hist.length - 2] : null;

  return {
    ticker,
    companyName: ticker,
    exchange: latest.floor || "HOSE",
    industry: "",
    marketCap: null, pe: null, pb: null, eps: null, roe: null,
    foreignOwnership: null, dividend: null, beta: null,
    week52High: null, week52Low: null, outstandingShares: null,
    price: latest.close || 0,
    change:
      latest.change ||
      (latest.close || 0) - (latest.basicPrice || 0),
    changePercent: latest.pctChange || 0,
    volume: latest.nmVolume || 0,
    high: latest.high || latest.close,
    low: latest.low || latest.close,
    open: latest.open || latest.close,
    history: hist.map((h) => ({
      date: h.date,
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close,
      volume: h.nmVolume || 0,
    })),
    source: "VNDirect",
    updated: new Date().toISOString(),
  };
}

// ── Fetch chart history separately (supplement for sources without history) ──
async function fetchHistory(ticker) {
  const ts = Math.floor(Date.now() / 1000);
  try {
    const bars = await tryFetch(
      `https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/bars-long-term?ticker=${ticker}&type=stock&resolution=D&to=${ts}&countBack=30`,
      8000,
      TCBS_HEADERS,
    );
    const hist = bars?.data || (Array.isArray(bars) ? bars : []);
    if (hist.length) {
      return hist.map((h) => ({
        date: h.tradingDate, open: h.open, high: h.high,
        low: h.low, close: h.close, volume: h.volume || 0,
      }));
    }
  } catch {}
  try {
    const d = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const data = await tryFetch(
      `https://finfo-api.vndirect.com.vn/v4/stock_prices?sort=date%3Aasc&q=code%3A${ticker}~date%3Agte%3A${d}&size=30&page=1`,
      8000,
      { "Origin": "https://dstock.vndirect.com.vn", "Referer": "https://dstock.vndirect.com.vn/" },
    );
    if (data.data?.length) {
      return data.data.map((h) => ({
        date: h.date, open: h.open, high: h.high,
        low: h.low, close: h.close, volume: h.nmVolume || 0,
      }));
    }
  } catch {}
  return [];
}

const COMPANY_NAMES = {
  FPT: "FPT Corporation", VNM: "Vinamilk", VCB: "Vietcombank", HPG: "Hòa Phát Group",
  MWG: "Thế Giới Di Động", VHM: "Vinhomes", VIC: "Vingroup", MSN: "Masan Group",
  MBB: "MB Bank", TCB: "Techcombank", ACB: "ACB", VPB: "VPBank",
  BID: "BIDV", CTG: "VietinBank", SSI: "SSI Securities", GAS: "PV Gas",
  PLX: "Petrolimex", SAB: "Sabeco", REE: "REE Corp", POW: "PV Power",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = (searchParams.get("ticker") || "").toUpperCase().trim();
  const debug = searchParams.get("debug") === "1";

  if (!ticker || ticker.length < 2 || ticker.length > 10) {
    return Response.json(
      { error: "Mã chứng khoán không hợp lệ" },
      { status: 400 },
    );
  }

  const errors = [];

  const [mainResult, history] = await Promise.all([
    (async () => {
      const sources = [
        { name: "tradingview", fn: fetchFromTradingView },
        { name: "tcbs", fn: fetchFromTCBS },
        { name: "supabase", fn: fetchFromSupabase },
        { name: "vndirect", fn: fetchFromVNDirect },
      ];
      for (const src of sources) {
        try {
          const result = await src.fn(ticker);
          result._winner = src.name;
          return result;
        } catch (e) {
          errors.push(`${src.name}: ${e.message}`);
        }
      }
      return null;
    })(),
    fetchHistory(ticker),
  ]);

  if (mainResult) {
    if (!mainResult.history?.length && history.length) {
      mainResult.history = history;
    }
    if (mainResult.companyName === ticker && COMPANY_NAMES[ticker]) {
      mainResult.companyName = COMPANY_NAMES[ticker];
    }
    if (debug) mainResult._debug = { winner: mainResult._winner, errors };
    delete mainResult._winner;
    return Response.json(mainResult);
  }

  return Response.json({
    error: `Không thể tải dữ liệu cho mã ${ticker}. Vui lòng thử lại sau.`,
    _errors: debug ? errors : undefined,
  }, { status: 502 });
}
