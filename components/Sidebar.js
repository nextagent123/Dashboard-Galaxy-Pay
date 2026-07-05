"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/lib/nav";
import Icon from "./ui/Icon";
import { useAuth } from "./AuthProvider";
import logo from "../public/galaxy-pay-logo.webp";

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, openUserAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close the drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navContent = (
    <>
      <div className="sidebar-logo-block" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "8px 10px 20px" }}>
        <Image src={logo} alt="Galaxy Pay" width={160} height={40} style={{ width: 160, height: "auto", display: "block" }} priority />
        <div style={{ fontSize: 11, color: "#8a8fa6", letterSpacing: 0.4, paddingLeft: 2 }}>Báo cáo Khối Kinh doanh</div>
      </div>

      {NAV_SECTIONS.map((section) => (
        <div key={section.header}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: "#5b5f74", padding: "14px 12px 8px" }}>
            {section.header}
          </div>
          {section.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 12px",
                  borderRadius: 11,
                  textAlign: "left",
                  width: "100%",
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  position: "relative",
                  textDecoration: "none",
                  color: active ? "#ecedf5" : "#a7abbe",
                  background: active
                    ? "linear-gradient(90deg, rgba(124,108,255,0.22), rgba(124,108,255,0.05))"
                    : "transparent",
                  border: active ? "1px solid rgba(124,108,255,0.35)" : "1px solid transparent",
                }}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 9,
                      bottom: 9,
                      width: 3,
                      borderRadius: 3,
                      background: "#9d8bff",
                    }}
                  />
                )}
                <Icon paths={item.icon} size={19} stroke={active ? "#b7abff" : "currentColor"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}

      {isAdmin && (
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: "#5b5f74", padding: "14px 12px 8px" }}>QUẢN TRỊ</div>
          <button
            onClick={openUserAdmin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 12px",
              borderRadius: 11,
              border: "1px solid rgba(124,108,255,0.35)",
              textAlign: "left",
              width: "100%",
              fontSize: 13.5,
              fontWeight: 600,
              color: "#c3b9ff",
              background: "rgba(124,108,255,0.08)",
              position: "relative",
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#c3b9ff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
              <circle cx="18" cy="9" r="2" />
              <path d="M18 13v4M16 15h4" />
            </svg>
            <span>Quản lý tài khoản</span>
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Slim top bar — mobile only (CSS-gated); triggers the drawer below */}
      <div className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Mở menu"
          aria-expanded={mobileOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Image src={logo} alt="Galaxy Pay" width={112} height={28} style={{ width: 112, height: "auto", display: "block" }} priority />
      </div>

      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <aside
        style={{
          width: 256,
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0))",
          padding: "22px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
        className={mobileOpen ? "sidebar sidebar--open" : "sidebar"}
      >
        {mobileOpen && (
          <button className="sidebar-close-btn" onClick={() => setMobileOpen(false)} aria-label="Đóng menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
        {navContent}
      </aside>
    </>
  );
}
