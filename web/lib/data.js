// ============================================================================
// Static datasets ported verbatim from the Galaxy Pay Dashboard prototype
// (project/Galaxy Pay Dashboard.dc.html). These were sourced from
// 2026_KPI_Monthly.xlsx / Dashboard Source - Khối Kinh doanh.xlsx.
//
// NOTE: this file is the seam to swap for a real API later — every page reads
// data through the functions in lib/metrics.js, which in turn only touch the
// constants below. Replacing these constants (or the functions that shape
// them) with a fetch() is the whole migration.
// ============================================================================

// ---- Trang chủ: Target (kế hoạch 12 tháng) vs Actual (thực đạt T1-T5) ----
// Nguồn: sheet "KPI Khối Kinh doanh" - Dashboard Source (cập nhật đến 30/06/2026)
export const FALLBACK_TGT = {
  gmv: [1477.4, 1605.2, 1693.7, 1582.9, 1596.3, 1646.7, 2321.5, 2222.3, 2122.2, 2232.1, 2313.7, 2379.4],
  dt: [19.6, 21.92, 23.16, 20.97, 21.21, 22.13, 22.59, 20.97, 19.34, 21.15, 22.62, 22.55],
  ln: [4.51, 5.05, 5.33, 4.83, 4.88, 5.1, 5.21, 4.83, 4.46, 4.87, 5.21, 5.19],
  cntt: [120, 50, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0],
};
export const FALLBACK_ACT = {
  gmv: [1600.5, 1797.9, 2884.8, 1218.5, 1324.6],
  dt: [21.82, 17.23, 21.49, 15.51, 17.35],
  ln: [5.52, 4.46, 6.0, 4.09, 4.9],
  cntt: [239, 123, 22, 7, 161],
};

export const MONTH_COLS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

// ---- KPI Company (Sheet 1 "Overall KPI Công ty") — kế hoạch toàn công ty ----
export const COMPANY = {
  gmv: {
    name: "GMV",
    unit: "tỷ VND",
    color: "#7c6cff",
    accent: "#c3b9ff",
    peak: "linear-gradient(180deg,#b98cff,#7c6cff)",
    norm: "linear-gradient(180deg,rgba(124,108,255,0.6),rgba(124,108,255,0.3))",
    data: [1537.5, 1672.8, 1765.7, 1653.1, 1667.7, 1721.1, 2400.5, 2296.8, 2191.8, 2310.8, 2397.5, 2464.8],
  },
  dt: {
    name: "Doanh thu",
    unit: "tỷ VND",
    color: "#34d399",
    accent: "#6ee7b7",
    peak: "linear-gradient(180deg,#6ee7b7,#34d399)",
    norm: "linear-gradient(180deg,rgba(52,211,153,0.55),rgba(52,211,153,0.25))",
    data: [57.8, 64.5, 68.2, 61.8, 62.6, 65.1, 66.1, 61.5, 56.4, 62.0, 66.4, 66.3],
  },
  ln: {
    name: "Lợi nhuận",
    unit: "tỷ VND",
    color: "#f59e0b",
    accent: "#fcd34d",
    peak: "linear-gradient(180deg,#fcd34d,#f59e0b)",
    norm: "linear-gradient(180deg,rgba(251,191,36,0.55),rgba(251,191,36,0.22))",
    data: [2.4, 3.1, 3.8, 8.3, 8.8, 9.3, 12.8, 12.9, 13.1, 16.6, 17.4, 19.1],
  },
};

