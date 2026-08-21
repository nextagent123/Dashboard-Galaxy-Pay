"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  USERS,
  ADMIN_USERS,
  RESTRICTED_USERS,
  clearSession,
  initialsFromName,
  loadSession,
  saveSession,
  sha256,
} from "@/lib/auth";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function hardcodedFallback() {
  return USERS.map((u) => ({
    ...u,
    isDefault: true,
    isAdmin: ADMIN_USERS.includes(u.u),
    allowedRoutes: RESTRICTED_USERS[u.u] || null,
  }));
}

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserAdmin, setShowUserAdmin] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      const list = data.users || hardcodedFallback();
      setAllUsers(list);
      return list;
    } catch {
      const list = hardcodedFallback();
      setAllUsers(list);
      return list;
    }
  }, []);

  useEffect(() => {
    async function init() {
      const list = await fetchUsers();
      const saved = loadSession();
      if (saved) {
        const match = list.find((x) => x.u === saved.u && x.h === saved.h);
        if (match) setUser(match);
      }
      setReady(true);
    }
    init();
  }, [fetchUsers]);

  const isAdmin = !!(user && user.isAdmin);
  const allowedRoutes = user?.allowedRoutes || null;

  async function login(username, password) {
    const u = (username || "").trim().toLowerCase();
    const p = password || "";
    if (!u || !p) return { ok: false, error: "Vui lòng nhập tài khoản và mật khẩu." };
    const hash = await sha256(p);
    const list = await fetchUsers();
    const found = list.find((x) => x.u === u && x.h === hash);
    if (!found) return { ok: false, error: "Tài khoản hoặc mật khẩu không đúng." };
    saveSession(found.u, found.h);
    setUser(found);
    // Fire-and-forget login log
    try {
      fetch("/api/auth/login-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: found.u, name: found.name, role: found.role }),
      }).catch(() => {});
    } catch {}
    return { ok: true };
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  async function signup({ name, role, username, password, password2, isAdmin: adm, allowedRoutes: routes }) {
    const n = (name || "").trim();
    const r = (role || "").trim() || "Nhân viên";
    const u = (username || "").trim().toLowerCase();
    const p = password || "";
    const p2 = password2 || "";
    if (!n) return { ok: false, error: "Vui lòng nhập họ và tên." };
    if (!u || !/^[a-z0-9_.-]{3,}$/.test(u))
      return { ok: false, error: "Tên đăng nhập tối thiểu 3 ký tự, chỉ chữ thường/số/._-" };
    if (p.length < 6) return { ok: false, error: "Mật khẩu tối thiểu 6 ký tự." };
    if (p !== p2) return { ok: false, error: "Mật khẩu nhập lại không khớp." };

    const h = await sha256(p);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: u,
          passwordHash: h,
          name: n,
          role: r,
          initials: initialsFromName(n),
          isAdmin: !!adm,
          allowedRoutes: routes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || "Lỗi tạo tài khoản" };
      await fetchUsers();
      return { ok: true, message: "Đã tạo tài khoản @" + u };
    } catch (e) {
      return { ok: false, error: "Lỗi kết nối: " + e.message };
    }
  }

  async function deleteUser(username) {
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) return data.error;
      await fetchUsers();
      return null;
    } catch (e) {
      return "Lỗi kết nối: " + e.message;
    }
  }

  async function resetPassword(username, newPassword) {
    const h = await sha256(newPassword);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, passwordHash: h }),
      });
      const data = await res.json();
      if (!res.ok) return data.error;
      if (user && user.u === username) {
        saveSession(username, h);
        setUser({ ...user, h });
      }
      await fetchUsers();
      return null;
    } catch (e) {
      return "Lỗi kết nối: " + e.message;
    }
  }

  async function updateUser(username, updates) {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, ...updates }),
      });
      const data = await res.json();
      if (!res.ok) return data.error;
      await fetchUsers();
      return null;
    } catch (e) {
      return "Lỗi kết nối: " + e.message;
    }
  }

  const value = {
    ready,
    user,
    isAdmin,
    allowedRoutes,
    allUsers,
    login,
    logout,
    signup,
    deleteUser,
    resetPassword,
    updateUser,
    showUserAdmin,
    openUserAdmin: () => setShowUserAdmin(true),
    closeUserAdmin: () => setShowUserAdmin(false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
