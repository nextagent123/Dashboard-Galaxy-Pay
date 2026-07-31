"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

function useTheme() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const saved = localStorage.getItem("gpDashTheme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("gpDashTheme", next);
  };
  return { theme, toggle };
}

export default function UserBadge() {
  const { user, isAdmin, openUserAdmin, logout } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  if (!user) return null;

  return (
    <div
      className="user-badge"
      style={{
        position: "fixed",
        top: 16,
        right: 20,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "8px 12px",
        borderRadius: 12,
        background: "var(--badge-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: 10,
          background: "linear-gradient(140deg,#4a4470,#6d5efc)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          color: "#fff",
        }}
      >
        {user.ini}
      </div>
      <div className="user-badge__text" style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
        <div style={{ fontSize: 10.5, color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.role}</div>
      </div>
      {isAdmin && (
        <button
          onClick={openUserAdmin}
          title="Quản lý tài khoản"
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            border: "1px solid rgba(124,108,255,0.35)",
            background: "rgba(124,108,255,0.12)",
            borderRadius: 8,
            color: "var(--accent-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
            <circle cx="18" cy="9" r="2" />
            <path d="M18 13v4M16 15h4" />
          </svg>
        </button>
      )}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Chuyển sang Light mode" : "Chuyển sang Dark mode"}
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          border: "1px solid var(--border)",
          background: "rgba(124,108,255,0.08)",
          borderRadius: 8,
          color: "var(--accent-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        {theme === "dark" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
      <button
        onClick={logout}
        title="Đăng xuất"
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          border: "1px solid var(--border)",
          background: "var(--surface-hover)",
          borderRadius: 8,
          color: "var(--text-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
}
