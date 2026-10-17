import {
  getMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  updateMerchantStatus,
  getStatusHistory,
  canTransition,
} from "@/lib/merchantSchema";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const history = searchParams.get("history");
    const token = searchParams.get("token");

    if (token) {
      const { getMerchantByToken } = await import("@/lib/merchantSchema");
      const merchant = await getMerchantByToken(token);
      if (!merchant) return Response.json({ error: "Link không hợp lệ hoặc đã hết hạn" }, { status: 404 });
      return Response.json({ merchant });
    }

    if (id && history) {
      const data = await getStatusHistory(id);
      return Response.json({ history: data });
    }

    if (id) {
      const merchant = await getMerchantById(id);
      if (!merchant) return Response.json({ error: "Không tìm thấy" }, { status: 404 });
      return Response.json({ merchant });
    }

    const filters = {};
    const status = searchParams.get("status");
    const sales_owner = searchParams.get("sales_owner");
    const search = searchParams.get("search");
    if (status) filters.status = status;
    if (sales_owner) filters.sales_owner = sales_owner;
    if (search) filters.search = search;

    const merchants = await getMerchants(filters);
    return Response.json({ merchants });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const { company_name, tax_id, contact_name, contact_phone, contact_email, sales_owner, notes } = body;
      if (!company_name) return Response.json({ error: "Vui lòng nhập tên doanh nghiệp" }, { status: 400 });

      const merchant = await createMerchant({
        company_name,
        tax_id: tax_id || "",
        contact_name: contact_name || "",
        contact_phone: contact_phone || "",
        contact_email: contact_email || "",
        sales_owner: sales_owner || "",
        notes: notes || "",
        declaration_data: null,
        documents: null,
        risk_review: null,
        contract_data: null,
      });
      return Response.json({ ok: true, merchant });
    }

    if (action === "update") {
      const { id, ...updates } = body;
      delete updates.action;
      if (!id) return Response.json({ error: "Thiếu ID" }, { status: 400 });
      const merchant = await updateMerchant(id, updates);
      return Response.json({ ok: true, merchant });
    }

    if (action === "status") {
      const { id, new_status, changed_by, role, note } = body;
      if (!id || !new_status) return Response.json({ error: "Thiếu thông tin" }, { status: 400 });

      const current = await getMerchantById(id);
      if (!current) return Response.json({ error: "Không tìm thấy" }, { status: 404 });

      const userRole = role || "admin";
      if (!canTransition(current.status, new_status, userRole)) {
        return Response.json({ error: "Không được phép chuyển trạng thái này" }, { status: 403 });
      }

      const merchant = await updateMerchantStatus(id, new_status, changed_by || "system", note);
      return Response.json({ ok: true, merchant });
    }

    if (action === "submit_declaration") {
      const { token, declaration_data } = body;
      if (!token) return Response.json({ error: "Thiếu token" }, { status: 400 });

      const { getMerchantByToken } = await import("@/lib/merchantSchema");
      const merchant = await getMerchantByToken(token);
      if (!merchant) return Response.json({ error: "Link không hợp lệ" }, { status: 404 });
      if (merchant.status !== "moi_tao" && merchant.status !== "can_bo_sung") {
        return Response.json({ error: "Merchant đã hoàn tất khai báo" }, { status: 400 });
      }

      const updated = await updateMerchant(merchant.id, { declaration_data });
      await updateMerchantStatus(merchant.id, "da_khai_bao", "merchant", "Merchant đã khai báo thông tin");
      return Response.json({ ok: true, merchant: updated });
    }

    return Response.json({ error: "Action không hợp lệ" }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
