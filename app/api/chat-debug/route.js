import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  const results = {};

  try {
    const { env } = getCloudflareContext();
    results.hasAI = !!env.AI;
    results.envKeys = Object.keys(env).filter(k => !k.startsWith("__")).slice(0, 20);

    if (env.AI) {
      try {
        const res = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [{ role: "user", content: "Nói OK" }],
          max_tokens: 10,
        });
        results.workersAI = { success: true, response: res?.response || JSON.stringify(res).slice(0, 200) };
      } catch (e) {
        results.workersAI = { error: e.message };
      }
    }
  } catch (e) {
    results.cfError = e.message;
  }

  return Response.json(results, { headers: { "Cache-Control": "no-store" } });
}
