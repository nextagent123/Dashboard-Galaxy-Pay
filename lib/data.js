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

// ---- Trang chủ: Target (kế hoạch 12 tháng) vs Actual (thực đạt T1-T7) ----
// Nguồn: sheet "KPI Khối Kinh doanh" - Dashboard Source (cập nhật đến 05/08/2026)
export const FALLBACK_TGT = {
  gmv: [1477.4, 1605.2, 1693.7, 1582.9, 1596.3, 1646.7, 2321.5, 2222.3, 2122.2, 2232.1, 2313.7, 2379.4],
  dt: [21.481, 23.696, 25.126, 26.522, 26.481, 27.586, 31.743, 30.203, 28.461, 33.519, 35.249, 35.131],
  ln: [5.641, 6.087, 6.465, 6.02, 5.865, 6.184, 6.459, 6.136, 5.689, 6.011, 6.497, 6.467],
};
export const FALLBACK_ACT = {
  gmv: [1600.5, 1235, 1677, 1218.5, 1324.6, 1591, 1357],
  dt: [21.82, 17.23, 21.49, 15.51, 17.35, 21.002, 20.022],
  ln: [5.52, 4.46, 6.0, 4.09, 4.9, 6.750, 5.711],
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
    data: [1477.4, 1605.2, 1693.7, 1582.9, 1596.3, 1646.7, 2321.5, 2222.3, 2122.2, 2232.1, 2313.7, 2379.4],
  },
  dt: {
    name: "Doanh thu",
    unit: "tỷ VND",
    color: "#34d399",
    accent: "#6ee7b7",
    peak: "linear-gradient(180deg,#6ee7b7,#34d399)",
    norm: "linear-gradient(180deg,rgba(52,211,153,0.55),rgba(52,211,153,0.25))",
    data: [21.481, 23.696, 25.126, 26.522, 26.481, 27.586, 31.743, 30.203, 28.461, 33.519, 35.249, 35.131],
  },
  ln: {
    name: "Lợi nhuận",
    unit: "tỷ VND",
    color: "#f59e0b",
    accent: "#fcd34d",
    peak: "linear-gradient(180deg,#fcd34d,#f59e0b)",
    norm: "linear-gradient(180deg,rgba(251,191,36,0.55),rgba(251,191,36,0.22))",
    data: [5.641, 6.087, 6.465, 6.02, 5.865, 6.184, 6.459, 6.136, 5.689, 6.011, 6.497, 6.467],
  },
};

