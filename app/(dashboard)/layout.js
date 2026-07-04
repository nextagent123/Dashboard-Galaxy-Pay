"use client";

import { AuthProvider, useAuth } from "@/components/AuthProvider";
import LoginScreen from "@/components/LoginScreen";
import Sidebar from "@/components/Sidebar";
import UserBadge from "@/components/UserBadge";
import UserAdminModal from "@/components/UserAdminModal";

function Gate({ children }) {
  const { ready, user } = useAuth();
  if (!ready) return null;
  if (!user) return <LoginScreen />;
  return (
    <div className="app-shell">
      <Sidebar />
      <UserBadge />
      <UserAdminModal />
      <main className="main-content">{children}</main>
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
