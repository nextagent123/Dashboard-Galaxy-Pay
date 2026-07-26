async function tryFetch(url, timeout = 10000) {
  const res = await fetch(url, {
    headers: { "User-Agent": "GalaxyPay-Dashboard/1.0" },
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
];

let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 5 * 60 * 1000;

export async function GET() {
  if (_cache && Date.now() - _cacheTime < CACHE_MS) {
    return Response.json(_cache);
  }
  const errors = [];
  for (const api of APIS) {
    try {
      const result = await api.run();
      _cache = result;
      _cacheTime = Date.now();
      return Response.json(result);
    } catch (e) {
      errors.push(`${api.name}: ${e.message}`);
    }
  }
  return Response.json(
    { error: "Không thể kết nối nguồn dữ liệu chứng khoán", details: errors },
    { status: 502 },
  );
}
