import { getCloudflareContext } from "@opennextjs/cloudflare";

function getEnv(key) {
  try {
    const { env } = getCloudflareContext();
    if (env[key]) return env[key];
  } catch {}
  return process.env[key];
}

export async function GET() {
  const results = {};

  const groqKey = getEnv("GROQ_API_KEY");
  results.groqKeyFound = !!groqKey;
  results.groqKeyPreview = groqKey ? groqKey.slice(0, 8) + "..." + groqKey.slice(-4) : "NOT FOUND";

  let cfContext = "unavailable";
  try {
    const ctx = getCloudflareContext();
    cfContext = {
      hasEnv: !!ctx?.env,
      envKeys: ctx?.env ? Object.keys(ctx.env).filter(k => !k.startsWith("__")).slice(0, 20) : [],
      groqInCf: !!ctx?.env?.GROQ_API_KEY,
    };
  } catch (e) {
    cfContext = { error: e.message };
  }
  results.cloudflareContext = cfContext;

  results.processEnvGroq = !!process.env.GROQ_API_KEY;

  if (groqKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 10,
        }),
      });
      results.groqTest = {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
      };
      if (!res.ok) {
        const body = await res.text();
        results.groqTest.body = body.slice(0, 500);
      } else {
        results.groqTest.body = "SUCCESS";
      }
    } catch (e) {
      results.groqTest = { error: e.message };
    }
  }

  return Response.json(results, { headers: { "Cache-Control": "no-store" } });
}
