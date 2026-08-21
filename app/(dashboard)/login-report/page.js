"use client";

import { useEffect, useState, useMemo } from "react";

/* ─── helpers ─── */
const fmt = (n) => n.toLocaleString("vi-VN");
const pad2 = (n) => String(n).padStart(2, "0");

function monthLabel(m) {
  // "2026-07" → "Tháng 07/2026"
  const [y, mo] = m.split("-");
  return `Tháng ${mo}/${y}`;
}

function toDateStr(ts) {
  const d = new Date(ts);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

function toTimeStr(ts) {
  const d = new Date(ts);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function toFullStr(ts) {
  const d = new Date(ts);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/* colour per user (stable hash) */
const USER_PALETTE = [
  "#7c6cff", "#34d399", "#f59e0b", "#ec4899", "#06b6d4",
  "#8b5cf6", "#ef4444", "#22c55e", "#f97316", "#14b8a6",
  "#6366f1", "#e11d48",
];
function userColor(name, idx) {
  return USER_PALETTE[idx % USER_PALETTE.length];
}

/* ─── main ─── */
export default function LoginReportPage() {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
  const lastMonth = (() => {
    let m = now.getMonth(); // 0-indexed
    let y = now.getFullYear();
    if (m === 0) { m = 12; y--; }
    return `${y}-${pad2(m)}`;
  })();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState([lastMonth, thisMonth]);
  const [filterUser, setFilterUser] = useState("all");

  // fetch
  useEffect(() => {
    setLoading(true);
    fetch(`/api/auth/login-log?months=${months.join(",")}`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [months]);

  /* ─── derived stats ─── */
  const filtered = useMemo(() => {
    if (filterUser === "all") return logs;
    return logs.filter((l) => l.user === filterUser);
  }, [logs, filterUser]);

  const uniqueUsers = useMemo(() => {
    const map = {};
    logs.forEach((l) => {
      if (!map[l.user]) map[l.user] = { name: l.name || l.user, role: l.role || "", count: 0 };
      map[l.user].count++;
    });
    return Object.entries(map)
      .map(([u, v]) => ({ user: u, ...v }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  // per-user stats (for filtered)
  const userStats = useMemo(() => {
    const map = {};
    filtered.forEach((l) => {
      if (!map[l.user]) map[l.user] = { name: l.name || l.user, role: l.role || "", count: 0, first: l.ts, last: l.ts };
      map[l.user].count++;
      if (l.ts < map[l.user].first) map[l.user].first = l.ts;
      if (l.ts > map[l.user].last) map[l.user].last = l.ts;
    });
    return Object.entries(map)
      .map(([u, v]) => ({ user: u, ...v }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // daily distribution
  const dailyData = useMemo(() => {
    const map = {};
    filtered.forEach((l) => {
      const day = toDateStr(l.ts);
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => {
      // sort by date
      const [da, ma] = a[0].split("/").map(Number);
      const [db, mb] = b[0].split("/").map(Number);
      return ma !== mb ? ma - mb : da - db;
    });
  }, [filtered]);

  // hourly distribution
  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0);
    filtered.forEach((l) => {
      const h = new Date(l.ts).getHours();
      hours[h]++;
    });
    return hours;
  }, [filtered]);
  const maxHourly = Math.max(...hourlyData, 1);

  // per-month breakdown
  const monthlyBreakdown = useMemo(() => {
    const map = {};
    months.forEach((m) => { map[m] = { total: 0, users: new Set() }; });
    filtered.forEach((l) => {
      const d = new Date(l.ts);
      const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      if (map[key]) {
        map[key].total++;
        map[key].users.add(l.user);
      }
    });
    return months.map((m) => ({
      month: m,
      label: monthLabel(m),
      total: map[m]?.total || 0,
      uniqueUsers: map[m]?.users?.size || 0,
    }));
  }, [filtered, months]);

  const maxBar = Math.max(...userStats.map((u) => u.count), 1);
  const maxDaily = Math.max(...dailyData.map((d) => d[1]), 1);

  const cellSt = { padding: "10px 14px", fontSize: 12, borderBottom: "1px solid var(--border-faint)" };
  const thSt = { padding: "10px 14px", fontSize: 10, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid var(--border)", textAlign: "left" };

  return (
    <>
      {/* Header */}
      <div style={{
        marginBottom: 20,
        display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>QUẢN TRỊ</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", margin: 0 }}>Báo cáo đăng nhập</h1>
          <p style={{ fontSize: 13, color: "var(--text-dim)", margin: "6px 0 0" }}>
            Tần suất đăng nhập của các user — {months.map(monthLabel).join(" & ")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "T7 & T8/2026", value: ["2026-07", "2026-08"] },
            { label: "T7/2026", value: ["2026-07"] },
            { label: "T8/2026", value: ["2026-08"] },
            { label: "Tháng này", value: [thisMonth] },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => { setMonths(opt.value); setFilterUser("all"); }}
              style={{
                padding: "6px 14px", fontSize: 11, fontWeight: 600, borderRadius: 8, cursor: "pointer",
                border: "1px solid",
                background: JSON.stringify(months) === JSON.stringify(opt.value) ? "rgba(124,108,255,0.15)" : "transparent",
                borderColor: JSON.stringify(months) === JSON.stringify(opt.value) ? "rgba(124,108,255,0.3)" : "var(--border)",
                color: JSON.stringify(months) === JSON.stringify(opt.value) ? "var(--accent-2)" : "var(--text-dim)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: 60, color: "var(--text-faint)" }}>
          Đang tải dữ liệu...
        </div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Chưa có dữ liệu đăng nhập</div>
          <p style={{ fontSize: 13, color: "var(--text-dim)", maxWidth: 400, margin: "0 auto", lineHeight: 1.7 }}>
            Hệ thống tracking đã được kích hoạt. Dữ liệu sẽ bắt đầu ghi nhận từ lần đăng nhập tiếp theo của mỗi user.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid-4" style={{ marginBottom: 20 }}>
            {[
              { label: "Tổng lượt đăng nhập", value: fmt(filtered.length), color: "var(--accent-2)", icon: "🔑" },
              { label: "User hoạt động", value: fmt(userStats.length), color: "var(--green)", icon: "👤" },
              { label: "TB lượt/user", value: userStats.length > 0 ? (filtered.length / userStats.length).toFixed(1) : "0", color: "#f59e0b", icon: "📈" },
              { label: "TB lượt/ngày", value: dailyData.length > 0 ? (filtered.length / dailyData.length).toFixed(1) : "0", color: "#06b6d4", icon: "📅" },
            ].map((kpi, i) => (
              <div key={i} className="card" style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{kpi.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: kpi.color, fontVariantNumeric: "tabular-nums" }}>{kpi.value}</div>
                  </div>
                  <span style={{ fontSize: 22 }}>{kpi.icon}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly breakdown */}
          {monthlyBreakdown.length > 1 && (
            <div className="grid-2" style={{ marginBottom: 20 }}>
              {monthlyBreakdown.map((mb) => (
                <div key={mb.month} className="card" style={{ padding: "16px 20px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>{mb.label}</div>
                  <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
                    <div>
                      <span style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-2)" }}>{fmt(mb.total)}</span>
                      <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 6 }}>lượt</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--green)" }}>{mb.uniqueUsers}</span>
                      <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 6 }}>user</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                      TB {mb.uniqueUsers > 0 ? (mb.total / mb.uniqueUsers).toFixed(1) : 0} lượt/user
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filter by user */}
          {uniqueUsers.length > 1 && (
            <div style={{ marginBottom: 16, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--text-faint)", marginRight: 4 }}>Lọc:</span>
              <button
                onClick={() => setFilterUser("all")}
                style={{
                  padding: "4px 12px", fontSize: 11, fontWeight: 600, borderRadius: 16, cursor: "pointer",
                  border: "1px solid",
                  background: filterUser === "all" ? "rgba(124,108,255,0.15)" : "transparent",
                  borderColor: filterUser === "all" ? "rgba(124,108,255,0.3)" : "var(--border-faint)",
                  color: filterUser === "all" ? "var(--accent-2)" : "var(--text-dim)",
                }}
              >
                Tất cả ({fmt(logs.length)})
              </button>
              {uniqueUsers.map((u, i) => (
                <button
                  key={u.user}
                  onClick={() => setFilterUser(u.user)}
                  style={{
                    padding: "4px 12px", fontSize: 11, fontWeight: 600, borderRadius: 16, cursor: "pointer",
                    border: "1px solid",
                    background: filterUser === u.user ? `${userColor(u.user, i)}22` : "transparent",
                    borderColor: filterUser === u.user ? `${userColor(u.user, i)}44` : "var(--border-faint)",
                    color: filterUser === u.user ? userColor(u.user, i) : "var(--text-dim)",
                  }}
                >
                  {u.name} ({u.count})
                </button>
              ))}
            </div>
          )}

          <div className="grid-2" style={{ marginBottom: 20 }}>
            {/* User ranking table */}
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>🏆 Xếp hạng theo user</h3>
                <p style={{ fontSize: 11, color: "var(--text-dim)", margin: "4px 0 0" }}>Số lượt đăng nhập theo từng tài khoản</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ ...thSt, width: 30, textAlign: "center" }}>#</th>
                      <th style={thSt}>User</th>
                      <th style={{ ...thSt, textAlign: "right" }}>Lượt</th>
                      <th style={{ ...thSt, textAlign: "left", minWidth: 120 }}>Phân bổ</th>
                      <th style={{ ...thSt, textAlign: "right" }}>Lần cuối</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.map((u, i) => (
                      <tr key={u.user} style={{ cursor: "pointer", background: filterUser === u.user ? "rgba(124,108,255,0.05)" : "transparent" }}
                          onClick={() => setFilterUser(filterUser === u.user ? "all" : u.user)}>
                        <td style={{ ...cellSt, textAlign: "center", fontWeight: 700, color: i < 3 ? "var(--accent-2)" : "var(--text-faint)" }}>{i + 1}</td>
                        <td style={cellSt}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%",
                              background: `${userColor(u.user, i)}22`,
                              color: userColor(u.user, i),
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 800, flexShrink: 0,
                            }}>
                              {u.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 12, color: "var(--text)" }}>{u.name}</div>
                              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>@{u.user} · {u.role}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ ...cellSt, textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "var(--accent-2)" }}>{fmt(u.count)}</td>
                        <td style={cellSt}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--border-faint)", overflow: "hidden" }}>
                              <div style={{ width: `${(u.count / maxBar) * 100}%`, height: "100%", borderRadius: 3, background: userColor(u.user, i) }} />
                            </div>
                            <span style={{ fontSize: 10, color: "var(--text-faint)", minWidth: 28, textAlign: "right" }}>
                              {filtered.length > 0 ? ((u.count / filtered.length) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </td>
                        <td style={{ ...cellSt, textAlign: "right", fontSize: 11, color: "var(--text-dim)", fontVariantNumeric: "tabular-nums" }}>{toFullStr(u.last)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hourly heatmap */}
            <div className="card" style={{ padding: "20px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>🕐 Phân bổ theo giờ</h3>
              <p style={{ fontSize: 11, color: "var(--text-dim)", margin: "0 0 16px" }}>Số lượt đăng nhập theo khung giờ trong ngày</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 140 }}>
                {hourlyData.map((count, h) => (
                  <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 9, color: count > 0 ? "var(--accent-2)" : "var(--text-faint)", fontWeight: 600 }}>
                      {count > 0 ? count : ""}
                    </span>
                    <div style={{
                      width: "100%", borderRadius: "3px 3px 0 0",
                      height: `${Math.max((count / maxHourly) * 100, count > 0 ? 4 : 0)}%`,
                      minHeight: count > 0 ? 4 : 1,
                      background: count > 0
                        ? (h >= 8 && h <= 18 ? "var(--accent-2)" : "rgba(124,108,255,0.4)")
                        : "var(--border-faint)",
                      transition: "height 0.3s",
                    }} />
                    <span style={{ fontSize: 8, color: "var(--text-faint)" }}>{pad2(h)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 16, fontSize: 10, color: "var(--text-faint)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent-2)" }} /> Giờ hành chính (8h-18h)
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(124,108,255,0.4)" }} /> Ngoài giờ
                </span>
              </div>
            </div>
          </div>

          {/* Daily chart */}
          {dailyData.length > 0 && (
            <div className="card" style={{ padding: "20px", marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "0 0 4px" }}>📅 Lượt đăng nhập theo ngày</h3>
              <p style={{ fontSize: 11, color: "var(--text-dim)", margin: "0 0 16px" }}>Biểu đồ hàng ngày — {months.map(monthLabel).join(" & ")}</p>
              <div style={{ overflowX: "auto" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120, minWidth: dailyData.length * 18 }}>
                  {dailyData.map(([day, count]) => (
                    <div key={day} style={{ flex: 1, minWidth: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 8, color: "var(--accent-2)", fontWeight: 600 }}>{count}</span>
                      <div style={{
                        width: "100%", maxWidth: 16, borderRadius: "3px 3px 0 0",
                        height: `${(count / maxDaily) * 100}%`,
                        minHeight: 4,
                        background: "var(--accent-2)",
                      }} />
                      <span style={{ fontSize: 7, color: "var(--text-faint)", writingMode: "vertical-lr", transform: "rotate(180deg)", height: 28 }}>{day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent logins table */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: 0 }}>📋 Chi tiết lượt đăng nhập</h3>
                <p style={{ fontSize: 11, color: "var(--text-dim)", margin: "4px 0 0" }}>
                  {fmt(filtered.length)} lượt · Sắp xếp mới nhất trước
                </p>
              </div>
            </div>
            <div style={{ overflowX: "auto", maxHeight: 500, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--card-bg)" }}>
                  <tr>
                    <th style={{ ...thSt, width: 40, textAlign: "center" }}>#</th>
                    <th style={thSt}>User</th>
                    <th style={thSt}>Vai trò</th>
                    <th style={{ ...thSt, textAlign: "right" }}>Thời gian</th>
                    <th style={thSt}>Thiết bị</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].reverse().slice(0, 200).map((l, i) => {
                    const isMobile = /mobile|android|iphone/i.test(l.ua || "");
                    const browser = /chrome/i.test(l.ua) ? "Chrome"
                      : /firefox/i.test(l.ua) ? "Firefox"
                      : /safari/i.test(l.ua) ? "Safari"
                      : /edge/i.test(l.ua) ? "Edge" : "—";
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border-faint)" }}>
                        <td style={{ ...cellSt, textAlign: "center", color: "var(--text-faint)", fontSize: 11 }}>{i + 1}</td>
                        <td style={cellSt}>
                          <span style={{ fontWeight: 600 }}>{l.name || l.user}</span>
                          <span style={{ fontSize: 10, color: "var(--text-faint)", marginLeft: 6 }}>@{l.user}</span>
                        </td>
                        <td style={{ ...cellSt, fontSize: 11, color: "var(--text-dim)" }}>{l.role || "—"}</td>
                        <td style={{ ...cellSt, textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                          {toFullStr(l.ts)}
                        </td>
                        <td style={{ ...cellSt, fontSize: 11, color: "var(--text-dim)" }}>
                          {isMobile ? "📱" : "💻"} {browser}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
