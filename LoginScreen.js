"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "./AuthProvider";
import logo from "../public/galaxy-pay-logo.webp";

export default function LoginScreen() {
  const { login } = useAuth();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    const res = await login(u, p);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      setP("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20,
          padding: "36px 32px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <Image src={logo} alt="Galaxy Pay" width={170} height={42} style={{ width: 170, height: "auto", display: "block" }} priority />
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1.6, color: "#8a7dff", textAlign: "center" }}>
            GALAXY PAY · BUSINESS INTELLIGENCE
          </div>
          <div style={{ fontSize: 13, color: "#8a8fa6", marginTop: 2 }}>Đăng nhập để xem báo cáo Khối Kinh doanh</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#8a8fa6", textTransform: "uppercase" }}>Tài khoản</span>
            <input
              type="text"
              value={u}
              onChange={(e) => { setU(e.target.value); setError(""); }}
              autoFocus
              placeholder="vd: taicv"
              style={inputStyle}
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#8a8fa6", textTransform: "uppercase" }}>Mật khẩu</span>
            <input
              type="password"
              value={p}
              onChange={(e) => { setP(e.target.value); setError(""); }}
              placeholder="••••••••"
              style={{ ...inputStyle, letterSpacing: 2 }}
            />
          </label>

          {error && (
            <div
              style={{
                fontSize: 12.5,
                color: "#fb7185",
                background: "rgba(251,113,133,0.09)",
                border: "1px solid rgba(251,113,133,0.2)",
                borderRadius: 8,
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 6,
              padding: "13px 16px",
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg,#7c6cff,#9d8bff)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 0.3,
              boxShadow: "0 8px 24px rgba(124,108,255,0.35)",
              opacity: busy ? 0.7 : 1,
            }}
          >
            Đăng nhập →
          </button>
        </div>

        <div
          style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11,
            color: "#5b5f74",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Nội bộ Galaxy Pay · Không chia sẻ tài khoản
          <br />
          Liên hệ admin (Khối Kinh doanh) nếu cần cấp tài khoản
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 14,
  color: "#ecedf5",
  outline: "none",
};
