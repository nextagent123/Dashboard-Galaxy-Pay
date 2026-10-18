"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { MERCHANT_STATUSES } from "@/lib/merchantSchema";
import RiskReviewView from "@/components/merchant/RiskReviewView";
import ContractView from "@/components/merchant/ContractView";
import SigningView from "@/components/merchant/SigningView";
import BulkImportView from "@/components/merchant/BulkImportView";
import DashboardOverviewView from "@/components/merchant/DashboardOverviewView";
import ManualDeclarationView from "@/components/merchant/ManualDeclarationView";
import FeeDeclarationView from "@/components/merchant/FeeDeclarationView";

const TABS = [
  { key: "dashboard", label: "Tổng quan" },
  { key: "leads", label: "Quản lý Lead" },
  { key: "pipeline", label: "Pipeline" },
  { key: "manual", label: "Khai báo thủ công" },
  { key: "fees", label: "Biểu phí" },
  { key: "risk", label: "Đánh giá rủi ro" },
  { key: "contract", label: "Hợp đồng" },
  { key: "signing", label: "Ký kết & Kích hoạt" },
  { key: "import", label: "Import" },
];

const cardStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "20px 22px",
};

export default function MerchantOnboardingPage() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab] = useState("dashboard");
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
      if (tab === "leads" && search) params.set("search", search);
      if (tab === "leads" && statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/merchant-onboarding?${params}`);
      const data = await res.json();
      setMerchants(data.merchants || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, statusFilter, tab]);

  useEffect(() => { setLoading(true); fetchMerchants(); }, [fetchMerchants]);

  function getFormLink(token) {
    return `${window.location.origin}/merchant-form?token=${token}`;
  }

  async function copyLink(token) {
    try {
      await navigator.clipboard.writeText(getFormLink(token));
      setLinkCopied(token);
      setTimeout(() => setLinkCopied(null), 2000);
    } catch { /* ignore */ }
  }

  const statusCounts = {};
  MERCHANT_STATUSES.forEach((s) => { statusCounts[s.key] = 0; });
  merchants.forEach((m) => { if (statusCounts[m.status] !== undefined) statusCounts[m.status]++; });

  return (
    <div style={{ padding: "0 4px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Merchant Onboarding</h1>
          <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "4px 0 0" }}>Quản lý tiếp nhận & kích hoạt Merchant</p>
        </div>
        {tab === "leads" && (
          <button onClick={() => setShowCreate(true)} style={createBtnStyle}>
            + Tạo Lead mới
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border-soft)", paddingBottom: 0, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "var(--accent-soft)" : "var(--text-dim)",
              background: "none",
              border: "none",
              borderBottom: tab === t.key ? "2px solid var(--accent-soft)" : "2px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
              marginBottom: -1,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "leads" && (
        <LeadsView
          merchants={merchants}
          loading={loading}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusCounts={statusCounts}
          linkCopied={linkCopied}
          copyLink={copyLink}
          onSelect={setSelectedMerchant}
        />
      )}
      {tab === "pipeline" && (
        <PipelineView merchants={merchants} loading={loading} />
      )}
      {tab === "dashboard" && (
        <DashboardOverviewView merchants={merchants} loading={loading} />
      )}
      {tab === "risk" && (
        <RiskReviewView merchants={merchants} loading={loading} onRefresh={fetchMerchants} />
      )}
      {tab === "contract" && (
        <ContractView merchants={merchants} loading={loading} onRefresh={fetchMerchants} />
      )}
      {tab === "signing" && (
        <SigningView merchants={merchants} loading={loading} onRefresh={fetchMerchants} />
      )}
      {tab === "manual" && (
        <ManualDeclarationView merchants={merchants} loading={loading} onRefresh={fetchMerchants} />
      )}
      {tab === "fees" && (
        <FeeDeclarationView merchants={merchants} loading={loading} onRefresh={fetchMerchants} />
      )}
      {tab === "import" && (
        <BulkImportView merchants={merchants} loading={loading} onRefresh={fetchMerchants} />
      )}

      {/* Modals */}
      {showCreate && (
        <CreateLeadModal
          user={user}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchMerchants(); }}
        />
      )}
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

/* ─── Leads View ─── */
function LeadsView({ merchants, loading, search, setSearch, statusFilter, setStatusFilter, statusCounts, linkCopied, copyLink, onSelect }) {
  return (
    <>
      {/* Status summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8, marginBottom: 18 }}>
        {MERCHANT_STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(statusFilter === s.key ? "" : s.key)}
            style={{
              ...cardStyle,
              padding: "10px 12px",
              cursor: "pointer",
              borderColor: statusFilter === s.key ? s.color : "var(--border)",
              background: statusFilter === s.key ? `${s.color}11` : "var(--card-bg)",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{statusCounts[s.key]}</div>
            <div style={{ fontSize: 10.5, color: "var(--text-dim)", marginTop: 2 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
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

      {/* List */}
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
                onClick={() => onSelect(m)}
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
    </>
  );
}

/* ─── Pipeline View ─── */
const PIPELINE_COLUMNS = MERCHANT_STATUSES.filter((s) => s.step >= 0);

function PipelineView({ merchants, loading }) {
  if (loading) {
    return <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>Đang tải pipeline...</div>;
  }

  const rejected = merchants.filter((m) => m.status === "tu_choi");

  return (
    <>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>
        Theo dõi tiến trình onboarding theo từng bước · {merchants.length} merchant
      </div>

      {/* Kanban */}
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 16, minHeight: 400 }}>
        {PIPELINE_COLUMNS.map((col) => {
          const items = merchants.filter((m) => m.status === col.key);
          return (
            <div key={col.key} style={{ minWidth: 210, maxWidth: 250, flex: "0 0 auto", display: "flex", flexDirection: "column" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", marginBottom: 8, borderRadius: 10,
                background: `${col.color}10`, borderBottom: `2px solid ${col.color}`,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: col.color }}>{col.label}</span>
                <span style={{
                  marginLeft: "auto", fontSize: 11, fontWeight: 700,
                  background: `${col.color}20`, color: col.color,
                  padding: "2px 8px", borderRadius: 10,
                }}>
                  {items.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                {items.length === 0 ? (
                  <div style={{
                    padding: "20px 12px", textAlign: "center", fontSize: 11,
                    color: "var(--text-faintest)", border: "1px dashed var(--border-soft)", borderRadius: 10,
                  }}>
                    Trống
                  </div>
                ) : items.map((m) => <PipelineCard key={m.id} merchant={m} />)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejected */}
      {rejected.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fb7185", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fb7185" }} />
            Từ chối ({rejected.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 8 }}>
            {rejected.map((m) => <PipelineCard key={m.id} merchant={m} />)}
          </div>
        </div>
      )}
    </>
  );
}

function PipelineCard({ merchant }) {
  const daysSince = Math.floor((Date.now() - new Date(merchant.updated_at || merchant.created_at).getTime()) / 86400000);
  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>{merchant.company_name}</div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 6 }}>{merchant.contact_name || "Chưa có LH"}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{merchant.sales_owner || "—"}</span>
        <span style={{
          fontSize: 10,
          color: daysSince > 7 ? "#fb7185" : daysSince > 3 ? "#fbbf24" : "var(--text-faint)",
          fontWeight: daysSince > 3 ? 600 : 400,
        }}>
          {daysSince === 0 ? "Hôm nay" : `${daysSince} ngày`}
        </span>
      </div>
    </div>
  );
}

/* ─── Create Lead Modal ─── */
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

/* ─── Merchant Detail Modal ─── */
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

  const possibleNext = MERCHANT_STATUSES.filter((s) => s.key !== merchant.status);

  async function changeStatus(newStatus) {
    setBusy(true);
    try {
      const res = await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status", id: merchant.id, new_status: newStatus,
          changed_by: user?.name || "Unknown", role: "admin", note,
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

        {/* Contact */}
        <DetailSection title="Thông tin liên hệ">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
            <div><span style={{ color: "var(--text-dim)" }}>Người LH:</span> <span style={{ color: "var(--text)" }}>{merchant.contact_name || "—"}</span></div>
            <div><span style={{ color: "var(--text-dim)" }}>SĐT:</span> <span style={{ color: "var(--text)" }}>{merchant.contact_phone || "—"}</span></div>
            <div style={{ gridColumn: "1/-1" }}><span style={{ color: "var(--text-dim)" }}>Email:</span> <span style={{ color: "var(--text)" }}>{merchant.contact_email || "—"}</span></div>
          </div>
          {merchant.notes && <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-dim)", fontStyle: "italic" }}>{merchant.notes}</div>}
        </DetailSection>

        {/* Declaration */}
        {decl && (
          <DetailSection title="Thông tin khai báo">
            <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                ["Loại hình KD", decl.business_type],
                ["Website", decl.website],
                ["Địa chỉ", decl.address],
                ["Người đại diện", decl.representative],
                ["Chức vụ", decl.position],
                ["CCCD", decl.id_number],
                ["STK", decl.bank_account],
                ["Ngân hàng", decl.bank_name],
                ["Chủ TK", decl.account_holder],
                ["DSGD dự kiến", decl.expected_volume],
                ["PTTT", Array.isArray(decl.payment_methods) ? decl.payment_methods.join(", ") : decl.payment_methods],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label}><span style={{ color: "var(--text-dim)" }}>{label}:</span> <span style={{ color: "var(--text)" }}>{val}</span></div>
              ))}
            </div>
          </DetailSection>
        )}

        {/* Status change */}
        <DetailSection title="Chuyển trạng thái">
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
                key={s.key} disabled={busy} onClick={() => changeStatus(s.key)}
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
        </DetailSection>

        {/* History */}
        {history.length > 0 && (
          <DetailSection title="Lịch sử trạng thái">
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
          </DetailSection>
        )}
      </div>
    </div>
  );
}

/* ─── Shared UI ─── */
function DetailSection({ title, children }) {
  return (
    <div style={{ ...cardStyle, marginBottom: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", autoFocus, multiline }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "var(--text-dim)", textTransform: "uppercase" }}>{label}</span>
      <Tag
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus} rows={multiline ? 3 : undefined}
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
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
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
const createBtnStyle = {
  padding: "10px 20px", border: "none", borderRadius: 10,
  background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  boxShadow: "0 4px 16px rgba(124,108,255,0.3)",
};
const submitBtnStyle = {
  marginTop: 4, padding: "12px 16px", border: "none", borderRadius: 10,
  background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
  boxShadow: "0 8px 24px rgba(124,108,255,0.35)",
};
