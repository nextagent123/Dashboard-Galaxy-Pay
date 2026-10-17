"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { MERCHANT_STATUSES } from "@/lib/merchantSchema";

const cardStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "20px 22px",
};

export default function MerchantOnboardingPage() {
  const { user, isAdmin } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [linkCopied, setLinkCopied] = useState(null);

  const fetchMerchants = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/merchant-onboarding?${params}`);
      const data = await res.json();
      setMerchants(data.merchants || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchMerchants(); }, [fetchMerchants]);

  function getFormLink(token) {
    return `${window.location.origin}/merchant-form?token=${token}`;
  }

  async function copyLink(token) {
    const link = getFormLink(token);
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(token);
      setTimeout(() => setLinkCopied(null), 2000);
    } catch { /* ignore */ }
  }

  const statusCounts = {};
  MERCHANT_STATUSES.forEach((s) => { statusCounts[s.key] = 0; });
  merchants.forEach((m) => { if (statusCounts[m.status] !== undefined) statusCounts[m.status]++; });

  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Merchant Onboarding</h1>
          <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "4px 0 0" }}>Quản lý tiếp nhận & kích hoạt Merchant</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding: "10px 20px", border: "none", borderRadius: 10,
            background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(124,108,255,0.3)",
          }}
        >
          + Tạo Lead mới
        </button>
      </div>

      {/* Status summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
        {MERCHANT_STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(statusFilter === s.key ? "" : s.key)}
            style={{
              ...cardStyle,
              padding: "12px 14px",
              cursor: "pointer",
              borderColor: statusFilter === s.key ? s.color : "var(--border)",
              background: statusFilter === s.key ? `${s.color}11` : "var(--card-bg)",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{statusCounts[s.key]}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên DN, MST, người liên hệ..."
          style={{
            width: "100%", maxWidth: 400, padding: "10px 14px",
            background: "var(--surface-soft)", border: "1px solid var(--border)",
            borderRadius: 10, fontSize: 13, color: "var(--text)", outline: "none",
          }}
        />
      </div>

      {/* Merchant list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>Đang tải...</div>
      ) : merchants.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 14, color: "var(--text-dim)" }}>
            {search || statusFilter ? "Không tìm thấy merchant phù hợp" : "Chưa có merchant nào. Nhấn \"Tạo Lead mới\" để bắt đầu."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {merchants.map((m) => {
            const st = MERCHANT_STATUSES.find((s) => s.key === m.status) || MERCHANT_STATUSES[0];
            return (
              <div
                key={m.id}
                style={{ ...cardStyle, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
                onClick={() => setSelectedMerchant(m)}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{m.company_name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                    {m.tax_id && `MST: ${m.tax_id} · `}{m.contact_name || "Chưa có liên hệ"}
                  </div>
                </div>
                <div style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}30`,
                  whiteSpace: "nowrap",
                }}>
                  {st.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", minWidth: 80, textAlign: "right" }}>
                  {m.sales_owner || "—"}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); copyLink(m.form_token); }}
                  style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: linkCopied === m.form_token ? "rgba(52,211,153,0.15)" : "var(--surface-soft)",
                    color: linkCopied === m.form_token ? "#34d399" : "var(--accent-soft)",
                    border: "1px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap",
                  }}
                  title="Copy link khai báo cho Merchant"
                >
                  {linkCopied === m.form_token ? "Đã copy ✓" : "Copy link"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Lead Modal */}
      {showCreate && (
        <CreateLeadModal
          user={user}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchMerchants(); }}
        />
      )}

      {/* Merchant Detail Modal */}
      {selectedMerchant && (
        <MerchantDetailModal
          merchant={selectedMerchant}
          user={user}
          isAdmin={isAdmin}
          onClose={() => setSelectedMerchant(null)}
          onUpdated={() => { setSelectedMerchant(null); fetchMerchants(); }}
        />
      )}
    </div>
  );
}

function CreateLeadModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({
    company_name: "", tax_id: "", contact_name: "", contact_phone: "", contact_email: "", notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function update(key, val) { setForm((f) => ({ ...f, [key]: val })); setError(""); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.company_name.trim()) { setError("Vui lòng nhập tên doanh nghiệp"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form, sales_owner: user?.name || "" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setBusy(false); return; }
      onCreated();
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
      setBusy(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "var(--text)" }}>Tạo Lead Merchant mới</h2>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Tên doanh nghiệp *" value={form.company_name} onChange={(v) => update("company_name", v)} autoFocus />
          <Field label="Mã số thuế" value={form.tax_id} onChange={(v) => update("tax_id", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Người liên hệ" value={form.contact_name} onChange={(v) => update("contact_name", v)} />
            <Field label="Số điện thoại" value={form.contact_phone} onChange={(v) => update("contact_phone", v)} />
          </div>
          <Field label="Email" type="email" value={form.contact_email} onChange={(v) => update("contact_email", v)} />
          <Field label="Ghi chú" value={form.notes} onChange={(v) => update("notes", v)} multiline />
          {error && <div style={{ fontSize: 12.5, color: "#fb7185", background: "rgba(251,113,133,0.09)", borderRadius: 8, padding: "8px 12px" }}>⚠ {error}</div>}
          <button type="submit" disabled={busy} style={submitBtnStyle}>
            {busy ? "Đang tạo..." : "Tạo Lead"}
          </button>
        </form>
      </div>
    </div>
  );
}

function MerchantDetailModal({ merchant, user, isAdmin, onClose, onUpdated }) {
  const [history, setHistory] = useState([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/merchant-onboarding?id=${merchant.id}&history=1`)
      .then((r) => r.json())
      .then((d) => setHistory(d.history || []))
      .catch(() => {});
  }, [merchant.id]);

  const st = MERCHANT_STATUSES.find((s) => s.key === merchant.status) || MERCHANT_STATUSES[0];

  const possibleNext = MERCHANT_STATUSES.filter((s) => {
    if (s.key === merchant.status) return false;
    return true;
  });

  async function changeStatus(newStatus) {
    setBusy(true);
    try {
      const res = await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status",
          id: merchant.id,
          new_status: newStatus,
          changed_by: user?.name || "Unknown",
          role: "admin",
          note,
        }),
      });
      const data = await res.json();
      if (res.ok) onUpdated();
      else alert(data.error);
    } catch (err) { alert(err.message); }
    setBusy(false);
  }

  const decl = merchant.declaration_data;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: 640, maxHeight: "85vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "var(--text)" }}>{merchant.company_name}</h2>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              {merchant.tax_id && `MST: ${merchant.tax_id} · `}Sales: {merchant.sales_owner || "—"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
              background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}30`,
            }}>
              {st.label}
            </span>
            <button onClick={onClose} style={closeBtnStyle}>✕</button>
          </div>
        </div>

        {/* Contact info */}
        <div style={{ ...cardStyle, marginBottom: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
            Thông tin liên hệ
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
            <div><span style={{ color: "var(--text-dim)" }}>Người LH:</span> <span style={{ color: "var(--text)" }}>{merchant.contact_name || "—"}</span></div>
            <div><span style={{ color: "var(--text-dim)" }}>SĐT:</span> <span style={{ color: "var(--text)" }}>{merchant.contact_phone || "—"}</span></div>
            <div style={{ gridColumn: "1/-1" }}><span style={{ color: "var(--text-dim)" }}>Email:</span> <span style={{ color: "var(--text)" }}>{merchant.contact_email || "—"}</span></div>
          </div>
          {merchant.notes && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-dim)", fontStyle: "italic" }}>
              {merchant.notes}
            </div>
          )}
        </div>

        {/* Declaration data if exists */}
        {decl && (
          <div style={{ ...cardStyle, marginBottom: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
              Thông tin khai báo
            </div>
            <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
              {decl.business_type && <div><span style={{ color: "var(--text-dim)" }}>Loại hình KD:</span> <span style={{ color: "var(--text)" }}>{decl.business_type}</span></div>}
              {decl.website && <div><span style={{ color: "var(--text-dim)" }}>Website:</span> <span style={{ color: "var(--text)" }}>{decl.website}</span></div>}
              {decl.address && <div><span style={{ color: "var(--text-dim)" }}>Địa chỉ:</span> <span style={{ color: "var(--text)" }}>{decl.address}</span></div>}
              {decl.representative && <div><span style={{ color: "var(--text-dim)" }}>Người đại diện:</span> <span style={{ color: "var(--text)" }}>{decl.representative}</span></div>}
              {decl.position && <div><span style={{ color: "var(--text-dim)" }}>Chức vụ:</span> <span style={{ color: "var(--text)" }}>{decl.position}</span></div>}
              {decl.id_number && <div><span style={{ color: "var(--text-dim)" }}>CCCD:</span> <span style={{ color: "var(--text)" }}>{decl.id_number}</span></div>}
              {decl.bank_account && <div><span style={{ color: "var(--text-dim)" }}>STK:</span> <span style={{ color: "var(--text)" }}>{decl.bank_account}</span></div>}
              {decl.bank_name && <div><span style={{ color: "var(--text-dim)" }}>Ngân hàng:</span> <span style={{ color: "var(--text)" }}>{decl.bank_name}</span></div>}
              {decl.account_holder && <div><span style={{ color: "var(--text-dim)" }}>Chủ TK:</span> <span style={{ color: "var(--text)" }}>{decl.account_holder}</span></div>}
              {decl.expected_volume && <div><span style={{ color: "var(--text-dim)" }}>DSGD dự kiến:</span> <span style={{ color: "var(--text)" }}>{decl.expected_volume}</span></div>}
              {decl.payment_methods && <div><span style={{ color: "var(--text-dim)" }}>PTTT:</span> <span style={{ color: "var(--text)" }}>{decl.payment_methods}</span></div>}
            </div>
          </div>
        )}

        {/* Status change */}
        <div style={{ ...cardStyle, marginBottom: 14, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
            Chuyển trạng thái
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú (tuỳ chọn)..."
            style={{
              width: "100%", padding: "8px 12px", marginBottom: 10,
              background: "var(--surface-soft)", border: "1px solid var(--border)",
              borderRadius: 8, fontSize: 12, color: "var(--text)", outline: "none",
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {possibleNext.map((s) => (
              <button
                key={s.key}
                disabled={busy}
                onClick={() => changeStatus(s.key)}
                style={{
                  padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                  background: `${s.color}12`, color: s.color,
                  border: `1px solid ${s.color}30`, cursor: "pointer",
                }}
              >
                → {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ ...cardStyle, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
              Lịch sử trạng thái
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((h, i) => {
                const from = MERCHANT_STATUSES.find((s) => s.key === h.from_status);
                const to = MERCHANT_STATUSES.find((s) => s.key === h.to_status);
                return (
                  <div key={i} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ color: "var(--text-faint)", fontSize: 11, minWidth: 120 }}>
                      {new Date(h.changed_at).toLocaleString("vi-VN")}
                    </span>
                    <span style={{ color: from?.color || "var(--text-dim)" }}>{from?.label || h.from_status}</span>
                    <span style={{ color: "var(--text-faint)" }}>→</span>
                    <span style={{ color: to?.color || "var(--text-dim)", fontWeight: 600 }}>{to?.label || h.to_status}</span>
                    <span style={{ color: "var(--text-dim)" }}>bởi {h.changed_by}</span>
                    {h.note && <span style={{ color: "var(--text-faint)", fontStyle: "italic" }}>"{h.note}"</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", autoFocus, multiline }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "var(--text-dim)", textTransform: "uppercase" }}>{label}</span>
      <Tag
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        rows={multiline ? 3 : undefined}
        style={{
          background: "var(--surface-soft)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "10px 14px", fontSize: 13,
          color: "var(--text)", outline: "none", resize: multiline ? "vertical" : "none",
        }}
      />
    </label>
  );
}

const overlayStyle = {
  position: "fixed", inset: 0, zIndex: 1000,
  background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 16,
};

const modalStyle = {
  background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 16, padding: "24px 28px", width: "100%", maxWidth: 520,
  boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
};

const closeBtnStyle = {
  background: "none", border: "none", fontSize: 18,
  color: "var(--text-faint)", cursor: "pointer", padding: "4px 8px",
};

const submitBtnStyle = {
  marginTop: 4, padding: "12px 16px", border: "none", borderRadius: 10,
  background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
  boxShadow: "0 8px 24px rgba(124,108,255,0.35)",
};
