"use client";

import { useState } from "react";
import { MERCHANT_STATUSES } from "@/lib/merchantSchema";

const RISK_LEVELS = [
  { key: "low", label: "Thấp", color: "#22c55e" },
  { key: "medium", label: "Trung bình", color: "#fbbf24" },
  { key: "high", label: "Cao", color: "#f97316" },
  { key: "critical", label: "Rất cao", color: "#ef4444" },
];

const RISK_CHECKLIST = [
  { id: "business_license", label: "Giấy phép kinh doanh hợp lệ" },
  { id: "tax_valid", label: "MST hợp lệ, không nợ thuế" },
  { id: "representative_id", label: "CCCD/CMND người đại diện" },
  { id: "bank_verified", label: "Tài khoản ngân hàng xác minh" },
  { id: "website_check", label: "Website/kênh bán hoạt động" },
  { id: "product_legal", label: "Sản phẩm/dịch vụ hợp pháp" },
  { id: "no_blacklist", label: "Không trong danh sách đen" },
  { id: "aml_check", label: "AML/KYC đạt yêu cầu" },
];

export default function RiskReviewView({ merchants, loading, onRefresh }) {
  const [selectedId, setSelectedId] = useState(null);
  const [reviewData, setReviewData] = useState({});
  const [busy, setBusy] = useState(false);

  const reviewable = merchants.filter((m) =>
    ["cho_duyet", "da_khai_bao"].includes(m.status)
  );
  const reviewed = merchants.filter((m) =>
    ["da_duyet", "tu_choi"].includes(m.status)
  );

  const selected = merchants.find((m) => m.id === selectedId);

  function initReview(merchant) {
    setSelectedId(merchant.id);
    const existing = merchant.risk_review || {};
    setReviewData({
      checklist: existing.checklist || {},
      risk_level: existing.risk_level || "",
      notes: existing.notes || "",
      reviewer: existing.reviewer || "",
    });
  }

  async function saveReview(approve) {
    if (!selected) return;
    setBusy(true);
    try {
      await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: selected.id,
          risk_review: { ...reviewData, reviewed_at: new Date().toISOString() },
        }),
      });

      if (approve !== undefined) {
        await fetch("/api/merchant-onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "status",
            id: selected.id,
            new_status: approve ? "da_duyet" : "tu_choi",
            changed_by: reviewData.reviewer || "Risk Team",
            role: "risk",
            note: reviewData.notes || (approve ? "Đã duyệt" : "Từ chối"),
          }),
        });
      }

      setSelectedId(null);
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
    setBusy(false);
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        Đánh giá rủi ro và phê duyệt merchant · {reviewable.length} chờ duyệt
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Left: Queue */}
        <div>
          <SectionHeader>Chờ duyệt ({reviewable.length})</SectionHeader>
          {reviewable.length === 0 ? (
            <EmptyState>Không có merchant nào chờ duyệt</EmptyState>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reviewable.map((m) => {
                const st = MERCHANT_STATUSES.find((s) => s.key === m.status);
                return (
                  <div
                    key={m.id}
                    onClick={() => initReview(m)}
                    style={{
                      ...cardStyle,
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderColor: selectedId === m.id ? "var(--accent-soft)" : "var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{m.company_name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                          {m.tax_id || "Chưa có MST"} · {m.sales_owner || "—"}
                        </div>
                      </div>
                      <span style={{
                        padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600,
                        background: `${st?.color}18`, color: st?.color,
                      }}>
                        {st?.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {reviewed.length > 0 && (
            <>
              <SectionHeader style={{ marginTop: 20 }}>Đã xử lý ({reviewed.length})</SectionHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {reviewed.slice(0, 10).map((m) => {
                  const st = MERCHANT_STATUSES.find((s) => s.key === m.status);
                  return (
                    <div key={m.id} style={{ ...cardStyle, padding: "10px 14px", opacity: 0.7 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{m.company_name}</span>
                        <span style={{ fontSize: 10, color: st?.color, fontWeight: 600 }}>{st?.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right: Review form */}
        <div>
          {!selected ? (
            <div style={{ ...cardStyle, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>←</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Chọn merchant bên trái để đánh giá</div>
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: "18px 20px" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                {selected.company_name}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>
                MST: {selected.tax_id || "—"} · {selected.contact_name || "—"}
              </div>

              {/* Declaration summary */}
              {selected.declaration_data && (
                <div style={{ marginBottom: 16, padding: "10px 12px", background: "var(--surface-soft)", borderRadius: 10, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-dim)", marginBottom: 6, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>Tóm tắt khai báo</div>
                  {[
                    ["Loại hình", selected.declaration_data.business_type],
                    ["Website", selected.declaration_data.website],
                    ["Sản phẩm", selected.declaration_data.products_desc],
                    ["DSGD dự kiến", selected.declaration_data.expected_volume],
                  ].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} style={{ color: "var(--text-dim)" }}>{k}: <span style={{ color: "var(--text)" }}>{v}</span></div>
                  ))}
                </div>
              )}

              {/* Checklist */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                  Checklist kiểm tra
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {RISK_CHECKLIST.map((item) => (
                    <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12.5, color: "var(--text)" }}>
                      <input
                        type="checkbox"
                        checked={!!reviewData.checklist?.[item.id]}
                        onChange={() => setReviewData((d) => ({
                          ...d,
                          checklist: { ...d.checklist, [item.id]: !d.checklist?.[item.id] },
                        }))}
                        style={{ accentColor: "#7c6cff" }}
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Risk level */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                  Mức độ rủi ro
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {RISK_LEVELS.map((rl) => (
                    <button
                      key={rl.key}
                      onClick={() => setReviewData((d) => ({ ...d, risk_level: rl.key }))}
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: reviewData.risk_level === rl.key ? `${rl.color}20` : "var(--surface-soft)",
                        color: reviewData.risk_level === rl.key ? rl.color : "var(--text-dim)",
                        border: reviewData.risk_level === rl.key ? `1px solid ${rl.color}50` : "1px solid var(--border)",
                        cursor: "pointer",
                      }}
                    >
                      {rl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviewer & Notes */}
              <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  value={reviewData.reviewer}
                  onChange={(e) => setReviewData((d) => ({ ...d, reviewer: e.target.value }))}
                  placeholder="Người đánh giá..."
                  style={inputStyle}
                />
                <textarea
                  value={reviewData.notes}
                  onChange={(e) => setReviewData((d) => ({ ...d, notes: e.target.value }))}
                  placeholder="Nhận xét / ghi chú..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => saveReview(undefined)}
                  disabled={busy}
                  style={{ ...actionBtn, background: "var(--surface-soft)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
                >
                  Lưu nháp
                </button>
                <button
                  onClick={() => saveReview(false)}
                  disabled={busy}
                  style={{ ...actionBtn, background: "rgba(251,113,133,0.12)", color: "#fb7185", border: "1px solid rgba(251,113,133,0.3)" }}
                >
                  Từ chối
                </button>
                <button
                  onClick={() => saveReview(true)}
                  disabled={busy}
                  style={{ ...actionBtn, flex: 1, background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", border: "none", fontWeight: 700 }}
                >
                  Phê duyệt
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children, style }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: "var(--text-faint)",
      textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
      ...style,
    }}>
      {children}
    </div>
  );
}

function EmptyState({ children }) {
  return (
    <div style={{
      ...cardStyle, padding: "30px 20px", textAlign: "center",
      fontSize: 13, color: "var(--text-dim)",
    }}>
      {children}
    </div>
  );
}

const cardStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "16px 18px",
};

const inputStyle = {
  background: "var(--surface-soft)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "8px 12px", fontSize: 12.5,
  color: "var(--text)", outline: "none", width: "100%",
};

const actionBtn = {
  padding: "10px 16px", borderRadius: 10, fontSize: 12.5,
  fontWeight: 600, cursor: "pointer",
};
