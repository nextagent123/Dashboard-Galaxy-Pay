import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  const checks = {};

  // Check 1: process.env
  checks.processEnv = {
    GROQ_API_KEY: process.env.GROQ_API_KEY ? `set (${process.env.GROQ_API_KEY.slice(0, 8)}...)` : "NOT SET",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "NOT SET",
  };

  // Check 2: getCloudflareContext
  try {
    const ctx = getCloudflareContext();
    const envKeys = Object.keys(ctx.env || {});
    checks.cloudflareContext = {
      available: true,
      envKeys,
      GROQ_API_KEY: ctx.env?.GROQ_API_KEY ? `set (${String(ctx.env.GROQ_API_KEY).slice(0, 8)}...)` : "NOT SET",
    };
  } catch (e) {
    checks.cloudflareContext = { available: false, error: e.message };
  }

  // Check 3: try Groq API
  let apiKey;
  try {
    const ctx = getCloudflareContext();
    apiKey = ctx.env?.GROQ_API_KEY;
  } catch {}
  if (!apiKey) apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      checks.groqApi = { status: res.status, ok: res.ok };
      if (!res.ok) {
        const body = await res.text();
        checks.groqApi.body = body.slice(0, 200);
      }
    } catch (e) {
      checks.groqApi = { error: e.message };
    }
  } else {
    checks.groqApi = { skipped: "no API key found" };
  }

  return Response.json(checks, {
    headers: { "Cache-Control": "no-store" },
  });
}
