import { buildDashboardContext } from "@/lib/chatContext";
import { GALAXY_PAY_KNOWLEDGE } from "@/lib/galaxyPayKnowledge";
import { supabase } from "@/lib/supabase";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Anthropic from "@anthropic-ai/sdk";

let _knowledgeCache = null;

export async function getKnowledge() {
  if (_knowledgeCache) return _knowledgeCache;
  if (supabase) {
    try {
      const { data } = await supabase
        .from("dashboard_data")
        .select("data")
        .eq("key", "galaxy_pay_knowledge")
        .single();
      if (data?.data?.text) {
        _knowledgeCache = data.data.text;
        return _knowledgeCache;
      }
    } catch {}
  }
  _knowledgeCache = GALAXY_PAY_KNOWLEDGE;
  return _knowledgeCache;
}

const FOREX_KEYS = ["tỷ giá", "ngoại hối", "forex", "usd", "eur", "gbp", "jpy", "cny", "sgd", "thb", "krw", "ngoại tệ", "exchange rate"];
const STOCK_KEYS = [
  "chứng khoán", "cổ phiếu", "vn-index", "vnindex", "stock", "hose", "hnx", "upcom",
  "thị trường", "blue chip", "bluechip", "giá cổ", "mã cổ",
];
const STOCK_CONTEXT = ["giá", "bao nhiêu", "tăng", "giảm", "mua", "bán", "cổ phiếu", "chứng khoán", "thế nào", "ra sao"];
const COMMON_WORDS = new Set([
  "THE", "AND", "FOR", "NOT", "BUT", "ARE", "WAS", "HAS", "HAD", "CAN", "MAY", "YOU", "ALL",
  "USD", "EUR", "GBP", "JPY", "CNY", "SGD", "THB", "KRW", "VND", "AUD", "CAD", "CHF", "HKD",
  "GMV", "KPI", "BDM", "CTV", "OTA", "PSP", "SME", "API", "BOX", "TOP", "VAT", "HOW", "WHY",
  "WHO", "PAY", "WEB", "APP", "PDF", "FAQ", "CEO", "CFO", "COO", "CTO",
]);

function matchesAny(text, keys) {
  const t = text.toLowerCase().normalize("NFC");
  return keys.some((k) => t.includes(k));
}

function extractTickers(text) {
  const matches = text.toUpperCase().match(/\b[A-Z]{3,4}\b/g) || [];
  return [...new Set(matches.filter((m) => !COMMON_WORDS.has(m)))];
}

function shouldFetchStock(text) {
  if (matchesAny(text, STOCK_KEYS)) return true;
  const tickers = extractTickers(text);
  if (tickers.length > 0 && STOCK_CONTEXT.some((w) => text.toLowerCase().includes(w))) return true;
  return false;
}

async function fetchStockFromSupabase() {
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from("dashboard_data")
      .select("data")
      .eq("key", "stock_live")
      .single();
    return data?.data || null;
  } catch {
    return null;
  }
}

