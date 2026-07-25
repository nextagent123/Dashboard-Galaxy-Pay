"use client";

import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import LoginScreen from "@/components/LoginScreen";
import Sidebar from "@/components/Sidebar";
import UserBadge from "@/components/UserBadge";
import UserAdminModal from "@/components/UserAdminModal";
import ChatBot from "@/components/ChatBot";
import { syncDashboardData } from "@/lib/syncData";

function Gate({ children }) {
  const { ready, user } = useAuth();
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    syncDashboardData().then(() => setDataReady(true));
  }, []);

  if (!ready || !dataReady) return null;
  if (!user) return <LoginScreen />;
  return (
    <div className="app-shell">
      <Sidebar />
      <UserBadge />
      <UserAdminModal />
      <main className="main-content">{children}</main>
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
