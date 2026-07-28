"use client";

import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import LoginScreen from "@/components/LoginScreen";
import Sidebar from "@/components/Sidebar";
import UserBadge from "@/components/UserBadge";
import UserAdminModal from "@/components/UserAdminModal";
import ChatBot from "@/components/ChatBot";
import { syncDashboardData } from "@/lib/syncData";

function LoadingSpinner() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#0a0b12",
    }}>
      <div style={{
        width: 40, height: 40, border: "3px solid rgba(124,108,255,0.2)",
        borderTopColor: "#7c6cff", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Gate({ children }) {
  const { ready, user } = useAuth();
  const [dataReady, setDataReady] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  useEffect(() => {
    syncDashboardData()
      .then(() => setDataReady(true))
      .catch(() => {
        setSyncError(true);
        setDataReady(true);
      });
  }, []);

  if (!ready || !dataReady) return <LoadingSpinner />;
  if (!user) return <LoginScreen />;
  return (
    <div className="app-shell">
      <Sidebar desktopHidden={sidebarHidden} onDesktopToggle={() => setSidebarHidden((v) => !v)} />
      <UserBadge />
      <UserAdminModal />
      <main className="main-content" style={sidebarHidden ? { marginLeft: 0, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" } : { transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        {syncError && (
          <div style={{
            padding: "10px 16px", margin: "0 0 12px", borderRadius: 8,
            background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
            color: "#fbbf24", fontSize: 13,
          }}>
            Dữ liệu có thể chưa được cập nhật. Vui lòng tải lại trang nếu cần.
          </div>
        )}
        {children}
      </main>
      <ChatBot />
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <Gate>{children}</Gate>
    </AuthProvider>
  );
}
