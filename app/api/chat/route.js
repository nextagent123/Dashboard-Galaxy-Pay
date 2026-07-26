import { buildDashboardContext } from "@/lib/chatContext";
import { getLocalAnswer } from "@/lib/localChat";
import { GALAXY_PAY_KNOWLEDGE } from "@/lib/galaxyPayKnowledge";
import { supabase } from "@/lib/supabase";
import { getCloudflareContext } from "@opennextjs/cloudflare";

let _knowledgeCache = null;

async function getKnowledge() {
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
const STOCK_KEYS = ["chứng khoán", "cổ phiếu", "vn-index", "vnindex", "stock", "hose", "hnx", "upcom", "fpt", "vnm", "vcb", "hpg", "mwg", "vhm", "vic", "msn", "mbb", "tcb", "acb", "vpb", "bid", "ctg", "ssi"];

function matchesAny(text, keys) {
  const t = text.toLowerCase().normalize("NFC");
  return keys.some((k) => t.includes(k));
}

async function fetchLiveContext(question, baseUrl) {
  const parts = [];
  try {
    if (matchesAny(question, FOREX_KEYS)) {
      const r = await fetch(`${baseUrl}/api/forex`, { signal: AbortSignal.timeout(8000) });
      if (r.ok) {
        const d = await r.json();
        if (d.rates) {
          parts.push(
            `\n=== DỮ LIỆU TỶ GIÁ NGOẠI HỐI REALTIME ===\nNguồn: ${d.source || "API"} | Cập nhật: ${d.updated || "now"}\nTỷ giá VND:\n` +
            Object.entries(d.rates).map(([k, v]) => `• 1 ${k} = ${Number(v).toLocaleString("vi-VN")} VND`).join("\n")
          );
        }
      }
    }
  } catch {}
  try {
    if (matchesAny(question, STOCK_KEYS)) {
      const r = await fetch(`${baseUrl}/api/stock`, { signal: AbortSignal.timeout(8000) });
      if (r.ok) {
        const d = await r.json();
        const idx = (d.indices || []).map((i) => `• ${i.code}: ${i.value} (${i.change >= 0 ? "+" : ""}${i.change}, ${i.changePercent >= 0 ? "+" : ""}${i.changePercent}%)`).join("\n");
        const gainers = (d.topGainers || []).slice(0, 5).map((s) => `• ${s.ticker}: ${s.price} (${s.changePercent >= 0 ? "+" : ""}${s.changePercent}%)`).join("\n");
        const losers = (d.topLosers || []).slice(0, 5).map((s) => `• ${s.ticker}: ${s.price} (${s.changePercent}%)`).join("\n");
        parts.push(
          `\n=== DỮ LIỆU CHỨNG KHOÁN VIỆT NAM REALTIME ===\nNguồn: ${d.source || "API"} | Cập nhật: ${d.updated || "now"}\nChỉ số:\n${idx}\nTop tăng giá:\n${gainers}\nTop giảm giá:\n${losers}`
        );
        if (d.breadth) {
          parts.push(`Độ rộng thị trường: Tăng ${d.breadth.advances}, Giảm ${d.breadth.declines}, Đứng ${d.breadth.unchanged} / Tổng ${d.breadth.total}`);
        }
      }
    }
  } catch {}
  return parts.join("\n");
}

function buildSystemPrompt(knowledge, liveData) {
  return `Bạn là **Trợ lý Khối Kinh doanh** — trợ lý AI của Galaxy Pay Dashboard, hệ thống báo cáo kinh doanh nội bộ Công ty TNHH Galaxy Pay.

PHONG CÁCH TRẢ LỜI:
- **Ngắn gọn, súc tích** — đi thẳng vào trọng tâm, không dài dòng
- Mềm mại, chuyên nghiệp, giọng đồng nghiệp thân thiện
- Xưng "mình", gọi "bạn"
- Dùng emoji vừa phải, không lạm dụng
- Khi phân tích số liệu: nêu số chính → nhận xét ngắn → gợi mở 1 câu
- Trả lời tối đa 3–5 dòng cho câu hỏi đơn giản, 8–12 dòng cho phân tích
- **NGOẠI LỆ — trả lời CHI TIẾT, ĐẦY ĐỦ** khi câu hỏi liên quan đến: thông tin khách hàng, biểu phí dịch vụ, bảng giá, chính sách phí, đối tác. Liệt kê đủ các mức phí, điều kiện áp dụng, phân loại khách hàng — không được tóm tắt hay bỏ sót

NHIỆM VỤ:
- Phân tích GMV, Doanh thu, Lợi nhuận, biên LN, xu hướng
- So sánh thực đạt vs kế hoạch, tính runrate, gap, dự báo
- Trả lời về Galaxy Pay: sản phẩm, biểu phí, đối tác, SME in a Box
- Khi được hỏi "tại sao" → phân tích dựa trên dữ liệu tháng biến động
- Trả lời về tỷ giá ngoại hối và chứng khoán dựa trên dữ liệu realtime
- Sale Pipeline: dự án, tiến độ, status (On Processing/Risk/Miss Deadline)
- KPI Cá nhân BDM, Kênh bán, CTV, OTA, Loa thanh toán, Sản phẩm

QUY TẮC:
- Tiếng Việt, dùng **bold** cho số quan trọng
- Ghi rõ đơn vị (tỷ VND, %)
- Không bịa số — nếu không có dữ liệu thì nói rõ
- Biểu phí ghi rõ "chưa VAT" hay "đã gồm VAT"
- Khi hỏi tỷ giá hoặc chứng khoán: dùng DỮ LIỆU REALTIME bên dưới, ghi rõ nguồn và thời gian cập nhật

KIẾN THỨC VỀ GALAXY PAY:
${knowledge}

DỮ LIỆU DASHBOARD HIỆN TẠI:
${buildDashboardContext()}${liveData || ""}`;
}

function getEnv(key) {
  try {
    const { env } = getCloudflareContext();
    if (env[key]) return env[key];
  } catch {}
  return process.env[key];
}

async function tryWorkersAI(messages, systemPrompt) {
  try {
    const { env } = getCloudflareContext();
    const ai = env.AI;
    if (!ai) return null;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const response = await ai.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
      messages: aiMessages,
      max_tokens: 2048,
      temperature: 0.7,
      stream: true,
    });

    return response;
  } catch {
    return null;
  }
}

