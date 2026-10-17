"use client";

import { useCallback, useEffect, useState } from "react";
import { MERCHANT_STATUSES } from "@/lib/merchantSchema";

const PIPELINE_COLUMNS = MERCHANT_STATUSES.filter((s) => s.step >= 0);

export default function MerchantPipelinePage() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant-onboarding");
      const data = await res.json();
      setMerchants(data.merchants || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "var(--text-dim)" }}>
        Đang tải pipeline...
      </div>
    );
  }

  const rejected = merchants.filter((m) => m.status === "tu_choi");

  return (
    <div style={{ padding: "0 4px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>Merchant Pipeline</h1>
        <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "4px 0 0" }}>
          Theo dõi tiến trình onboarding merchant theo từng bước · {merchants.length} merchant
        </p>
      </div>

      {/* Kanban board */}
      <div style={{
        display: "flex", gap: 10, overflowX: "auto", paddingBottom: 16,
        minHeight: 400,
      }}>
        {PIPELINE_COLUMNS.map((col) => {
          const items = merchants.filter((m) => m.status === col.key);
          return (
            <div key={col.key} style={{
              minWidth: 220, maxWidth: 260, flex: "0 0 auto",
              display: "flex", flexDirection: "column",
            }}>
              {/* Column header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", marginBottom: 8,
                borderRadius: 10,
                background: `${col.color}10`,
                borderBottom: `2px solid ${col.color}`,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: col.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: col.color }}>{col.label}</span>
                <span style={{
                  marginLeft: "auto", fontSize: 11, fontWeight: 700,
                  background: `${col.color}20`, color: col.color,
                  padding: "2px 8px", borderRadius: 10,
                }}>
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                {items.length === 0 ? (
                  <div style={{
                    padding: "20px 12px", textAlign: "center",
                    fontSize: 11, color: "var(--text-faintest)",
                    border: "1px dashed var(--border-soft)",
                    borderRadius: 10,
                  }}>
                    Trống
                  </div>
                ) : items.map((m) => (
                  <PipelineCard key={m.id} merchant={m} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejected section */}
      {rejected.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "#fb7185", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fb7185" }} />
            Từ chối ({rejected.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {rejected.map((m) => (
              <PipelineCard key={m.id} merchant={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PipelineCard({ merchant }) {
  const daysSince = Math.floor((Date.now() - new Date(merchant.updated_at || merchant.created_at).getTime()) / 86400000);

  return (
    <div style={{
      background: "var(--card-bg)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "12px 14px",
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4, lineHeight: 1.3 }}>
        {merchant.company_name}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 6 }}>
        {merchant.contact_name || "Chưa có LH"}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
          {merchant.sales_owner || "—"}
        </span>
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
