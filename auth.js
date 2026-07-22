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
  { u: "anhvq", h: "01fc14329be86bb303fc5a8fa2d7c3646f287bbcf1bc2d8b9245390dcc7e3465", name: "Vũ Quốc Anh", role: "Giám đốc điều hành", ini: "VA" },
  { u: "kimanh", h: "01fc14329be86bb303fc5a8fa2d7c3646f287bbcf1bc2d8b9245390dcc7e3465", name: "Kim Anh", role: "Phó Giám đốc", ini: "KA" },
  { u: "sinh", h: "b3ff1ced7e84c1c0b402362bf543795e6a6183e913e0371fd6c74a9cef204c75", name: "Lâm Sinh", role: "BDM", ini: "LS" },
  { u: "hang", h: "7f359800c2bce7e8db0dab7ed412796ef4ea69d6958deacb3485a6ba66abe08e", name: "Thúy Hằng", role: "BDM", ini: "TH" },
  { u: "nhan", h: "78636122645372e229378e17c1a9f3a009a130db14a915762f03dd4a2a629057", name: "Anh Nhàn", role: "Admin", ini: "AN" },
  { u: "tuan", h: "dfc912ace02180097be0332a9f1478c7ad0573d3cb2ea6e480cf15f69e510d31", name: "Mạnh Tuấn", role: "BDM", ini: "MT" },
];
export const ADMIN_USERS = ["taicv", "diem", "nhan"];

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
