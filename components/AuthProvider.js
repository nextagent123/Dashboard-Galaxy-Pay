"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ADMIN_USERS,
  clearSession,
  getAllUsers,
  initialsFromName,
  loadExtraUsers,
  loadOverrides,
  loadSession,
  saveExtraUsers,
  saveOverrides,
  saveSession,
  sha256,
} from "@/lib/auth";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Everything that has to be hydrated from localStorage on mount (client-only,
// so this can't run during the server render) — bundled into one object so
// the mount effect below is a single setState call, not four.
function hydrateFromStorage() {
  const extraUsers = loadExtraUsers();
  const overrides = loadOverrides();
  const saved = loadSession();
  let user = null;
  if (saved) {
    const all = getAllUsers(extraUsers, overrides);
    user = all.find((x) => x.u === saved.u && x.h === saved.h) || null;
  }
  return { extraUsers, overrides, user };
}

const INITIAL_AUTH_DATA = { ready: false, user: null, extraUsers: [], overrides: {} };

export function AuthProvider({ children }) {
  const [{ ready, user, extraUsers, overrides }, setAuthData] = useState(INITIAL_AUTH_DATA);
  const [showUserAdmin, setShowUserAdmin] = useState(false);

  useEffect(() => {
    // One-shot hydration from localStorage, which doesn't exist during SSR —
    // there's no external-subscription API to sync from here, an effect is
    // the only place this can run.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthData({ ready: true, ...hydrateFromStorage() });
  }, []);

  function setUser(user) {
    setAuthData((s) => ({ ...s, user }));
  }
  function setExtraUsers(extraUsers) {
    setAuthData((s) => ({ ...s, extraUsers }));
  }
  function setOverrides(overrides) {
    setAuthData((s) => ({ ...s, overrides }));
  }

  const allUsers = useMemo(() => getAllUsers(extraUsers, overrides), [extraUsers, overrides]);
  const isAdmin = !!(user && ADMIN_USERS.indexOf(user.u) >= 0);

  async function login(username, password) {
    const u = (username || "").trim().toLowerCase();
    const p = password || "";
    if (!u || !p) return { ok: false, error: "Vui lòng nhập tài khoản và mật khẩu." };
    const hash = await sha256(p);
    const found = allUsers.find((x) => x.u === u && x.h === hash);
    if (!found) return { ok: false, error: "Tài khoản hoặc mật khẩu không đúng." };
    saveSession(found.u, found.h);
    setUser(found);
    return { ok: true };
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  async function signup({ name, role, username, password, password2 }) {
    const n = (name || "").trim();
    const r = (role || "").trim() || "Nhân viên";
    const u = (username || "").trim().toLowerCase();
    const p = password || "";
    const p2 = password2 || "";
    if (!n) return { ok: false, error: "Vui lòng nhập họ và tên." };
    if (!u || !/^[a-z0-9_.-]{3,}$/.test(u)) return { ok: false, error: "Tên đăng nhập tối thiểu 3 ký tự, chỉ chữ thường/số/._-" };
    if (p.length < 6) return { ok: false, error: "Mật khẩu tối thiểu 6 ký tự." };
    if (p !== p2) return { ok: false, error: "Mật khẩu nhập lại không khớp." };
    if (allUsers.some((x) => x.u === u)) return { ok: false, error: "Tên đăng nhập đã tồn tại." };
    const h = await sha256(p);
    const newUser = { u, h, name: n, role: r, ini: initialsFromName(n) };
    const next = extraUsers.concat([newUser]);
    saveExtraUsers(next);
    setExtraUsers(next);
    return { ok: true, message: "Đã tạo tài khoản @" + u };
  }

  function deleteExtraUser(username) {
    const next = extraUsers.filter((x) => x.u !== username);
    saveExtraUsers(next);
    setExtraUsers(next);
  }

  async function resetPassword(username, newPassword) {
    const h = await sha256(newPassword);
    const isExtra = extraUsers.some((x) => x.u === username);
    if (isExtra) {
      const next = extraUsers.map((x) => (x.u === username ? { ...x, h } : x));
      saveExtraUsers(next);
      setExtraUsers(next);
    } else {
      const next = { ...overrides, [username]: h };
      saveOverrides(next);
      setOverrides(next);
    }
    if (user && user.u === username) {
      saveSession(username, h);
      setUser({ ...user, h });
    }
  }

  const value = {
    ready,
    user,
    isAdmin,
    allUsers,
    login,
    logout,
    signup,
    deleteExtraUser,
    resetPassword,
    showUserAdmin,
    openUserAdmin: () => setShowUserAdmin(true),
    closeUserAdmin: () => setShowUserAdmin(false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
