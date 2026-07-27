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

const APIS = [
  {
    name: "tcbs",
    run: async () => {
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
    },
  },
  {
    name: "vci",
    run: async () => {
      const url = "https://mt.vietcap.com.vn/api/price/symbols/getAll";
      const resp = await tryFetch(url, 8000, {
        "Origin": "https://mt.vietcap.com.vn",
        "Referer": "https://mt.vietcap.com.vn/",
      });

      const items = Array.isArray(resp) ? resp : resp?.data || resp?.d || [];
      if (!items.length) throw new Error("No data from VCI");

      const indices = [];
      const stocks = [];

      for (const s of items) {
        const sym = s.sym || s.symbol || s.stockCode || s.code || "";
        if (!sym) continue;

        const price = +(s.lastPrice || s.close || s.price || s.c || 0);
        const ref = +(s.refPrice || s.ref || s.r || s.basicPrice || 0);
        if (!price) continue;

        const change = ref ? +(price - ref).toFixed(2) : +(s.change || 0);
        const changePct = ref ? +((price - ref) / ref * 100).toFixed(2) : +(s.changePct || s.changePercent || 0);
        const vol = +(s.lot || s.accumulatedVol || s.volume || s.totalVolume || 0);

        if (["VNINDEX", "HNXINDEX", "UPCOMINDEX", "HNX-INDEX", "UPCOM-INDEX"].includes(sym.toUpperCase())) {
          const code = sym.toUpperCase()
            .replace("-INDEX", "").replace("INDEX", "")
            .replace("VN", "VNINDEX").replace("VNINDEXINDEX", "VNINDEX");
          indices.push({
            code: code === "VNINDEX" ? "VNINDEX" : code === "HNX" ? "HNX" : "UPCOM",
            value: price, change, changePercent: changePct,
            volume: vol, high: price, low: price, open: ref || price,
          });
        } else {
          stocks.push({ ticker: sym.toUpperCase(), price, change, changePercent: changePct, volume: vol });
        }
      }

      if (!stocks.length) throw new Error("No stock data from VCI");
      return buildResult(stocks, indices, "VCI (Viet Capital)");
    },
  },
  {
    name: "fialda",
    run: async () => {
      const url = "https://fwtapi1.fialda.com/api/services/app/StockInfo/GetAllStockInfo";
      const resp = await tryFetch(url, 8000, {
        "Origin": "https://fialda.com",
        "Referer": "https://fialda.com/",
      });

      const items = resp?.result || resp?.data || resp || [];
      if (!Array.isArray(items) || !items.length) throw new Error("No data from Fialda");

      const stocks = items
        .map((s) => {
          const ticker = s.stockCode || s.code || s.ticker || s.symbol || "";
          const price = +(s.lastPrice || s.close || s.price || s.matchPrice || 0);
          const ref = +(s.refPrice || s.basicPrice || s.referencePrice || 0);
          if (!ticker || !price) return null;
          return {
            ticker: ticker.toUpperCase(),
            price,
            change: ref ? +(price - ref).toFixed(2) : +(s.change || 0),
            changePercent: ref ? +((price - ref) / ref * 100).toFixed(2) : +(s.changePct || s.changePercent || 0),
            volume: +(s.totalVolume || s.volume || s.matchVolume || 0),
          };
        })
        .filter(Boolean);

      if (!stocks.length) throw new Error("No stock data from Fialda");
      return buildResult(stocks, [], "Fialda");
    },
  },
  {
    name: "vndirect",
    run: async () => {
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
    },
  },
  {
    name: "simplize",
    run: async () => {
      const url = "https://api.simplize.vn/api/company/list/all";
      const resp = await tryFetch(url, 8000, {
        "Origin": "https://simplize.vn",
        "Referer": "https://simplize.vn/",
      });

      const items = resp?.data || resp || [];
      if (!Array.isArray(items) || !items.length) throw new Error("No data from Simplize");

      const stocks = items
        .filter((s) => (s.exchange === "HOSE" || s.san === "HOSE" || !s.exchange))
        .map((s) => {
          const ticker = s.ticker || s.symbol || s.code || "";
          const price = +(s.price || s.close || s.lastPrice || 0);
          const ref = +(s.refPrice || s.basicPrice || 0);
          if (!ticker || !price) return null;
          return {
            ticker,
            price,
            change: ref ? +(price - ref).toFixed(2) : +(s.change || 0),
            changePercent: ref ? +((price - ref) / ref * 100).toFixed(2) : +(s.changePercent || s.changePct || 0),
            volume: +(s.volume || s.totalVolume || 0),
          };
        })
        .filter(Boolean);

      if (!stocks.length) throw new Error("No stock data from Simplize");
      return buildResult(stocks, [], "Simplize");
    },
  },
];

let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 5 * 60 * 1000;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get("debug") === "1";

  if (_cache && Date.now() - _cacheTime < CACHE_MS && !debug) {
    return Response.json(_cache);
  }

  const results = await Promise.allSettled(
    APIS.map(async (api) => {
      const start = Date.now();
      try {
        const result = await api.run();
        return { name: api.name, result, ms: Date.now() - start };
      } catch (e) {
        throw { name: api.name, error: e.message || String(e), ms: Date.now() - start };
      }
    })
  );

  const apiErrors = [];
  let winner = null;

  for (const r of results) {
    if (r.status === "fulfilled" && r.value?.result) {
      if (!winner) winner = r.value;
    } else if (r.status === "rejected") {
      const info = r.reason || {};
      apiErrors.push(`${info.name}: ${info.error} (${info.ms}ms)`);
    }
  }

  if (winner) {
    const data = winner.result;
    if (debug) {
      data._debug = {
        winner: winner.name,
        winnerMs: winner.ms,
        errors: apiErrors,
        allResults: results.map((r) =>
          r.status === "fulfilled"
            ? { name: r.value.name, status: "ok", ms: r.value.ms, stocks: r.value.result?.breadth?.total }
            : { name: r.reason?.name, status: "fail", ms: r.reason?.ms, error: r.reason?.error }
        ),
      };
    }
    _cache = data;
    _cacheTime = Date.now();
    return Response.json(data);
  }

  console.error("[stock] All APIs failed:", apiErrors);
  const fallback = {
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
    _errors: apiErrors,
  };
  return Response.json(fallback);
}
