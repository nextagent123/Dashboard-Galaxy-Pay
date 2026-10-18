"use client";

import { useState } from "react";

const PAYMENT_METHODS = [
  { key: "napas", label: "Thẻ Napas/nội địa" },
  { key: "intl_vn", label: "Thẻ quốc tế (VN)" },
  { key: "intl_foreign", label: "Thẻ quốc tế (nước ngoài)" },
  { key: "vietqr", label: "VietQR" },
  { key: "skypay", label: "Ví SkyPay" },
];

const FEE_DEFAULTS = [
  { key: "napas", label: "Thẻ Napas/nội địa", rate: "0.55", unit: "%/giao dịch" },
  { key: "intl_vn", label: "Thẻ quốc tế (VN)", rate: "1.75", unit: "%/giao dịch" },
  { key: "intl_foreign", label: "Thẻ quốc tế (nước ngoài)", rate: "3.30", unit: "%/giao dịch" },
  { key: "vietqr", label: "VietQR", rate: "0", unit: "VND/giao dịch" },
  { key: "skypay", label: "Ví SkyPay", rate: "0.50", unit: "%/giao dịch" },
];

const SETTLEMENT_OPTIONS = ["T+1", "T+2", "T+3", "T+7"];

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
  fees: FEE_DEFAULTS.map((f) => ({ ...f, enabled: true, min_fee: "", max_fee: "" })),
  settlement_cycle: "T+1",
  deposit_amount: "",
  min_transaction: "10,000",
  max_transaction: "",
  monthly_fee: "0",
  setup_fee: "0",
  fee_notes: "",
};

