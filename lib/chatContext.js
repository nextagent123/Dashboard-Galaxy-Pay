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
  const takeRate = (dtAct / gmvAct) * 100;
  const gmvMonthly = gmvAct / N;
  const dtMonthly = dtAct / N;
  const lnMonthly = lnAct / N;

  const gmvBest = Math.max(...FALLBACK_ACT.gmv);
  const gmvWorst = Math.min(...FALLBACK_ACT.gmv);
  const gmvBestMonth = FALLBACK_ACT.gmv.indexOf(gmvBest) + 1;
  const gmvWorstMonth = FALLBACK_ACT.gmv.indexOf(gmvWorst) + 1;

  const khoiGmvAct = sum(KHOI.gmv.act);
  const khoiGmvPlan = sum(KHOI.gmv.plan.slice(0, KHOI.gmv.act.length));
  const khoiDtAct = sum(KHOI.dt.act);
  const khoiDtPlan = sum(KHOI.dt.plan.slice(0, KHOI.dt.act.length));
  const khoiLnAct = sum(KHOI.ln.act);
  const khoiLnPlan = sum(KHOI.ln.plan.slice(0, KHOI.ln.act.length));

  const momGmv = FALLBACK_ACT.gmv.map((v, i) =>
    i === 0 ? "N/A" : `${((v - FALLBACK_ACT.gmv[i - 1]) / FALLBACK_ACT.gmv[i - 1] * 100).toFixed(1)}%`
  );

  return `
GALAXY PAY - BÁO CÁO KHỐI KINH DOANH 2026
Dữ liệu cập nhật đến tháng ${N}/2026 (${N} tháng đầu năm)

=== TỔNG QUAN NHANH ===
- GMV lũy kế: ${vn(gmvAct, 1)} tỷ VND → đạt ${vn(gmvAct / gmvH1Tgt * 100, 1)}% H1, ${vn(gmvAct / gmvTgt * 100, 1)}% năm
- Doanh thu lũy kế: ${vn(dtAct, 1)} tỷ VND → đạt ${vn(dtAct / dtH1Tgt * 100, 1)}% H1, ${vn(dtAct / dtTgt * 100, 1)}% năm
- Lợi nhuận lũy kế: ${vn(lnAct, 1)} tỷ VND → đạt ${vn(lnAct / lnH1Tgt * 100, 1)}% H1, ${vn(lnAct / lnTgt * 100, 1)}% năm
- Biên lợi nhuận gộp: ${vn(margin, 1)}%
- Take rate (DT/GMV): ${vn(takeRate, 2)}%
- GMV trung bình/tháng: ${vn(gmvMonthly, 1)} tỷ
- Tháng GMV cao nhất: T${gmvBestMonth} (${vn(gmvBest, 1)} tỷ)
- Tháng GMV thấp nhất: T${gmvWorstMonth} (${vn(gmvWorst, 1)} tỷ)

=== DỰ BÁO RUNRATE CUỐI NĂM (dựa trên ${N} tháng) ===
- GMV dự kiến: ${vn(gmvMonthly * 12, 1)} tỷ (${vn(gmvMonthly * 12 / gmvTgt * 100, 1)}% target năm ${vn(gmvTgt, 1)} tỷ)
- Doanh thu dự kiến: ${vn(dtMonthly * 12, 1)} tỷ (${vn(dtMonthly * 12 / dtTgt * 100, 1)}% target năm ${vn(dtTgt, 1)} tỷ)
- Lợi nhuận dự kiến: ${vn(lnMonthly * 12, 1)} tỷ (${vn(lnMonthly * 12 / lnTgt * 100, 1)}% target năm ${vn(lnTgt, 1)} tỷ)

=== GMV THEO THÁNG (tỷ VND) ===
${FALLBACK_ACT.gmv.map((v, i) => `T${i + 1}: Thực ${vn(v, 1)} / KH ${vn(FALLBACK_TGT.gmv[i], 1)} (${vn(v / FALLBACK_TGT.gmv[i] * 100, 0)}%) | MoM: ${momGmv[i]}`).join("\n")}

=== DOANH THU THEO THÁNG (tỷ VND) ===
${FALLBACK_ACT.dt.map((v, i) => `T${i + 1}: Thực ${vn(v, 1)} / KH ${vn(FALLBACK_TGT.dt[i], 1)} (${vn(v / FALLBACK_TGT.dt[i] * 100, 0)}%)`).join("\n")}

=== LỢI NHUẬN THEO THÁNG (tỷ VND) ===
${FALLBACK_ACT.ln.map((v, i) => {
    const m = (v / FALLBACK_ACT.dt[i] * 100);
    return `T${i + 1}: Thực ${vn(v, 1)} / KH ${vn(FALLBACK_TGT.ln[i], 1)} (${vn(v / FALLBACK_TGT.ln[i] * 100, 0)}%) | Biên LN: ${vn(m, 1)}%`;
  }).join("\n")}

=== TARGET NĂM & H1 (tỷ VND) ===
- GMV: Target năm ${vn(gmvTgt, 1)} | Target H1 ${vn(gmvH1Tgt, 1)} | Gap còn thiếu H2: ${vn(gmvTgt - gmvAct, 1)}
- Doanh thu: Target năm ${vn(dtTgt, 1)} | Target H1 ${vn(dtH1Tgt, 1)} | Gap còn thiếu H2: ${vn(dtTgt - dtAct, 1)}
- Lợi nhuận: Target năm ${vn(lnTgt, 1)} | Target H1 ${vn(lnH1Tgt, 1)} | Gap còn thiếu H2: ${vn(lnTgt - lnAct, 1)}

=== KPI KHỐI KINH DOANH (Lũy kế ${KHOI.gmv.act.length} tháng) ===
- GMV Khối: Thực ${vn(khoiGmvAct, 1)} / KH ${vn(khoiGmvPlan, 1)} tỷ (${vn(khoiGmvAct / khoiGmvPlan * 100, 1)}%)
- DT Khối: Thực ${vn(khoiDtAct, 1)} / KH ${vn(khoiDtPlan, 1)} tỷ (${vn(khoiDtAct / khoiDtPlan * 100, 1)}%)
- LN Khối: Thực ${vn(khoiLnAct, 1)} / KH ${vn(khoiLnPlan, 1)} tỷ (${vn(khoiLnAct / khoiLnPlan * 100, 1)}%)

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
- GMV (Gross Merchandise Value): Tổng giá trị giao dịch qua hệ thống Galaxy Pay
- DT (Doanh thu / Revenue): Thu nhập thực tế từ phí dịch vụ (MDR, phí XLGD...)
- LN (Lợi nhuận gộp / Gross Profit): Doanh thu trừ chi phí trực tiếp (phí đầu vào trả cho ngân hàng, ví...)
- Biên LN gộp: LN / DT × 100% — thể hiện hiệu quả kinh doanh
- Take rate: DT / GMV × 100% — tỷ lệ doanh thu trên tổng giá trị giao dịch
- MoM (Month-over-Month): Tăng trưởng so với tháng trước
- Runrate: Ước đạt cuối năm = (lũy kế / số tháng) × 12
- H1: Nửa đầu năm (T1-T6), H2: Nửa cuối năm (T7-T12)
- KH (Kế hoạch): Target / mục tiêu đề ra
- Gap: Chênh lệch giữa thực đạt và kế hoạch
- MDR (Merchant Discount Rate): Phí chiết khấu merchant
- GTGD / SLGD: Giá trị / Số lượng giao dịch
- BDM: Business Development Manager
- CTV: Cộng tác viên
- KHCN / KHDN: Khách hàng Cá nhân / Doanh nghiệp
- PSP: Payment Service Provider
- OTA: Online Travel Agent
`.trim();
}
