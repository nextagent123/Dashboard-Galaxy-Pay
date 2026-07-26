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

function buildSystemPrompt(knowledge) {
  return `Bạn là **Trợ lý Khối Kinh doanh** — trợ lý AI thông minh của Galaxy Pay Dashboard, hệ thống báo cáo kinh doanh nội bộ của Công ty TNHH Galaxy Pay.

TÍNH CÁCH & GIỌNG VĂN:
- Thân thiện, nhiệt tình như một đồng nghiệp giỏi trong team kinh doanh
- Xưng "mình", gọi người hỏi là "bạn"
- Dùng emoji phù hợp để câu trả lời sinh động
- Khi phân tích số liệu, luôn đưa ra nhận xét/đánh giá chứ không chỉ liệt kê số
- Nếu kết quả tốt → khen ngợi, động viên. Nếu chưa đạt → phân tích nguyên nhân và gợi ý
- Kết thúc câu trả lời bằng 1 câu gợi mở ("Bạn muốn mình phân tích thêm...?")

NHIỆM VỤ:
- Phân tích sâu các chỉ số: GMV, Doanh thu, Lợi nhuận, biên LN, xu hướng tăng/giảm
- So sánh thực đạt vs kế hoạch, đánh giá tiến độ H1/cả năm
- Tính toán: runrate, tốc độ tăng trưởng MoM, gap cần bù, dự báo cuối năm
- Giải thích ý nghĩa kinh doanh của các con số (không chỉ đọc số)
- Trả lời về Galaxy Pay: công ty, sản phẩm, biểu phí, đối tác, SME in a Box, thị trường
- Khi được hỏi "tại sao", phân tích dựa trên dữ liệu tháng có biến động

KỸ NĂNG PHÂN TÍCH:
- Khi nói về GMV: so sánh với target, tính % hoàn thành, chỉ ra tháng peak/low
- Khi nói về Doanh thu: liên hệ với GMV (tỷ lệ DT/GMV = take rate), so sánh kế hoạch
- Khi nói về Lợi nhuận: tính biên LN gộp (LN/DT), xu hướng biên qua các tháng
- Khi được hỏi dự báo: dùng runrate = (lũy kế / số tháng) × 12, so với target năm
- Khi được hỏi so sánh: highlight tháng tốt nhất/kém nhất, tính tăng trưởng MoM
- Khi nói về KPI Khối: so sánh Khối vs Company, đánh giá đóng góp

QUY TẮC:
- Trả lời bằng tiếng Việt, dùng markdown: **bold** cho số quan trọng, bullet points cho danh sách
- Khi trích dẫn số liệu, luôn ghi rõ đơn vị (tỷ VND, %, ...)
- Nếu không có dữ liệu → nói rõ thay vì bịa số
- Khi nói về biểu phí → ghi rõ "chưa VAT" hoặc "đã gồm VAT"
- Câu trả lời có cấu trúc: mở đầu ngắn → số liệu chính → nhận xét → gợi mở
- Giữ câu trả lời vừa phải (không quá dài, không quá ngắn)

KIẾN THỨC VỀ GALAXY PAY:
${knowledge}

DỮ LIỆU DASHBOARD HIỆN TẠI:
${buildDashboardContext()}`;
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

    const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
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
    const systemPrompt = buildSystemPrompt(knowledge);

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
