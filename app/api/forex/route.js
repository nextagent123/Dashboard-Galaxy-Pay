const APIS = [
  {
    name: "exchangerate-api",
    url: "https://open.er-api.com/v6/latest/VND",
    parse: (data) => {
      if (data.result !== "success") throw new Error("API returned error");
      return {
        base: "VND",
        rates: data.rates,
        updated: data.time_last_update_utc,
        nextUpdate: data.time_next_update_utc,
        source: "ExchangeRate-API",
      };
    },
  },
  {
    name: "currency-api",
    url: "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
    parse: (data) => {
      const usdRates = data.usd;
      if (!usdRates || !usdRates.vnd) throw new Error("No VND in response");
      const vndPerUsd = usdRates.vnd;
      const vndRates = { VND: 1 };
      for (const [code, ratePerUsd] of Object.entries(usdRates)) {
        if (code === "vnd") continue;
        vndRates[code.toUpperCase()] = ratePerUsd / vndPerUsd;
      }
      return {
        base: "VND",
        rates: vndRates,
        updated: data.date || new Date().toISOString(),
        source: "Currency-API",
      };
    },
  },
  {
    name: "frankfurter",
    url: "https://api.frankfurter.app/latest?base=USD",
    parse: (data) => {
      if (!data.rates) throw new Error("No rates");
      const vndPerUsd = 25900;
      const vndRates = { VND: 1, USD: vndPerUsd };
      for (const [code, ratePerUsd] of Object.entries(data.rates)) {
        vndRates[code] = vndPerUsd / ratePerUsd;
      }
      return {
        base: "VND",
        rates: vndRates,
        updated: data.date || new Date().toISOString(),
        source: "Frankfurter/ECB (USD fixed)",
      };
    },
  },
];

let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 30 * 60 * 1000;

export async function GET() {
  if (_cache && Date.now() - _cacheTime < CACHE_MS) {
    return Response.json(_cache);
  }

  const errors = [];
  for (const api of APIS) {
    try {
      const res = await fetch(api.url, {
        headers: { "User-Agent": "GalaxyPay-Dashboard/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        errors.push(`${api.name}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const result = api.parse(data);
      _cache = result;
      _cacheTime = Date.now();
      return Response.json(result);
    } catch (e) {
      errors.push(`${api.name}: ${e.message}`);
    }
  }

  return Response.json(
    { error: "Không thể kết nối nguồn tỷ giá", details: errors },
    { status: 502 }
  );
}
