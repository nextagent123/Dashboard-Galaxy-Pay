import { buildDashboardContext } from "@/lib/chatContext";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.CHAT_MODEL || "gemini-2.0-flash";

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
  if (!GEMINI_API_KEY) {
    return Response.json(
      { error: "GEMINI_API_KEY chưa được cấu hình. Vui lòng thêm biến môi trường GEMINI_API_KEY." },
      { status: 500 }
    );
  }

  try {
    const { messages } = await request.json();

    const geminiContents = messages.slice(-20).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: geminiContents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json(
        { error: `Gemini API error: ${res.status}` },
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
              const data = line.slice(6).trim();
              if (!data) continue;

              try {
                const evt = JSON.parse(data);
                const text = evt.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
                const finish = evt.candidates?.[0]?.finishReason;
                if (finish && finish !== "STOP" && finish !== "MAX_TOKENS") {
                  // blocked or error
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
  } catch (err) {
    return Response.json(
      { error: "Có lỗi xảy ra khi xử lý yêu cầu." },
      { status: 500 }
    );
  }
}
