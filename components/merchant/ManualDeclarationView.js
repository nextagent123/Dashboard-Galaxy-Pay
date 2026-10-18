"use client";

import { useState } from "react";

const PAYMENT_METHODS = [
  { key: "napas", label: "Thẻ Napas/nội địa" },
  { key: "intl_vn", label: "Thẻ quốc tế (VN)" },
  { key: "intl_foreign", label: "Thẻ quốc tế (nước ngoài)" },
  { key: "vietqr", label: "VietQR" },
  { key: "skypay", label: "Ví SkyPay" },
];

const INITIAL = {
  company_name: "",
  tax_id: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  sales_owner: "",
  business_type: "",
  address: "",
  representative: "",
  position: "",
  id_number: "",
  bank_account: "",
  bank_name: "",
  account_holder: "",
  website: "",
  products_desc: "",
  expected_volume: "",
  payment_methods: [],
  notes: "",
};

export default function ManualDeclarationView({ merchants, loading, onRefresh }) {
  const [form, setForm] = useState({ ...INITIAL });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  function update(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function togglePayment(key) {
    setForm((f) => ({
      ...f,
      payment_methods: f.payment_methods.includes(key)
        ? f.payment_methods.filter((k) => k !== key)
        : [...f.payment_methods, key],
    }));
  }

  function validate() {
    const e = {};
    if (!form.company_name.trim()) e.company_name = "Bắt buộc";
    if (!form.tax_id.trim()) e.tax_id = "Bắt buộc";
    if (!form.contact_name.trim()) e.contact_name = "Bắt buộc";
    if (!form.contact_email.trim() && !form.contact_phone.trim()) e.contact_email = "Cần ít nhất email hoặc SĐT";
    if (!form.representative.trim()) e.representative = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setBusy(true);
    setResult(null);
    try {
      const createRes = await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          company_name: form.company_name,
          tax_id: form.tax_id,
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone,
          sales_owner: form.sales_owner,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error || "Lỗi tạo merchant");

      const merchant = createData.merchant;

      const declData = {
        company_name: form.company_name,
        tax_id: form.tax_id,
        business_type: form.business_type,
        address: form.address,
        representative: form.representative,
        position: form.position,
        id_number: form.id_number,
        bank_account: form.bank_account,
        bank_name: form.bank_name,
        account_holder: form.account_holder,
        website: form.website,
        products_desc: form.products_desc,
        expected_volume: form.expected_volume,
        payment_methods: form.payment_methods,
        notes: form.notes,
        submitted_by: "staff",
        submitted_at: new Date().toISOString(),
      };

      await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_declaration",
          token: merchant.form_token,
          declaration_data: declData,
        }),
      });

      setResult({ ok: true, name: form.company_name, id: merchant.id });
      setForm({ ...INITIAL });
      onRefresh();
    } catch (err) {
      setResult({ ok: false, error: err.message });
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        Nhập trực tiếp thông tin merchant — tạo lead & khai báo trong 1 bước
      </div>

      {result && (
        <div style={{
          padding: "14px 18px", borderRadius: 10, marginBottom: 16,
          background: result.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${result.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: result.ok ? "#22c55e" : "#ef4444" }}>
              {result.ok ? "Tạo merchant thành công" : "Lỗi"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
              {result.ok ? `${result.name} — trạng thái: Đã khai báo` : result.error}
            </div>
          </div>
          {result.ok && (
            <button onClick={() => setResult(null)} style={closeBtnStyle}>Tạo tiếp</button>
          )}
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Section 1: Company info */}
          <div>
            <SectionLabel>Thông tin doanh nghiệp</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
              <Field label="Tên doanh nghiệp *" value={form.company_name} onChange={(v) => update("company_name", v)} error={errors.company_name} />
              <Field label="Mã số thuế *" value={form.tax_id} onChange={(v) => update("tax_id", v)} error={errors.tax_id} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <Field label="Loại hình kinh doanh" value={form.business_type} onChange={(v) => update("business_type", v)} placeholder="VD: Công ty TNHH, Cổ phần..." />
              <Field label="Địa chỉ" value={form.address} onChange={(v) => update("address", v)} />
            </div>
            <div style={{ marginTop: 10 }}>
              <Field label="Website" value={form.website} onChange={(v) => update("website", v)} placeholder="https://..." />
            </div>
          </div>

          {/* Section 2: Contact */}
          <div>
            <SectionLabel>Người liên hệ & Sales</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
              <Field label="Tên người liên hệ *" value={form.contact_name} onChange={(v) => update("contact_name", v)} error={errors.contact_name} />
              <Field label="Email" value={form.contact_email} onChange={(v) => update("contact_email", v)} error={errors.contact_email} type="email" />
              <Field label="Số điện thoại" value={form.contact_phone} onChange={(v) => update("contact_phone", v)} />
            </div>
            <div style={{ marginTop: 10, maxWidth: 300 }}>
              <Field label="Sales phụ trách" value={form.sales_owner} onChange={(v) => update("sales_owner", v)} />
            </div>
          </div>

          {/* Section 3: Legal representative */}
          <div>
            <SectionLabel>Người đại diện pháp luật</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
              <Field label="Họ tên *" value={form.representative} onChange={(v) => update("representative", v)} error={errors.representative} />
              <Field label="Chức vụ" value={form.position} onChange={(v) => update("position", v)} placeholder="VD: Giám đốc" />
              <Field label="Số CCCD/CMND" value={form.id_number} onChange={(v) => update("id_number", v)} />
            </div>
          </div>

          {/* Section 4: Bank */}
          <div>
            <SectionLabel>Thông tin ngân hàng</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
              <Field label="Số tài khoản" value={form.bank_account} onChange={(v) => update("bank_account", v)} />
              <Field label="Ngân hàng" value={form.bank_name} onChange={(v) => update("bank_name", v)} placeholder="VD: Vietcombank" />
              <Field label="Chủ tài khoản" value={form.account_holder} onChange={(v) => update("account_holder", v)} />
            </div>
          </div>

          {/* Section 5: Business details */}
          <div>
            <SectionLabel>Chi tiết kinh doanh</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
              <Field label="Mô tả sản phẩm/dịch vụ" value={form.products_desc} onChange={(v) => update("products_desc", v)} placeholder="VD: Bán hàng online, dịch vụ du lịch..." />
              <Field label="DSGD dự kiến/tháng" value={form.expected_volume} onChange={(v) => update("expected_volume", v)} placeholder="VD: 500 triệu" />
            </div>

            <div style={{ marginTop: 12 }}>
              <span style={labelStyle}>Phương thức thanh toán mong muốn</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {PAYMENT_METHODS.map((pm) => {
                  const active = form.payment_methods.includes(pm.key);
                  return (
                    <button
                      key={pm.key}
                      type="button"
                      onClick={() => togglePayment(pm.key)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: active ? "rgba(124,108,255,0.12)" : "var(--surface-soft)",
                        color: active ? "#7c6cff" : "var(--text-dim)",
                        border: active ? "1px solid rgba(124,108,255,0.3)" : "1px solid var(--border)",
                        cursor: "pointer",
                      }}
                    >
                      {pm.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 6: Notes */}
          <div>
            <SectionLabel>Ghi chú</SectionLabel>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Ghi chú thêm (tuỳ chọn)..."
              rows={3}
              style={{ ...inputStyle, resize: "vertical", marginTop: 8 }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button
              onClick={() => { setForm({ ...INITIAL }); setErrors({}); setResult(null); }}
              style={{ ...actionBtn, background: "var(--surface-soft)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
            >
              Xoá form
            </button>
            <button
              onClick={submit}
              disabled={busy}
              style={{
                ...actionBtn, flex: 1,
                background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
                border: "none", fontWeight: 700,
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? "Đang xử lý..." : "Tạo merchant & khai báo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, error }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={labelStyle}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputStyle,
          borderColor: error ? "#ef4444" : "var(--border)",
        }}
      />
      {error && <span style={{ fontSize: 10.5, color: "#ef4444" }}>{error}</span>}
    </label>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: "var(--accent-soft)",
      textTransform: "uppercase", letterSpacing: 0.6,
    }}>
      {children}
    </div>
  );
}

const cardStyle = {
  background: "var(--card-bg)", border: "1px solid var(--border)",
  borderRadius: 12, padding: "20px 24px",
};
const inputStyle = {
  background: "var(--surface-soft)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "9px 12px", fontSize: 12.5,
  color: "var(--text)", outline: "none", width: "100%",
};
const labelStyle = {
  fontSize: 10.5, fontWeight: 600, color: "var(--text-faint)",
  textTransform: "uppercase", letterSpacing: 0.4,
};
const actionBtn = {
  padding: "11px 20px", borderRadius: 10, fontSize: 13, cursor: "pointer",
};
const closeBtnStyle = {
  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
  background: "var(--surface-soft)", color: "var(--text-dim)",
  border: "1px solid var(--border)", cursor: "pointer",
};
