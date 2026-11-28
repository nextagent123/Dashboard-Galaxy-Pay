import { getLocalAnswer } from "@/lib/localChat";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import {
  getKnowledge,
  fetchLiveContext,
  buildSystemPrompt,
  RESTRICTED_SYSTEM_PROMPT,
  getEnv,
  GROQ_FALLBACK_MODELS,
  GROQ_DEPRECATED,
  GROQ_MAX_TOKENS,
  WORKERS_AI_MODEL,
} from "@/lib/assistant";

async function tryWorkersAI(messages, systemPrompt) {
  try {
    const { env } = getCloudflareContext();
    const ai = env.AI;
    if (!ai) return null;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const response = await ai.run(WORKERS_AI_MODEL, {
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

async function callGroqModel(apiKey, model, messages, systemPrompt) {
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
      max_tokens: GROQ_MAX_TOKENS,
      temperature: 0.7,
      stream: true,
    }),
  });
  if (!res.ok) return null;
  return { type: "groq", response: res };
}

async function tryGroq(messages, systemPrompt) {
  const apiKey = getEnv("GROQ_API_KEY");
  if (!apiKey) return null;

  // Build model list: env override (if not deprecated) → fallbacks
  const envModel = getEnv("CHAT_MODEL");
  const models = [];
  if (envModel && !GROQ_DEPRECATED.has(envModel)) {
    models.push(envModel);
  }
  for (const m of GROQ_FALLBACK_MODELS) {
    if (!models.includes(m)) models.push(m);
  }

  // Try each model until one succeeds
  for (const model of models) {
    try {
      const result = await callGroqModel(apiKey, model, messages, systemPrompt);
      if (result) return result;
    } catch {
      continue;
    }
  }
  return null;
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
      const chunk = words.slice(i, i + 6).join("");
      i += 6;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
      await new Promise((r) => setTimeout(r, 10));
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
    const { messages, restricted } = await request.json();
    const sanitized = (Array.isArray(messages) ? messages : [])
      .filter((m) => m && typeof m.content === "string" && m.content.trim())
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content.slice(0, 4000) }));
    const recent = sanitized.slice(-10);
    const lastMsg = recent[recent.length - 1]?.content || "";

    let systemPrompt;
    if (restricted) {
      systemPrompt = RESTRICTED_SYSTEM_PROMPT;
    } else {
      const baseUrl = new URL(request.url).origin;
      const [knowledge, liveData] = await Promise.all([
        getKnowledge(),
        fetchLiveContext(lastMsg, baseUrl),
      ]);
      systemPrompt = buildSystemPrompt(knowledge, liveData);
    }

    const [groqResult, aiStream] = await Promise.all([
      tryGroq(recent, systemPrompt),
      tryWorkersAI(recent, systemPrompt),
    ]);

    if (groqResult) {
      return groqStreamResponse(groqResult.response);
    }
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
