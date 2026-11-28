import { getEnv } from "@/lib/assistant";

const ZALO_MAX_LEN = 2000;

export async function zaloCall(token, method, payload = {}) {
  const base = getEnv("ZALO_API_BASE") || "https://bot-api.zapps.me";
  const res = await fetch(`${base}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({ ok: false }));
  if (!data.ok) throw new Error(`Zalo ${method} ${res.status}: ${data.description || ""}`);
  return data.result;
}

export function splitText(text, limit = ZALO_MAX_LEN) {
  let rest = text.trim() || "(trống)";
  const parts = [];
  while (rest.length > limit) {
    let cut = rest.lastIndexOf("\n", limit);
    if (cut < limit / 2) cut = rest.lastIndexOf(" ", limit);
    if (cut <= 0) cut = limit;
    parts.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  parts.push(rest);
  return parts;
}

export async function sendText(token, chatId, text) {
  for (const chunk of splitText(text)) {
    await zaloCall(token, "sendMessage", { chat_id: chatId, text: chunk });
  }
}

// Zalo renders plain text only.
export function toPlain(text) {
  return text
    .replace(/```[a-zA-Z]*\n?/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/`/g, "")
    .trim();
}

export function envList(name) {
  return new Set((getEnv(name) || "").split(",").map((s) => s.trim()).filter(Boolean));
}

export function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
