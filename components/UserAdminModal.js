"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function UserAdminModal() {
  const { showUserAdmin, closeUserAdmin, allUsers, deleteExtraUser, resetPassword, signup } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!showUserAdmin) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await signup({ name, role, username, password, password2 });
    if (!res.ok) {
      setError(res.error);
      setSuccess("");
      return;
    }
    setName(""); setRole(""); setUsername(""); setPassword(""); setPassword2("");
    setError("");
    setSuccess(res.message);
  }

  async function handleReset(u) {
    const p = window.prompt("Nhập mật khẩu mới cho @" + u + " (tối thiểu 6 ký tự):");
    if (p == null) return;
    if (p.length < 6) { alert("Mật khẩu phải ở tối thiểu 6 ký tự."); return; }
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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background:
          "radial-gradient(1200px 700px at 12% -8%, rgba(124,108,255,0.14), transparent 55%), radial-gradient(900px 600px at 100% 0%, rgba(157,123,255,0.08), transparent 50%), #0a0b12",
        overflowY: "auto",
        padding: "32px 40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1080,
          margin: "0 auto",
          background: "linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.01))",
          border: "1px solid rgba(124,108,255,0.2)",
          borderRadius: 18,
          boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "24px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={closeUserAdmin}
              title="Trở về"
              style={{
                width: 38,
                height: 38,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                color: "#a7abbe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1.6, color: "#8a7dff" }}>ADMIN · GALAXY PAY</div>
              <h2 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>Quản lý tài khoản</h2>
              <div style={{ fontSize: 12.5, color: "#8a8fa6", marginTop: 3 }}>Danh sách người dùng · Tạo mới · Đổi mật khẩu · Xóa</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "rgba(124,108,255,0.08)",
              border: "1px solid rgba(124,108,255,0.25)",
              borderRadius: 10,
              fontSize: 12,
            }}
          >
            <span className="mono" style={{ fontWeight: 700, color: "#c3b9ff" }}>{allUsers.length}</span>
            <span style={{ color: "#8a8fa6" }}>tài khoản</span>
          </div>
        </div>

        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, color: "#8a8fa6", textTransform: "uppercase", marginBottom: 10 }}>
              Tài khoản hiện có
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
              {allUsers.map((u) => {
                const isDefault = u.u === "taicv" || u.u === "diem";
                return (
                  <div
                    key={u.u}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 32, height: 32, flexShrink: 0, borderRadius: 9,
                        background: "linear-gradient(140deg,#4a4470,#6d5efc)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 12, color: "#fff",
                      }}
                    >
                      {u.ini}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {u.name} <span style={{ color: "#8a8fa6", fontWeight: 500 }}>· @{u.u}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#8a8fa6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {u.role} · {isDefault ? "Admin (mặc định)" : "Thêm mới"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleReset(u.u)}
                      title="Đổi mật khẩu"
                      style={{
                        flexShrink: 0, padding: "6px 10px", border: "1px solid rgba(124,108,255,0.3)",
                        background: "rgba(124,108,255,0.1)", color: "#c3b9ff", borderRadius: 8,
                        fontSize: 11.5, fontWeight: 600,
                      }}
                    >
                      Đổi MK
                    </button>
                    {!isDefault && (
                      <button
                        onClick={() => handleDelete(u.u)}
                        title="Xóa tài khoản"
                        style={{
                          flexShrink: 0, padding: "6px 10px", border: "1px solid rgba(251,113,133,0.3)",
                          background: "rgba(251,113,133,0.08)", color: "#fb7185", borderRadius: 8,
                          fontSize: 11.5, fontWeight: 600,
                        }}
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 11, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, color: "#8a8fa6", textTransform: "uppercase", marginBottom: 2 }}>
              Tạo tài khoản mới
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ và tên" style={modalInputStyle} />
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Chức vụ / Phòng ban" style={modalInputStyle} />
            </div>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập (chữ thường, không dấu)" style={modalInputStyle} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (≥6 ký tự)" style={{ ...modalInputStyle, letterSpacing: 2 }} />
              <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Nhập lại mật khẩu" style={{ ...modalInputStyle, letterSpacing: 2 }} />
            </div>

            {error && (
              <div style={{ fontSize: 12.5, color: "#fb7185", background: "rgba(251,113,133,0.09)", border: "1px solid rgba(251,113,133,0.2)", borderRadius: 8, padding: "9px 12px" }}>
                ⚠ {error}
              </div>
            )}
            {success && (
              <div style={{ fontSize: 12.5, color: "#34d399", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.22)", borderRadius: 8, padding: "9px 12px" }}>
                ✓ {success}
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: 4, padding: "11px 16px", border: "none", borderRadius: 10,
                background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
                fontSize: 13.5, fontWeight: 700, boxShadow: "0 6px 20px rgba(124,108,255,0.3)",
              }}
            >
              + Tạo tài khoản
            </button>
          </form>

          <div style={{ fontSize: 11, color: "#5b5f74", textAlign: "center", paddingTop: 4 }}>
            Tài khoản lưu trên trình duyệt của máy này. Không đồng bộ giữa các thiết bị.
          </div>
        </div>
      </div>
    </div>
  );
}

const modalInputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13.5,
  color: "#ecedf5",
  outline: "none",
};
