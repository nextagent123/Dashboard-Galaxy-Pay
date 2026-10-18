"use client";

import { useState } from "react";
import { MERCHANT_STATUSES } from "@/lib/merchantSchema";

const FEE_TYPES = [
  { key: "napas", label: "Thẻ Napas/nội địa", defaultRate: "0.55", unit: "%/giao dịch", desc: "Thẻ ATM, thẻ ghi nợ nội địa qua Napas" },
  { key: "intl_vn", label: "Thẻ quốc tế (VN)", defaultRate: "1.75", unit: "%/giao dịch", desc: "Visa/Master/JCB phát hành tại VN" },
  { key: "intl_foreign", label: "Thẻ quốc tế (nước ngoài)", defaultRate: "3.30", unit: "%/giao dịch", desc: "Visa/Master/JCB phát hành nước ngoài" },
  { key: "vietqr", label: "VietQR", defaultRate: "0", unit: "VND/giao dịch", desc: "Chuyển khoản qua mã QR (miễn phí)" },
  { key: "skypay", label: "Ví SkyPay", defaultRate: "0.50", unit: "%/giao dịch", desc: "Thanh toán qua ví điện tử SkyPay" },
];

const SETTLEMENT_OPTIONS = ["T+1", "T+2", "T+3", "T+7"];

