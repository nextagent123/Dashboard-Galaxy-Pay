"use client";

import { useState } from "react";
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
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [collapsed, setCollapsed] = useState({});

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const toggleSection = (header) => {
    setCollapsed((prev) => ({ ...prev, [header]: !prev[header] }));
  };

  const navContent = (
    <>
      {/* Logo block */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "6px 8px 24px",
        borderBottom: "1px solid rgba(124,108,255,0.12)",
        marginBottom: 8,
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: "linear-gradient(135deg, rgba(124,108,255,0.2), rgba(167,139,250,0.1))",
          border: "1px solid rgba(124,108,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 700, letterSpacing: -0.3,
            background: "linear-gradient(135deg, #ecedf5, #a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1.2,
          }}>Galaxy Pay</div>
          <div style={{
            fontSize: 10.5, color: "#6b6f85", fontWeight: 500,
            letterSpacing: 0.3, marginTop: 2,
          }}>Business Dashboard</div>
        </div>
      </div>

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {NAV_SECTIONS.map((section) => {
          const isCollapsed = collapsed[section.header];
          const hasActive = section.items.some((item) => pathname === item.href);
          return (
            <div key={section.header} style={{ marginBottom: 4 }}>
              <button
                onClick={() => toggleSection(section.header)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", border: "none", background: "none",
                  fontSize: 10, fontWeight: 700, letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: hasActive ? "rgba(167,139,250,0.8)" : "#4d5165",
                  padding: "12px 10px 6px",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
              >
                <span>{section.header}</span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{
                    transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    opacity: 0.5,
                  }}
                >
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div style={{
                overflow: "hidden",
                maxHeight: isCollapsed ? 0 : 500,
                transition: "max-height 0.3s ease",
              }}>
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "flex", alignItems: "center", gap: 11,
                        padding: "9px 10px",
                        borderRadius: 10,
                        textDecoration: "none",
                        fontSize: 13, fontWeight: active ? 600 : 450,
                        position: "relative",
                        margin: "1px 0",
                        color: active ? "#ecedf5" : "#8a8fa6",
                        background: active
                          ? "linear-gradient(90deg, rgba(124,108,255,0.18), rgba(124,108,255,0.04))"
                          : "transparent",
                        border: active
                          ? "1px solid rgba(124,108,255,0.28)"
                          : "1px solid transparent",
                        transition: "all 0.18s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.035)";
                          e.currentTarget.style.color = "#c0c3d4";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#8a8fa6";
                        }
                      }}
                    >
                      {active && (
                        <span style={{
                          position: "absolute", left: 0, top: 8, bottom: 8,
                          width: 3, borderRadius: 3,
                          background: "linear-gradient(180deg, #a78bfa, #7c6cff)",
                          boxShadow: "0 0 8px rgba(124,108,255,0.5)",
                        }}/>
                      )}
                      <span style={{
                        width: 30, height: 30, borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                        background: active
                          ? "rgba(124,108,255,0.15)"
                          : "rgba(255,255,255,0.04)",
                        transition: "background 0.18s",
                      }}>
                        <Icon
                          paths={item.icon}
                          size={16}
                          stroke={active ? "#b7abff" : "currentColor"}
                        />
                      </span>
                      <span style={{
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{item.label}</span>
                      {active && (
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: "#7c6cff",
                          boxShadow: "0 0 6px rgba(124,108,255,0.6)",
                          marginLeft: "auto", flexShrink: 0,
                        }}/>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom section */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingTop: 14, marginTop: 8,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 10px",
          borderRadius: 10,
          background: "rgba(124,108,255,0.06)",
          border: "1px solid rgba(124,108,255,0.12)",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #7c6cff, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
            flexShrink: 0,
          }}>GP</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: "#c0c3d4" }}>Galaxy Pay v2.0</div>
            <div style={{ fontSize: 10, color: "#5b5f74", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#34d399",
                boxShadow: "0 0 6px rgba(52,211,153,0.5)",
                display: "inline-block",
              }}/>
              Live
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
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
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: "linear-gradient(135deg, rgba(124,108,255,0.25), rgba(167,139,250,0.1))",
            border: "1px solid rgba(124,108,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5Z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{
            fontSize: 14, fontWeight: 700, letterSpacing: -0.3,
            background: "linear-gradient(135deg, #ecedf5, #a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Galaxy Pay</span>
        </div>
      </div>

      {mobileOpen && <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />}

      <aside
        style={{
          width: 260,
          flexShrink: 0,
          borderRight: "1px solid rgba(124,108,255,0.08)",
          background: "linear-gradient(180deg, rgba(15,16,28,0.98), rgba(10,11,18,0.99))",
          padding: "20px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
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