function formatStockContext(d, requestedTickers) {
  const parts = [];
  parts.push(`\n=== DỮ LIỆU CHỨNG KHOÁN VIỆT NAM REALTIME ===`);
  parts.push(`Nguồn: ${d.source || "API"} | Cập nhật: ${d.updated || "now"}`);

  if (d.indices?.length) {
    parts.push("Chỉ số:");
    for (const i of d.indices) {
      parts.push(`• ${i.code}: ${i.value} (${i.change >= 0 ? "+" : ""}${i.change}, ${i.changePercent >= 0 ? "+" : ""}${i.changePercent}%)`);
    }
  }

  if (requestedTickers.length > 0 && d.allStocks?.length) {
    const tickerSet = new Set(requestedTickers);
    const found = d.allStocks.filter((s) => tickerSet.has(s.t));
    if (found.length > 0) {
      parts.push(`\nCHI TIẾT MÃ CỔ PHIẾU ĐƯỢC HỎI:`);
      for (const s of found) {
        parts.push(`• ${s.t}: ${(s.p * 1000).toLocaleString("vi-VN")} VND | Thay đổi: ${s.c >= 0 ? "+" : ""}${s.c}% | KL: ${(s.v || 0).toLocaleString("vi-VN")}`);
      }
    } else {
      const notFound = requestedTickers.filter((t) => !d.allStocks.some((s) => s.t === t));
      if (notFound.length) {
        parts.push(`\nKhông tìm thấy mã: ${notFound.join(", ")} trên sàn HOSE.`);
      }
    }
  }

  const gainers = (d.topGainers || []).slice(0, 5);
  const losers = (d.topLosers || []).slice(0, 5);
  if (gainers.length) {
    parts.push("\nTop tăng giá:");
    for (const s of gainers) parts.push(`• ${s.ticker}: ${s.price} (+${s.changePercent}%)`);
  }
  if (losers.length) {
    parts.push("Top giảm giá:");
    for (const s of losers) parts.push(`• ${s.ticker}: ${s.price} (${s.changePercent}%)`);
  }
  if (d.breadth) {
    parts.push(`Độ rộng: Tăng ${d.breadth.advances}, Giảm ${d.breadth.declines}, Đứng ${d.breadth.unchanged} / Tổng ${d.breadth.total}`);
  }

  if (d.blueChips?.length && requestedTickers.length === 0) {
    parts.push("\nBlue Chips:");
    for (const s of d.blueChips) {
      parts.push(`• ${s.ticker}: ${s.price} (${s.changePercent >= 0 ? "+" : ""}${s.changePercent}%)`);
    }
  }

  return parts.join("\n");
}

export async function fetchLiveContext(question, baseUrl) {
  const fetches = [];

  if (matchesAny(question, FOREX_KEYS)) {
    fetches.push(
      fetch(`${baseUrl}/api/forex`, { signal: AbortSignal.timeout(3000) })
        .then(async (r) => {
          if (!r.ok) return "";
          const d = await r.json();
          if (!d.rates) return "";
          return (
            `\n=== DỮ LIỆU TỶ GIÁ NGOẠI HỐI REALTIME ===\nNguồn: ${d.source || "API"} | Cập nhật: ${d.updated || "now"}\nTỷ giá VND:\n` +
            Object.entries(d.rates).map(([k, v]) => `• 1 ${k} = ${Number(v).toLocaleString("vi-VN")} VND`).join("\n")
          );
        })
        .catch(() => "")
    );
  }

  if (shouldFetchStock(question)) {
    const tickers = extractTickers(question);
    fetches.push(
      fetchStockFromSupabase()
        .then((d) => {
          if (d) return formatStockContext(d, tickers);
          return fetch(`${baseUrl}/api/stock`, { signal: AbortSignal.timeout(3000) })
            .then(async (r) => {
              if (!r.ok) return "";
              const data = await r.json();
              return formatStockContext(data, tickers);
            })
            .catch(() => "");
        })
        .catch(() => "")
    );
  }

  if (fetches.length === 0) return "";
  const results = await Promise.all(fetches);
  return results.filter(Boolean).join("\n");
}

export const RESTRICTED_SYSTEM_PROMPT = `Bạn là một trợ lý AI thông minh, thân thiện.

PHONG CÁCH TRẢ LỜI:
- Ngắn gọn, súc tích, đi thẳng vào trọng tâm
- Mềm mại, chuyên nghiệp, giọng thân thiện
- Xưng "mình", gọi "bạn"
- Trả lời bằng tiếng Việt
- Dùng emoji vừa phải

QUY TẮC:
- Trả lời các câu hỏi chung dựa trên kiến thức của bạn
- KHÔNG cung cấp bất kỳ thông tin nội bộ nào về Galaxy Pay, bao gồm: sản phẩm, biểu phí, đối tác, chỉ số kinh doanh, KPI, doanh thu, lợi nhuận, nhân sự, quy trình nội bộ
- Nếu được hỏi về Galaxy Pay hoặc thông tin kinh doanh nội bộ, lịch sự từ chối: "Mình không có quyền truy cập thông tin này. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ thêm nhé!"
- Có thể trả lời các câu hỏi chung về kinh tế, tài chính, công nghệ, hoặc bất kỳ chủ đề nào khác`;

