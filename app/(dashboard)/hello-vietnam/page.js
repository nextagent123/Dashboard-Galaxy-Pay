"use client";

import { useState, useCallback } from "react";

const HUBS = [
  {
    id: "travel-hub",
    title: "Travel Hub",
    subtitle: "Vé bay, khách sạn, lữ hành, du lịch sông",
    color: "#0B5D50",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>
      </svg>
    ),
  },
  {
    id: "commerce-hub",
    title: "Commerce Hub",
    subtitle: "Mua sắm, KOL livestream, bán lẻ",
    color: "#1F4E79",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    id: "event-ticketing",
    title: "Event & Ticketing",
    subtitle: "Đêm nhạc, sự kiện, combo vé",
    color: "#9A2B3A",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/><path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/><path d="M2 9v6"/><path d="M22 9v6"/><path d="M9 3v18"/>
      </svg>
    ),
  },
  {
    id: "payment-loyalty",
    title: "Payment & Loyalty",
    subtitle: "Thanh toán, ví ưu đãi, hoàn tiền",
    color: "#B8860B",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
      </svg>
    ),
  },
  {
    id: "distribution-hub",
    title: "Distribution Hub",
    subtitle: "Phân phối KOL, đại lý, OTA",
    color: "#6B3D7A",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    id: "control-center",
    title: "Control Center",
    subtitle: "Trung tâm điều hành VIFC & Sở ngành",
    color: "#13201D",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
      </svg>
    ),
  },
  {
    id: "revenue-model",
    title: "Mô hình doanh thu",
    subtitle: "Cấu trúc doanh thu & dự phóng",
    color: "#0B5D50",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 5-10"/>
      </svg>
    ),
  },
  {
    id: "service-providers",
    title: "Nhà cung cấp dịch vụ",
    subtitle: "Bản đồ nhà cung cấp & đối tác",
    color: "#0B5D50",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>
      </svg>
    ),
  },
  {
    id: "voucher-engine",
    title: "Voucher & Incentive Engine",
    subtitle: "Hệ thống voucher, hoàn tiền, ưu đãi",
    color: "#B8860B",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"/><path d="M2 8h20v4H2z"/><path d="M12 20V8"/><path d="M12 8H7.5a2.5 2.5 0 110-5C11 3 12 8 12 8z"/><path d="M12 8h4.5a2.5 2.5 0 100-5C13 3 12 8 12 8z"/>
      </svg>
    ),
  },
  {
    id: "voucher-studio",
    title: "Voucher Studio",
    subtitle: "Nhà tài trợ phân bổ quota voucher",
    color: "#0B5D50",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6l-4.9 3.6 1.9-5.8L4 8.8h6.1z"/>
      </svg>
    ),
  },
  {
    id: "last-page",
    title: "Nhà tài trợ & nhãn hàng",
    subtitle: "Danh mục tài trợ & đóng góp",
    color: "#0B5D50",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

const IFRAME_HEIGHTS = {
  overview: 1940,
  "travel-hub": 1600,
  "commerce-hub": 1600,
  "event-ticketing": 1900,
  "payment-loyalty": 2600,
  "distribution-hub": 1600,
  "control-center": 1600,
  "revenue-model": 2750,
  "service-providers": 3000,
  "voucher-engine": 2000,
  "voucher-studio": 1300,
  "last-page": 1600,
};

export default function HelloVietnamPage() {
  const [activeView, setActiveView] = useState("overview");
  const [iframeLoading, setIframeLoading] = useState(true);

  const handleNavToHub = useCallback((hubId) => {
    setIframeLoading(true);
    setActiveView(hubId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackToOverview = useCallback(() => {
    setIframeLoading(true);
    setActiveView("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const activeHub = HUBS.find((h) => h.id === activeView);
  const iframeSrc = activeView === "overview"
    ? "/hello-vietnam/overview.html"
    : `/hello-vietnam/${activeView}.html`;

  return (
    <div style={{ padding: "0 0 40px" }}>
      <style>{`
        @keyframes hv-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .hv-card {
          background: var(--surface);
          border: 1px solid var(--border-soft);
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.22s ease;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          text-decoration: none;
          color: inherit;
          position: relative;
          overflow: hidden;
        }
        .hv-card:hover {
          border-color: rgba(11, 93, 80, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        .hv-card::after {
          content: '→';
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          opacity: 0.3;
          transition: opacity 0.2s, transform 0.2s;
        }
        .hv-card:hover::after {
          opacity: 0.7;
          transform: translateY(-50%) translateX(3px);
        }
        .hv-iframe-wrap {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border-soft);
          background: #F4F6F4;
          position: relative;
        }
        .hv-iframe-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(244,246,244,0.9);
          z-index: 2;
        }
        .hv-loading-bar {
          width: 200px;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(90deg, transparent 0%, #0B5D50 50%, transparent 100%);
          background-size: 200% 100%;
          animation: hv-shimmer 1.5s infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0B5D50 0%, #0D6B5C 50%, #0B5D50 100%)",
        borderRadius: 16,
        padding: "28px 32px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="52" height="52" viewBox="0 0 72 72" role="img" aria-label="Hello Vietnam">
            <circle cx="36" cy="30" r="18" fill="#F2B441"/>
            <path d="M6 46c8-6 16-6 24 0s16 6 24 0 10-4 12-3" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round"/>
            <path d="M10 58c8-5 14-5 22 0s16 5 24 0" fill="none" stroke="#A9CFC6" strokeWidth="5" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{
              fontSize: 26, fontWeight: 800, color: "#fff",
              letterSpacing: -0.5, lineHeight: 1,
            }}>
              HELLO VIETNAM
            </div>
            <div style={{ fontSize: 13, color: "#CFE5DF", marginTop: 4 }}>
              Phác thảo nền tảng · Cổng kết nối số cho du lịch, mua sắm và thanh toán
            </div>
          </div>
        </div>

        {activeView !== "overview" && (
          <button
            onClick={handleBackToOverview}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.18s",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/>
            </svg>
            Về tổng quan
          </button>
        )}
      </div>

      {/* Active hub breadcrumb */}
      {activeView !== "overview" && activeHub && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 16, fontSize: 14, color: "var(--text-dim)",
        }}>
          <span
            onClick={handleBackToOverview}
            style={{ cursor: "pointer", color: "#0B5D50", fontWeight: 500 }}
          >
            Tổng quan
          </span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>
            {activeHub.title}
          </span>
        </div>
      )}

      {/* Iframe viewer */}
      <div className="hv-iframe-wrap" style={{ marginBottom: activeView === "overview" ? 28 : 0 }}>
        {iframeLoading && (
          <div className="hv-iframe-loading">
            <div style={{ textAlign: "center" }}>
              <div className="hv-loading-bar" />
              <div style={{ fontSize: 12, color: "#4A5A56", marginTop: 10 }}>
                Đang tải {activeView === "overview" ? "tổng quan" : activeHub?.title}...
              </div>
            </div>
          </div>
        )}
        <iframe
          key={activeView}
          src={iframeSrc}
          title={activeView === "overview" ? "Hello Vietnam – Tổng quan" : activeHub?.title}
          style={{
            width: "100%",
            height: IFRAME_HEIGHTS[activeView] || 1600,
            border: "none",
            display: "block",
            minHeight: 600,
          }}
          onLoad={() => setIframeLoading(false)}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Hub grid - only on overview */}
      {activeView === "overview" && (
        <>
          <h2 style={{
            fontSize: 16, fontWeight: 700, color: "var(--text-strong)",
            marginBottom: 16,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{
              width: 4, height: 20, borderRadius: 2,
              background: "linear-gradient(180deg, #0B5D50, #F2B441)",
              display: "inline-block",
            }}/>
            Chi tiết các Hub
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 14,
          }}>
            {HUBS.map((hub) => (
              <div
                key={hub.id}
                className="hv-card"
                onClick={() => handleNavToHub(hub.id)}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: hub.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: hub.color === "#F2B441" || hub.color === "#B8860B" ? "#13201D" : "#fff",
                  flexShrink: 0,
                }}>
                  {hub.icon}
                </div>
                <div style={{ minWidth: 0, paddingRight: 24 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: "var(--text-strong)",
                    marginBottom: 2,
                  }}>
                    {hub.title}
                  </div>
                  <div style={{
                    fontSize: 12, color: "var(--text-dim)",
                    lineHeight: 1.4,
                  }}>
                    {hub.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