// ---- KPI Khối Kinh doanh (Sheet 2) — Thực đạt vs Kế hoạch theo tháng ----
export const KHOI = {
  gmv: {
    name: "GMV",
    unit: "tỷ VND",
    plan: [1537.522, 1672.787, 1765.654, 1653.106, 1667.669, 1721.069, 2400.451, 2296.79, 2191.752, 2310.756, 2397.5, 2464.834],
    act: [1600.539, 1797.875, 2884.768, 1218.504, 1324.598],
    peak: "linear-gradient(180deg,#b98cff,#7c6cff)",
    accent: "#c3b9ff",
  },
  dt: {
    name: "Doanh thu",
    unit: "tỷ VND",
    plan: [21.481, 23.696, 25.126, 26.522, 26.481, 27.586, 31.743, 30.203, 28.461, 33.519, 35.249, 35.131],
    act: [21.817, 17.233, 21.494, 15.514, 17.351],
    peak: "linear-gradient(180deg,#6ee7b7,#34d399)",
    accent: "#6ee7b7",
  },
  ln: {
    name: "Lợi nhuận gộp",
    unit: "tỷ VND",
    plan: [5.641, 6.087, 6.465, 6.02, 5.865, 6.184, 6.459, 6.136, 5.689, 6.011, 6.497, 6.467],
    act: [5.519, 4.463, 5.996, 4.091, 4.905],
    peak: "linear-gradient(180deg,#fcd34d,#f59e0b)",
    accent: "#fcd34d",
  },
  dv: {
    name: "ĐV CNTT go-live",
    unit: "đơn vị",
    plan: [120, 50, 100, 100, 100, 0, 0, 0, 0, 0, 0, 0],
    act: [239, 123, 22, 7, 161],
    peak: "linear-gradient(180deg,#a78bff,#7c6cff)",
    accent: "#c3b9ff",
  },
};

