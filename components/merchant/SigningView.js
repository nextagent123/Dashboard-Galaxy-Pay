"use client";

import { useState } from "react";
import { MERCHANT_STATUSES } from "@/lib/merchantSchema";

export default function SigningView({ merchants, loading, onRefresh }) {
  const [busy, setBusy] = useState(null);

  const awaitSign = merchants.filter((m) => m.status === "da_sinh_hd");
  const signed = merchants.filter((m) => m.status === "da_ky");
  const active = merchants.filter((m) => m.status === "hoat_dong");

  async function markSigned(merchant) {
    setBusy(merchant.id);
    try {
      await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status", id: merchant.id, new_status: "da_ky",
          changed_by: "Legal", role: "legal", note: "Merchant đã ký hợp đồng",
        }),
      });
      onRefresh();
    } catch (err) { alert(err.message); }
    setBusy(null);
  }

  async function activate(merchant) {
    setBusy(merchant.id);
    try {
      await fetch("/api/merchant-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status", id: merchant.id, new_status: "hoat_dong",
          changed_by: "Operations", role: "ops", note: "Kích hoạt merchant thành công",
        }),
      });
      onRefresh();
    } catch (err) { alert(err.message); }
    setBusy(null);
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        Theo dõi ký kết & kích hoạt merchant
      </div>

      {/* Awaiting signature */}
      <SectionTitle color="#2dd4bf" count={awaitSign.length}>Chờ ký hợp đồng</SectionTitle>
      {awaitSign.length === 0 ? (
        <EmptyCard>Không có merchant nào chờ ký</EmptyCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10, marginBottom: 24 }}>
          {awaitSign.map((m) => (
            <div key={m.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{m.company_name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 3 }}>
                    {m.tax_id || "—"} · {m.contact_name || "—"} · {m.contact_phone || "—"}
                  </div>
                  {m.contract_data?.contract_number && (
                    <div style={{ fontSize: 11, color: "var(--accent-soft)", marginTop: 4 }}>
                      HĐ: {m.contract_data.contract_number}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => markSigned(m)}
                  disabled={busy === m.id}
                  style={{
                    padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: "linear-gradient(135deg,#a78bfa,#7c6cff)", color: "#fff",
                    border: "none", cursor: "pointer", whiteSpace: "nowrap",
                    opacity: busy === m.id ? 0.6 : 1,
                  }}
                >
                  {busy === m.id ? "..." : "Xác nhận đã ký"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Signed - awaiting activation */}
      <SectionTitle color="#a78bfa" count={signed.length}>Đã ký — Chờ kích hoạt</SectionTitle>
      {signed.length === 0 ? (
        <EmptyCard>Không có merchant nào chờ kích hoạt</EmptyCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10, marginBottom: 24 }}>
          {signed.map((m) => (
            <div key={m.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{m.company_name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 3 }}>
                    {m.tax_id || "—"} · Sales: {m.sales_owner || "—"}
                  </div>
                </div>
                <button
                  onClick={() => activate(m)}
                  disabled={busy === m.id}
                  style={{
                    padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff",
                    border: "none", cursor: "pointer", whiteSpace: "nowrap",
                    opacity: busy === m.id ? 0.6 : 1,
                  }}
                >
                  {busy === m.id ? "..." : "Kích hoạt Go-live"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active */}
      <SectionTitle color="#22c55e" count={active.length}>Đang hoạt động</SectionTitle>
      {active.length === 0 ? (
        <EmptyCard>Chưa có merchant nào hoạt động</EmptyCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
          {active.map((m) => (
            <div key={m.id} style={{ ...cardStyle, padding: "10px 14px", borderLeft: "3px solid #22c55e" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{m.company_name}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                {m.tax_id || "—"} · {m.sales_owner || "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children, color, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{children}</span>
      <span style={{
        fontSize: 11, fontWeight: 600, padding: "1px 8px", borderRadius: 10,
        background: `${color}15`, color,
      }}>
        {count}
      </span>
    </div>
  );
}

function EmptyCard({ children }) {
  return (
    <div style={{
      background: "var(--card-bg)", border: "1px dashed var(--border-soft)",
      borderRadius: 10, padding: "24px 16px", textAlign: "center",
      fontSize: 12.5, color: "var(--text-dim)", marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

const cardStyle = {
  background: "var(--card-bg)", border: "1px solid var(--border)",
  borderRadius: 12, padding: "14px 18px",
};
