import { getCloudflareContext } from "@opennextjs/cloudflare";

const MODELS = [
  "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
  "@cf/meta/llama-3.2-3b-instruct",
  "@cf/meta/llama-4-scout-17b-16e-instruct",
  "@cf/mistral/mistral-7b-instruct-v0.2",
  "@cf/qwen/qwen2.5-7b-instruct-fp8",
  "@cf/google/gemma-7b-it-lora",
  "@cf/meta/llama-3.1-70b-instruct",
];

export async function GET() {
  const results = { models: {} };

  try {
    const { env } = getCloudflareContext();
    results.hasAI = !!env.AI;

    if (env.AI) {
      for (const model of MODELS) {
        try {
          const res = await env.AI.run(model, {
            messages: [{ role: "user", content: "Nói OK" }],
            max_tokens: 10,
          });
          results.models[model] = { ok: true, response: res?.response?.slice(0, 100) || "empty" };
        } catch (e) {
          results.models[model] = { ok: false, error: e.message?.slice(0, 100) };
        }
      }
    }
  } catch (e) {
    results.cfError = e.message;
  }

  return Response.json(results, { headers: { "Cache-Control": "no-store" } });
}
