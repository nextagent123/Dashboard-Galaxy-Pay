import { supabase } from "./supabase";

export const MERCHANT_STATUSES = [
  { key: "moi_tao", label: "Mới tạo", color: "#94a3b8", step: 0 },
  { key: "da_khai_bao", label: "Đã khai báo", color: "#60a5fa", step: 1 },
  { key: "can_bo_sung", label: "Cần bổ sung", color: "#fbbf24", step: 2 },
  { key: "cho_duyet", label: "Chờ duyệt", color: "#c084fc", step: 3 },
  { key: "da_duyet", label: "Đã duyệt", color: "#34d399", step: 4 },
  { key: "tu_choi", label: "Từ chối", color: "#fb7185", step: -1 },
  { key: "da_sinh_hd", label: "Đã sinh HĐ", color: "#2dd4bf", step: 5 },
  { key: "da_ky", label: "Đã ký", color: "#a78bfa", step: 6 },
  { key: "hoat_dong", label: "Hoạt động", color: "#22c55e", step: 7 },
];

export const MERCHANT_ROLES = {
  merchant: "Merchant",
  sales: "Sales",
  sales_lead: "Sales Lead",
  risk: "Risk/Compliance",
  legal: "Legal",
  ops: "Operations",
  admin: "System Admin",
};

export function getStatusInfo(key) {
  return MERCHANT_STATUSES.find((s) => s.key === key) || MERCHANT_STATUSES[0];
}

export function canTransition(fromStatus, toStatus, role) {
  const transitions = {
    moi_tao: { da_khai_bao: ["merchant", "sales", "admin"] },
    da_khai_bao: {
      cho_duyet: ["sales", "sales_lead", "admin"],
      can_bo_sung: ["sales", "sales_lead", "risk", "admin"],
    },
    can_bo_sung: {
      da_khai_bao: ["merchant", "sales", "admin"],
    },
    cho_duyet: {
      da_duyet: ["risk", "sales_lead", "admin"],
      tu_choi: ["risk", "sales_lead", "admin"],
      can_bo_sung: ["risk", "sales_lead", "admin"],
    },
    da_duyet: {
      da_sinh_hd: ["legal", "ops", "admin"],
    },
    da_sinh_hd: {
      da_ky: ["legal", "ops", "admin"],
    },
    da_ky: {
      hoat_dong: ["ops", "admin"],
    },
    tu_choi: {
      moi_tao: ["sales", "admin"],
    },
  };
  const allowed = transitions[fromStatus]?.[toStatus];
  if (!allowed) return false;
  return allowed.includes(role) || allowed.includes("admin");
}

const TABLE = "merchant_onboarding";
const HISTORY_TABLE = "merchant_status_history";

export async function getMerchants(filters = {}) {
  if (!supabase) return [];
  let q = supabase.from(TABLE).select("*").order("created_at", { ascending: false });
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.sales_owner) q = q.eq("sales_owner", filters.sales_owner);
  if (filters.search) q = q.or(`company_name.ilike.%${filters.search}%,tax_id.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getMerchantById(id) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getMerchantByToken(token) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(TABLE).select("*").eq("form_token", token).single();
  if (error) return null;
  return data;
}

export async function createMerchant(merchant) {
  if (!supabase) throw new Error("Supabase chưa được cấu hình");
  const token = crypto.randomUUID();
  const record = {
    ...merchant,
    status: "moi_tao",
    form_token: token,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from(TABLE).insert(record).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMerchant(id, updates) {
  if (!supabase) throw new Error("Supabase chưa được cấu hình");
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMerchantStatus(id, newStatus, changedBy, note) {
  if (!supabase) throw new Error("Supabase chưa được cấu hình");
  const merchant = await getMerchantById(id);
  if (!merchant) throw new Error("Không tìm thấy merchant");

  const { error: histError } = await supabase.from(HISTORY_TABLE).insert({
    merchant_id: id,
    from_status: merchant.status,
    to_status: newStatus,
    changed_by: changedBy,
    note: note || "",
    changed_at: new Date().toISOString(),
  });
  if (histError) throw new Error(histError.message);

  return updateMerchant(id, { status: newStatus });
}

export async function getStatusHistory(merchantId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(HISTORY_TABLE)
    .select("*")
    .eq("merchant_id", merchantId)
    .order("changed_at", { ascending: true });
  if (error) return [];
  return data || [];
}
