// Sidebar nav definition — icon path data (rendered by <Icon/>) ported from
// the original ico(paths) helper.
export const NAV_SECTIONS = [
  {
    header: "TỔNG QUAN",
    items: [
      { href: "/", label: "Trang chủ", icon: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h14V9.5"] },
    ],
  },
  {
    header: "KẾT QUẢ KPI",
    items: [
      { href: "/company", label: "KPI Company", icon: ["M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", "M16 8h2a2 2 0 0 1 2 2v11", "M8 7h2M8 11h2M8 15h2"] },
      { href: "/khoi", label: "KPI Khối", icon: ["M3 3v18h18", "M7 12v5M12 8v9M17 14v3"] },
      { href: "/kpi", label: "KPI Cá nhân", icon: ["M12 3 15 9l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"] },
    ],
  },
  {
    header: "QUẢN LÝ KINH DOANH",
    items: [
      { href: "/pipeline", label: "Báo cáo Sale Pipeline", icon: ["M3 5h18l-7 8v6l-4 2v-8L3 5Z"] },
      { href: "/kenh-ban", label: "Báo cáo Quản lý kênh bán", icon: ["M4 21V9l8-6 8 6v12", "M9 21v-6h6v6"] },
      { href: "/ctv", label: "Báo cáo Quản lý CTV", icon: ["M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2", "M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M20 21v-2a4 4 0 0 0-3-3.87", "M15.5 3.13a4 4 0 0 1 0 7.75"] },
    ],
  },
  {
    header: "QUẢN LÝ ĐẦU VÀO",
    items: [
      { href: "/psp", label: "Tổng quan PSP", icon: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z", "M2 12h20", "M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2z"] },
      { href: "/doi-tac", label: "Luồng đối tác & hợp đồng", icon: ["M16 3h5v5", "M21 3l-7 7", "M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"] },
    ],
  },
  {
    header: "QUẢN LÝ SẢN PHẨM & DỊCH VỤ",
    items: [
      { href: "/sp", label: "Báo cáo sản phẩm", icon: ["M21 8 12 3 3 8l9 5 9-5Z", "M3 8v8l9 5 9-5V8"] },
      { href: "/ota", label: "Báo cáo Dịch vụ OTA", icon: ["M2 12h20", "M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"] },
      { href: "/bhxh", label: "Báo cáo Dịch vụ BHXH", icon: ["M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"] },
      { href: "/gd", label: "Báo cáo DV Loa thanh toán", icon: ["M4 7h13l-3-3", "M20 17H7l3 3"] },
    ],
  },
  {
    header: "QUẢN TRỊ",
    items: [
      { href: "/quan-tri", label: "Quản lý tài khoản", icon: ["M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2", "M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M12 14l2 2 4-4"] },
    ],
  },
];

// Feature grid on the home page (id maps to href above).
export const FEATURES = [
  { href: "/", title: "Trang chủ", desc: "Tổng quan điều hành", iconBg: "rgba(124,108,255,0.16)", icon: ["M3 10.5 12 3l9 7.5", "M5 9.5V21h14V9.5"] },
  { href: "/company", title: "KPI Company", desc: "Chỉ tiêu toàn công ty", iconBg: "rgba(157,139,255,0.16)", icon: ["M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", "M16 8h2a2 2 0 0 1 2 2v11", "M8 7h2M8 11h2M8 15h2"] },
  { href: "/khoi", title: "KPI Khối", desc: "Chỉ tiêu theo khối", iconBg: "rgba(52,211,153,0.14)", icon: ["M3 3v18h18", "M7 12v5M12 8v9M17 14v3"] },
  { href: "/gd", title: "Báo cáo DV Loa thanh toán", desc: "Chi tiết giao dịch", iconBg: "rgba(124,108,255,0.16)", icon: ["M4 7h13l-3-3", "M20 17H7l3 3"] },
  { href: "/kpi", title: "KPI Cá nhân", desc: "KPI Khối & cá nhân", iconBg: "rgba(157,139,255,0.16)", icon: ["M12 3 15 9l7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"] },
  { href: "/sp", title: "Báo cáo sản phẩm", desc: "Hiệu quả sản phẩm", iconBg: "rgba(52,211,153,0.14)", icon: ["M21 8 12 3 3 8l9 5 9-5Z", "M3 8v8l9 5 9-5V8"] },
  { href: "/ota", title: "Dịch vụ OTA", desc: "Vé máy bay & du lịch", iconBg: "rgba(251,191,36,0.14)", icon: ["M2 12h20", "M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"] },
  { href: "/bhxh", title: "Dịch vụ BHXH", desc: "Bảo hiểm xã hội", iconBg: "rgba(124,108,255,0.16)", icon: ["M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z"] },
  { href: "/pipeline", title: "Sale Pipeline", desc: "Cơ hội & dự báo", iconBg: "rgba(157,139,255,0.16)", icon: ["M3 5h18l-7 8v6l-4 2v-8L3 5Z"] },
  { href: "/kenh-ban", title: "Quản lý Kênh bán", desc: "Đóng góp KHCN & KHDN", iconBg: "rgba(124,108,255,0.16)", icon: ["M4 21V9l8-6 8 6v12", "M9 21v-6h6v6"] },
  { href: "/ctv", title: "Quản lý CTV", desc: "Hiệu quả giới thiệu KH", iconBg: "rgba(52,211,153,0.14)", icon: ["M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2", "M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M20 21v-2a4 4 0 0 0-3-3.87", "M15.5 3.13a4 4 0 0 1 0 7.75"] },
];