async function tryGroq(messages, systemPrompt) {
  const apiKey = getEnv("GROQ_API_KEY");
  const model = getEnv("CHAT_MODEL") || "llama-3.3-70b-versatile";
  if (!apiKey) return null;

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
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 2048,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!res.ok) return null;
    return { type: "groq", response: res };
  } catch {
    return null;
  }
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
}

function localResponse(text) {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/);
  let i = 0;

  const stream = new ReadableStream({
    async pull(controller) {
      if (i >= words.length) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }
      const chunk = words.slice(i, i + 3).join("");
      i += 3;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
      await new Promise((r) => setTimeout(r, 30));
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

function groqStreamResponse(groqRes) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            if (!data) continue;
            try {
              const evt = JSON.parse(data);
              const text = evt.choices?.[0]?.delta?.content;
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch {}
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

function workersAIStreamResponse(aiStream) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = aiStream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            if (!data) continue;
            try {
              const evt = JSON.parse(data);
              const text = evt.response;
              if (text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } catch {}
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

export async function POST(request) {
  try {
    const { messages } = await request.json();
    const recent = messages.slice(-20);
    const lastMsg = recent[recent.length - 1]?.content || "";

    const knowledge = await getKnowledge();
    const baseUrl = new URL(request.url).origin;
    const liveData = await fetchLiveContext(lastMsg, baseUrl);
    const systemPrompt = buildSystemPrompt(knowledge, liveData);

    const groqResult = await tryGroq(recent, systemPrompt);
    if (groqResult) {
      return groqStreamResponse(groqResult.response);
    }

    const aiStream = await tryWorkersAI(recent, systemPrompt);
    if (aiStream) {
      return workersAIStreamResponse(aiStream);
    }

    const answer = getLocalAnswer(lastMsg);
    return localResponse(answer);
  } catch {
    return Response.json(
      { error: "Có lỗi xảy ra khi xử lý yêu cầu." },
      { status: 500 }
    );
  }
}
