// Client-side prototype auth — ported 1:1 from dc.html. This is intentionally
// NOT secure: users/passwords live in localStorage and are visible to anyone
// with devtools access on the machine. It exists to match the design's
// login/user-management flow; swap for real server-side auth before this
// dashboard holds anything sensitive.

// Default accounts. h = SHA-256 hex of the password.
//   taicv / (khối kinh doanh password) — Admin
//   diem  / (diễm password)            — Admin
export const USERS = [
  { u: "taicv", h: "8eaafecbd8d4112803cb1be81f88f594ac9998db453cca160edd65feda5f9fef", name: "Khối Kinh doanh", role: "Admin · Khối Kinh doanh", ini: "KD" },
  { u: "diem", h: "7c1feddbaf5b920e7222c48b2c387e30799769e55628dfc6a58127b157eb9310", name: "Diễm", role: "Admin · Phòng Kinh doanh", ini: "D" },
];
export const ADMIN_USERS = ["taicv", "diem"];

const LS_USER = "gpDashUser";
const LS_EXTRA = "gpDashExtraUsers";
const LS_OVERRIDES = "gpDashUserOverrides";

export async function sha256(s) {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (private browsing / storage disabled)
  }
}

export function loadExtraUsers() {
  return safeGet(LS_EXTRA) || [];
}
export function loadOverrides() {
  return safeGet(LS_OVERRIDES) || {};
}
export function loadSession() {
  return safeGet(LS_USER);
}
export function saveSession(u, h) {
  safeSet(LS_USER, { u, h });
}
export function clearSession() {
  try {
    localStorage.removeItem(LS_USER);
  } catch {
    // ignore
  }
}
export function saveExtraUsers(list) {
  safeSet(LS_EXTRA, list);
}
export function saveOverrides(map) {
  safeSet(LS_OVERRIDES, map);
}

export function getAllUsers(extraUsers, overrides) {
  const applyOv = (x) => (overrides[x.u] ? { ...x, h: overrides[x.u] } : x);
  return USERS.map(applyOv).concat((extraUsers || []).map(applyOv));
}

export function initialsFromName(name) {
  const parts = name.split(/\s+/);
  const first = (parts[0] || "")[0] || "";
  const last = (parts[parts.length - 1] || "")[0] || "";
  return (first + last).toUpperCase() || "U";
}
