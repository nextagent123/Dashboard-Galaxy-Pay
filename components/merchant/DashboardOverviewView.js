"use client";

import { MERCHANT_STATUSES } from "@/lib/merchantSchema";

export default function DashboardOverviewView({ merchants, loading }) {
  const byStatus = {};
  MERCHANT_STATUSES.forEach((s) => { byStatus[s.key] = 0; });
  merchants.forEach((m) => { byStatus[m.status] = (byStatus[m.status] || 0) + 1; });

  const total = merchants.length;
  const activeCount = byStatus["hoat_dong"] || 0;
  const pendingReview = (byStatus["cho_duyet"] || 0) + (byStatus["da_khai_bao"] || 0);
  const contractPending = (byStatus["da_duyet"] || 0) + (byStatus["da_sinh_hd"] || 0) + (byStatus["da_ky"] || 0);
  const rejected = byStatus["tu_choi"] || 0;

  const salesMap = {};
  merchants.forEach((m) => {
    const owner = m.sales_owner || "Chưa gán";
    salesMap[owner] = (salesMap[owner] || 0) + 1;
  });
  const topSales = Object.entries(salesMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const recentMerchants = [...merchants]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 10);

  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        Tổng quan merchant onboarding
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: 24 }}>
        <KPICard label="Tổng merchant" value={total} color="#7c6cff" />
        <KPICard label="Đang hoạt động" value={activeCount} color="#22c55e" />
        <KPICard label="Chờ duyệt" value={pendingReview} color="#fbbf24" />
        <KPICard label="Chờ hợp đồng" value={contractPending} color="#a78bfa" />
        <KPICard label="Từ chối" value={rejected} color="#ef4444" />
      </div>

      {/* Status breakdown + Sales leaderboard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Status breakdown */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Phân bổ theo trạng thái</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {MERCHANT_STATUSES.map((s) => {
              const count = byStatus[s.key] || 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-dim)", flex: 1 }}>{s.label}</span>
                  <div style={{ width: 120, height: 6, background: "var(--surface-soft)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: s.color, borderRadius: 3, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", minWidth: 28, textAlign: "right" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales leaderboard */}
        <div style={cardStyle}>
          <div style={sectionTitle}>Top Sales Owner</div>
          {topSales.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Chưa có dữ liệu</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {topSales.map(([name, count], i) => {
                const maxCount = topSales[0][1];
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%", fontSize: 10, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: i < 3 ? "linear-gradient(135deg,#7c6cff,#9d8bff)" : "var(--surface-soft)",
                      color: i < 3 ? "#fff" : "var(--text-dim)",
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text)", flex: 1 }}>{name}</span>
                    <div style={{ width: 100, height: 6, background: "var(--surface-soft)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(135deg,#7c6cff,#a78bfa)", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", minWidth: 24, textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Conversion funnel */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={sectionTitle}>Funnel chuyển đổi</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
          {MERCHANT_STATUSES.filter((s) => !["can_bo_sung", "tu_choi"].includes(s.key)).map((s) => {
            const count = byStatus[s.key] || 0;
            const maxVal = Math.max(...MERCHANT_STATUSES.map((st) => byStatus[st.key] || 0), 1);
            const h = Math.max((count / maxVal) * 100, 4);
            return (
              <div key={s.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{count}</span>
                <div style={{
                  width: "100%", maxWidth: 60, height: h, borderRadius: "6px 6px 0 0",
                  background: `linear-gradient(180deg, ${s.color}, ${s.color}88)`,
                }} />
                <span style={{ fontSize: 9, color: "var(--text-dim)", textAlign: "center", lineHeight: 1.2 }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div style={cardStyle}>
        <div style={sectionTitle}>Hoạt động gần đây</div>
        {recentMerchants.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Chưa có merchant nào</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {recentMerchants.map((m) => {
              const st = MERCHANT_STATUSES.find((s) => s.key === m.status);
              const date = m.updated_at || m.created_at;
              return (
                <div key={m.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 12px", borderRadius: 8,
                  background: "var(--surface-soft)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: st?.color }} />
                    <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{m.company_name}</span>
                    <span style={{
                      padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600,
                      background: `${st?.color}15`, color: st?.color,
                    }}>
                      {st?.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{m.sales_owner || "—"}</span>
                    {date && (
                      <span style={{ fontSize: 10, color: "var(--text-faint)" }}>
                        {new Date(date).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({ label, value, color }) {
  return (
    <div style={{
      background: "var(--card-bg)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "16px 18px", borderTop: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "var(--text-dim)", marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

const cardStyle = {
  background: "var(--card-bg)", border: "1px solid var(--border)",
  borderRadius: 12, padding: "16px 18px",
};
const sectionTitle = {
  fontSize: 11, fontWeight: 700, color: "var(--text-faint)",
  textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12,
};