// ---- Salepipeline — số liệu từ sheet "Pipeline" (Dashboard Source Khối KD) ----
export const PIPELINE_GROUPS = [
  {
    key: "gmv",
    label: "GMV",
    short: "GMV",
    unit: "Tỷ",
    color: "#7c6cff",
    barCol: "#7c6cff",
    zoneBg:
      "linear-gradient(135deg, rgba(124,108,255,0.18), rgba(124,108,255,0.03) 60%), radial-gradient(600px 300px at 100% 0%, rgba(124,108,255,0.12), transparent 60%)",
    zoneBorder: "rgba(124,108,255,0.35)",
    zoneTag: "CHIẾN LƯỢC TĂNG TRƯỞNG QUY MÔ",
    zoneNarrative:
      "Mở rộng volume qua các dự án Topup ngân hàng lớn — tập trung Miss Deadline & Risk trong Q3",
    target: 24080,
    runrate: 18000,
    actYTD: 8826,
    prevYear: 11330,
    monthsElapsed: 5,
    monthlyTargets: [1600.5, 1797.9, 2884.8, 1218.5, 1324.6],
    desc: "Chiến lược chỉ tiêu GMV — Topup ngân hàng & Payment Hub Vikki",
    featured: [
      { title: "Dự án Topup VCB & BIDV, MB", kind: "Quy mô tiềm năng", value: 9000, valStr: "~9.000 Tỷ" },
      { title: "Payment Hub Vikki & bán chéo HDFG", kind: "Quy mô đóng góp", value: 1000, valStr: "~1.000 Tỷ" },
    ],
    projects: [
      { name: "Dự án Topup VCB", target: 3900, goLive: "06/2026", status: "Miss Deadline", note: "Đã quá deadline T6 — cần đẩy sớm hoàn tất tích hợp & đưa vào production" },
      { name: "Dự án Topup MB", target: 1920, goLive: "08/2026", status: "Risk", note: "Có rủi ro trượt deadline T8 — cần kiểm soát tiến độ & hạn chế phụ thuộc phía MB" },
      { name: "Dự án Topup BIDV", target: 260, goLive: "09/2026", status: "On Processing", note: "Đang triển khai theo tiến độ, target đưa lên production T9" },
      { name: "Dự án Topup Vietinbank", target: 2, goLive: "09/2026", status: "On Processing", note: "Giai đoạn đầu triển khai, mục tiêu doanh số nhỏ trong 2026" },
      { name: "Dự án Payment Hub VikkiBank", target: 1000, goLive: "08/2026", status: "Risk", note: "Có rủi ro deadline T8 — cần đẩy nhanh phase 1 & phối hợp Vikki xử lý blocker" },
    ],
  },
  {
    key: "dt",
    label: "Doanh thu",
    short: "REV",
    unit: "Tỷ",
    color: "#34d399",
    barCol: "#34d399",
    zoneBg:
      "linear-gradient(135deg, rgba(52,211,153,0.16), rgba(52,211,153,0.03) 60%), radial-gradient(600px 300px at 100% 0%, rgba(52,211,153,0.10), transparent 60%)",
    zoneBorder: "rgba(52,211,153,0.32)",
    zoneTag: "CHIẾN LƯỢC MỞ RỘNG DOANH THU",
    zoneNarrative:
      "Đẩy nhanh Cybs & Payment Hub quốc tế — chốt các gói thầu HDFG, BHXH và OTA để nâng CR",
    target: 345,
    runrate: 240,
    actYTD: 93.4,
    prevYear: 79,
    monthsElapsed: 5,
    monthlyTargets: [21.8, 17.2, 21.5, 15.5, 17.4],
    desc: "Chiến lược doanh thu — Cybs, Payment Hub QT, gói thầu HDFG, BHXH, OTA",
    featured: [
      { title: "Dự án Cybs — Cổng thanh toán quốc tế", kind: "Quy mô tiềm năng", value: 20, valStr: "~20 Tỷ" },
      { title: "Payment Hub Quốc tế (Smartro, Alipay, PayU…)", kind: "Quy mô đóng góp", value: 8.711, valStr: "~8,7 Tỷ" },
    ],
    projects: [
      { name: "Dự án Cybs", target: 20, goLive: "08/2026", status: "Risk", note: "Rủi ro trượt deadline T8 — cần chốt sớm ký kết Cybs Vietcombank & lên production T8" },
      { name: "Dự án Payment Hub (quốc tế)", target: 8.711, goLive: "08/2026", status: "Risk", note: "Rủi ro deadline T8 — nhiều đối tác (Smartro, Alipay, Azupay, PayU) cần đồng bộ" },
      { name: "Gói thầu thiết bị HDFG", target: 4.512, goLive: "09/2026", status: "On Processing", note: "Đang triển khai theo tiến độ, target chốt gói thầu T9" },
      { name: "Dự án BHXH", target: 2, goLive: "05/2026", status: "Miss Deadline", note: "Đã quá deadline T5 — cần rà soát nguyên nhân & lập lại roadmap" },
      { name: "Dự án OTA", target: 68, goLive: "05/2026", status: "On Processing", note: "Đã qua mốc T5 nhưng đang chạy tiếp — cần theo dõi doanh số & biên phí" },
    ],
  },
  {
    key: "ln",
    label: "Lợi nhuận gộp",
    short: "LN",
    unit: "Tỷ",
    color: "#f59e0b",
    barCol: "#fbbf24",
    zoneBg:
      "linear-gradient(135deg, rgba(251,191,36,0.16), rgba(251,191,36,0.03) 60%), radial-gradient(600px 300px at 100% 0%, rgba(251,191,36,0.10), transparent 60%)",
    zoneBorder: "rgba(251,191,36,0.32)",
    zoneTag: "CHIẾN LƯỢC BIÊN LỢI NHUẬN",
    zoneNarrative:
      "Nâng biên LN qua Payment Hub Vikki & gói thầu HDFG — kiểm soát chi phí và tối ưu deal cao biên",
    target: 74,
    runrate: 60,
    actYTD: 25.0,
    prevYear: 33.1,
    monthsElapsed: 5,
    monthlyTargets: [5.5, 4.5, 6.0, 4.1, 4.9],
    desc: "Chiến lược lợi nhuận — Payment Hub Vikki & gói thầu HDFG",
    featured: [
      { title: "Dự án Payment Hub VikkiBank", kind: "Quy mô tiềm năng", value: 12, valStr: "~12 Tỷ" },
      { title: "Dự án các gói thầu HDFG", kind: "Quy mô đóng góp", value: 0.5, valStr: "~0,5 Tỷ" },
    ],
    projects: [
      { name: "Dự án Payment Hub VikkiBank", target: 12, goLive: "09/2026", status: "Risk", note: "Rủi ro deadline T9 — cần đẩy nhanh phase 1 để đảm bảo biên LN kỳ vọng" },
      { name: "Dự án các gói thầu HDFG", target: 0.5, goLive: "08/2026", status: "On Processing", note: "Đang triển khai theo tiến độ, chốt gói thầu trong T8" },
    ],
  },
];