export default function FeeDeclarationView({ merchants, loading, onRefresh }) {
  const [selectedId, setSelectedId] = useState(null);
  const [feeForm, setFeeForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [searchText, setSearchText] = useState("");

  const activeMerchants = merchants.filter((m) =>
    ["da_duyet", "da_sinh_hd", "da_ky", "hoat_dong"].includes(m.status)
  );

  const filtered = searchText.trim()
    ? activeMerchants.filter((m) =>
        m.company_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        m.tax_id?.includes(searchText)
      )
    : activeMerchants;

  const selected = merchants.find((m) => m.id === selectedId);

  function selectMerchant(m) {
    setSelectedId(m.id);
    setResult(null);
    const existing = m.fee_schedule || {};
    setFeeForm({
      fees: FEE_TYPES.map((ft) => {
        const saved = existing.fees?.find((f) => f.key === ft.key);
        return {
          key: ft.key,
          label: ft.label,
          desc: ft.desc,
          enabled: saved ? saved.enabled : true,
          rate: saved ? saved.rate : ft.defaultRate,
          unit: saved ? saved.unit : ft.unit,
          min_fee: saved?.min_fee || "",
          max_fee: saved?.max_fee || "",
          note: saved?.note || "",
        };
      }),
      settlement_cycle: existing.settlement_cycle || "T+1",
      deposit_amount: existing.deposit_amount || "",
      min_transaction: existing.min_transaction || "10,000",
      max_transaction: existing.max_transaction || "",
      monthly_fee: existing.monthly_fee || "0",
      setup_fee: existing.setup_fee || "0",
      effective_date: existing.effective_date || new Date().toISOString().split("T")[0],
      notes: existing.notes || "",
    });
  }

  function updateFee(idx, field, val) {
    setFeeForm((f) => {
      const fees = [...f.fees];
      fees[idx] = { ...fees[idx], [field]: val };
      return { ...f, fees };
    });
  }

  function updateField(key, val) {
    setFeeForm((f) => ({ ...f, [key]: val }));
  }

  function resetToDefault() {
    setFeeForm((f) => ({
      ...f,
      fees: FEE_TYPES.map((ft) => ({
        key: ft.key, label: ft.label, desc: ft.desc,
        enabled: true, rate: ft.defaultRate, unit: ft.unit,
        min_fee: "", max_fee: "", note: "",
      })),
    }));
  }

  async function saveFeeSchedule() {
    if (!selected || !feeForm) return;
    setBusy(true);
    setResult(null);
    try {
      const feeData = {
        fees: feeForm.fees.map((f) => ({
          key: f.key, label: f.label, enabled: f.enabled,
          rate: f.rate, unit: f.unit,
          min_fee: f.min_fee, max_fee: f.max_fee, note: f.note,
        })),
        settlement_cycle: feeForm.settlement_cycle,
        deposit_amount: feeForm.deposit_amount,
        min_transaction: feeForm.min_transaction,
        max_transaction: feeForm.max_transaction,
        monthly_fee: feeForm.monthly_fee,
        setup_fee: feeForm.setup_fee,
        effective_date: feeForm.effective_date,
        notes: feeForm.notes,
        updated_at: new Date().toISOString(),
        updated_by: "staff",
      };

      const res = await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: selected.id,
          fee_schedule: feeData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi lưu biểu phí");

      setResult({ ok: true, name: selected.company_name });
      onRefresh();
    } catch (err) {
      setResult({ ok: false, error: err.message });
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        Khai báo phí dịch vụ theo từng merchant · Mỗi merchant có biểu phí riêng
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
              {result.ok ? "Lưu biểu phí thành công" : "Lỗi"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
              {result.ok ? `${result.name} — biểu phí đã được cập nhật` : result.error}
            </div>
          </div>
          <button onClick={() => setResult(null)} style={chipBtn}>Đóng</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, minHeight: 500 }}>
        {/* Left sidebar — merchant list */}
        <div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm merchant..."
            style={{ ...inputStyle, marginBottom: 10, width: "100%" }}
          />
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
            Merchant ({filtered.length})
          </div>
          {loading ? (
            <div style={{ fontSize: 12, color: "var(--text-dim)", padding: 20, textAlign: "center" }}>Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div style={{ ...cardStyle, padding: "28px 16px", textAlign: "center", fontSize: 12, color: "var(--text-dim)" }}>
              {searchText ? "Không tìm thấy" : "Chưa có merchant đã duyệt"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "60vh", overflowY: "auto" }}>
              {filtered.map((m) => {
                const st = MERCHANT_STATUSES.find((s) => s.key === m.status);
                const hasFee = !!m.fee_schedule;
                return (
                  <div
                    key={m.id}
                    onClick={() => selectMerchant(m)}
                    style={{
                      ...cardStyle,
                      padding: "10px 14px", cursor: "pointer",
                      borderColor: selectedId === m.id ? "var(--accent-soft)" : "var(--border)",
                      background: selectedId === m.id ? "rgba(124,108,255,0.04)" : "var(--card-bg)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{m.company_name}</div>
                      {hasFee && (
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 6px", borderRadius: 4 }}>
                          Đã khai
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 3 }}>
                      <span style={{ fontSize: 10.5, color: "var(--text-dim)" }}>{m.tax_id || "—"}</span>
                      <span style={{ fontSize: 10, color: st?.color }}>{st?.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — fee form */}
        <div>
          {!selected ? (
            <div style={{ ...cardStyle, padding: 50, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>$</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Chọn merchant để khai báo biểu phí dịch vụ</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
                Mỗi merchant có phí dịch vụ khác nhau tùy theo thỏa thuận
              </div>
            </div>
          ) : !feeForm ? (
            <div style={{ ...cardStyle, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Đang tải...</div>
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: "18px 22px", maxHeight: "75vh", overflowY: "auto" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
                    Biểu phí — {selected.company_name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                    MST: {selected.tax_id || "—"} · Theo mẫu hợp đồng TGTT
                  </div>
                </div>
                <button onClick={resetToDefault} style={{ ...chipBtn, fontSize: 11 }}>
                  Reset mặc định
                </button>
              </div>

              {/* Fee table */}
              <div style={{ marginBottom: 20 }}>
                <div style={sectionLabel}>Phụ lục 01 — Biểu phí dịch vụ</div>
                <div style={{
                  border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden",
                }}>
                  {/* Header row */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 100px 120px",
                    gap: 0, background: "var(--surface-soft)", padding: "8px 12px",
                    borderBottom: "1px solid var(--border)",
                  }}>
                    <span style={thStyle}></span>
                    <span style={thStyle}>Loại phí</span>
                    <span style={thStyle}>Phí suất</span>
                    <span style={thStyle}>Phí tối thiểu</span>
                    <span style={thStyle}>Phí tối đa</span>
                    <span style={thStyle}>Ghi chú</span>
                  </div>
                  {feeForm.fees.map((fee, i) => (
                    <div
                      key={fee.key}
                      style={{
                        display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 100px 120px",
                        gap: 0, padding: "8px 12px", alignItems: "center",
                        borderBottom: i < feeForm.fees.length - 1 ? "1px solid var(--border)" : "none",
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
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{fee.label}</div>
                        <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{fee.desc}</div>
                      </div>
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
                      <input
                        value={fee.note}
                        onChange={(e) => updateFee(i, "note", e.target.value)}
                        disabled={!fee.enabled}
                        placeholder="—"
                        style={{ ...inputStyle, padding: "6px 8px", fontSize: 11 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement & terms */}
              <div style={{ marginBottom: 20 }}>
                <div style={sectionLabel}>Điều khoản thanh toán & phí khác</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div>
                    <span style={fieldLabel}>Chu kỳ đối soát</span>
                    <select
                      value={feeForm.settlement_cycle}
                      onChange={(e) => updateField("settlement_cycle", e.target.value)}
                      style={{ ...inputStyle, width: "100%" }}
                    >
                      {SETTLEMENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span style={fieldLabel}>Ký quỹ (VND)</span>
                    <input
                      value={feeForm.deposit_amount}
                      onChange={(e) => updateField("deposit_amount", e.target.value)}
                      placeholder="VD: 50,000,000"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>
                  <div>
                    <span style={fieldLabel}>Ngày hiệu lực</span>
                    <input
                      type="date"
                      value={feeForm.effective_date}
                      onChange={(e) => updateField("effective_date", e.target.value)}
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                  <div>
                    <span style={fieldLabel}>GD tối thiểu (VND)</span>
                    <input
                      value={feeForm.min_transaction}
                      onChange={(e) => updateField("min_transaction", e.target.value)}
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>
                  <div>
                    <span style={fieldLabel}>GD tối đa (VND)</span>
                    <input
                      value={feeForm.max_transaction}
                      onChange={(e) => updateField("max_transaction", e.target.value)}
                      placeholder="Không giới hạn"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>
                  <div>
                    <span style={fieldLabel}>Phí duy trì/tháng</span>
                    <input
                      value={feeForm.monthly_fee}
                      onChange={(e) => updateField("monthly_fee", e.target.value)}
                      placeholder="0"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>
                  <div>
                    <span style={fieldLabel}>Phí cài đặt</span>
                    <input
                      value={feeForm.setup_fee}
                      onChange={(e) => updateField("setup_fee", e.target.value)}
                      placeholder="0"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 20 }}>
                <div style={sectionLabel}>Ghi chú</div>
                <textarea
                  value={feeForm.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Ghi chú thêm về biểu phí, điều kiện đặc biệt..."
                  rows={3}
                  style={{ ...inputStyle, width: "100%", resize: "vertical" }}
                />
              </div>

              {/* Fee summary */}
              <div style={{
                background: "var(--surface-soft)", borderRadius: 10, padding: "14px 16px", marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Tóm tắt biểu phí
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {feeForm.fees.filter((f) => f.enabled).map((f) => (
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
                  {feeForm.fees.filter((f) => f.enabled).length === 0 && (
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Chưa chọn phương thức nào</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
                  Đối soát: {feeForm.settlement_cycle}
                  {feeForm.deposit_amount && ` · Ký quỹ: ${feeForm.deposit_amount} VND`}
                  {feeForm.effective_date && ` · Hiệu lực: ${feeForm.effective_date}`}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setSelectedId(null); setFeeForm(null); }}
                  style={{ ...actionBtn, background: "var(--surface-soft)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
                >
                  Huỷ
                </button>
                <button
                  onClick={saveFeeSchedule}
                  disabled={busy}
                  style={{
                    ...actionBtn, flex: 1,
                    background: "linear-gradient(135deg,#7c6cff,#9d8bff)", color: "#fff",
                    border: "none", fontWeight: 700,
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  {busy ? "Đang lưu..." : "Lưu biểu phí dịch vụ"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "var(--card-bg)", border: "1px solid var(--border)",
  borderRadius: 12, padding: "14px 16px",
};
const inputStyle = {
  background: "var(--surface-soft)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "8px 12px", fontSize: 12.5,
  color: "var(--text)", outline: "none",
};
const thStyle = {
  fontSize: 10, fontWeight: 700, color: "var(--text-faint)",
  textTransform: "uppercase", letterSpacing: 0.4,
};
const sectionLabel = {
  fontSize: 11, fontWeight: 700, color: "var(--accent-soft)",
  textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10,
};
const fieldLabel = {
  display: "block", fontSize: 10.5, fontWeight: 600, color: "var(--text-faint)",
  textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4,
};
const actionBtn = {
  padding: "11px 18px", borderRadius: 10, fontSize: 13, cursor: "pointer",
};
const chipBtn = {
  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
  background: "var(--surface-soft)", color: "var(--text-dim)",
  border: "1px solid var(--border)", cursor: "pointer",
};
