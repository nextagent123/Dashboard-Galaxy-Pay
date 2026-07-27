import { supabase } from "@/lib/supabase";

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

async function fetchFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("dashboard_data")
      .select("data")
      .eq("key", "forex_live")
      .single();
    if (error || !data?.data) return null;
    if (!data.data.rates) return null;
    return data.data;
  } catch {
    return null;
  }
}

let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 30 * 60 * 1000;

export async function GET() {
  if (_cache && Date.now() - _cacheTime < CACHE_MS) {
    return Response.json(_cache);
  }

  // 1. Try Supabase first
  try {
    const sbData = await fetchFromSupabase();
    if (sbData) {
      _cache = sbData;
      _cacheTime = Date.now();
      return Response.json(sbData);
    }
  } catch {}

  // 2. Try direct APIs in parallel
  const errors = [];
  const results = await Promise.allSettled(
    APIS.map(async (api) => {
      const res = await fetch(api.url, {
        headers: {
          "Accept": "application/json",
          "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return api.parse(data);
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      _cache = r.value;
      _cacheTime = Date.now();
      return Response.json(r.value);
    }
  }

  for (const r of results) {
    if (r.status === "rejected") {
      errors.push(r.reason?.message || "Unknown error");
      console.error(`[forex] API failed:`, r.reason?.message);
    }
  }
  console.error("[forex] All APIs failed:", errors);

  const fallback = {
    base: "VND",
    rates: {
      VND: 1, USD: 25920, EUR: 28950, GBP: 33100, JPY: 178.5,
      CNY: 3580, SGD: 19450, THB: 740, KRW: 19.2,
      AUD: 16800, CAD: 18900, CHF: 29800, HKD: 3320,
    },
    updated: new Date().toISOString(),
    source: "Dữ liệu tham khảo",
  };
  return Response.json(fallback);
}
