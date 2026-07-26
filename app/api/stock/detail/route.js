async function tryFetch(url, timeout = 10000) {
  const res = await fetch(url, {
    headers: { "User-Agent": "GalaxyPay-Dashboard/1.0" },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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

  if (!ticker || ticker.length < 2 || ticker.length > 10) {
    return Response.json(
      { error: "Mã chứng khoán không hợp lệ" },
      { status: 400 },
    );
  }

  const errors = [];
  for (const api of APIS) {
    try {
      const result = await api.run(ticker);
      return Response.json(result);
    } catch (e) {
      errors.push(`${api.name}: ${e.message}`);
    }
  }

  return Response.json(
    { error: `Không tìm thấy dữ liệu cho mã ${ticker}`, details: errors },
    { status: 404 },
  );
}