export function buildSystemPrompt(knowledge, liveData) {
  return `Bạn là **Trợ lý Khối Kinh doanh** — trợ lý AI của Galaxy Pay Dashboard, hệ thống báo cáo kinh doanh nội bộ Công ty TNHH Galaxy Pay.

PHONG CÁCH TRẢ LỜI:
- Câu hỏi đơn giản: trả lời ngắn gọn, đi thẳng vào trọng tâm
- Câu hỏi cần giải thích, phân tích, hướng dẫn, so sánh, soạn thảo: trả lời **đầy đủ, chi tiết, có cấu trúc** — độ dài theo đúng nhu cầu của câu hỏi, không tự cắt ngắn
- Mềm mại, chuyên nghiệp, giọng đồng nghiệp thân thiện
- Xưng "mình", gọi "bạn"
- Dùng emoji vừa phải, không lạm dụng
- Khi phân tích số liệu: nêu số chính → nhận xét → gợi mở bước tiếp theo
- Với thông tin khách hàng, biểu phí dịch vụ, bảng giá, chính sách phí, đối tác: liệt kê đủ các mức phí, điều kiện áp dụng, phân loại khách hàng — không tóm tắt hay bỏ sót

PHẠM VI: Trả lời MỌI câu hỏi, không giới hạn chủ đề.
- Câu hỏi ngoài Galaxy Pay và số liệu dashboard (kiến thức chung, kinh tế, tài chính, công nghệ, thanh toán/fintech nói chung, kỹ năng làm việc, soạn thảo email/văn bản, dịch thuật, tính toán, lên ý tưởng...): trả lời đầy đủ bằng kiến thức của bạn, không từ chối chỉ vì nằm ngoài dữ liệu được cung cấp
- Thông tin dễ thay đổi theo thời gian (tin tức, giá cả, quy định, lãi suất): nói rõ đó là hiểu biết chung có thể chưa cập nhật và nên kiểm tra nguồn chính thức
- Riêng số liệu và thông tin nội bộ Galaxy Pay: CHỈ dùng dữ liệu được cung cấp bên dưới, không suy đoán

NHIỆM VỤ VỀ GALAXY PAY:
- Phân tích GMV, Doanh thu, Lợi nhuận, biên LN, xu hướng
- So sánh thực đạt vs kế hoạch, tính runrate, gap, dự báo
- Trả lời về Galaxy Pay: sản phẩm, biểu phí, đối tác, SME in a Box
- Khi được hỏi "tại sao" → phân tích dựa trên dữ liệu tháng biến động
- Trả lời về tỷ giá ngoại hối và chứng khoán dựa trên dữ liệu realtime
- Tra cứu giá từng mã cổ phiếu cụ thể (VD: FPT, VCB, HPG...) — nêu giá, % thay đổi, khối lượng
- Sale Pipeline: dự án, tiến độ, status (On Processing/Risk/Miss Deadline)
- KPI Cá nhân BDM, Kênh bán, CTV, OTA, Loa thanh toán, Sản phẩm

QUY TẮC:
- Tiếng Việt, dùng **bold** cho số quan trọng
- Ghi rõ đơn vị (tỷ VND, %)
- Không bịa số — nếu không có dữ liệu thì nói rõ
- Biểu phí ghi rõ "chưa VAT" hay "đã gồm VAT"
- Khi hỏi tỷ giá hoặc chứng khoán: dùng DỮ LIỆU REALTIME bên dưới, ghi rõ nguồn và thời gian cập nhật
- Khi hỏi mã cổ phiếu cụ thể: nêu giá (đơn vị VND), biến động %, khối lượng giao dịch. Giá trong dữ liệu đã nhân 1000.

KIẾN THỨC VỀ GALAXY PAY:
${knowledge}

DỮ LIỆU DASHBOARD HIỆN TẠI:
${buildDashboardContext()}${liveData || ""}`;
}