// ---- KPI Khối Kinh doanh (Sheet 2) — Thực đạt vs Kế hoạch theo tháng ----
export const KHOI = {
  gmv: {
    name: "GMV",
    unit: "tỷ VND",
    plan: [1477.4, 1605.2, 1693.7, 1582.9, 1596.3, 1646.7, 2321.5, 2222.3, 2122.2, 2232.1, 2313.7, 2379.4],
    act: [1600.539, 1235, 1677, 1218.504, 1324.598, 1591, 1356.553],
    peak: "linear-gradient(180deg,#b98cff,#7c6cff)",
    accent: "#c3b9ff",
  },
  dt: {
    name: "Doanh thu",
    unit: "tỷ VND",
    plan: [21.481, 23.696, 25.126, 26.522, 26.481, 27.586, 31.743, 30.203, 28.461, 33.519, 35.249, 35.131],
    act: [21.817, 17.233, 21.494, 15.514, 17.351, 21.002, 20.022],
    peak: "linear-gradient(180deg,#6ee7b7,#34d399)",
    accent: "#6ee7b7",
  },
  ln: {
    name: "Lợi nhuận gộp",
    unit: "tỷ VND",
    plan: [5.641, 6.087, 6.465, 6.02, 5.865, 6.184, 6.459, 6.136, 5.689, 6.011, 6.497, 6.467],
    act: [5.519, 4.463, 5.996, 4.091, 4.905, 6.750, 5.711],
    peak: "linear-gradient(180deg,#fcd34d,#f59e0b)",
    accent: "#fcd34d",
  },
  dv: {
    name: "ĐV CN Loa Thanh toán",
    unit: "đơn vị",
    plan: [120, 50, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
    act: [239, 123, 22, 7, 161, 2247, 103],
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
    runrate: 17000,
    actYTD: 10003,
    prevYear: 11330,
    monthsElapsed: 7,
    monthlyTargets: [1881.8, 1797.9, 2884.8, 1218.5, 1324.6, 1591, 1357],
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
    actYTD: 134.4,
    prevYear: 79,
    monthsElapsed: 7,
    monthlyTargets: [21.8, 17.2, 21.5, 15.5, 17.4, 21.0, 20.0],
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
    actYTD: 37.4,
    prevYear: 33.1,
    monthsElapsed: 7,
    monthlyTargets: [5.5, 4.5, 6.0, 4.1, 4.9, 6.75, 5.71],
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
    weeks: [["3/7–9/7", 9.126, 207], ["10/7–16/7", 8.471, 208], ["17/7–23/7", 6.969, 174], ["24/7–30/7", 8.490, 172], ["31/7–6/8", 7.959, 159]],
    months: [["T1", 27.157, 503], ["T2", 22.207, 440], ["T3", 43.816, 807], ["T4", 32.221, 658], ["T5", 30.502, 688], ["T6", 38.766, 869], ["T7", 40.468, 855]],
  },
  {
    key: "topuphd", code: "HD", name: "Dự án Topup HDB Centralize", accent: "#2f5bff",
    weeks: [["3/7–9/7", 86.446, 346], ["10/7–16/7", 89.729, 355], ["17/7–23/7", 88.080, 340], ["24/7–30/7", 60.324, 288], ["31/7–6/8", 61.253, 260]],
    months: [["T1", 400.309, 1582], ["T2", 275.406, 1183], ["T3", 397.887, 1754], ["T4", 365.297, 1533], ["T5", 371.552, 1666], ["T6", 426.566, 1710], ["T7", 356.036, 1474]],
  },
  {
    key: "fx", code: "FX", name: "Dự án Mua bán ngoại tệ", accent: "#0ea5e9",
    weeks: [["3/7–9/7", 0.789, 16], ["10/7–16/7", 0.188, 7], ["17/7–23/7", 0.180, 12], ["24/7–30/7", 0.325, 11], ["31/7–6/8", 0.843, 22]],
    months: [["T1", 35.243, 299], ["T2", 24.574, 211], ["T3", 66.921, 545], ["T4", 19.92, 262], ["T5", 4.575, 83], ["T6", 2.397, 68], ["T7", 2.299, 62]],
  },
  {
    key: "skypos", code: "SP", name: "Dự án SkyPOS", accent: "#f59e0b",
    weeks: [["3/7–9/7", 0.000489, 2], ["10/7–16/7", 0.001654, 2], ["17/7–23/7", 0.002671, 2], ["24/7–30/7", 0.000328, 1], ["31/7–6/8", 0.005794, 5]],
    months: [["T1", 0, 0], ["T2", 0.00005, 1], ["T3", 0.0001, 1], ["T4", 0, 0], ["T5", 0.00001, 1], ["T6", 0.023, 17], ["T7", 0.007, 9]],
  },
  {
    key: "softpos", code: "SF", name: "Dự án SoftPos by HDB", accent: "#22c55e",
    weeks: [["3/7–9/7", 0.100, 2], ["10/7–16/7", 0.065, 2], ["17/7–23/7", 0.031, 2], ["24/7–30/7", 0.405, 1], ["31/7–6/8", 0.105, 5]],
    months: [["T1", 0.347, 3], ["T2", 0.63, 7], ["T3", 0.685, 9], ["T4", 0.643, 5], ["T5", 0.733, 15], ["T6", 1.254, 16], ["T7", 0.701, 13]],
  },
  {
    key: "vjweb", code: "WB", name: "Dự án VJ WEB B2B", accent: "#ec4899",
    weeks: [["3/7–9/7", 0.052, 1], ["10/7–16/7", 0.379, 43], ["17/7–23/7", 0.065, 9], ["24/7–30/7", 0.031, 3], ["31/7–6/8", 0, 0]],
    months: [["T1", 0, 0], ["T2", 0, 0], ["T3", 0, 0], ["T4", 0, 0], ["T5", 0, 0], ["T6", 0.068, 3], ["T7", 0.526, 56]],
  },
  {
    key: "vjplink", code: "PL", name: "Dự án VJ Payment Link", accent: "#e11d48",
    weeks: [["3/7–9/7", 0.363, 145], ["10/7–16/7", 0.322, 168], ["17/7–23/7", 0.296, 153], ["24/7–30/7", 0.197, 96], ["31/7–6/8", 0.097, 64]],
    months: [["T1", 1.325, 821], ["T2", 1.135, 742], ["T3", 1.301, 708], ["T4", 0.67, 391], ["T5", 0.949, 438], ["T6", 1.303, 652], ["T7", 1.453, 623]],
  },
];

// ---- KPI cá nhân — nguồn sheet "KPI Theo BDM". GMV: tỷ VND, Rev/GP: triệu (trừ Hằng dùng tỷ) ----
export const KHOI_YTD = { gmv: 10002.87, rev: 134.43, gp: 37.43 }; // tỷ VND — lũy kế T1-T7/2026

function pad12(a) {
  const b = a.slice(0, 12);
  while (b.length < 12) b.push(null);
  return b;
}

export const BDM = [
  {
    name: "Bùi Lâm Sinh", role: "BDM · Phòng Kinh doanh", accent: "#7c6cff", short: "BLS",
    metrics: {
      gmv: { unit: "tỷ", kpi: pad12([4, 4, 4]), actual: pad12([2.91, 2.08, 1.68]) },
      rev: { unit: "tr", kpi: pad12([400, 400, 750]), actual: pad12([394, 52, 423]) },
      gp: { unit: "tr", kpi: pad12([300, 100, 531]), actual: pad12([256, 34, 262]) },
    },
  },
  {
    name: "Nguyễn Mạnh Tuấn", role: "BDM · Phòng Kinh doanh", accent: "#f59e0b", short: "NMT",
    metrics: {
      gmv: { unit: "tỷ", kpi: pad12([220, 280, 300, 8, 8, 8, 10, 10, 10, 10, 10, 10]), actual: pad12([9.48, 6.02, 23.17, 10.38, 14.17, 11.36, 15.70]) },
      rev: { unit: "tr", kpi: pad12([200, 200, 200, 1189, 859, 973, 1178, 1309, 1244, 1024, 1189, 1189]), actual: pad12([264, 163, 398, 778, 964, 1309, 971]) },
      gp: { unit: "tr", kpi: pad12([37, 50, 57, 625, 616, 585, 757, 821, 807, 639, 749, 750]), actual: pad12([48, 26, 95, 405, 474, 413, 505]) },
    },
  },
  {
    name: "Phan Thị Thúy Hằng", role: "BDM Senior · Phòng Kinh doanh", accent: "#34d399", short: "PTH",
    metrics: {
      gmv: { unit: "tỷ", kpi: pad12([1600, 1050, 1462, 1349, 1364, 1417, 2096, 1993, 1888, 2007, 2094, 2161]), actual: pad12([1588, 1226, 1653, 1208, 1310, 1579, 1341]) },
      rev: { unit: "tỷ", kpi: pad12([20.1, 22.4, 23.7, 24.9, 21.7, 22.6, 23.0, 21.4, 19.6, 21.5, 23.1, 23.0]), actual: pad12([21.2, 17.0, 20.7, 14.7, 16.4, 19.7, 19.1]) },
      gp: { unit: "tỷ", kpi: pad12([5.2, 4.5, 4.9, 4.5, 5.5, 5.6, 4.9, 6.0, 6.1, 6.4, 6.5, 6.7]), actual: pad12([5.2, 4.4, 5.6, 3.7, 4.4, 6.3, 5.2]) },
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

// ---- OTA — tổng quan theo tháng (toàn bộ đối tác, cả năm 2026) ----
// 4 số tổng (bookings/revenue) là số xác nhận chính xác do người dùng cung
// cấp. Không có bản gốc chính xác theo từng tháng (chỉ có ảnh chụp biểu đồ)
// — phân bổ theo tháng dưới đây được ước lượng từ tỷ lệ chiều cao cột/điểm
// trong ảnh, sau đó quy đổi (rescale) để tổng khớp đúng 4 số đã xác nhận.
// Cập nhật lại khi có số liệu gốc theo tháng chính xác hơn.
export const OTA_MONTHLY_OVERVIEW = {
  totalBookings: 519,
  successfulBookings: 519,
  cancelledBookings: 0,
  totalRevenue: 2017448165,
  monthly: [
    { label: "T1", bookings: 0, revenue: 0 },
    { label: "T2", bookings: 0, revenue: 0 },
    { label: "T3", bookings: 0, revenue: 0 },
    { label: "T4", bookings: 0, revenue: 0 },
    { label: "T5", bookings: 110, revenue: 572000000 },
    { label: "T6", bookings: 384, revenue: 1385448165 },
    { label: "T7", bookings: 25, revenue: 60000000 },
    { label: "T8", bookings: 0, revenue: 0 },
    { label: "T9", bookings: 0, revenue: 0 },
    { label: "T10", bookings: 0, revenue: 0 },
    { label: "T11", bookings: 0, revenue: 0 },
    { label: "T12", bookings: 0, revenue: 0 },
  ],
};

// ---- Báo cáo Dịch vụ Loa thanh toán — nguồn sheet "Báo cáo Loa Thanh toán" ----
// Mỗi dòng là 1 nguồn khai thác khách hàng (không phải đối tác/tháng như bản
// cũ). Số liệu VND nguyên (chưa VAT). status: "done" | "processing".
export const LOA_SOURCES = [
  { stt: 1, name: "Khách hàng doanh nghiệp", units: 1409, revenue: 882944444, cost: 662230000, commission: 119956500, grossProfit: 100757944, status: "done" },
  { stt: 2, name: "Khách hàng HKD - SBH", units: 58, revenue: 37055556, cost: 27260000, commission: 5899500, grossProfit: 3896056, status: "done" },
  { stt: 3, name: "Dự án Vikki Bank - Mobifone", units: 2000, revenue: 584133333, cost: 540910000, commission: 0, grossProfit: 43273333, status: "done" },
  { stt: 4, name: "Dự án sỉ KHDN", units: 4000, revenue: 1462964000, cost: 1320000000, commission: 0, grossProfit: 142964000, status: "processing" },
  { stt: 5, name: "Dự án sỉ KHCN", units: 3000, revenue: 730557000, cost: 694446000, commission: 0, grossProfit: 36111000, status: "processing" },
];

// ---- Báo cáo Quản lý Kênh bán — nguồn sheet "Kênh bán" (Bảng kê CTV.xlsx) ----
// Mỗi dòng là 1 khách hàng phát sinh doanh thu trong 1 tháng, gắn với kênh
// giới thiệu (KHCN = khách hàng cá nhân, KHDN = khách hàng doanh nghiệp).
// hoaHong: null nghĩa là ô gốc trong file Excel bị bỏ trống (không phải 0).
export const CHANNEL_SALES = [
  { kenh: "KHCN", thang: "5/2026", khachHang: "HDB Chi nhánh Tân Uyên", soLuong: 10, doanhThu: 6900000, chiPhi: 5076000, hoaHong: 1035000, loiNhuan: 789000 },
  { kenh: "KHCN", thang: "5/2026", khachHang: "HDB HỐ NAI", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "5/2026", khachHang: "HDB Phương Lâm", soLuong: 8, doanhThu: 5520000, chiPhi: 4060800, hoaHong: 828000, loiNhuan: 631200 },
  { kenh: "KHCN", thang: "5/2026", khachHang: "HDB Văn Lâm", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "5/2026", khachHang: "HKD HẢI NAM QUÁN", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "5/2026", khachHang: "HKD LÊ THỊ THANH HƯƠNG", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuan: 236700 },
  { kenh: "KHCN", thang: "5/2026", khachHang: "HKD TRẦN THỊ MỸ PHƯƠNG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "5/2026", khachHang: "HKD VỰA CÂY KIỂNG HOÀNG PHÁT", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "5/2026", khachHang: "MOMENTO", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "BÚN ỐC HÀ NỘI", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HDB AMANTA", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HDB BÌNH AN", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuan: 236700 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HDB BỒNG SƠN", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HDB ĐẠI TỪ", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuan: 157800 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HDB Phương Lâm", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuan: 157800 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HDB QUẢNG BÌNH", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuan: 236700 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HDB THỐNG NHẤT", soLuong: 5, doanhThu: 3450000, chiPhi: 2538000, hoaHong: 517500, loiNhuan: 394500 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HKD BÙI THỊ PHƯƠNG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HKD CƯỜNG THỊNH 2", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HKD ĐỖ THỊ SEN 1995", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HKD MÌ QUẢNG BÀ VUI", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HKD NGUYỄN HOÀNG VŨ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "HKD NGUYỄN THÚY LÊ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "MINH CHÂU PHARMA", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "Nguyễn Thị Minh Thư", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "QUÁN ĂN ỐC SỮA", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHCN", thang: "6/2026", khachHang: "Tiệm hoa tươi Bách Khoa", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "1/2026", khachHang: "HATO", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "1/2026", khachHang: "Mai Tiến Phát", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "1/2026", khachHang: "PLX Bắc Tây Ninh", soLuong: 118, doanhThu: 81420000, chiPhi: 59896800, hoaHong: 12213000, loiNhuan: 9310200 },
  { kenh: "KHDN", thang: "1/2026", khachHang: "PLX KONTUM", soLuong: 29, doanhThu: 20010000, chiPhi: 14720400, hoaHong: 3001500, loiNhuan: 2288100 },
  { kenh: "KHDN", thang: "1/2026", khachHang: "PLX QUẢNG NGÃI", soLuong: 37, doanhThu: 25530000, chiPhi: 18781200, hoaHong: 3829500, loiNhuan: 2919300 },
  { kenh: "KHDN", thang: "1/2026", khachHang: "PLX QUẢNG NINH", soLuong: 20, doanhThu: 13800000, chiPhi: 10152000, hoaHong: 2070000, loiNhuan: 1578000 },
  { kenh: "KHDN", thang: "1/2026", khachHang: "PLX THÁI BÌNH", soLuong: 34, doanhThu: 23460000, chiPhi: 17258400, hoaHong: 3519000, loiNhuan: 2682600 },
  { kenh: "KHDN", thang: "11/2025", khachHang: "MAXIDI", soLuong: 180, doanhThu: 105570000, chiPhi: 91368000, hoaHong: null, loiNhuan: 14202000 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "KATINAT", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX BÌNH DƯƠNG-SÀI GÒN", soLuong: 22, doanhThu: 15180000, chiPhi: 11167200, hoaHong: 2277000, loiNhuan: 1735800 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX CẦN THƠ", soLuong: 28, doanhThu: 19320000, chiPhi: 14212800, hoaHong: 2898000, loiNhuan: 2209200 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX HẬU GIANG", soLuong: 23, doanhThu: 15870000, chiPhi: 11674800, hoaHong: 2380500, loiNhuan: 1814700 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX HUẾ", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuan: 236700 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX HƯNG YÊN", soLuong: 45, doanhThu: 31050000, chiPhi: 22842000, hoaHong: 4657500, loiNhuan: 3550500 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX LẠNG SƠN", soLuong: 38, doanhThu: 26220000, chiPhi: 19288800, hoaHong: 3933000, loiNhuan: 2998200 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX NGHỆ AN", soLuong: 90, doanhThu: 62100000, chiPhi: 45684000, hoaHong: 9315000, loiNhuan: 7101000 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX QUẢNG NAM-ĐÀ NẴNG", soLuong: 47, doanhThu: 32430000, chiPhi: 23857200, hoaHong: 4864500, loiNhuan: 3708300 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX SÓC TRĂNG", soLuong: 40, doanhThu: 27600000, chiPhi: 20304000, hoaHong: 4140000, loiNhuan: 3156000 },
  { kenh: "KHDN", thang: "12/2025", khachHang: "PLX TÂY NINH", soLuong: 70, doanhThu: 48300000, chiPhi: 35532000, hoaHong: 7245000, loiNhuan: 5523000 },
  { kenh: "KHDN", thang: "2/2026", khachHang: "Chung Loan", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuan: 236700 },
  { kenh: "KHDN", thang: "2/2026", khachHang: "Hữu Hoàng Duyên", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "2/2026", khachHang: "PLX Đà Nẵng", soLuong: 29, doanhThu: 20010000, chiPhi: 14720400, hoaHong: 3001500, loiNhuan: 2288100 },
  { kenh: "KHDN", thang: "2/2026", khachHang: "PLX Thái Nguyên", soLuong: 86, doanhThu: 59340000, chiPhi: 43653600, hoaHong: 8901000, loiNhuan: 6785400 },
  { kenh: "KHDN", thang: "2/2026", khachHang: "Tuyết Thanh", soLuong: 4, doanhThu: 2760000, chiPhi: 2030400, hoaHong: 414000, loiNhuan: 315600 },
  { kenh: "KHDN", thang: "3/2026", khachHang: "BÁNH MÌ HỒNG CHÂU", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "3/2026", khachHang: "BÁNH MÌ HỒNG CHÂU 1", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "3/2026", khachHang: "BV PHƯƠNG NAM", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuan: 157800 },
  { kenh: "KHDN", thang: "3/2026", khachHang: "CÔNG TY TNHH CÔNG DANH", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "3/2026", khachHang: "DR. PHƯƠNG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "3/2026", khachHang: "Ô TÔ CÔNG THÀNH", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "3/2026", khachHang: "PLX QUẢNG NAM-ĐÀ NẴNG", soLuong: 5, doanhThu: 3450000, chiPhi: 2538000, hoaHong: 517500, loiNhuan: 394500 },
  { kenh: "KHDN", thang: "3/2026", khachHang: "PLX THANH HÓA", soLuong: 10, doanhThu: 6900000, chiPhi: 5076000, hoaHong: 1035000, loiNhuan: 789000 },
  { kenh: "KHDN", thang: "4/2026", khachHang: "DNTN THANH MAI", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "4/2026", khachHang: "HẢI SẢN THÀNH ĐẠT", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "4/2026", khachHang: "HỘ KINH DOANH NHÀ THUỐC BẢO NHI 2", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "4/2026", khachHang: "HỘ KINH DOANH QUÁN CÂY KHẾ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "4/2026", khachHang: "HỒNG TRÀ NGÔ GIA H072", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "4/2026", khachHang: "HỒNG TRÀ NGÔ GIA H163", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "4/2026", khachHang: "NHÀ SÁCH ÂU LẠC", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "A&B SÀI GÒN NHA TRANG", soLuong: 6, doanhThu: 4140000, chiPhi: 3045600, hoaHong: 621000, loiNhuan: 473400 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "BỆNH VIỆN CÔNG AN TỈNH PHÚ THỌ", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuan: 157800 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "CÔNG TY TNHH AIICAFE", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "CÔNG TY TNHH TUYẾT BEDDING", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "HKD XUÂN QUÝ 2", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "PLX ĐẮK NÔNG", soLuong: 33, doanhThu: 22770000, chiPhi: 16750800, hoaHong: 3415500, loiNhuan: 2603700 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "PLX ĐÔNG HÀ", soLuong: 40, doanhThu: 27600000, chiPhi: 20304000, hoaHong: 4140000, loiNhuan: 3156000 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "PLX QUẢNG NINH", soLuong: 35, doanhThu: 24150000, chiPhi: 17766000, hoaHong: 3622500, loiNhuan: 2761500 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "VĂN PHÒNG CÔNG CHỨNG BÌNH AN", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "5/2026", khachHang: "XĂNG DẦU TÍN PHONG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "CÔNG TY TNHH DU LỊCH THỦY CHÂU", soLuong: 4, doanhThu: 2760000, chiPhi: 2030400, hoaHong: 414000, loiNhuan: 315600 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "DNTN  KIM HỮU HUỆ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "DNTNH HV KIM THU DŨNG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "HDB QUẢNG NAM", soLuong: 13, doanhThu: 8970000, chiPhi: 6598800, hoaHong: 1345500, loiNhuan: 1025700 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "HDB SÀI GÒN", soLuong: 4, doanhThu: 2760000, chiPhi: 2030400, hoaHong: 414000, loiNhuan: 315600 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "HUY HIỆU", soLuong: 8, doanhThu: 5520000, chiPhi: 4060800, hoaHong: 828000, loiNhuan: 631200 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "LOVE VIETNAM 30", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "LUÂN MINH PHÁT", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "MAXIDI", soLuong: 1, doanhThu: 586500, chiPhi: 507600, hoaHong: null, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "PLX AN GIANG", soLuong: 52, doanhThu: 35880000, chiPhi: 26395200, hoaHong: 5382000, loiNhuan: 4102800 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "PLX BÌNH THUẬN", soLuong: 24, doanhThu: 16560000, chiPhi: 12182400, hoaHong: 2484000, loiNhuan: 1893600 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "PLX Đà Nẵng", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "PLX ĐÔNG HÀ", soLuong: 5, doanhThu: 3450000, chiPhi: 2538000, hoaHong: 517500, loiNhuan: 394500 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "PLX HÀ GIANG", soLuong: 34, doanhThu: 23460000, chiPhi: 17258400, hoaHong: 3519000, loiNhuan: 2682600 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "PLX KHÁNH HÒA", soLuong: 45, doanhThu: 31050000, chiPhi: 22842000, hoaHong: 4657500, loiNhuan: 3550500 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "PLX NINH THUẬN", soLuong: 28, doanhThu: 19320000, chiPhi: 14212800, hoaHong: 2898000, loiNhuan: 2209200 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "THACO AUTO ĐÀ NẴNG", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuan: 157800 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "TRUNG DŨNG PM", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuan: 157800 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "TRUNG TÂM GD MÔI TRƯỜNG VÀ DỊCH VỤ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "TRUNG TÂM Y TẾ KHU VỰC TÂN PHÚ", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuan: 236700 },
  { kenh: "KHDN", thang: "6/2026", khachHang: "VƯỜN QUỐC GIA CÁT TIÊN", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuan: 78900 },
];

// ---- Báo cáo Cộng tác viên (NVKD) — nguồn sheet "NVKD" (Bảng kê CTV.xlsx) ----
// Mỗi dòng là 1 khách hàng do 1 cộng tác viên (NVKD) giới thiệu, phát sinh
// doanh thu trong 1 tháng. hoaHong: null nghĩa là ô gốc bị bỏ trống.
export const NVKD_SALES = [
  { nvkd: "Bùi Khánh Linh", thang: "5/2026", khachHang: "HKD HẢI NAM QUÁN", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Bùi Khánh Linh", thang: "5/2026", khachHang: "HKD XUÂN QUÝ 2", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Bùi Khánh Linh", thang: "6/2026", khachHang: "HKD CƯỜNG THỊNH 2", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Cao Thúy Vi", thang: "6/2026", khachHang: "Nguyễn Thị Minh Thư", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Chương Gia Linh", thang: "6/2026", khachHang: "TRUNG TÂM Y TẾ KHU VỰC TÂN PHÚ", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuanGop: 236700 },
  { nvkd: "Chương Gia Linh", thang: "6/2026", khachHang: "VƯỜN QUỐC GIA CÁT TIÊN", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Đặng Thị Thu Hà", thang: "3/2026", khachHang: "BÁNH MÌ HỒNG CHÂU", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Đặng Thị Thu Hà", thang: "3/2026", khachHang: "BÁNH MÌ HỒNG CHÂU 1", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Đặng Thị Thu Hà", thang: "4/2026", khachHang: "HỒNG TRÀ NGÔ GIA H072", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Đặng Thị Thu Hà", thang: "4/2026", khachHang: "HỒNG TRÀ NGÔ GIA H163", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Đặng Thị Thu Hà", thang: "6/2026", khachHang: "BÚN ỐC HÀ NỘI", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Đỗ Thị Tĩnh", thang: "4/2026", khachHang: "HẢI SẢN THÀNH ĐẠT", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Đoàn Thị Thùy Dung", thang: "1/2026", khachHang: "Mai Tiến Phát", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Hoàng Ngọc Ánh", thang: "6/2026", khachHang: "Tiệm hoa tươi Bách Khoa", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Huỳnh Trần Ngọc Quí", thang: "5/2026", khachHang: "MOMENTO", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Lại Thị Thu", thang: "6/2026", khachHang: "HDB BÌNH AN", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuanGop: 236700 },
  { nvkd: "Lê Thị Xuân Thanh", thang: "5/2026", khachHang: "HDB HỐ NAI", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Lương Thị Diểm Đan", thang: "12/2025", khachHang: "KATINAT", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Lưu Đắc Hà Thành", thang: "5/2026", khachHang: "HKD LÊ THỊ THANH HƯƠNG", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuanGop: 236700 },
  { nvkd: "Lưu Đắc Hà Thành", thang: "5/2026", khachHang: "HKD TRẦN THỊ MỸ PHƯƠNG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Lưu Thị Hương Giang", thang: "12/2025", khachHang: "PLX CẦN THƠ", soLuong: 28, doanhThu: 19320000, chiPhi: 14212800, hoaHong: 2898000, loiNhuanGop: 2209200 },
  { nvkd: "Lưu Thị Hương Giang", thang: "3/2026", khachHang: "CÔNG TY TNHH CÔNG DANH", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Lưu Thị Hương Giang", thang: "3/2026", khachHang: "DR. PHƯƠNG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Mai Thị Thu Huyền", thang: "2/2026", khachHang: "Chung Loan", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuanGop: 236700 },
  { nvkd: "Nguyễn Duy Thanh", thang: "5/2026", khachHang: "VĂN PHÒNG CÔNG CHỨNG BÌNH AN", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Hoàng Long", thang: "5/2026", khachHang: "HDB Văn Lâm", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Hữu Nghi", thang: "4/2026", khachHang: "DNTN THANH MAI", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Khắc Khiêm", thang: "6/2026", khachHang: "HKD NGUYỄN HOÀNG VŨ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Phan Hoài Phú", thang: "5/2026", khachHang: "HDB Phương Lâm", soLuong: 8, doanhThu: 5520000, chiPhi: 4060800, hoaHong: 828000, loiNhuanGop: 631200 },
  { nvkd: "Nguyễn Phan Hoài Phú", thang: "6/2026", khachHang: "HDB Phương Lâm", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuanGop: 157800 },
  { nvkd: "Nguyễn Quỳnh Anh", thang: "6/2026", khachHang: "HKD ĐỖ THỊ SEN 1995", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Thái Phương Vi", thang: "1/2026", khachHang: "HATO", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Thanh Nhã", thang: "5/2026", khachHang: "XĂNG DẦU TÍN PHONG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Thị Mỹ Diễm", thang: "5/2026", khachHang: "HKD VỰA CÂY KIỂNG HOÀNG PHÁT", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Thị Ngọc Mai", thang: "12/2025", khachHang: "PLX HẬU GIANG", soLuong: 23, doanhThu: 15870000, chiPhi: 11674800, hoaHong: 2380500, loiNhuanGop: 1814700 },
  { nvkd: "Nguyễn Thị Phương Lan", thang: "5/2026", khachHang: "CÔNG TY TNHH TUYẾT BEDDING", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Thị Thanh Xuân", thang: "5/2026", khachHang: "CÔNG TY TNHH AIICAFE", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Thị Thùy Linh", thang: "6/2026", khachHang: "TRUNG TÂM GD MÔI TRƯỜNG VÀ DỊCH VỤ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Thu Hương", thang: "6/2026", khachHang: "HDB AMANTA", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Tuấn Hưng", thang: "6/2026", khachHang: "HKD BÙI THỊ PHƯƠNG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Phạm Phi Vũ", thang: "6/2026", khachHang: "HKD MÌ QUẢNG BÀ VUI", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Phạm Thị Diệu Huyền", thang: "6/2026", khachHang: "HDB QUẢNG BÌNH", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuanGop: 236700 },
  { nvkd: "Phạm Thị Kim Khánh", thang: "5/2026", khachHang: "A&B SÀI GÒN NHA TRANG", soLuong: 6, doanhThu: 4140000, chiPhi: 3045600, hoaHong: 621000, loiNhuanGop: 473400 },
  { nvkd: "Phạm Thị Thu Hà", thang: "12/2025", khachHang: "PLX HUẾ", soLuong: 3, doanhThu: 2070000, chiPhi: 1522800, hoaHong: 310500, loiNhuanGop: 236700 },
  { nvkd: "Phạm Trí Dũng", thang: "4/2026", khachHang: "NHÀ SÁCH ÂU LẠC", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Phan Trung Hiếu", thang: "6/2026", khachHang: "QUÁN ĂN ỐC SỮA", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Quách Tòng Vinh", thang: "12/2025", khachHang: "PLX SÓC TRĂNG", soLuong: 40, doanhThu: 27600000, chiPhi: 20304000, hoaHong: 4140000, loiNhuanGop: 3156000 },
  { nvkd: "Trần Hoàng Thạch", thang: "4/2026", khachHang: "HỘ KINH DOANH NHÀ THUỐC BẢO NHI 2", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Trần Hoàng Thạch", thang: "4/2026", khachHang: "HỘ KINH DOANH QUÁN CÂY KHẾ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Trần Thị Hồng", thang: "3/2026", khachHang: "BV PHƯƠNG NAM", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuanGop: 157800 },
  { nvkd: "Trang Thị Kim Lợi", thang: "6/2026", khachHang: "DNTN  KIM HỮU HUỆ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Trang Thị Kim Lợi", thang: "6/2026", khachHang: "DNTNH HV KIM THU DŨNG", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Trang Thị Kim Lợi", thang: "6/2026", khachHang: "HDB QUẢNG NAM", soLuong: 13, doanhThu: 8970000, chiPhi: 6598800, hoaHong: 1345500, loiNhuanGop: 1025700 },
  { nvkd: "Trương Công Hậu", thang: "1/2026", khachHang: "PLX Bắc Tây Ninh", soLuong: 118, doanhThu: 81420000, chiPhi: 59896800, hoaHong: 12213000, loiNhuanGop: 9310200 },
  { nvkd: "Trương Công Hậu", thang: "1/2026", khachHang: "PLX KONTUM", soLuong: 29, doanhThu: 20010000, chiPhi: 14720400, hoaHong: 3001500, loiNhuanGop: 2288100 },
  { nvkd: "Trương Công Hậu", thang: "1/2026", khachHang: "PLX QUẢNG NGÃI", soLuong: 37, doanhThu: 25530000, chiPhi: 18781200, hoaHong: 3829500, loiNhuanGop: 2919300 },
  { nvkd: "Trương Công Hậu", thang: "1/2026", khachHang: "PLX QUẢNG NINH", soLuong: 20, doanhThu: 13800000, chiPhi: 10152000, hoaHong: 2070000, loiNhuanGop: 1578000 },
  { nvkd: "Trương Công Hậu", thang: "1/2026", khachHang: "PLX THÁI BÌNH", soLuong: 34, doanhThu: 23460000, chiPhi: 17258400, hoaHong: 3519000, loiNhuanGop: 2682600 },
  { nvkd: "Trương Công Hậu", thang: "12/2025", khachHang: "PLX BÌNH DƯƠNG-SÀI GÒN", soLuong: 22, doanhThu: 15180000, chiPhi: 11167200, hoaHong: 2277000, loiNhuanGop: 1735800 },
  { nvkd: "Trương Công Hậu", thang: "12/2025", khachHang: "PLX HƯNG YÊN", soLuong: 45, doanhThu: 31050000, chiPhi: 22842000, hoaHong: 4657500, loiNhuanGop: 3550500 },
  { nvkd: "Trương Công Hậu", thang: "12/2025", khachHang: "PLX LẠNG SƠN", soLuong: 38, doanhThu: 26220000, chiPhi: 19288800, hoaHong: 3933000, loiNhuanGop: 2998200 },
  { nvkd: "Trương Công Hậu", thang: "12/2025", khachHang: "PLX NGHỆ AN", soLuong: 90, doanhThu: 62100000, chiPhi: 45684000, hoaHong: 9315000, loiNhuanGop: 7101000 },
  { nvkd: "Trương Công Hậu", thang: "12/2025", khachHang: "PLX QUẢNG NAM-ĐÀ NẴNG", soLuong: 47, doanhThu: 32430000, chiPhi: 23857200, hoaHong: 4864500, loiNhuanGop: 3708300 },
  { nvkd: "Trương Công Hậu", thang: "12/2025", khachHang: "PLX TÂY NINH", soLuong: 70, doanhThu: 48300000, chiPhi: 35532000, hoaHong: 7245000, loiNhuanGop: 5523000 },
  { nvkd: "Trương Công Hậu", thang: "2/2026", khachHang: "Hữu Hoàng Duyên", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Trương Công Hậu", thang: "2/2026", khachHang: "PLX Đà Nẵng", soLuong: 29, doanhThu: 20010000, chiPhi: 14720400, hoaHong: 3001500, loiNhuanGop: 2288100 },
  { nvkd: "Trương Công Hậu", thang: "2/2026", khachHang: "PLX Thái Nguyên", soLuong: 86, doanhThu: 59340000, chiPhi: 43653600, hoaHong: 8901000, loiNhuanGop: 6785400 },
  { nvkd: "Trương Công Hậu", thang: "3/2026", khachHang: "PLX QUẢNG NAM", soLuong: 5, doanhThu: 3450000, chiPhi: 2538000, hoaHong: 517500, loiNhuanGop: 394500 },
  { nvkd: "Trương Công Hậu", thang: "3/2026", khachHang: "PLX THANH HÓA", soLuong: 10, doanhThu: 6900000, chiPhi: 5076000, hoaHong: 1035000, loiNhuanGop: 789000 },
  { nvkd: "Trương Công Hậu", thang: "5/2026", khachHang: "BỆNH VIỆN CÔNG AN TỈNH PHÚ THỌ", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuanGop: 157800 },
  { nvkd: "Trương Công Hậu", thang: "5/2026", khachHang: "PLX ĐẮK NÔNG", soLuong: 33, doanhThu: 22770000, chiPhi: 16750800, hoaHong: 3415500, loiNhuanGop: 2603700 },
  { nvkd: "Trương Công Hậu", thang: "5/2026", khachHang: "PLX ĐÔNG HÀ", soLuong: 40, doanhThu: 27600000, chiPhi: 20304000, hoaHong: 4140000, loiNhuanGop: 3156000 },
  { nvkd: "Trương Công Hậu", thang: "5/2026", khachHang: "PLX QUẢNG NINH", soLuong: 35, doanhThu: 24150000, chiPhi: 17766000, hoaHong: 3622500, loiNhuanGop: 2761500 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "HUY HIỆU", soLuong: 8, doanhThu: 5520000, chiPhi: 4060800, hoaHong: 828000, loiNhuanGop: 631200 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "PLX AN GIANG", soLuong: 52, doanhThu: 35880000, chiPhi: 26395200, hoaHong: 5382000, loiNhuanGop: 4102800 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "PLX BÌNH THUẬN", soLuong: 24, doanhThu: 16560000, chiPhi: 12182400, hoaHong: 2484000, loiNhuanGop: 1893600 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "PLX Đà Nẵng", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "PLX ĐÔNG HÀ", soLuong: 5, doanhThu: 3450000, chiPhi: 2538000, hoaHong: 517500, loiNhuanGop: 394500 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "PLX HÀ GIANG", soLuong: 34, doanhThu: 23460000, chiPhi: 17258400, hoaHong: 3519000, loiNhuanGop: 2682600 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "PLX KHÁNH HÒA", soLuong: 45, doanhThu: 31050000, chiPhi: 22842000, hoaHong: 4657500, loiNhuanGop: 3550500 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "PLX NINH THUẬN", soLuong: 28, doanhThu: 19320000, chiPhi: 14212800, hoaHong: 2898000, loiNhuanGop: 2209200 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "THACO AUTO ĐÀ NẴNG", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuanGop: 157800 },
  { nvkd: "Trương Công Hậu", thang: "6/2026", khachHang: "TRUNG DŨNG PM", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuanGop: 157800 },
  { nvkd: "Trương Thị Hải Châu", thang: "3/2026", khachHang: "Ô TÔ CÔNG THÀNH", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Võ Thị Uyên", thang: "6/2026", khachHang: "LOVE VIETNAM 30", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Vũ Ngọc Khả", thang: "2/2026", khachHang: "Tuyết Thanh", soLuong: 4, doanhThu: 2760000, chiPhi: 2030400, hoaHong: 414000, loiNhuanGop: 315600 },
  { nvkd: "Vũ Thị Nhung", thang: "6/2026", khachHang: "HDB ĐẠI TỪ", soLuong: 2, doanhThu: 1380000, chiPhi: 1015200, hoaHong: 207000, loiNhuanGop: 157800 },
  { nvkd: "Nguyễn Thị Hiền Trang", thang: "11/2025", khachHang: "MAXIDI", soLuong: 180, doanhThu: 105570000, chiPhi: 91368000, hoaHong: null, loiNhuanGop: 14202000 },
  { nvkd: "Nguyễn Thị Hiền Trang", thang: "6/2026", khachHang: "MAXIDI", soLuong: 1, doanhThu: 586500, chiPhi: 507600, hoaHong: null, loiNhuanGop: 78900 },
  { nvkd: "Nguyễn Thị Gái", thang: "6/2026", khachHang: "HKD NGUYỄN THÚY LÊ", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Phan Bích Ngọc", thang: "6/2026", khachHang: "CÔNG TY TNHH DU LỊCH THỦY CHÂU", soLuong: 4, doanhThu: 2760000, chiPhi: 2030400, hoaHong: 414000, loiNhuanGop: 315600 },
  { nvkd: "Hà Đức Sang", thang: "6/2026", khachHang: "MINH CHÂU PHARMA", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Võ Thị Phương Anh", thang: "6/2026", khachHang: "HDB THỐNG NHẤT", soLuong: 5, doanhThu: 3450000, chiPhi: 2538000, hoaHong: 517500, loiNhuanGop: 394500 },
  { nvkd: "Văn Hải Đăng", thang: "6/2026", khachHang: "LUÂN MINH PHÁT", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Hoàng Năng Đạt", thang: "6/2026", khachHang: "HDB SÀI GÒN", soLuong: 4, doanhThu: 2760000, chiPhi: 2030400, hoaHong: 414000, loiNhuanGop: 315600 },
  { nvkd: "Hoàng Thị Trà Mi", thang: "6/2026", khachHang: "HDB BỒNG SƠN", soLuong: 1, doanhThu: 690000, chiPhi: 507600, hoaHong: 103500, loiNhuanGop: 78900 },
  { nvkd: "Ngô Tấn Dự", thang: "5/2026", khachHang: "HDB Chi nhánh Tân Uyên", soLuong: 10, doanhThu: 6900000, chiPhi: 5076000, hoaHong: 1035000, loiNhuanGop: 789000 },
];

export const MONTHS_12 = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];

// ============================================================================
// BÁO CÁO P&L THEO NHÓM SẢN PHẨM — Cổng (UPC), Ví (E-Wallet), Dịch vụ khác
// Nguồn: Planning KPI + Chỉ số giao dịch PTTT + Báo cáo theo sản phẩm
// Đơn vị: tỷ VND. Dữ liệu T1–T7/2026.
// Cổng: Payment Gateway — Topup QR/HD, FX, VJ WEB/PLink (tổng hợp từ PRODUCTS)
// Ví: E-Wallet — derived = Company KPI − Cổng − Dịch vụ khác
// Dịch vụ khác: SoftPOS/POS + Loa thanh toán (Soundbox) + dịch vụ giá trị gia tăng
// ============================================================================
export const PNL_PRODUCTS = [
  {
    key: "cong",
    name: "Cổng thanh toán",
    shortName: "Cổng",
    accent: "#7c6cff",
    accentLight: "rgba(124,108,255,0.12)",
    description: "Payment Gateway — Topup QR/HD, Mua bán ngoại tệ, VJ WEB/Payment Link",
    monthly: {
      gmv:         [464.034, 323.322, 509.925, 418.108, 407.578, 469.100, 400.782],
      revenue:     [13.92,   9.70,    15.30,   12.54,   12.23,   14.07,   12.02],
      cogs:        [10.44,   7.27,    11.47,   9.41,    9.17,    10.55,   9.02],
      grossProfit: [3.48,    2.43,    3.83,    3.13,    3.06,    3.52,    3.00],
      opex:        [1.80,    1.80,    1.80,    1.80,    1.80,    1.80,    1.80],
      netProfit:   [1.68,    0.63,    2.03,    1.33,    1.26,    1.72,    1.20],
      merchants:   [45,      48,      52,      55,      58,      63,      68],
      transactions: [1324, 1183, 2062, 1311, 1210, 1612, 2415],
    },
    targets: { gmv: 8400, revenue: 252, grossProfit: 75.6, netProfit: 50.4 },
  },
  {
    key: "vi",
    name: "Ví điện tử",
    shortName: "Ví",
    accent: "#0ea5e9",
    accentLight: "rgba(14,165,233,0.12)",
    description: "E-Wallet — Ví điện tử Galaxy Pay, thanh toán di động, chuyển tiền",
    monthly: {
      gmv:         [1136.12, 911.05,  1166.39, 799.75,  916.29,  1120.62, 955.51],
      revenue:     [7.77,    7.35,    6.07,    2.87,    4.92,    6.56,    7.90],
      cogs:        [5.75,    5.36,    3.94,    1.94,    3.13,    3.42,    5.22],
      grossProfit: [2.01,    1.99,    2.13,    0.93,    1.79,    3.14,    2.68],
      opex:        [1.00,    1.00,    1.00,    1.00,    1.00,    1.00,    1.00],
      netProfit:   [1.01,    0.99,    1.13,    -0.07,   0.79,    2.14,    1.68],
      merchants:   [0,       0,       0,       0,       0,       0,       0],
      transactions: [0,      0,       0,       0,       0,       0,       0],
    },
    targets: { gmv: 15500, revenue: 71.5, grossProfit: 22.9, netProfit: 10.9 },
  },
  {
    key: "khac",
    name: "Dịch vụ khác",
    shortName: "Khác",
    accent: "#f59e0b",
    accentLight: "rgba(245,158,11,0.12)",
    description: "SoftPOS/POS, Loa thanh toán (Soundbox) và các dịch vụ giá trị gia tăng",
    monthly: {
      gmv:         [0.347,  0.630,  0.685,  0.643,  0.733,  1.277,  0.708],
      revenue:     [0.133,  0.180,  0.118,  0.102,  0.202,  0.377,  0.106],
      cogs:        [0.095,  0.125,  0.079,  0.069,  0.141,  0.263,  0.071],
      grossProfit: [0.027,  0.041,  0.036,  0.032,  0.049,  0.090,  0.035],
      opex:        [0.154,  0.154,  0.154,  0.154,  0.154,  0.154,  0.154],
      netProfit:   [-0.126, -0.112, -0.117, -0.121, -0.104, -0.063, -0.118],
      merchants:   [242,    130,    31,     12,     176,    2280,   140],
      transactions: [245,   134,    32,     14,     177,    2280,   125],
    },
    targets: { gmv: 120, revenue: 21.70, grossProfit: 5.73, netProfit: 2.09 },
    // Danh sách dịch vụ con — dùng cho chế độ xem chi tiết mở rộng
    subItems: [
      {
        key: "softpos", name: "SoftPOS / POS", accent: "#22c55e",
        description: "SoftPos by HDB, SkyPOS — thanh toán không tiếp xúc",
        monthly: {
          gmv:         [0.347,  0.630,  0.685,  0.643,  0.733,  1.277,  0.708],
          revenue:     [0.052,  0.095,  0.103,  0.096,  0.110,  0.192,  0.106],
          cogs:        [0.035,  0.063,  0.068,  0.064,  0.073,  0.127,  0.071],
          grossProfit: [0.017,  0.032,  0.035,  0.032,  0.037,  0.065,  0.035],
          opex:        [0.150,  0.150,  0.150,  0.150,  0.150,  0.150,  0.150],
          netProfit:   [-0.133, -0.118, -0.115, -0.118, -0.113, -0.085, -0.115],
          merchants:   [3,      7,      9,      5,      15,     33,     37],
          transactions: [6, 11, 10, 7, 16, 33, 22],
        },
        targets: { revenue: 18, grossProfit: 5.4, netProfit: 1.8 },
      },
      {
        key: "loa", name: "Loa thanh toán (Soundbox)", accent: "#f59e0b",
        description: "Thiết bị loa thông báo thanh toán — KHDN, KHCN, Vikki, SBH",
        monthly: {
          gmv:         [0,      0,      0,      0,      0,      0,      0],
          revenue:     [0.081,  0.085,  0.015,  0.006,  0.092,  0.185,  0],
          cogs:        [0.060,  0.062,  0.011,  0.005,  0.068,  0.136,  0],
          grossProfit: [0.010,  0.009,  0.001,  0.001,  0.012,  0.025,  0],
          opex:        [0.004,  0.004,  0.004,  0.004,  0.004,  0.004,  0.004],
          netProfit:   [0.007,  0.006,  -0.003, -0.003, 0.009,  0.022,  -0.004],
          merchants:   [239,    123,    22,     7,      161,    2247,   103],
          transactions: [239, 123, 22, 7, 161, 2247, 103],
        },
        targets: { revenue: 3.698, grossProfit: 0.327, netProfit: 0.285 },
      },
    ],
  },
];