export const STATUS_COLORS = {
  "On Processing": "#34d399",
  Risk: "#fbbf24",
  "Miss Deadline": "#e11d48",
};

// ---- Báo cáo sản phẩm — nguồn sheet "Báo cáo theo sản phẩm" Dashboard Source ----
// GTGD lưu ở đây là tỷ VND; SLGD là số nguyên. weeks/months: [label, gtgd, slgd]
export const PRODUCTS = [
  {
    key: "topupqr", code: "QR", name: "Dự án Topup QR", accent: "#7c6cff",
    weeks: [["29/5–4/6", 9.432, 198], ["5/6–11/6", 8.867, 191], ["12/6–18/6", 10.066, 211], ["19/6–25/6", 7.944, 193], ["26/6–2/7", 8.432, 168]],
    months: [["T1", 27.157, 503], ["T2", 22.207, 440], ["T3", 43.816, 807], ["T4", 32.221, 658], ["T5", 30.502, 688], ["T6", 38.766, 869], ["T7", 3.19, 29]],
  },
  {
    key: "topuphd", code: "HD", name: "Dự án Topup HDB Centralize", accent: "#2f5bff",
    weeks: [["29/5–4/6", 107.924, 408], ["5/6–11/6", 97.884, 425], ["12/6–18/6", 107.495, 421], ["19/6–25/6", 84.88, 351], ["26/6–2/7", 71.456, 300]],
    months: [["T1", 400.309, 1582], ["T2", 275.406, 1183], ["T3", 397.887, 1754], ["T4", 365.297, 1533], ["T5", 371.552, 1666], ["T6", 426.566, 1710], ["T7", 10.911, 56]],
  },
  {
    key: "fx", code: "FX", name: "Dự án Mua bán ngoại tệ", accent: "#0ea5e9",
    weeks: [["29/5–4/6", 0.191, 17], ["5/6–11/6", 0.808, 20], ["12/6–18/6", 0.325, 9], ["19/6–25/6", 0.418, 15], ["26/6–2/7", 1.163, 21]],
    months: [["T1", 35.243, 299], ["T2", 24.574, 211], ["T3", 66.921, 545], ["T4", 19.92, 262], ["T5", 4.575, 83], ["T6", 2.397, 68], ["T7", 0.446, 8]],
  },
  {
    key: "skypos", code: "SP", name: "Dự án SkyPOS", accent: "#f59e0b",
    weeks: [["29/5–4/6", 0, 0], ["5/6–11/6", 0, 0], ["12/6–18/6", 0.0005, 3], ["19/6–25/6", 0.013, 10], ["26/6–2/7", 0.009, 4]],
    months: [["T1", 0, 0], ["T2", 0.00005, 1], ["T3", 0.0001, 1], ["T4", 0, 0], ["T5", 0.00001, 1], ["T6", 0.023, 17], ["T7", 0, 0]],
  },
  {
    key: "softpos", code: "SF", name: "Dự án SoftPos by HDB", accent: "#22c55e",
    weeks: [["29/5–4/6", 0.38, 0], ["5/6–11/6", 0, 0], ["12/6–18/6", 0.545, 3], ["19/6–25/6", 0.041, 10], ["26/6–2/7", 0.498, 4]],
    months: [["T1", 0.347, 3], ["T2", 0.63, 7], ["T3", 0.685, 9], ["T4", 0.643, 5], ["T5", 0.733, 15], ["T6", 1.254, 16], ["T7", 0, 0]],
  },
  {
    key: "vjweb", code: "WB", name: "Dự án VJ WEB B2B", accent: "#ec4899",
    weeks: [["29/5–4/6", 0, 0], ["5/6–11/6", 0.001, 1], ["12/6–18/6", 0.067, 2], ["19/6–25/6", 0, 0], ["26/6–2/7", 0, 0]],
    months: [["T1", 0, 0], ["T2", 0, 0], ["T3", 0, 0], ["T4", 0, 0], ["T5", 0, 0], ["T6", 0.068, 3], ["T7", 0, 0]],
  },
  {
    key: "vjplink", code: "PL", name: "Dự án VJ Payment Link", accent: "#e11d48",
    weeks: [["29/5–4/6", 0.255, 132], ["5/6–11/6", 0.233, 122], ["12/6–18/6", 0.284, 187], ["19/6–25/6", 0.343, 173], ["26/6–2/7", 0.384, 104]],
    months: [["T1", 1.325, 821], ["T2", 1.135, 742], ["T3", 1.301, 708], ["T4", 0.67, 391], ["T5", 0.949, 438], ["T6", 1.303, 652], ["T7", 0.12, 26]],
  },
];

