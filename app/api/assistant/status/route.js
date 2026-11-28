import Anthropic from "@anthropic-ai/sdk";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getEnv, GROQ_FALLBACK_MODELS, CLAUDE_MODEL } from "@/lib/assistant";

// Read-only health check: lists models with the configured keys (no generation, no cost, no secrets returned).
async function checkGroq() {
  const apiKey = getEnv("GROQ_API_KEY");
  if (!apiKey) return { configured: false };
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}`, "User-Agent": "GalaxyPay-Dashboard/1.0" },
    });
    if (!res.ok) return { configured: true, ok: false, error: `HTTP ${res.status}` };
    const ids = new Set(((await res.json()).data || []).map((m) => m.id));
    const available = GROQ_FALLBACK_MODELS.filter((m) => ids.has(m));
    return { configured: true, ok: true, available, missing: GROQ_FALLBACK_MODELS.filter((m) => !ids.has(m)) };
  } catch (e) {
    return { configured: true, ok: false, error: e.message };
  }
}

async function checkClaude() {
  const apiKey = getEnv("ANTHROPIC_API_KEY");
  if (!apiKey) return { configured: false };
  try {
    const model = await new Anthropic({ apiKey }).models.retrieve(CLAUDE_MODEL);
    return { configured: true, ok: true, model: model.id };
  } catch (error) {
    const status = error instanceof Anthropic.APIError ? error.status : undefined;
    return { configured: true, ok: false, error: status ? `HTTP ${status}` : error.message };
  }
}

function hasWorkersAI() {
  try {
    return !!getCloudflareContext().env.AI;
  } catch {
    return false;
  }
}

export async function GET() {
  const [groq, claude] = await Promise.all([checkGroq(), checkClaude()]);
  const workersAI = hasWorkersAI();
  const groqModel = groq.ok ? groq.available?.[0] : null;
  const webModel = groqModel ? `Groq ${groqModel}` : workersAI ? "Cloudflare Workers AI (dự phòng)" : "Câu trả lời soạn sẵn (không có AI)";
  const zaloModel = claude.ok ? `Claude ${CLAUDE_MODEL}` : `${webModel} (chưa dùng được Claude)`;

  return Response.json(
    { chatbot_web_dang_dung: webModel, bot_zalo_dang_dung: zaloModel, groq, claude, workers_ai: workersAI },
    { headers: { "Cache-Control": "no-store" } }
  );
}
