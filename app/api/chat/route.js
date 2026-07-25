import { buildDashboardContext } from "@/lib/chatContext";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CHAT_MODEL || "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `Bạn là trợ lý AI của Galaxy Pay Dashboard — hệ thống báo cáo kinh doanh nội bộ.

NHIỆM VỤ:
- Giải thích và phân tích các chỉ số kinh doanh trong dashboard (GMV, Doanh thu, Lợi nhuận, KPI, Pipeline...)
- Trả lời câu hỏi về xu hướng, so sánh, đánh giá tiến độ hoàn thành mục tiêu
- Đưa ra nhận định, gợi ý dựa trên dữ liệu thực tế
- Trả lời các câu hỏi kinh doanh liên quan khác

QUY TẮC:
- Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng
- Khi trích dẫn số liệu, luôn ghi rõ đơn vị (tỷ VND, %, ...)
- Nếu không có dữ liệu để trả lời, nói rõ thay vì bịa số
- Giọng văn chuyên nghiệp nhưng thân thiện

DỮ LIỆU DASHBOARD HIỆN TẠI:
${buildDashboardContext()}`;

export async function POST(request) {
  if (!ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY chưa được cấu hình. Vui lòng thêm biến môi trường ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const { messages } = await request.json();

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-20),
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json(
        { error: `API error: ${res.status}` },
        { status: res.status }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body.getReader();
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
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const evt = JSON.parse(data);
                if (evt.type === "content_block_delta" && evt.delta?.text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: evt.delta.text })}\n\n`));
                }
                if (evt.type === "message_stop") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                }
              } catch {}
            }
          }
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
  } catch (err) {
    return Response.json(
      { error: "Có lỗi xảy ra khi xử lý yêu cầu." },
      { status: 500 }
    );
  }
}