// ---- KPI cá nhân — nguồn sheet "KPI Theo BDM". GMV: tỷ VND, Rev/GP: triệu (trừ Hằng dùng tỷ) ----
export const KHOI_YTD = { gmv: 10461, rev: 93.4, gp: 24.97 }; // tỷ VND

function pad12(a) {
  const b = a.slice(0, 12);
  while (b.length < 12) b.push(null);
  return b;
}

export const BDM = [
  {
    name: "Bùi Lâm Sinh", role: "BDM · Phòng Kinh doanh", accent: "#7c6cff", short: "BLS",
    metrics: {
      gmv: { unit: "tỷ", kpi: pad12([4, 4, 4]), actual: pad12([2.47, 2.08, 1.68]) },
      rev: { unit: "tr", kpi: pad12([400, 400, 750]), actual: pad12([394, 52, 423]) },
      gp: { unit: "tr", kpi: pad12([300, 100, 531]), actual: pad12([256, 34, 262]) },
    },
  },
  {
    name: "Nguyễn Mạnh Tuấn", role: "BDM · Phòng Kinh doanh", accent: "#f59e0b", short: "NMT",
    metrics: {
      gmv: { unit: "tỷ", kpi: pad12([220, 280, 300, 8, 8, 8, 10, 10, 10, 10, 10, 10]), actual: pad12([247, 569, 1231, 10, 14, 11]) },
      rev: { unit: "tr", kpi: pad12([200, 200, 200, 1189, 859, 973, 1178, 1309, 1244, 1024, 1189, 1189]), actual: pad12([264, 163, 398, 778, 857, 0]) },
      gp: { unit: "tr", kpi: pad12([37, 50, 57, 625, 616, 585, 757, 821, 807, 639, 749, 750]), actual: pad12([48, 26, 95, 404, 458, 0]) },
    },
  },
  {
    name: "Phan Thị Thúy Hằng", role: "BDM Senior · Phòng Kinh doanh", accent: "#34d399", short: "PTH",
    metrics: {
      gmv: { unit: "tỷ", kpi: pad12([1600, 1050, 1462, 1349, 1364, 1417, 2096, 1993, 1888, 2007, 2094, 2161]), actual: pad12([1351, 1226, 1653, 1208, 1310, 1579]) },
      rev: { unit: "tỷ", kpi: pad12([20.1, 22.4, 23.7, 24.9, 21.7, 22.6, 23.0, 21.4, 19.6, 21.5, 23.1, 23.0]), actual: pad12([21.2, 17.0, 20.7, 14.7, 16.5, 0]) },
      gp: { unit: "tỷ", kpi: pad12([5.2, 4.5, 4.9, 4.5, 5.5, 5.6, 4.9, 6.0, 6.1, 6.4, 6.5, 6.7]), actual: pad12([5.2, 4.4, 5.6, 3.7, 4.4, 0]) },
    },
  },
];

