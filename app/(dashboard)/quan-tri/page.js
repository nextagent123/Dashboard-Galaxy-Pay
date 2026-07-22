"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { USERS } from "@/lib/auth";

const INPUT = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13.5,
  color: "#ecedf5",
  outline: "none",
  width: "100%",
};

export default function QuanTriPage() {
  const { allUsers, deleteExtraUser, resetPassword, signup } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const filtered = search
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.u.toLowerCase().includes(search.toLowerCase()) ||
          (u.role || "").toLowerCase().includes(search.toLowerCase())
      )
    : allUsers;

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await signup({ name, role, username, password, password2 });
    if (!res.ok) {
      setError(res.error);
      setSuccess("");
      return;
    }
    setName("");
    setRole("");
    setUsername("");
    setPassword("");
    setPassword2("");
    setError("");
    setSuccess(res.message);
  }

  async function handleReset(u) {
    const p = window.prompt("Nhập mật khẩu mới cho @" + u + " (tối thiểu 6 ký tự):");
    if (p == null) return;
    if (p.length < 6) { alert("Mật khẩu phải tối thiểu 6 ký tự."); return; }
    const p2 = window.prompt("Nhập lại mật khẩu mới:");
    if (p !== p2) { alert("Mật khẩu nhập lại không khớp."); return; }
    await resetPassword(u, p);
    alert("Đã đổi mật khẩu cho @" + u);
  }

  function handleDelete(u) {
    if (!confirm("Xóa tài khoản @" + u + "?")) return;
    deleteExtraUser(u);
  }

  return (
    <>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3, marginBottom: 4 }}>
        Quản lý tài khoản
      </h1>
      <p style={{ fontSize: 13, color: "#8a8fa6", marginBottom: 24 }}>
        Tạo mới, đổi mật khẩu và quản lý người dùng hệ thống
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {/* Stats */}
        <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42, height: 42, borderRadius: 12,
              background: "linear-gradient(135deg, #7c6cff, #9d8bff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#fff",
            }}
          >
            {allUsers.length}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Tổng tài khoản</div>
            <div style={{ fontSize: 12, color: "#8a8fa6" }}>
              {USERS.length} mặc định · {allUsers.length - USERS.length} thêm mới
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42, height: 42, borderRadius: 12,
              background: "linear-gradient(135deg, #34d399, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Bảo mật</div>
            <div style={{ fontSize: 12, color: "#8a8fa6" }}>Mật khẩu được mã hóa SHA-256</div>
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="card" style={{ padding: 0, marginBottom: 24, overflow: "hidden" }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>
            Danh sách người dùng
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            style={{ ...INPUT, maxWidth: 220, padding: "7px 12px", fontSize: 12.5 }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th style={TH}></th>
                <th style={TH}>Họ tên</th>
                <th style={TH}>Username</th>
                <th style={TH}>Chức vụ</th>
                <th style={TH}>Loại</th>
                <th style={{ ...TH, textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isDefault = USERS.some((x) => x.u === u.u);
                return (
                  <tr key={u.u} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ ...TD, width: 48 }}>
                      <div
                        style={{
                          width: 32, height: 32, borderRadius: 9,
                          background: isDefault
                            ? "linear-gradient(140deg, #4a4470, #6d5efc)"
                            : "linear-gradient(140deg, #1a4a4a, #0d9488)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 11, color: "#fff",
                        }}
                      >
                        {u.ini}
                      </div>
                    </td>
                    <td style={{ ...TD, fontWeight: 600 }}>{u.name}</td>
                    <td style={TD}>
                      <span className="mono" style={{ color: "#a78bfa", fontSize: 12 }}>@{u.u}</span>
                    </td>
                    <td style={{ ...TD, color: "#8a8fa6" }}>{u.role}</td>
                    <td style={TD}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          background: isDefault ? "rgba(124,108,255,0.12)" : "rgba(52,211,153,0.12)",
                          color: isDefault ? "#c3b9ff" : "#34d399",
                          border: `1px solid ${isDefault ? "rgba(124,108,255,0.25)" : "rgba(52,211,153,0.25)"}`,
                        }}
                      >
                        {isDefault ? "Mặc định" : "Thêm mới"}
                      </span>
                    </td>
                    <td style={{ ...TD, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => handleReset(u.u)} style={BTN_EDIT}>
                          Đổi MK
                        </button>
                        {!isDefault && (
                          <button onClick={() => handleDelete(u.u)} style={BTN_DEL}>
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...TD, textAlign: "center", color: "#5b5f74", padding: 32 }}>
                    Không tìm thấy tài khoản nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create new user */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
        }}>
          Tạo tài khoản mới
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và tên" style={INPUT} />
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Chức vụ / Phòng ban" style={INPUT} />
          </div>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập (chữ thường, không dấu)" style={INPUT} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (≥6 ký tự)" style={{ ...INPUT, letterSpacing: 2 }} />
            <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Nhập lại mật khẩu" style={{ ...INPUT, letterSpacing: 2 }} />
          </div>

          {error && (
            <div style={{ fontSize: 12.5, color: "#fb7185", background: "rgba(251,113,133,0.09)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 8, padding: "9px 12px" }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ fontSize: 12.5, color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.22)", borderRadius: 8, padding: "9px 12px" }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            style={{
              marginTop: 4, padding: "11px 16px", border: "none", borderRadius: 10,
              background: "linear-gradient(135deg, #7c6cff, #9d8bff)", color: "#fff",
              fontSize: 13.5, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 6px 20px rgba(124,108,255,0.3)",
            }}
          >
            + Tạo tài khoản
          </button>
        </form>
      </div>

      <div style={{ fontSize: 11, color: "#5b5f74", textAlign: "center", marginTop: 16 }}>
        Tài khoản lưu trên trình duyệt của máy này. Không đồng bộ giữa các thiết bị.
      </div>
    </>
  );
}

const TH = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "#8a8fa6",
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const TD = { padding: "10px 14px" };

const BTN_EDIT = {
  padding: "5px 10px",
  border: "1px solid rgba(124,108,255,0.3)",
  background: "rgba(124,108,255,0.1)",
  color: "#c3b9ff",
  borderRadius: 7,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};

const BTN_DEL = {
  padding: "5px 10px",
  border: "1px solid rgba(251,113,133,0.3)",
  background: "rgba(251,113,133,0.08)",
  color: "#fb7185",
  borderRadius: 7,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};
