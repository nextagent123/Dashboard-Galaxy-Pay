import { supabase } from "@/lib/supabase";
import { USERS, ADMIN_USERS, RESTRICTED_USERS } from "@/lib/auth";

const USERS_KEY = "users_dynamic";
const OVERRIDES_KEY = "user_overrides";

async function getDynamic() {
  if (!supabase) return [];
  try {
    const { data } = await supabase
      .from("dashboard_data")
      .select("data")
      .eq("key", USERS_KEY)
      .single();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

async function saveDynamic(users) {
  if (!supabase) throw new Error("Supabase chưa được cấu hình");
  const { error } = await supabase
    .from("dashboard_data")
    .upsert({ key: USERS_KEY, data: users });
  if (error) throw new Error(error.message);
}

async function getOverrides() {
  if (!supabase) return {};
  try {
    const { data } = await supabase
      .from("dashboard_data")
      .select("data")
      .eq("key", OVERRIDES_KEY)
      .single();
    return data?.data && typeof data.data === "object" ? data.data : {};
  } catch {
    return {};
  }
}

async function saveOverrides(ov) {
  if (!supabase) throw new Error("Supabase chưa được cấu hình");
  const { error } = await supabase
    .from("dashboard_data")
    .upsert({ key: OVERRIDES_KEY, data: ov });
  if (error) throw new Error(error.message);
}

function buildAllUsers(dynamic, overrides) {
  const defaults = USERS.map((u) => ({
    ...u,
    h: overrides[u.u] || u.h,
    isDefault: true,
    isAdmin: ADMIN_USERS.includes(u.u),
    allowedRoutes: RESTRICTED_USERS[u.u] || null,
  }));
  const dyn = dynamic.map((u) => ({ ...u, isDefault: false }));
  return [...defaults, ...dyn];
}

export async function GET() {
  try {
    const [dynamic, overrides] = await Promise.all([getDynamic(), getOverrides()]);
    return Response.json({ users: buildAllUsers(dynamic, overrides) });
  } catch (e) {
    const fallback = USERS.map((u) => ({
      ...u,
      isDefault: true,
      isAdmin: ADMIN_USERS.includes(u.u),
      allowedRoutes: RESTRICTED_USERS[u.u] || null,
    }));
    return Response.json({ users: fallback });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, passwordHash, name, role, initials, isAdmin, allowedRoutes } = body;

    if (!username || !passwordHash || !name) {
      return Response.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }
    if (USERS.find((u) => u.u === username)) {
      return Response.json({ error: "Username đã tồn tại trong hệ thống mặc định" }, { status: 400 });
    }

    const dynamic = await getDynamic();
    if (dynamic.find((u) => u.u === username)) {
      return Response.json({ error: "Username đã tồn tại" }, { status: 400 });
    }

    const ini = initials ||
      name.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";

    const newUser = {
      u: username,
      h: passwordHash,
      name,
      role: role || "",
      ini,
      isAdmin: !!isAdmin,
      allowedRoutes: allowedRoutes || null,
    };

    dynamic.push(newUser);
    await saveDynamic(dynamic);
    return Response.json({ ok: true, user: { ...newUser, isDefault: false } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { username } = await request.json();
    if (USERS.find((u) => u.u === username)) {
      return Response.json({ error: "Không thể xóa tài khoản mặc định" }, { status: 400 });
    }
    const dynamic = await getDynamic();
    const filtered = dynamic.filter((u) => u.u !== username);
    if (filtered.length === dynamic.length) {
      return Response.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
    }
    await saveDynamic(filtered);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { username, passwordHash, name, role, isAdmin, allowedRoutes } = body;

    if (!username) {
      return Response.json({ error: "Thiếu username" }, { status: 400 });
    }

    const isDefaultUser = USERS.find((u) => u.u === username);
    if (isDefaultUser) {
      if (passwordHash) {
        const ov = await getOverrides();
        ov[username] = passwordHash;
        await saveOverrides(ov);
      }
      return Response.json({ ok: true });
    }

    const dynamic = await getDynamic();
    const idx = dynamic.findIndex((u) => u.u === username);
    if (idx === -1) {
      return Response.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    if (passwordHash) dynamic[idx].h = passwordHash;
    if (name !== undefined) dynamic[idx].name = name;
    if (role !== undefined) dynamic[idx].role = role;
    if (isAdmin !== undefined) dynamic[idx].isAdmin = !!isAdmin;
    if (allowedRoutes !== undefined) dynamic[idx].allowedRoutes = allowedRoutes;

    await saveDynamic(dynamic);
    return Response.json({ ok: true, user: { ...dynamic[idx], isDefault: false } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