// ---- Báo cáo Dịch vụ OTA ----
// Nguồn: báo cáo "2.16.2 SALE REVENUE OTA" — hiện chỉ có 1 đối tác thật.
// 4 số tổng (bookings/revenue) là số xác nhận chính xác. Chi tiết theo ngày
// không có bản gốc chính xác (chỉ có ảnh biểu đồ) — các số dưới đây được
// quy đổi tỷ lệ từ ảnh biểu đồ sao cho tổng khớp đúng 4 số đã xác nhận
// (phương pháp làm tròn "phần dư lớn nhất"), KHÔNG phải số gốc chính xác
// từng ngày. Cập nhật lại khi có số liệu ngày chính xác hơn.
// Array (not a single object) so the page's partner/period filters have a
// real list to work from — currently 1 entry, add more as data arrives.
export const OTA_REPORTS = [
  {
    agent: "Zhengzhou Fly International Inc.",
    agentCode: "F2",
    periodKey: "2026-06-26_2026-07-02",
    periodLabel: "26/6 – 2/7/2026",
    totalBookings: 97,
    successfulBookings: 97,
    cancelledBookings: 0,
    totalRevenue: 311954598,
    daily: [
      { label: "26/6", bookings: 0, revenue: 5000000 },
      { label: "27/6", bookings: 8, revenue: 8000000 },
      { label: "28/6", bookings: 6, revenue: 26000000 },
      { label: "29/6", bookings: 20, revenue: 72000000 },
      { label: "30/6", bookings: 21, revenue: 84000000 },
      { label: "1/7", bookings: 5, revenue: 15000000 },
      { label: "2/7", bookings: 37, revenue: 102000000 },
    ],
  },
];

// ---- Báo cáo Dịch vụ Loa thanh toán ----
export const LOA_CUSTOMERS = [
  { name: "HDBank", color: "#e11d48", cust: [380, 420, 465, 510, 560, 610, 0, 0, 0, 0, 0, 0], loas: [420, 485, 540, 610, 680, 745, 0, 0, 0, 0, 0, 0], gtgd: [12.5, 14.8, 16.9, 19.2, 21.8, 24.1, 0, 0, 0, 0, 0, 0] },
  { name: "Vikki", color: "#7c6cff", cust: [220, 265, 310, 360, 410, 470, 0, 0, 0, 0, 0, 0], loas: [240, 300, 360, 420, 480, 555, 0, 0, 0, 0, 0, 0], gtgd: [6.2, 7.8, 9.1, 10.6, 12.4, 14.3, 0, 0, 0, 0, 0, 0] },
  { name: "F&B Chain (Highland+ETC)", color: "#f59e0b", cust: [85, 105, 120, 140, 155, 175, 0, 0, 0, 0, 0, 0], loas: [110, 140, 165, 190, 215, 245, 0, 0, 0, 0, 0, 0], gtgd: [2.1, 2.6, 3.0, 3.5, 4.0, 4.5, 0, 0, 0, 0, 0, 0] },
  { name: "Retail SMB", color: "#34d399", cust: [45, 58, 72, 88, 105, 125, 0, 0, 0, 0, 0, 0], loas: [45, 58, 72, 88, 105, 125, 0, 0, 0, 0, 0, 0], gtgd: [0.8, 1.1, 1.4, 1.7, 2.0, 2.4, 0, 0, 0, 0, 0, 0] },
];

export const MONTHS_12 = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
