"use client";

import { useState } from "react";
import { MERCHANT_STATUSES } from "@/lib/merchantSchema";

const FEE_TEMPLATE = [
  { key: "napas", label: "Thẻ Napas/nội địa", defaultRate: "0.55%/giao dịch" },
  { key: "intl_vn", label: "Thẻ quốc tế (VN)", defaultRate: "1.75%/giao dịch" },
  { key: "intl_foreign", label: "Thẻ quốc tế (nước ngoài)", defaultRate: "3.30%/giao dịch" },
  { key: "vietqr", label: "VietQR", defaultRate: "Miễn phí" },
  { key: "skypay", label: "Ví SkyPay", defaultRate: "0.50%/giao dịch" },
];

export default function ContractView({ merchants, loading, onRefresh }) {
  const [selectedId, setSelectedId] = useState(null);
  const [contractForm, setContractForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [generated, setGenerated] = useState(null);

  const eligible = merchants.filter((m) => m.status === "da_duyet");
  const contracted = merchants.filter((m) => ["da_sinh_hd", "da_ky", "hoat_dong"].includes(m.status));

  const selected = merchants.find((m) => m.id === selectedId);

  function initContract(merchant) {
    setSelectedId(merchant.id);
    setGenerated(null);
    const existing = merchant.contract_data || {};
    const decl = merchant.declaration_data || {};
    setContractForm({
      contract_number: existing.contract_number || "",
      contract_date: existing.contract_date || new Date().toISOString().split("T")[0],
      merchant_name: decl.company_name || merchant.company_name || "",
      tax_id: decl.tax_id || merchant.tax_id || "",
      address: decl.address || "",
      representative: decl.representative || "",
      position: decl.position || "",
      id_number: decl.id_number || "",
      bank_account: decl.bank_account || "",
      bank_name: decl.bank_name || "",
      account_holder: decl.account_holder || "",
      fees: existing.fees || FEE_TEMPLATE.map((f) => ({ ...f, rate: f.defaultRate })),
      settlement_cycle: existing.settlement_cycle || "T+1",
      deposit_amount: existing.deposit_amount || "",
      min_payment: existing.min_payment || "1,000,000 VND",
    });
  }

  function updateForm(key, val) {
    setContractForm((f) => ({ ...f, [key]: val }));
  }

  function updateFee(idx, rate) {
    setContractForm((f) => {
      const fees = [...f.fees];
      fees[idx] = { ...fees[idx], rate };
      return { ...f, fees };
    });
  }

  async function generateContract() {
    if (!selected || !contractForm) return;
    setBusy(true);
    try {
      await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: selected.id,
          contract_data: { ...contractForm, generated_at: new Date().toISOString() },
        }),
      });

      await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status",
          id: selected.id,
          new_status: "da_sinh_hd",
          changed_by: "Legal",
          role: "legal",
          note: `Sinh HĐ số ${contractForm.contract_number || "(auto)"}`,
        }),
      });

      setGenerated(contractForm);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        Sinh hợp đồng từ template · {eligible.length} merchant đã duyệt chờ sinh HĐ
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Left: Merchant list */}
        <div>
          <SectionLabel>Đã duyệt — chờ sinh HĐ ({eligible.length})</SectionLabel>
          {eligible.length === 0 ? (
            <EmptyCard>Chưa có merchant đã duyệt</EmptyCard>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {eligible.map((m) => (
                <div
                  key={m.id}
                  onClick={() => initContract(m)}
                  style={{
                    ...cardStyle,
                    padding: "10px 14px", cursor: "pointer",
                    borderColor: selectedId === m.id ? "var(--accent-soft)" : "var(--border)",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{m.company_name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{m.tax_id || "—"}</div>
                </div>
              ))}
            </div>
          )}

          {contracted.length > 0 && (
            <>
              <SectionLabel style={{ marginTop: 18 }}>Đã sinh HĐ ({contracted.length})</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {contracted.slice(0, 8).map((m) => {
                  const st = MERCHANT_STATUSES.find((s) => s.key === m.status);
                  return (
                    <div key={m.id} style={{ ...cardStyle, padding: "8px 12px", opacity: 0.6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{m.company_name}</span>
                      <span style={{ fontSize: 10, color: st?.color }}>{st?.label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Contract form */}
        <div>
          {!selected ? (
            <div style={{ ...cardStyle, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Chọn merchant để sinh hợp đồng</div>
            </div>
          ) : generated ? (
            <div style={{ ...cardStyle, padding: "24px 28px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Đã sinh hợp đồng</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
                HĐ số: {generated.contract_number || "(tự động)"}<br />
                Merchant: {generated.merchant_name}
              </div>
              <button onClick={() => { setSelectedId(null); setGenerated(null); }} style={closeBtnStyle}>
                Đóng
              </button>
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: "18px 20px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
                HỢP ĐỒNG CUNG CẤP DỊCH VỤ TRUNG GIAN THANH TOÁN
              </div>

              {/* Contract fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <FormInput label="Số hợp đồng" value={contractForm.contract_number} onChange={(v) => updateForm("contract_number", v)} placeholder="____/2026/HĐTGTT/GP" />
                  <FormInput label="Ngày hợp đồng" type="date" value={contractForm.contract_date} onChange={(v) => updateForm("contract_date", v)} />
                </div>

                <SectionLabel>Bên B — Merchant</SectionLabel>
                <FormInput label="Tên doanh nghiệp" value={contractForm.merchant_name} onChange={(v) => updateForm("merchant_name", v)} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <FormInput label="MST" value={contractForm.tax_id} onChange={(v) => updateForm("tax_id", v)} />
                  <FormInput label="CCCD" value={contractForm.id_number} onChange={(v) => updateForm("id_number", v)} />
                </div>
                <FormInput label="Địa chỉ" value={contractForm.address} onChange={(v) => updateForm("address", v)} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <FormInput label="Người đại diện" value={contractForm.representative} onChange={(v) => updateForm("representative", v)} />
                  <FormInput label="Chức vụ" value={contractForm.position} onChange={(v) => updateForm("position", v)} />
                </div>

                <SectionLabel>Thông tin thanh toán</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <FormInput label="Số tài khoản" value={contractForm.bank_account} onChange={(v) => updateForm("bank_account", v)} />
                  <FormInput label="Ngân hàng" value={contractForm.bank_name} onChange={(v) => updateForm("bank_name", v)} />
                  <FormInput label="Chủ tài khoản" value={contractForm.account_holder} onChange={(v) => updateForm("account_holder", v)} />
                </div>

                <SectionLabel>Phụ lục 01 — Biểu phí</SectionLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {contractForm.fees.map((fee, i) => (
                    <div key={fee.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--text-dim)", flex: 1 }}>{fee.label}</span>
                      <input
                        value={fee.rate}
                        onChange={(e) => updateFee(i, e.target.value)}
                        style={{ ...inputStyle, width: 160, textAlign: "right" }}
                      />
                    </div>
                  ))}
                </div>

                <SectionLabel>Điều khoản thanh toán</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <FormInput label="Chu kỳ đối soát" value={contractForm.settlement_cycle} onChange={(v) => updateForm("settlement_cycle", v)} />
                  <FormInput label="Ký quỹ" value={contractForm.deposit_amount} onChange={(v) => updateForm("deposit_amount", v)} placeholder="VD: 50,000,000" />
                  <FormInput label="Thanh toán tối thiểu" value={contractForm.min_payment} onChange={(v) => updateForm("min_payment", v)} />
                </div>
              </div>

              {/* Generate button */}
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setSelectedId(null); setContractForm(null); }}
                  style={{ ...actionBtn, background: "var(--surface-soft)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
                >
                  Huỷ
                </button>
                <button
                  onClick={generateContract}
                  disabled={busy}
                  style={{ ...actionBtn, flex: 1, background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff", border: "none", fontWeight: 700 }}
                >
                  {busy ? "Đang xử lý..." : "Sinh hợp đồng & chuyển trạng thái"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </label>
  );
}

function SectionLabel({ children, style }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-soft)", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 6, marginBottom: 2, ...style }}>
      {children}
    </div>
  );
}

function EmptyCard({ children }) {
  return <div style={{ ...cardStyle, padding: "28px 16px", textAlign: "center", fontSize: 12.5, color: "var(--text-dim)" }}>{children}</div>;
}

const cardStyle = {
  background: "var(--card-bg)", border: "1px solid var(--border)",
  borderRadius: 12, padding: "14px 16px",
};
const inputStyle = {
  background: "var(--surface-soft)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "8px 12px", fontSize: 12.5,
  color: "var(--text)", outline: "none", width: "100%",
};
const actionBtn = {
  padding: "11px 18px", borderRadius: 10, fontSize: 13, cursor: "pointer",
};
const closeBtnStyle = {
  padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
  background: "var(--surface-soft)", color: "var(--text-dim)",
  border: "1px solid var(--border)", cursor: "pointer",
};