export default function ManualDeclarationView({ merchants, loading, onRefresh }) {
  const [form, setForm] = useState({ ...INITIAL, fees: INITIAL.fees.map((f) => ({ ...f })) });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

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

  function updateFee(idx, field, val) {
    setForm((f) => {
      const fees = [...f.fees];
      fees[idx] = { ...fees[idx], [field]: val };
      return { ...f, fees };
    });
  }

  function resetFees() {
    setForm((f) => ({
      ...f,
      fees: FEE_DEFAULTS.map((fd) => ({ ...fd, enabled: true, min_fee: "", max_fee: "" })),
    }));
  }

  function validateStep1() {
    const e = {};
    if (!form.company_name.trim()) e.company_name = "Bắt buộc";
    if (!form.tax_id.trim()) e.tax_id = "Bắt buộc";
    if (!form.contact_name.trim()) e.contact_name = "Bắt buộc";
    if (!form.contact_email.trim() && !form.contact_phone.trim()) e.contact_email = "Cần ít nhất email hoặc SĐT";
    if (!form.representative.trim()) e.representative = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goToStep2() {
    if (validateStep1()) setStep(2);
  }

  async function submit() {
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

      const feeData = {
        fees: form.fees.map((f) => ({
          key: f.key, label: f.label, enabled: f.enabled,
          rate: f.rate, unit: f.unit, min_fee: f.min_fee, max_fee: f.max_fee,
        })),
        settlement_cycle: form.settlement_cycle,
        deposit_amount: form.deposit_amount,
        min_transaction: form.min_transaction,
        max_transaction: form.max_transaction,
        monthly_fee: form.monthly_fee,
        setup_fee: form.setup_fee,
        notes: form.fee_notes,
        updated_at: new Date().toISOString(),
        updated_by: "staff",
      };

      await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: merchant.id,
          fee_schedule: feeData,
        }),
      });

      setResult({ ok: true, name: form.company_name, id: merchant.id });
      setForm({ ...INITIAL, fees: INITIAL.fees.map((f) => ({ ...f })) });
      setStep(1);
      onRefresh();
    } catch (err) {
      setResult({ ok: false, error: err.message });
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        Nhập thông tin merchant + khai báo phí dịch vụ — tạo lead & khai báo trong 1 bước để gửi duyệt
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
              {result.ok ? `${result.name} — đã khai báo thông tin + phí, sẵn sàng gửi duyệt` : result.error}
            </div>
          </div>
          {result.ok && (
            <button onClick={() => setResult(null)} style={closeBtnStyle}>Tạo tiếp</button>
          )}
        </div>
      )}

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        <StepBadge num={1} label="Thông tin doanh nghiệp" active={step === 1} done={step > 1} onClick={() => setStep(1)} />
        <span style={{ color: "var(--text-faint)", fontSize: 16 }}>→</span>
        <StepBadge num={2} label="Khai báo phí dịch vụ" active={step === 2} done={false} onClick={() => { if (validateStep1()) setStep(2); }} />
      </div>

      {/* Step 1: Business info */}
      {step === 1 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

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

            <div>
              <SectionLabel>Người đại diện pháp luật</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
                <Field label="Họ tên *" value={form.representative} onChange={(v) => update("representative", v)} error={errors.representative} />
                <Field label="Chức vụ" value={form.position} onChange={(v) => update("position", v)} placeholder="VD: Giám đốc" />
                <Field label="Số CCCD/CMND" value={form.id_number} onChange={(v) => update("id_number", v)} />
              </div>
            </div>

            <div>
              <SectionLabel>Thông tin ngân hàng</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
                <Field label="Số tài khoản" value={form.bank_account} onChange={(v) => update("bank_account", v)} />
                <Field label="Ngân hàng" value={form.bank_name} onChange={(v) => update("bank_name", v)} placeholder="VD: Vietcombank" />
                <Field label="Chủ tài khoản" value={form.account_holder} onChange={(v) => update("account_holder", v)} />
              </div>
            </div>

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

            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button
                onClick={() => { setForm({ ...INITIAL, fees: INITIAL.fees.map((f) => ({ ...f })) }); setErrors({}); setResult(null); setStep(1); }}
                style={{ ...actionBtn, background: "var(--surface-soft)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
              >
                Xoá form
              </button>
              <button
                onClick={goToStep2}
                style={{
                  ...actionBtn, flex: 1,
                  background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
                  border: "none", fontWeight: 700,
                }}
              >
                Tiếp → Khai báo phí dịch vụ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Fee declaration */}
      {step === 2 && (
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <SectionLabel>Biểu phí dịch vụ — {form.company_name}</SectionLabel>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                  MST: {form.tax_id} · Theo mẫu hợp đồng TGTT
                </div>
              </div>
              <button onClick={resetFees} style={closeBtnStyle}>Reset mặc định</button>
            </div>

            {/* Fee table */}
            <div>
              <div style={{
                border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
              }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 100px",
                  gap: 0, background: "var(--surface-soft)", padding: "8px 12px",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <span style={thStyle}></span>
                  <span style={thStyle}>Loại phí</span>
                  <span style={thStyle}>Phí suất</span>
                  <span style={thStyle}>Phí tối thiểu</span>
                  <span style={thStyle}>Phí tối đa</span>
                </div>
                {form.fees.map((fee, i) => (
                  <div
                    key={fee.key}
                    style={{
                      display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 100px",
                      gap: 0, padding: "8px 12px", alignItems: "center",
                      borderBottom: i < form.fees.length - 1 ? "1px solid var(--border)" : "none",
                      opacity: fee.enabled ? 1 : 0.4,
                      background: fee.enabled ? "transparent" : "var(--surface-soft)",
                    }}
                  >
                    <label style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <input
                        type="checkbox"
                        checked={fee.enabled}
                        onChange={(e) => updateFee(i, "enabled", e.target.checked)}
                        style={{ accentColor: "#7c6cff" }}
                      />
                    </label>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{fee.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input
                        value={fee.rate}
                        onChange={(e) => updateFee(i, "rate", e.target.value)}
                        disabled={!fee.enabled}
                        style={{ ...inputStyle, width: 60, textAlign: "right", padding: "6px 8px", fontSize: 12 }}
                      />
                      <select
                        value={fee.unit}
                        onChange={(e) => updateFee(i, "unit", e.target.value)}
                        disabled={!fee.enabled}
                        style={{ ...inputStyle, width: 50, padding: "6px 4px", fontSize: 10 }}
                      >
                        <option value="%/giao dịch">%/GD</option>
                        <option value="VND/giao dịch">VND/GD</option>
                      </select>
                    </div>
                    <input
                      value={fee.min_fee}
                      onChange={(e) => updateFee(i, "min_fee", e.target.value)}
                      disabled={!fee.enabled}
                      placeholder="—"
                      style={{ ...inputStyle, padding: "6px 8px", fontSize: 11, textAlign: "right" }}
                    />
                    <input
                      value={fee.max_fee}
                      onChange={(e) => updateFee(i, "max_fee", e.target.value)}
                      disabled={!fee.enabled}
                      placeholder="—"
                      style={{ ...inputStyle, padding: "6px 8px", fontSize: 11, textAlign: "right" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Settlement & terms */}
            <div>
              <SectionLabel>Điều khoản thanh toán & phí khác</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
                <div>
                  <span style={labelStyle}>Chu kỳ đối soát</span>
                  <select
                    value={form.settlement_cycle}
                    onChange={(e) => update("settlement_cycle", e.target.value)}
                    style={{ ...inputStyle, width: "100%", marginTop: 4 }}
                  >
                    {SETTLEMENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <Field label="Ký quỹ (VND)" value={form.deposit_amount} onChange={(v) => update("deposit_amount", v)} placeholder="VD: 50,000,000" />
                <Field label="GD tối thiểu (VND)" value={form.min_transaction} onChange={(v) => update("min_transaction", v)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                <Field label="GD tối đa (VND)" value={form.max_transaction} onChange={(v) => update("max_transaction", v)} placeholder="Không giới hạn" />
                <Field label="Phí duy trì/tháng" value={form.monthly_fee} onChange={(v) => update("monthly_fee", v)} placeholder="0" />
                <Field label="Phí cài đặt" value={form.setup_fee} onChange={(v) => update("setup_fee", v)} placeholder="0" />
              </div>
            </div>

            {/* Fee notes */}
            <div>
              <SectionLabel>Ghi chú biểu phí</SectionLabel>
              <textarea
                value={form.fee_notes}
                onChange={(e) => update("fee_notes", e.target.value)}
                placeholder="Ghi chú thêm về biểu phí, điều kiện đặc biệt..."
                rows={2}
                style={{ ...inputStyle, resize: "vertical", marginTop: 8 }}
              />
            </div>

            {/* Fee summary */}
            <div style={{
              background: "var(--surface-soft)", borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                Tóm tắt biểu phí
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {form.fees.filter((f) => f.enabled).map((f) => (
                  <div key={f.key} style={{
                    padding: "6px 12px", borderRadius: 8, fontSize: 11,
                    background: "rgba(124,108,255,0.08)", border: "1px solid rgba(124,108,255,0.2)",
                    color: "var(--text)",
                  }}>
                    <span style={{ fontWeight: 600 }}>{f.label}</span>
                    <span style={{ color: "#7c6cff", fontWeight: 700, marginLeft: 6 }}>
                      {f.rate}{f.unit === "%/giao dịch" ? "%" : " VND"}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
                Đối soát: {form.settlement_cycle}
                {form.deposit_amount && ` · Ký quỹ: ${form.deposit_amount} VND`}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button
                onClick={() => setStep(1)}
                style={{ ...actionBtn, background: "var(--surface-soft)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
              >
                ← Quay lại
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
                {busy ? "Đang xử lý..." : "Tạo merchant & khai báo (thông tin + phí)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepBadge({ num, label, active, done, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 16px", borderRadius: 10, cursor: "pointer",
        background: active ? "rgba(124,108,255,0.1)" : done ? "rgba(34,197,94,0.08)" : "var(--surface-soft)",
        border: active ? "1px solid rgba(124,108,255,0.3)" : done ? "1px solid rgba(34,197,94,0.2)" : "1px solid var(--border)",
        color: active ? "#7c6cff" : done ? "#22c55e" : "var(--text-dim)",
        fontSize: 12, fontWeight: 600,
      }}
    >
      <span style={{
        width: 22, height: 22, borderRadius: "50%", fontSize: 11, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: active ? "#7c6cff" : done ? "#22c55e" : "var(--border)",
        color: "#fff",
      }}>
        {done ? "✓" : num}
      </span>
      {label}
    </button>
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
const thStyle = {
  fontSize: 10, fontWeight: 700, color: "var(--text-faint)",
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
