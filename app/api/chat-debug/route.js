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

  if (!groqKey) {
    return Response.json(results, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${groqKey}` },
    });
    results.modelsStatus = modelsRes.status;
    if (modelsRes.ok) {
      const modelsData = await modelsRes.json();
      results.availableModels = (modelsData.data || []).map(m => m.id).sort();
    } else {
      results.modelsError = await modelsRes.text().then(t => t.slice(0, 300));
    }
  } catch (e) {
    results.modelsError = e.message;
  }

  const testModels = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
  ];

  results.modelTests = {};
  for (const model of testModels) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 5,
        }),
      });
      results.modelTests[model] = {
        status: res.status,
        ok: res.ok,
      };
      if (!res.ok) {
        results.modelTests[model].error = await res.text().then(t => t.slice(0, 200));
      } else {
        results.modelTests[model].success = true;
      }
    } catch (e) {
      results.modelTests[model] = { error: e.message };
    }
  }

  return Response.json(results, { headers: { "Cache-Control": "no-store" } });
}
