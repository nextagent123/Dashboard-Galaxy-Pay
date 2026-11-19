import { getEnv } from "@/lib/assistant";
import { zaloCall, safeEqual } from "@/lib/zalo";

// One-time: open /api/zalo/setup?key=<ZALO_WEBHOOK_SECRET> to register this site's webhook with Zalo.
export async function GET(request) {
  const token = getEnv("ZALO_BOT_TOKEN");
  const secret = getEnv("ZALO_WEBHOOK_SECRET");
  if (!token || !secret) {
    return Response.json({ ok: false, error: "Chưa có ZALO_BOT_TOKEN / ZALO_WEBHOOK_SECRET trong Cloudflare" }, { status: 503 });
  }
  const url = new URL(request.url);
  if (!safeEqual(url.searchParams.get("key") || "", secret)) {
    return Response.json({ ok: false, error: "Sai key" }, { status: 403 });
  }

  const webhookUrl = `${url.origin}/api/zalo/webhook`;
  try {
    const me = await zaloCall(token, "getMe");
    await zaloCall(token, "setWebhook", { url: webhookUrl, secret_token: secret });
    return Response.json({
      ok: true,
      bot: me?.display_name || me?.account_name || null,
      webhook: webhookUrl,
      next: "Nhắn /id cho bot để lấy User ID / Chat ID, rồi thêm vào ZALO_ADMIN_USER_IDS hoặc ZALO_ALLOWED_CHAT_IDS.",
    });
  } catch (e) {
    return Response.json({ ok: false, error: e.message }, { status: 502 });
  }
}
