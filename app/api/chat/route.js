import { buildDashboardContext } from "@/lib/chatContext";
import { getLocalAnswer } from "@/lib/localChat";
import { GALAXY_PAY_KNOWLEDGE } from "@/lib/galaxyPayKnowledge";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.CHAT_MODEL || "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `Bạn là Khối Kinh doanh Chatbot AI — trợ lý AI của Galaxy Pay Dashboard, hệ thống báo cáo kinh doanh nội bộ.

NHIỆM VỤ:
- Giải thích và phân tích các chỉ số kinh doanh trong dashboard (GMV, Doanh thu, Lợi nhuận, KPI, Pipeline...)
- Trả lời câu hỏi về xu hướng, so sánh, đánh giá tiến độ hoàn thành mục tiêu
- Đưa ra nhận định, gợi ý dựa trên dữ liệu thực tế
- Trả lời các câu hỏi về Galaxy Pay: công ty, sản phẩm, dịch vụ, biểu phí, đối tác, giải pháp SME in a Box, thị trường...
- Trả lời các câu hỏi kinh doanh liên quan khác

QUY TẮC:
- Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng
- Khi trích dẫn số liệu, luôn ghi rõ đơn vị (tỷ VND, %, ...)
- Nếu không có dữ liệu để trả lời, nói rõ thay vì bịa số
- Giọng văn chuyên nghiệp nhưng thân thiện
- Khi trả lời về biểu phí, luôn ghi rõ "chưa VAT" hoặc "đã gồm VAT"
- Khi trả lời về sản phẩm/dịch vụ Galaxy Pay, ưu tiên thông tin từ kiến thức nội bộ

KIẾN THỨC VỀ GALAXY PAY:
${GALAXY_PAY_KNOWLEDGE}

DỮ LIỆU DASHBOARD HIỆN TẠI:
${buildDashboardContext()}`;

async function tryGroq(messages) {
  if (!GROQ_API_KEY) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  }
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

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request) {
  try {
    const { messages } = await request.json();
    const recent = messages.slice(-20);
    const lastMsg = recent[recent.length - 1]?.content || "";

    const groqRes = await tryGroq(recent);

    if (groqRes) {
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

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
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
