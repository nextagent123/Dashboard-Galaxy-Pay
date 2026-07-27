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

const APIS = [
  {
    name: "tcbs",
    run: async (ticker) => {
      const ts = Math.floor(Date.now() / 1000);
      const [overview, bars] = await Promise.all([
        tryFetch(
          `https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/${ticker}/overview`,
        ).catch(() => null),
        tryFetch(
          `https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/bars-long-term?ticker=${ticker}&type=stock&resolution=D&to=${ts}&countBack=30`,
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
    },
  },
  {
    name: "vndirect",
    run: async (ticker) => {
      const d = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const url = `https://finfo-api.vndirect.com.vn/v4/stock_prices?sort=date%3Aasc&q=code%3A${ticker}~date%3Agte%3A${d}&size=30&page=1`;
      const data = await tryFetch(url);
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
    },
  },
];

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

  const apiErrors = [];
  const results = await Promise.allSettled(
    APIS.map(async (api) => {
      const start = Date.now();
      try {
        const result = await api.run(ticker);
        return { name: api.name, result, ms: Date.now() - start };
      } catch (e) {
        throw { name: api.name, error: e.message || String(e), ms: Date.now() - start };
      }
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value?.result) {
      const data = r.value.result;
      if (debug) {
        data._debug = {
          winner: r.value.name,
          winnerMs: r.value.ms,
          errors: apiErrors,
        };
      }
      return Response.json(data);
    }
    if (r.status === "rejected") {
      const info = r.reason || {};
      apiErrors.push(`${info.name}: ${info.error} (${info.ms}ms)`);
      console.error(`[stock-detail] ${info.name} failed (${info.ms}ms):`, info.error);
    }
  }
  console.error("[stock-detail] All APIs failed:", apiErrors);

  const SAMPLE_PRICES = {
    FPT: 152.80, VNM: 85.50, VCB: 98.20, HPG: 28.90, MWG: 62.30,
    VHM: 38.50, VIC: 42.10, MSN: 78.60, MBB: 26.50, TCB: 45.60,
    ACB: 25.80, VPB: 22.30, BID: 48.90, CTG: 36.70, SSI: 35.40,
    GAS: 82.30, PLX: 38.20, SAB: 55.00, REE: 67.40, POW: 12.80,
  };
  const SAMPLE_NAMES = {
    FPT: "FPT Corporation", VNM: "Vinamilk", VCB: "Vietcombank", HPG: "Hòa Phát Group",
    MWG: "Thế Giới Di Động", VHM: "Vinhomes", VIC: "Vingroup", MSN: "Masan Group",
    MBB: "MB Bank", TCB: "Techcombank", ACB: "ACB", VPB: "VPBank",
    BID: "BIDV", CTG: "VietinBank", SSI: "SSI Securities", GAS: "PV Gas",
    PLX: "Petrolimex", SAB: "Sabeco", REE: "REE Corp", POW: "PV Power",
  };
  const price = SAMPLE_PRICES[ticker] || 50;
  const base = price * 0.97;
  const history = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const c = base + Math.random() * (price * 0.06);
    return {
      date: d.toISOString().slice(0, 10),
      open: +(c - Math.random() * 2).toFixed(2),
      high: +(c + Math.random() * 3).toFixed(2),
      low: +(c - Math.random() * 3).toFixed(2),
      close: +c.toFixed(2),
      volume: Math.floor(2000000 + Math.random() * 8000000),
    };
  });
  return Response.json({
    ticker,
    companyName: SAMPLE_NAMES[ticker] || ticker,
    exchange: "HOSE",
    industry: "",
    marketCap: null, pe: null, pb: null, eps: null, roe: null,
    foreignOwnership: null, dividend: null, beta: null,
    week52High: null, week52Low: null, outstandingShares: null,
    price,
    change: +(price - history[history.length - 2].close).toFixed(2),
    changePercent: +((price - history[history.length - 2].close) / history[history.length - 2].close * 100).toFixed(2),
    volume: 5000000,
    high: price + 2,
    low: price - 2,
    open: price - 1,
    history,
    source: "Dữ liệu tham khảo",
    updated: new Date().toISOString(),
    _errors: apiErrors,
  });
}
