import { supabase } from "@/lib/supabase";

// Login logs are stored per-month in dashboard_data: key = "login_logs_YYYY_MM"
// Each entry: { user, name, role, ts, ua }

function monthKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `login_logs_${y}_${m}`;
}

async function getLogs(key) {
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("dashboard_data")
      .select("data")
      .eq("key", key)
      .single();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

async function appendLog(key, entry) {
  if (!supabase) throw new Error("Supabase chưa cấu hình");
  const logs = await getLogs(key);
  logs.push(entry);
  const { error } = await supabase
    .from("dashboard_data")
    .upsert({ key, data: logs });
  if (error) throw new Error(error.message);
}

// POST — record a login event
export async function POST(request) {
  try {
    const { user, name, role } = await request.json();
    if (!user) return Response.json({ error: "Missing user" }, { status: 400 });

    const now = new Date().toISOString();
    const ua = request.headers.get("user-agent") || "";
    const entry = { user, name: name || "", role: role || "", ts: now, ua };
    const key = monthKey(now);

    await appendLog(key, entry);
    return Response.json({ ok: true });
  } catch (e) {
    // Fire-and-forget — don't block login if logging fails
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// GET — retrieve login logs for given months
// ?months=2026-07,2026-08  or  ?from=2026-07&to=2026-08
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    let keys = [];
    const monthsParam = searchParams.get("months");
    if (monthsParam) {
      keys = monthsParam.split(",").map((m) => `login_logs_${m.replace("-", "_")}`);
    } else {
      const from = searchParams.get("from");
      const to = searchParams.get("to") || from;
      if (!from) return Response.json({ error: "Cần tham số ?months= hoặc ?from=&to=" }, { status: 400 });

      const [fy, fm] = from.split("-").map(Number);
      const [ty, tm] = to.split("-").map(Number);
      let y = fy, m = fm;
      while (y < ty || (y === ty && m <= tm)) {
        keys.push(`login_logs_${y}_${String(m).padStart(2, "0")}`);
        m++;
        if (m > 12) { m = 1; y++; }
      }
    }

    const allLogs = [];
    for (const key of keys) {
      const logs = await getLogs(key);
      allLogs.push(...logs);
    }

    // Sort by timestamp
    allLogs.sort((a, b) => new Date(a.ts) - new Date(b.ts));

    return Response.json({ logs: allLogs, total: allLogs.length });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
