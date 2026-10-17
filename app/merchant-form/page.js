"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const BUSINESS_TYPES = [
  "Công ty TNHH",
  "Công ty Cổ phần",
  "Doanh nghiệp tư nhân",
  "Hộ kinh doanh",
  "Khác",
];

const PAYMENT_METHODS = [
  "Thẻ nội địa (Napas)",
  "Thẻ quốc tế (Visa/Mastercard/JCB)",
  "VietQR",
  "Ví SkyPay",
  "Apple Pay / Google Pay",
];

export default function MerchantFormPage() {
  return (
    <Suspense fallback={<div style={pageStyle}><div style={{ textAlign: "center", padding: 40 }}><div style={spinnerStyle} /><div style={{ marginTop: 16, color: "#94a3b8", fontSize: 14 }}>Đang tải...</div></div></div>}>
      <MerchantFormContent />
    </Suspense>
  );
}

function MerchantFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    business_type: "",
    company_name: "",
    tax_id: "",
    address: "",
    website: "",
    representative: "",
    position: "",
    id_number: "",
    bank_account: "",
    bank_name: "",
    account_holder: "",
    expected_volume: "",
    payment_methods: [],
    products_desc: "",
    online_channels: "",
  });

  useEffect(() => {
    if (!token) { setLoading(false); setError("Link không hợp lệ. Vui lòng liên hệ Galaxy Pay."); return; }
    fetch(`/api/merchant-onboarding?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); }
        else {
          setMerchant(d.merchant);
          if (d.merchant.status !== "moi_tao" && d.merchant.status !== "can_bo_sung") {
            setSubmitted(true);
          }
          if (d.merchant.declaration_data) {
            setForm((f) => ({ ...f, ...d.merchant.declaration_data }));
          } else {
            setForm((f) => ({
              ...f,
              company_name: d.merchant.company_name || "",
              tax_id: d.merchant.tax_id || "",
            }));
          }
        }
        setLoading(false);
      })
      .catch(() => { setError("Lỗi kết nối"); setLoading(false); });
  }, [token]);

  function update(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  function togglePayment(method) {
    setForm((f) => ({
      ...f,
      payment_methods: f.payment_methods.includes(method)
        ? f.payment_methods.filter((m) => m !== method)
        : [...f.payment_methods, method],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.company_name.trim()) { alert("Vui lòng nhập tên doanh nghiệp"); return; }
    if (!form.tax_id.trim()) { alert("Vui lòng nhập mã số thuế"); return; }
    if (!form.representative.trim()) { alert("Vui lòng nhập tên người đại diện"); return; }

    setBusy(true);
    try {
      const res = await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_declaration",
          token,
          declaration_data: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error); setBusy(false); return; }
      setSubmitted(true);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
    setBusy(false);
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={spinnerStyle} />
          <div style={{ marginTop: 16, color: "#94a3b8", fontSize: 14 }}>Đang tải...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={formContainerStyle}>
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚠</div>
            <div style={{ fontSize: 15, color: "#fb7185", fontWeight: 600 }}>{error}</div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 8 }}>
              Vui lòng liên hệ Galaxy Pay để nhận link khai báo mới.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={formContainerStyle}>
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" }}>
              Đã gửi thông tin thành công!
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
              Cảm ơn quý doanh nghiệp <strong style={{ color: "#e2e8f0" }}>{merchant?.company_name}</strong> đã hoàn tất khai báo.
              <br />Galaxy Pay sẽ liên hệ trong thời gian sớm nhất.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={formContainerStyle}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: "#7c6cff", marginBottom: 8 }}>
            GALAXY PAY · MERCHANT ONBOARDING
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" }}>
            Khai báo thông tin Merchant
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
            Vui lòng điền đầy đủ thông tin bên dưới để Galaxy Pay xử lý hồ sơ
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Section 1: Business info */}
          <Section title="Thông tin doanh nghiệp">
            <FormField label="Loại hình kinh doanh *">
              <select
                value={form.business_type}
                onChange={(e) => update("business_type", e.target.value)}
                style={inputStyle}
              >
                <option value="">Chọn loại hình...</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Tên doanh nghiệp *">
              <input type="text" value={form.company_name} onChange={(e) => update("company_name", e.target.value)} style={inputStyle} placeholder="VD: Công ty TNHH ABC" />
            </FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Mã số thuế *">
                <input type="text" value={form.tax_id} onChange={(e) => update("tax_id", e.target.value)} style={inputStyle} placeholder="VD: 0316368255" />
              </FormField>
              <FormField label="Website">
                <input type="text" value={form.website} onChange={(e) => update("website", e.target.value)} style={inputStyle} placeholder="https://..." />
              </FormField>
            </div>
            <FormField label="Địa chỉ trụ sở">
              <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} style={inputStyle} placeholder="Số, đường, quận/huyện, tỉnh/TP" />
            </FormField>
          </Section>

          {/* Section 2: Legal representative */}
          <Section title="Người đại diện pháp luật">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Họ và tên *">
                <input type="text" value={form.representative} onChange={(e) => update("representative", e.target.value)} style={inputStyle} />
              </FormField>
              <FormField label="Chức vụ">
                <input type="text" value={form.position} onChange={(e) => update("position", e.target.value)} style={inputStyle} placeholder="VD: Giám đốc" />
              </FormField>
            </div>
            <FormField label="Số CCCD/CMND">
              <input type="text" value={form.id_number} onChange={(e) => update("id_number", e.target.value)} style={inputStyle} />
            </FormField>
          </Section>

          {/* Section 3: Bank info */}
          <Section title="Thông tin thanh toán">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Số tài khoản">
                <input type="text" value={form.bank_account} onChange={(e) => update("bank_account", e.target.value)} style={inputStyle} />
              </FormField>
              <FormField label="Ngân hàng">
                <input type="text" value={form.bank_name} onChange={(e) => update("bank_name", e.target.value)} style={inputStyle} placeholder="VD: Vietcombank" />
              </FormField>
            </div>
            <FormField label="Chủ tài khoản">
              <input type="text" value={form.account_holder} onChange={(e) => update("account_holder", e.target.value)} style={inputStyle} />
            </FormField>
          </Section>

          {/* Section 4: Business details */}
          <Section title="Thông tin kinh doanh">
            <FormField label="Mô tả sản phẩm/dịch vụ">
              <textarea
                value={form.products_desc}
                onChange={(e) => update("products_desc", e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
                rows={3}
                placeholder="Mô tả ngắn gọn sản phẩm/dịch vụ chính..."
              />
            </FormField>
            <FormField label="Kênh bán hàng online">
              <input type="text" value={form.online_channels} onChange={(e) => update("online_channels", e.target.value)} style={inputStyle} placeholder="VD: Website, App, Shopee, Lazada..." />
            </FormField>
            <FormField label="Doanh số giao dịch dự kiến (VNĐ/tháng)">
              <input type="text" value={form.expected_volume} onChange={(e) => update("expected_volume", e.target.value)} style={inputStyle} placeholder="VD: 500,000,000" />
            </FormField>

            <FormField label="Phương thức thanh toán mong muốn">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => togglePayment(pm)}
                    style={{
                      padding: "6px 14px", borderRadius: 20, fontSize: 12,
                      border: form.payment_methods.includes(pm) ? "1px solid #7c6cff" : "1px solid #334155",
                      background: form.payment_methods.includes(pm) ? "rgba(124,108,255,0.15)" : "transparent",
                      color: form.payment_methods.includes(pm) ? "#a78bfa" : "#94a3b8",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {form.payment_methods.includes(pm) ? "✓ " : ""}{pm}
                  </button>
                ))}
              </div>
            </FormField>
          </Section>

          <button type="submit" disabled={busy} style={submitStyle}>
            {busy ? "Đang gửi..." : "Gửi thông tin khai báo"}
          </button>

          <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", lineHeight: 1.6 }}>
            Thông tin của quý doanh nghiệp được bảo mật theo quy định.
            <br />Liên hệ: kinhdoanh@galaxypay.vn
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color: "#7c6cff", textTransform: "uppercase", marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#94a3b8" }}>{label}</span>
      {children}
    </label>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#0b1120",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "40px 16px",
};

const formContainerStyle = {
  width: "100%",
  maxWidth: 600,
  background: "#111827",
  border: "1px solid #1e293b",
  borderRadius: 16,
  padding: "32px 28px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
};

const inputStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  color: "#e2e8f0",
  outline: "none",
  width: "100%",
};

const submitStyle = {
  marginTop: 8,
  padding: "14px 20px",
  border: "none",
  borderRadius: 12,
  background: "linear-gradient(135deg,#7c6cff,#9d8bff)",
  color: "#fff",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(124,108,255,0.35)",
};

const spinnerStyle = {
  width: 36, height: 36, margin: "0 auto",
  border: "3px solid rgba(124,108,255,0.2)",
  borderTopColor: "#7c6cff",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
};
