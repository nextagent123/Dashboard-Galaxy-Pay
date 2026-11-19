import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getEnv, getKnowledge, fetchLiveContext, buildSystemPrompt, generateAnswer } from "@/lib/assistant";
import { getLocalAnswer } from "@/lib/localChat";
import { zaloCall, sendText, toPlain, envList, safeEqual } from "@/lib/zalo";

const ZALO_STYLE = `

KÊNH TRẢ LỜI: Bạn đang trả lời trong Zalo. Zalo KHÔNG hiển thị markdown: không dùng **, #, bảng — dùng xuống dòng và "•" để liệt kê. Giữ câu trả lời ngắn gọn.`;

const HELP = `🤖 Trợ lý Khối Kinh doanh — hỏi đáp số liệu salereport
Trong nhóm: @tên bot + câu hỏi (hoặc reply tin của bot).

Ví dụ:
• GMV lũy kế năm nay đạt bao nhiêu % kế hoạch?
• Doanh thu tháng 10 so với tháng 9?
• KPI của BDM Thúy Hằng thế nào?
• Dự án nào trong pipeline đang Risk?
• Biểu phí SoftPOS?

/id — xem Chat ID / User ID`;

const seen = new Map();
let botName = null;

function isDuplicate(messageId) {
  if (!messageId) return false;
  if (seen.has(messageId)) return true;
  seen.set(messageId, Date.now());
  if (seen.size > 500) seen.delete(seen.keys().next().value);
  return false;
}

async function getBotName(token) {
  if (botName !== null) return botName;
  try {
    const me = await zaloCall(token, "getMe");
    botName = me?.display_name || me?.account_name || "";
  } catch {
    botName = "";
  }
  return botName;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripMention(text, name) {
  for (const n of [name, getEnv("ZALO_BOT_NAME")].filter(Boolean)) {
    const re = new RegExp(`^\\s*@${escapeRegExp(n)}[\\s,:]*`, "i");
    if (re.test(text)) return text.replace(re, "").trim();
  }
  const cmd = text.match(/^\s*@[^\s/]+[\s,:]+(\/.*)$/s);
  return cmd ? cmd[1].trim() : text.trim();
}

async function answerQuestion(question, origin) {
  const [knowledge, live] = await Promise.all([getKnowledge(), fetchLiveContext(question, origin)]);
  const systemPrompt = buildSystemPrompt(knowledge, live) + ZALO_STYLE;
  const ai = await generateAnswer([{ role: "user", content: question.slice(0, 4000) }], systemPrompt);
  return toPlain(ai || getLocalAnswer(question));
}

async function handleUpdate(raw, token, origin) {
  const update = raw?.result && typeof raw.result === "object" ? raw.result : raw || {};
  const msg = update.message || {};
  const chatId = String(msg.chat?.id ?? "");
  const sender = msg.from || {};
  const userId = String(sender.id ?? "");
  const text = (msg.text || msg.caption || "").trim();
  if (!chatId || sender.is_bot || !text) return;
  if (isDuplicate(String(msg.message_id ?? ""))) return;

  const clean = stripMention(text, await getBotName(token));
  const cmd = clean.startsWith("/") ? clean.slice(1).split(/\s+/)[0].split("@")[0].toLowerCase() : "";
  // Dashboard figures are internal: answer only in allow-listed chats or for admin users.
  const allowed = envList("ZALO_ALLOWED_CHAT_IDS").has(chatId) || envList("ZALO_ADMIN_USER_IDS").has(userId);

  if (cmd === "id") {
    const note = allowed ? "" : "\nNhóm/người dùng này chưa được cấp quyền hỏi số liệu.";
    return sendText(token, chatId, `Chat ID: ${chatId}\nUser ID của bạn: ${userId}${note}`);
  }
  if (!allowed) {
    return sendText(
      token,
      chatId,
      `Dạ, nhóm này chưa được cấp quyền hỏi số liệu salereport nên mình chưa trả lời được ạ.\nNhờ quản trị viên thêm Chat ID ${chatId} vào danh sách cho phép (ZALO_ALLOWED_CHAT_IDS).`
    );
  }
  if (!clean || ["help", "start", "trogiup"].includes(cmd)) return sendText(token, chatId, HELP);

  await zaloCall(token, "sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => {});
  await sendText(token, chatId, await answerQuestion(clean, origin));
}

export async function GET() {
  return new Response("OK");
}

export async function POST(request) {
  const token = getEnv("ZALO_BOT_TOKEN");
  const secret = getEnv("ZALO_WEBHOOK_SECRET");
  if (!token || !secret) return new Response("Zalo bot chưa được cấu hình", { status: 503 });
  if (!safeEqual(request.headers.get("x-bot-api-secret-token") || "", secret)) {
    return new Response("Forbidden", { status: 403 });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  // Zalo expects a fast 200; the AI answer is generated and sent after responding.
  const job = handleUpdate(update, token, new URL(request.url).origin).catch((e) =>
    console.error("Zalo webhook:", e.message)
  );
  try {
    getCloudflareContext().ctx.waitUntil(job);
  } catch {
    await job;
  }
  return Response.json({ ok: true });
}