export function getEnv(key) {
  try {
    const { env } = getCloudflareContext();
    if (env[key]) return env[key];
  } catch {}
  return process.env[key];
}

// --- Model configuration ---
// Groq: fast & lightweight models (sorted by speed → quality)
export const GROQ_FALLBACK_MODELS = [
  "openai/gpt-oss-120b", // 120B — most capable Groq production model
  "openai/gpt-oss-20b",  // 20B — lighter production backup
];
// gpt-oss reasons before answering and reasoning counts toward the limit, so leave room.
export const GROQ_MAX_TOKENS = 4096;
// Deprecated models (auto-skip if set in env)
export const GROQ_DEPRECATED = new Set([
  "llama-3.3-70b-versatile",     // retired 16/08/2026
  "llama-3.3-70b-specdec",
  "llama-3.1-8b-instant",        // retired 16/08/2026
  "gemma2-9b-it",
  "qwen-qwq-32b",
]);

// Workers AI: lightweight model for Cloudflare fallback
export const WORKERS_AI_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

function groqModelList() {
  const envModel = getEnv("CHAT_MODEL");
  const models = envModel && !GROQ_DEPRECATED.has(envModel) ? [envModel] : [];
  for (const m of GROQ_FALLBACK_MODELS) if (!models.includes(m)) models.push(m);
  return models;
}

async function groqText(messages, systemPrompt) {
  const apiKey = getEnv("GROQ_API_KEY");
  if (!apiKey) return null;
  for (const model of groqModelList()) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "GalaxyPay-Dashboard/1.0",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          max_tokens: GROQ_MAX_TOKENS,
          temperature: 0.7,
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    } catch {}
  }
  return null;
}

async function workersAIText(messages, systemPrompt) {
  try {
    const ai = getCloudflareContext().env.AI;
    if (!ai) return null;
    const out = await ai.run(WORKERS_AI_MODEL, {
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 2048,
      temperature: 0.7,
    });
    return out?.response || null;
  } catch {
    return null;
  }
}

export const CLAUDE_MODEL = "claude-haiku-5-5";
const CLAUDE_REFUSAL_TEXT = "Dạ, câu này em xin phép không trả lời ạ.";

async function claudeText(messages, systemPrompt, liveContext) {
  const apiKey = getEnv("ANTHROPIC_API_KEY");
  if (!apiKey) return null;
  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium" },
      // Knowledge + dashboard context is large and identical across questions, so cache it;
      // per-question live data goes after the breakpoint.
      system: [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
        ...(liveContext ? [{ type: "text", text: liveContext }] : []),
      ],
      messages,
    });
    if (response.stop_reason === "refusal") return CLAUDE_REFUSAL_TEXT;
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return text || null;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}:`, error.message);
    } else {
      console.error("Claude request failed:", error?.message);
    }
    return null;
  }
}

// Non-streaming answer for channels that need the full text at once (Zalo bot).
// With `claude: true`, Claude is tried first and Groq / Workers AI remain the fallback.
export async function generateAnswer(messages, systemPrompt, { liveContext = "", claude = false } = {}) {
  if (claude) {
    const text = await claudeText(messages, systemPrompt, liveContext);
    if (text) return text;
  }
  const fullPrompt = systemPrompt + (liveContext || "");
  return (await groqText(messages, fullPrompt)) || (await workersAIText(messages, fullPrompt));
}
