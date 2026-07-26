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
  results.keyFound = !!groqKey;
  results.keyPreview = groqKey ? groqKey.slice(0, 8) + "..." + groqKey.slice(-4) : "NONE";
  results.keyLength = groqKey ? groqKey.length : 0;

  if (!groqKey) {
    return Response.json(results, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "GalaxyPay-Dashboard/1.0",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "say ok" }],
        max_tokens: 5,
      }),
    });

    results.status = res.status;
    results.ok = res.ok;

    if (res.ok) {
      const data = await res.json();
      results.response = data.choices?.[0]?.message?.content || "empty";
      results.model = data.model;
    } else {
      results.error = await res.text().then(t => t.slice(0, 500));
      results.headers = Object.fromEntries([...res.headers.entries()].filter(([k]) =>
        ["x-request-id", "x-ratelimit-remaining", "retry-after", "www-authenticate"].includes(k)
      ));
    }
  } catch (e) {
    results.fetchError = e.message;
  }

  return Response.json(results, { headers: { "Cache-Control": "no-store" } });
}
