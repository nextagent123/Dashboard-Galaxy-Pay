import {
  FALLBACK_TGT,
  FALLBACK_ACT,
  COMPANY,
  KHOI,
} from "./data";

const sum = (arr) => arr.reduce((s, v) => s + (v || 0), 0);
const vn = (v, d = 1) => v.toLocaleString("vi-VN", { minimumFractionDigits: d, maximumFractionDigits: d });

export function buildDashboardContext() {
  const N = FALLBACK_ACT.gmv.length;

  const gmvAct = sum(FALLBACK_ACT.gmv);
  const gmvTgt = sum(FALLBACK_TGT.gmv);
  const dtAct = sum(FALLBACK_ACT.dt);
  const dtTgt = sum(FALLBACK_TGT.dt);
  const lnAct = sum(FALLBACK_ACT.ln);
  const lnTgt = sum(FALLBACK_TGT.ln);

  const gmvH1Tgt = sum(FALLBACK_TGT.gmv.slice(0, 6));
  const dtH1Tgt = sum(FALLBACK_TGT.dt.slice(0, 6));
  const lnH1Tgt = sum(FALLBACK_TGT.ln.slice(0, 6));

  const margin = (lnAct / dtAct) * 100;

  const khoiGmvAct = sum(KHOI.gmv.act);
  const khoiGmvPlan = sum(KHOI.gmv.plan.slice(0, KHOI.gmv.act.length));
  const khoiDtAct = sum(KHOI.dt.act);
  const khoiDtPlan = sum(KHOI.dt.plan.slice(0, KHOI.dt.act.length));
  const khoiLnAct = sum(KHOI.ln.act);
  const khoiLnPlan = sum(KHOI.ln.plan.slice(0, KHOI.ln.act.length));

  return `
GALAXY PAY - BÁO CÁO KHỐI KINH DOANH 2026
Dữ liệu cập nhật đến tháng ${N}/2026 (6 tháng đầu năm)

=== CHỈ SỐ TRANG CHỦ (Lũy kế T1-T${N}) ===
- GMV thực đạt: ${vn(gmvAct, 1)} tỷ VND / Target năm: ${vn(gmvTgt, 1)} tỷ (đạt ${vn(gmvAct / gmvTgt * 100, 1)}%)
- GMV Target H1: ${vn(gmvH1Tgt, 1)} tỷ → đạt ${vn(gmvAct / gmvH1Tgt * 100, 1)}% H1
- Doanh thu thực đạt: ${vn(dtAct, 1)} tỷ VND / Target năm: ${vn(dtTgt, 1)} tỷ (đạt ${vn(dtAct / dtTgt * 100, 1)}%)
- Doanh thu Target H1: ${vn(dtH1Tgt, 1)} tỷ → đạt ${vn(dtAct / dtH1Tgt * 100, 1)}% H1
- Lợi nhuận thực đạt: ${vn(lnAct, 1)} tỷ VND / Target năm: ${vn(lnTgt, 1)} tỷ (đạt ${vn(lnAct / lnTgt * 100, 1)}%)
- Lợi nhuận Target H1: ${vn(lnH1Tgt, 1)} tỷ → đạt ${vn(lnAct / lnH1Tgt * 100, 1)}% H1
- Biên lợi nhuận gộp: ${vn(margin, 1)}%

=== GMV THEO THÁNG (tỷ VND) ===
${FALLBACK_ACT.gmv.map((v, i) => `T${i + 1}: Thực đạt ${vn(v, 1)} / KH ${vn(FALLBACK_TGT.gmv[i], 1)} (${vn(v / FALLBACK_TGT.gmv[i] * 100, 0)}%)`).join("\n")}

=== DOANH THU THEO THÁNG (tỷ VND) ===
${FALLBACK_ACT.dt.map((v, i) => `T${i + 1}: Thực đạt ${vn(v, 1)} / KH ${vn(FALLBACK_TGT.dt[i], 1)} (${vn(v / FALLBACK_TGT.dt[i] * 100, 0)}%)`).join("\n")}

=== LỢI NHUẬN THEO THÁNG (tỷ VND) ===
${FALLBACK_ACT.ln.map((v, i) => `T${i + 1}: Thực đạt ${vn(v, 1)} / KH ${vn(FALLBACK_TGT.ln[i], 1)} (${vn(v / FALLBACK_TGT.ln[i] * 100, 0)}%)`).join("\n")}

=== KPI KHỐI KINH DOANH (Lũy kế ${KHOI.gmv.act.length} tháng) ===
- GMV Khối: Thực đạt ${vn(khoiGmvAct, 1)} / KH ${vn(khoiGmvPlan, 1)} tỷ (${vn(khoiGmvAct / khoiGmvPlan * 100, 1)}%)
- Doanh thu Khối: Thực đạt ${vn(khoiDtAct, 1)} / KH ${vn(khoiDtPlan, 1)} tỷ (${vn(khoiDtAct / khoiDtPlan * 100, 1)}%)
- Lợi nhuận Khối: Thực đạt ${vn(khoiLnAct, 1)} / KH ${vn(khoiLnPlan, 1)} tỷ (${vn(khoiLnAct / khoiLnPlan * 100, 1)}%)

=== KPI COMPANY (Kế hoạch toàn công ty 12 tháng, tỷ VND) ===
- GMV Company: ${vn(sum(COMPANY.gmv.data), 1)} tỷ
- Doanh thu Company: ${vn(sum(COMPANY.dt.data), 1)} tỷ
- Lợi nhuận Company: ${vn(sum(COMPANY.ln.data), 1)} tỷ

=== CÁC PHÂN HỆ BÁO CÁO ===
- KPI Company: Chỉ tiêu toàn công ty
- KPI Khối: Chỉ tiêu theo khối kinh doanh
- KPI Cá nhân: KPI từng BDM (Business Development Manager)
- Sale Pipeline: Cơ hội kinh doanh & dự báo doanh thu
- Quản lý Kênh bán: Đóng góp KHCN & KHDN
- Quản lý CTV: Hiệu quả cộng tác viên giới thiệu
- Tổng quan PSP: Payment Service Provider
- Luồng đối tác & hợp đồng
- Báo cáo Sản phẩm: GTGD & SLGD theo sản phẩm
- Dịch vụ OTA: Vé máy bay & du lịch
- Dịch vụ BHXH: Bảo hiểm xã hội
- Dịch vụ Loa thanh toán: Thiết bị loa thanh toán

=== GIẢI THÍCH THUẬT NGỮ ===
- GMV (Gross Merchandise Value): Tổng giá trị giao dịch
- DT (Doanh thu / Revenue): Thu nhập thực tế từ phí dịch vụ
- LN (Lợi nhuận gộp / Gross Profit): Doanh thu trừ chi phí trực tiếp
- H1: Nửa đầu năm (T1-T6), H2: Nửa cuối năm (T7-T12)
- KH (Kế hoạch): Target / mục tiêu đề ra
- GTGD: Giá trị giao dịch
- SLGD: Số lượng giao dịch
- BDM: Business Development Manager
- CTV: Cộng tác viên
- KHCN: Khách hàng cá nhân
- KHDN: Khách hàng doanh nghiệp
- PSP: Payment Service Provider
- OTA: Online Travel Agent
- BHXH: Bảo hiểm xã hội
- Runrate: Tốc độ chạy dự kiến (ước đạt cuối năm dựa trên kết quả hiện tại)
`.trim();
}
