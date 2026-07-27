async function tryFetch(url, timeout = 10000, extraHeaders = {}) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Accept": "application/json",
      "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
      ...extraHeaders,
    },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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
    name: "wichart",
    run: async () => {
      const [indexRes, stockRes] = await Promise.all([
        tryFetch("https://wichart.vn/api/indexes/list"),
        tryFetch("https://wichart.vn/api/thong-ke-thi-truong/bien-dong-gia?san=HOSE"),
      ]);

      const indexData = indexRes?.data || indexRes || [];
      const indices = (Array.isArray(indexData) ? indexData : [])
        .filter((i) => ["VNINDEX", "HNX", "UPCOM"].includes(i.indexCode || i.code))
        .map((i) => ({
          code: i.indexCode || i.code,
          value: +(i.indexValue || i.value || 0),
          change: +(i.change || 0),
          changePercent: +(i.changePercent || i.pctChange || 0),
          volume: i.totalVolume || i.volume || 0,
          high: +(i.highIndex || i.high || i.indexValue || 0),
          low: +(i.lowIndex || i.low || i.indexValue || 0),
          open: +(i.openIndex || i.open || i.indexValue || 0),
        }));

      const stockData = stockRes?.data || stockRes || [];
      const stocks = (Array.isArray(stockData) ? stockData : [])
        .map((s) => ({
          ticker: s.code || s.ticker || s.symbol || "",
          price: +(s.price || s.close || s.matchPrice || 0),
          change: +(s.change || s.priceChange || 0),
          changePercent: +(s.changePercent || s.pctChange || 0),
          volume: s.volume || s.totalVolume || 0,
        }))
        .filter((s) => s.ticker && s.price > 0);

      if (!stocks.length && !indices.length) throw new Error("No data");
      return buildResult(stocks, indices, "WiChart");
    },
  },
  {
    name: "tcbs",
    run: async () => {
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

      return buildResult(stocks, indices, "TCBS");
    },
  },
  {
    name: "vndirect",
    run: async () => {
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

      return buildResult(stocks, [], "VNDirect");
    },
  },
  {
    name: "ssi",
    run: async () => {
      const url = "https://iboard-query.ssi.com.vn/v2/stock/exchange/hose";
      const resp = await tryFetch(url);
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

      return buildResult(stocks, [], "SSI");
    },
  },
  {
    name: "cafef",
    run: async () => {
      const url = "https://s.cafef.vn/ajax/marketoverview.ashx";
      const resp = await tryFetch(url, 10000, {
        "Referer": "https://cafef.vn/",
      });
      const items = resp?.Data || resp?.data || resp || [];
      if (!Array.isArray(items) || !items.length) throw new Error("No data");

      const indices = [];
      const stocks = [];
      for (const s of items) {
        const code = s.a || s.Symbol || s.code || "";
        const price = +(s.b || s.Price || s.close || 0);
        const change = +(s.c || s.Change || 0);
        const changePct = +(s.d || s.PerChange || 0);
        const vol = +(s.g || s.Volume || 0);
        if (!code || !price) continue;
        if (["VNINDEX", "HNX-INDEX", "UPCOM-INDEX", "HNX", "UPCOM"].includes(code.toUpperCase())) {
          const normalized = code.toUpperCase().replace("-INDEX", "");
          indices.push({
            code: normalized, value: price, change, changePercent: changePct,
            volume: vol, high: price, low: price, open: price,
          });
        } else {
          stocks.push({ ticker: code, price, change, changePercent: changePct, volume: vol });
        }
      }

      if (!stocks.length) throw new Error("No stock data");
      return buildResult(stocks, indices, "CafeF");
    },
  },
];

let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 5 * 60 * 1000;

export async function GET() {
  if (_cache && Date.now() - _cacheTime < CACHE_MS) {
    return Response.json(_cache);
  }

  const errors = [];

  const raceResults = await Promise.allSettled(
    APIS.slice(0, 3).map((api) =>
      api.run().then((r) => ({ ...r, _apiName: api.name }))
    )
  );

  for (const r of raceResults) {
    if (r.status === "fulfilled" && r.value) {
      const result = r.value;
      delete result._apiName;
      _cache = result;
      _cacheTime = Date.now();
      return Response.json(result);
    }
    if (r.status === "rejected") {
      errors.push(r.reason?.message || "Unknown error");
    }
  }

  for (const api of APIS.slice(3)) {
    try {
      const result = await api.run();
      _cache = result;
      _cacheTime = Date.now();
      return Response.json(result);
    } catch (e) {
      errors.push(`${api.name}: ${e.message}`);
      console.error(`[stock] ${api.name} failed:`, e.message);
    }
  }
  console.error("[stock] All APIs failed:", errors);
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
    _errors: errors,
  };
  return Response.json(fallback);
}
