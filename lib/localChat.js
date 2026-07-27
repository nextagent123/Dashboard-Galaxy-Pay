import {
  FALLBACK_TGT,
  FALLBACK_ACT,
  KHOI,
  COMPANY,
  PIPELINE_GROUPS,
  PRODUCTS,
  BDM,
  OTA_MONTHLY_OVERVIEW,
  LOA_SOURCES,
  CHANNEL_SALES,
  NVKD_SALES,
} from "./data";

const sum = (arr) => arr.reduce((s, v) => s + (v || 0), 0);
const vn = (v, d = 1) => v.toLocaleString("vi-VN", { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (a, b) => vn((a / b) * 100, 1) + "%";

const N = FALLBACK_ACT.gmv.length;
const gmvAct = sum(FALLBACK_ACT.gmv);
const gmvTgtY = sum(FALLBACK_TGT.gmv);
const gmvTgtH1 = sum(FALLBACK_TGT.gmv.slice(0, 6));
const dtAct = sum(FALLBACK_ACT.dt);
const dtTgtY = sum(FALLBACK_TGT.dt);
const dtTgtH1 = sum(FALLBACK_TGT.dt.slice(0, 6));
const lnAct = sum(FALLBACK_ACT.ln);
const lnTgtY = sum(FALLBACK_TGT.ln);
const lnTgtH1 = sum(FALLBACK_TGT.ln.slice(0, 6));
const margin = (lnAct / dtAct) * 100;

const MONTHS = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"];

const KNOWLEDGE = [
  {
    keys: ["gmv", "tổng giá trị", "gross merchandise"],
    answer: () =>
      `GMV (Gross Merchandise Value) là tổng giá trị giao dịch qua hệ thống Galaxy Pay.\n\n` +
      `Lũy kế T1-T${N}/2026:\n` +
      `• Thực đạt: ${vn(gmvAct, 1)} tỷ VND\n` +
      `• Target năm: ${vn(gmvTgtY, 1)} tỷ → đạt ${pct(gmvAct, gmvTgtY)}\n` +
      `• Target H1: ${vn(gmvTgtH1, 1)} tỷ → đạt ${pct(gmvAct, gmvTgtH1)}\n\n` +
      `Chi tiết theo tháng:\n` +
      FALLBACK_ACT.gmv.map((v, i) => `• T${i + 1}: ${vn(v, 1)} tỷ (KH: ${vn(FALLBACK_TGT.gmv[i], 1)} tỷ, đạt ${pct(v, FALLBACK_TGT.gmv[i])})`).join("\n"),
  },
  {
    keys: ["doanh thu", "revenue", " dt "],
    answer: () =>
      `Doanh thu (Revenue) là thu nhập thực tế từ phí dịch vụ.\n\n` +
      `Lũy kế T1-T${N}/2026:\n` +
      `• Thực đạt: ${vn(dtAct, 1)} tỷ VND\n` +
      `• Target năm: ${vn(dtTgtY, 1)} tỷ → đạt ${pct(dtAct, dtTgtY)}\n` +
      `• Target H1: ${vn(dtTgtH1, 1)} tỷ → đạt ${pct(dtAct, dtTgtH1)}\n\n` +
      `Chi tiết theo tháng:\n` +
      FALLBACK_ACT.dt.map((v, i) => `• T${i + 1}: ${vn(v, 1)} tỷ (KH: ${vn(FALLBACK_TGT.dt[i], 1)} tỷ, đạt ${pct(v, FALLBACK_TGT.dt[i])})`).join("\n"),
  },
  {
    keys: ["lợi nhuận", "profit", " ln ", "lãi"],
    answer: () =>
      `Lợi nhuận gộp (Gross Profit) = Doanh thu – Chi phí trực tiếp.\n\n` +
      `Lũy kế T1-T${N}/2026:\n` +
      `• Thực đạt: ${vn(lnAct, 1)} tỷ VND\n` +
      `• Target năm: ${vn(lnTgtY, 1)} tỷ → đạt ${pct(lnAct, lnTgtY)}\n` +
      `• Target H1: ${vn(lnTgtH1, 1)} tỷ → đạt ${pct(lnAct, lnTgtH1)}\n` +
      `• Biên lợi nhuận gộp: ${vn(margin, 1)}%\n\n` +
      `Chi tiết theo tháng:\n` +
      FALLBACK_ACT.ln.map((v, i) => `• T${i + 1}: ${vn(v, 1)} tỷ (KH: ${vn(FALLBACK_TGT.ln[i], 1)} tỷ, đạt ${pct(v, FALLBACK_TGT.ln[i])})`).join("\n"),
  },
  {
    keys: ["biên lợi nhuận", "margin", "biên gộp"],
    answer: () =>
      `Biên lợi nhuận gộp lũy kế T1-T${N}/2026: ${vn(margin, 1)}%\n\n` +
      `Công thức: Lợi nhuận gộp / Doanh thu × 100\n` +
      `= ${vn(lnAct, 1)} / ${vn(dtAct, 1)} × 100 = ${vn(margin, 1)}%\n\n` +
      `Biên theo tháng:\n` +
      FALLBACK_ACT.ln.map((v, i) => {
        const m = (v / FALLBACK_ACT.dt[i]) * 100;
        return `• T${i + 1}: ${vn(m, 1)}%`;
      }).join("\n"),
  },
  {
    keys: ["tổng quan", "overview", "tình hình", "chung", "tóm tắt", "summary"],
    answer: () =>
      `Tổng quan kinh doanh Galaxy Pay — Lũy kế T1-T${N}/2026:\n\n` +
      `📊 GMV: ${vn(gmvAct, 1)} tỷ VND (đạt ${pct(gmvAct, gmvTgtH1)} H1)\n` +
      `💰 Doanh thu: ${vn(dtAct, 1)} tỷ VND (đạt ${pct(dtAct, dtTgtH1)} H1)\n` +
      `📈 Lợi nhuận: ${vn(lnAct, 1)} tỷ VND (đạt ${pct(lnAct, lnTgtH1)} H1)\n` +
      `💎 Biên LN gộp: ${vn(margin, 1)}%\n\n` +
      bestWorstMonth(),
  },
  {
    keys: ["so sánh", "compare", "tháng nào", "cao nhất", "thấp nhất", "tốt nhất", "kém nhất", "peak"],
    answer: () => {
      return `So sánh GMV theo tháng (T1-T${N}/2026):\n\n` +
        FALLBACK_ACT.gmv.map((v, i) => `• T${i + 1}: ${vn(v, 1)} tỷ`).join("\n") +
        "\n\n" + bestWorstMonth() +
        `\n\nSo sánh Doanh thu:\n` +
        FALLBACK_ACT.dt.map((v, i) => `• T${i + 1}: ${vn(v, 1)} tỷ`).join("\n");
    },
  },
  {
    keys: ["tiến độ", "target", "mục tiêu", "kế hoạch", "kpi", "hoàn thành"],
    answer: () => {
      const items = [
        { name: "GMV", act: gmvAct, h1: gmvTgtH1, yr: gmvTgtY },
        { name: "Doanh thu", act: dtAct, h1: dtTgtH1, yr: dtTgtY },
        { name: "Lợi nhuận", act: lnAct, h1: lnTgtH1, yr: lnTgtY },
      ];
      return `Tiến độ hoàn thành mục tiêu 2026 (lũy kế ${N} tháng):\n\n` +
        items.map((i) => {
          const h1p = (i.act / i.h1) * 100;
          const yp = (i.act / i.yr) * 100;
          const status = h1p >= 100 ? "✅ Đạt" : h1p >= 80 ? "⚡ Gần đạt" : "⚠️ Chậm";
          return `${status} ${i.name}: ${pct(i.act, i.h1)} H1 | ${pct(i.act, i.yr)} năm`;
        }).join("\n") +
        `\n\nChỉ số cần chú ý: ${items.reduce((w, i) => (i.act / i.h1 < w.act / w.h1 ? i : w), items[0]).name} có tỷ lệ hoàn thành H1 thấp nhất.`;
    },
  },
  {
    keys: ["runrate", "dự báo", "ước đạt", "forecast", "cuối năm"],
    answer: () => {
      const items = [
        { name: "GMV", act: gmvAct, yr: gmvTgtY },
        { name: "Doanh thu", act: dtAct, yr: dtTgtY },
        { name: "Lợi nhuận", act: lnAct, yr: lnTgtY },
      ];
      return `Dự báo Runrate cuối năm 2026 (dựa trên tốc độ ${N} tháng đầu):\n\n` +
        items.map((i) => {
          const monthly = i.act / N;
          const forecast = monthly * 12;
          const fp = (forecast / i.yr) * 100;
          const gap = forecast - i.yr;
          return `• ${i.name}: ~${vn(forecast, 1)} tỷ/năm (${vn(fp, 1)}% target)\n  Trung bình: ${vn(monthly, 1)} tỷ/tháng | ${gap >= 0 ? "Vượt" : "Thiếu"}: ${vn(Math.abs(gap), 1)} tỷ`;
        }).join("\n\n");
    },
  },
  {
    keys: ["khối", "khối kinh doanh"],
    answer: () => {
      const khoiGmvAct = sum(KHOI.gmv.act);
      const khoiGmvPlan = sum(KHOI.gmv.plan.slice(0, KHOI.gmv.act.length));
      const khoiDtAct = sum(KHOI.dt.act);
      const khoiDtPlan = sum(KHOI.dt.plan.slice(0, KHOI.dt.act.length));
      const khoiLnAct = sum(KHOI.ln.act);
      const khoiLnPlan = sum(KHOI.ln.plan.slice(0, KHOI.ln.act.length));
      return `KPI Khối Kinh doanh — Lũy kế ${KHOI.gmv.act.length} tháng:\n\n` +
        `• GMV: ${vn(khoiGmvAct, 1)} / ${vn(khoiGmvPlan, 1)} tỷ (${pct(khoiGmvAct, khoiGmvPlan)})\n` +
        `• Doanh thu: ${vn(khoiDtAct, 1)} / ${vn(khoiDtPlan, 1)} tỷ (${pct(khoiDtAct, khoiDtPlan)})\n` +
        `• Lợi nhuận: ${vn(khoiLnAct, 1)} / ${vn(khoiLnPlan, 1)} tỷ (${pct(khoiLnAct, khoiLnPlan)})`;
    },
  },
  {
    keys: ["company", "công ty", "toàn công ty"],
    answer: () =>
      `KPI Company — Kế hoạch toàn công ty 2026 (12 tháng):\n\n` +
      `• GMV: ${vn(sum(COMPANY.gmv.data), 1)} tỷ VND\n` +
      `• Doanh thu: ${vn(sum(COMPANY.dt.data), 1)} tỷ VND\n` +
      `• Lợi nhuận: ${vn(sum(COMPANY.ln.data), 1)} tỷ VND`,
  },
  {
    keys: ["thuật ngữ", "viết tắt", "nghĩa là gì", "giải thích"],
    answer: () =>
      `Thuật ngữ thường dùng trong Dashboard:\n\n` +
      `• GMV: Gross Merchandise Value — Tổng giá trị giao dịch\n` +
      `• DT: Doanh thu (Revenue) — Thu nhập từ phí dịch vụ\n` +
      `• LN: Lợi nhuận gộp (Gross Profit)\n` +
      `• H1/H2: Nửa đầu năm (T1-T6) / Nửa cuối năm (T7-T12)\n` +
      `• KH: Kế hoạch (Target)\n` +
      `• BDM: Business Development Manager\n` +
      `• CTV: Cộng tác viên\n` +
      `• KHCN/KHDN: Khách hàng Cá nhân / Doanh nghiệp\n` +
      `• PSP: Payment Service Provider\n` +
      `• OTA: Online Travel Agent\n` +
      `• GTGD/SLGD: Giá trị / Số lượng giao dịch\n` +
      `• Runrate: Ước đạt cuối năm dựa trên kết quả hiện tại`,
  },
  {
    keys: ["tháng 1", "t1 ", "thang 1"],
    answer: () => monthDetail(0),
  },
  {
    keys: ["tháng 2", "t2 ", "thang 2"],
    answer: () => monthDetail(1),
  },
  {
    keys: ["tháng 3", "t3 ", "thang 3"],
    answer: () => monthDetail(2),
  },
  {
    keys: ["tháng 4", "t4 ", "thang 4"],
    answer: () => monthDetail(3),
  },
  {
    keys: ["tháng 5", "t5 ", "thang 5"],
    answer: () => monthDetail(4),
  },
  {
    keys: ["tháng 6", "t6 ", "thang 6"],
    answer: () => monthDetail(5),
  },
  {
    keys: ["pipeline", "cơ hội", "dự án"],
    answer: () => {
      const lines = PIPELINE_GROUPS.map((g) => {
        const pctYTD = ((g.actYTD / g.target) * 100).toFixed(1);
        const projects = g.projects.map((p) => `  - ${p.name}: ${p.target} ${g.unit}, ${p.status}`).join("\n");
        return `■ ${g.label}: Target ${vn(g.target, 0)} ${g.unit} | YTD ${vn(g.actYTD, 1)} ${g.unit} (${pctYTD}%) | Runrate ${vn(g.runrate, 0)} ${g.unit}\n${projects}`;
      });
      return `Sale Pipeline — Cơ hội kinh doanh & dự báo:\n\n${lines.join("\n\n")}\n\nXem chi tiết tại "Báo cáo Sale Pipeline" trên sidebar.`;
    },
  },
  {
    keys: ["galaxy pay là gì", "giới thiệu galaxy", "about galaxy"],
    answer: () =>
      `Galaxy Pay (CÔNG TY TNHH GALAXY PAY) là công ty trung gian thanh toán được NHNN cấp phép (Số 51/GP-NHNN, 06/08/2021).\n\n` +
      `■ Trụ sở: Vietjet Plaza, 60A Trường Sơn, P.2, Q. Tân Bình, TP.HCM\n` +
      `■ Thuộc hệ sinh thái Sovico Holdings (Vietjet, HDBank, Vikki Bank, Galaxy Joy)\n\n` +
      `■ Dịch vụ được cấp phép:\n` +
      `  1. Cổng thanh toán điện tử\n` +
      `  2. Hỗ trợ thu hộ, chi hộ\n` +
      `  3. Ví điện tử\n\n` +
      `■ Sản phẩm chính: Cổng thanh toán, SoftPOS/SmartPOS, Phần mềm bán hàng F&B (Smenu), eKYC, Đối soát tự động`,
  },
  {
    keys: ["sme in a box", "sme box", "giải pháp trọn gói", "vikki sme"],
    answer: () =>
      `VIKKI SME IN A BOX — Giải pháp kinh doanh trọn gói cho F&B:\n\n` +
      `■ Lớp 1 — Galaxy Pay: Phần mềm bán hàng, cổng thanh toán, SoftPOS, hoá đơn điện tử\n` +
      `■ Lớp 2 — Galaxy Joy: Loyalty SkyJoy (18 triệu hội viên), tích/tiêu điểm SkyPoint\n` +
      `■ Lớp 3 — Vikki Bank: Tài khoản DN số đẹp, chi lương, vay tín chấp đến 5 tỷ\n\n` +
      `■ Go-live: 01/08/2026 tại Vikkafe\n` +
      `■ Mục tiêu: 139K merchant năm 2027`,
  },
  {
    keys: ["biểu phí", "phí dịch vụ", "fee", "mdr"],
    answer: () =>
      `Biểu phí dịch vụ Galaxy Pay (tham khảo, chưa VAT):\n\n` +
      `■ Cổng thanh toán cho Merchant:\n` +
      `  • Thẻ nội địa Napas: 0.65–1.1% GMV\n` +
      `  • Thẻ QT phát hành VN: 1.32–2.5% GMV\n` +
      `  • Thẻ QT phát hành NN: 2.2–3.3% GMV\n` +
      `  • VietQR: 0.22–0.88% GMV\n` +
      `  • Ví MoMo: 1.55–1.8% | ZaloPay: 0.88–1.3% | SkyPay: 0.55–1.1%\n\n` +
      `■ SME in a Box:\n` +
      `  • Thẻ nội địa: 1.2%/GD | QT: 1.8%/GD | NN: 2.4%/GD\n` +
      `  • Loyalty: 0.8%/GD | SoftPOS: 100K/thiết bị/tháng\n` +
      `  • Miễn phí đăng ký, tích hợp & phí thường niên`,
  },
  {
    keys: ["softpos", "smartpos", "pos", "máy pos"],
    answer: () =>
      `SoftPOS & SmartPOS của Galaxy Pay:\n\n` +
      `■ SoftPOS: Biến điện thoại/tablet Android thành máy POS\n` +
      `  • Chạm thẻ NFC, quét QR, không cần đầu tư thiết bị\n` +
      `  • Phí quản lý: 100.000đ/thiết bị/tháng\n\n` +
      `■ SmartPOS: Máy POS vật lý cho quầy thu ngân chuỗi lớn\n\n` +
      `■ Chấp nhận: Visa, Mastercard, Napas, Apple Pay, Google Pay, Samsung Pay, VietQR, ví điện tử\n` +
      `■ Biên lai điện tử qua email/QR/URL`,
  },
  {
    keys: ["đối tác", "merchant", "partner", "khách hàng"],
    answer: () =>
      `Đối tác & Merchant Galaxy Pay (36+ đối tác):\n\n` +
      `■ Đối tác chính:\n` +
      `  • Vietjet Air: cổng thanh toán, POS, SkyPOS\n` +
      `  • HD Insurance, Victoria International School (3 campus)\n` +
      `  • Galaxy Joy, VinClub, Wash24H, OnAir, Okuro...\n\n` +
      `■ Đối tác đầu vào:\n` +
      `  • Ngân hàng: HDBank, BVBank, VietinBank, BIDV\n` +
      `  • Ví: MoMo, ZaloPay, Viettel Money, SkyPay\n` +
      `  • eKYC: TrueID (VNG), Hyperverge, RAR`,
  },
  {
    keys: ["giấy phép", "license", "cấp phép", "nhnn"],
    answer: () =>
      `Giấy phép Galaxy Pay:\n\n` +
      `■ Số: 51/GP-NHNN, cấp ngày 06/08/2021\n` +
      `■ Cơ quan cấp: Ngân hàng Nhà nước Việt Nam\n` +
      `■ Thời hạn: 10 năm (đến 2031)\n` +
      `■ MSDN: 0316368255\n\n` +
      `■ Dịch vụ được cấp phép:\n` +
      `  1. Cổng thanh toán điện tử\n` +
      `  2. Hỗ trợ thu hộ, chi hộ\n` +
      `  3. Ví điện tử`,
  },
  {
    keys: ["đối thủ", "techcombank", "shinhan", "cạnh tranh"],
    answer: () =>
      `Phân tích đối thủ cạnh tranh:\n\n` +
      `■ Techcombank: MerchantOne "4 trong 1", ShopCash/ShopCredit (vay đến 500tr/15 tỷ)\n` +
      `■ Shinhan: Shinhan Store + Sổ Bán Hàng (Finan), MISA Lending\n\n` +
      `■ Lợi thế Galaxy Pay (CHỈ VIKKI CÓ):\n` +
      `  • Loyalty 18 triệu hội viên SkyJoy\n` +
      `  • AI Agent CSKH + Marketing 0đ\n` +
      `  • Menu/Order nhúng vào app ngân hàng\n` +
      `  • Hệ sinh thái Sovico đổ khách về cửa hàng`,
  },
  {
    keys: ["vikkafe", "pilot", "go-live"],
    answer: () =>
      `Vikkafe — Đối tác pilot SME in a Box:\n\n` +
      `■ Thuộc hệ sinh thái Sovico, 2 mô hình: cửa hàng + xe đẩy\n` +
      `■ Go-live: 01/08/2026\n` +
      `■ KPI pilot (08–10/2026):\n` +
      `  • 100% giao dịch qua SME in a Box\n` +
      `  • Thời gian phục vụ giảm ≥20%\n` +
      `  • ≥60% CBNV Galaxy Holdings kích hoạt redeem\n` +
      `  • ≥30% thanh toán bằng QR Vikki/SkyPoint`,
  },
  {
    keys: ["ota", "vé máy bay", "du lịch"],
    answer: () => {
      const o = OTA_MONTHLY_OVERVIEW;
      const activeMonths = o.monthly.filter((m) => m.bookings > 0);
      return `Dịch vụ OTA (Online Travel Agent) — vé máy bay & du lịch:\n\n` +
        `• Tổng bookings: ${o.totalBookings} (thành công: ${o.successfulBookings}, hủy: ${o.cancelledBookings})\n` +
        `• Tổng doanh thu: ${vn(o.totalRevenue / 1e6, 1)} triệu VND\n\n` +
        `Theo tháng:\n` +
        activeMonths.map((m) => `• ${m.label}: ${m.bookings} bookings, ${vn(m.revenue / 1e6, 0)} triệu VND`).join("\n") +
        `\n\nXem chi tiết tại "Báo cáo Dịch vụ OTA" trên sidebar.`;
    },
  },
  {
    keys: ["loa", "loa thanh toán"],
    answer: () => {
      const totalUnits = LOA_SOURCES.reduce((s, l) => s + l.units, 0);
      const totalRev = LOA_SOURCES.reduce((s, l) => s + l.revenue, 0);
      const totalGP = LOA_SOURCES.reduce((s, l) => s + l.grossProfit, 0);
      return `Dịch vụ Loa thanh toán:\n\n` +
        `Tổng: ${totalUnits.toLocaleString("vi-VN")} đơn vị | DT: ${vn(totalRev / 1e6, 1)} triệu | LN gộp: ${vn(totalGP / 1e6, 1)} triệu\n\n` +
        LOA_SOURCES.map((l) => `• ${l.name}: ${l.units.toLocaleString("vi-VN")} ĐV, DT ${vn(l.revenue / 1e6, 1)} tr, LN ${vn(l.grossProfit / 1e6, 1)} tr (${l.status === "done" ? "Hoàn thành" : "Đang xử lý"})`).join("\n") +
        `\n\nXem chi tiết tại "Báo cáo DV Loa thanh toán" trên sidebar.`;
    },
  },
  {
    keys: ["bhxh", "bảo hiểm"],
    answer: () => `Dịch vụ BHXH — Bảo hiểm xã hội.\n\n` +
      `Trong Pipeline, dự án BHXH có target doanh thu 2 tỷ VND, go-live T5/2026 nhưng đã Miss Deadline.\nCần rà soát nguyên nhân & lập lại roadmap.\n\nXem chi tiết tại "Báo cáo Dịch vụ BHXH" trên sidebar.`,
  },
  {
    keys: ["sản phẩm", "product", "gtgd", "slgd"],
    answer: () => {
      const lines = PRODUCTS.map((p) => {
        const totalGtgd = p.months.reduce((s, m) => s + m[1], 0);
        const totalSlgd = p.months.reduce((s, m) => s + m[2], 0);
        return `• ${p.name} (${p.code}): GTGD ${vn(totalGtgd, 1)} tỷ, SLGD ${totalSlgd.toLocaleString("vi-VN")} GD`;
      });
      return `Báo cáo sản phẩm — GTGD & SLGD lũy kế:\n\n${lines.join("\n")}\n\nXem chi tiết tại "Báo cáo sản phẩm" trên sidebar.`;
    },
  },
  {
    keys: ["kênh bán", "khcn", "khdn", "kênh"],
    answer: () => {
      const byKenh = {};
      CHANNEL_SALES.forEach((r) => {
        if (!byKenh[r.kenh]) byKenh[r.kenh] = { sl: 0, dt: 0, ln: 0, count: 0 };
        byKenh[r.kenh].sl += r.soLuong;
        byKenh[r.kenh].dt += r.doanhThu;
        byKenh[r.kenh].ln += r.loiNhuan;
        byKenh[r.kenh].count++;
      });
      const lines = Object.entries(byKenh).map(([k, v]) =>
        `• ${k}: ${v.count} KH, ${v.sl.toLocaleString("vi-VN")} thiết bị, DT ${vn(v.dt / 1e6, 1)} tr, LN ${vn(v.ln / 1e6, 1)} tr`
      );
      return `Báo cáo Quản lý Kênh bán:\n\n${lines.join("\n")}\n\nXem chi tiết tại "Báo cáo Quản lý kênh bán" trên sidebar.`;
    },
  },
  {
    keys: ["ctv", "cộng tác viên", "nvkd"],
    answer: () => {
      const byNvkd = {};
      NVKD_SALES.forEach((r) => {
        if (!byNvkd[r.nvkd]) byNvkd[r.nvkd] = { sl: 0, dt: 0, ln: 0 };
        byNvkd[r.nvkd].sl += r.soLuong;
        byNvkd[r.nvkd].dt += r.doanhThu;
        byNvkd[r.nvkd].ln += r.loiNhuanGop;
      });
      const sorted = Object.entries(byNvkd).sort((a, b) => b[1].dt - a[1].dt);
      const top5 = sorted.slice(0, 5);
      const totalDt = sorted.reduce((s, [, v]) => s + v.dt, 0);
      return `Báo cáo CTV (${sorted.length} cộng tác viên):\n` +
        `Tổng doanh thu: ${vn(totalDt / 1e6, 1)} triệu VND\n\n` +
        `Top 5 CTV theo doanh thu:\n` +
        top5.map(([name, v], i) => `${i + 1}. ${name}: ${v.sl} thiết bị, DT ${vn(v.dt / 1e6, 1)} tr`).join("\n") +
        `\n\nXem chi tiết tại "Báo cáo Quản lý CTV" trên sidebar.`;
    },
  },
  {
    keys: ["bdm", "cá nhân", "bùi lâm", "mạnh tuấn", "thúy hằng"],
    answer: () => {
      const lines = BDM.map((b) => {
        const gmvAct = b.metrics.gmv.actual.filter((v) => v != null);
        const gmvKpi = b.metrics.gmv.kpi.slice(0, gmvAct.length);
        const gmvSum = gmvAct.reduce((s, v) => s + v, 0);
        const gmvKpiSum = gmvKpi.reduce((s, v) => s + v, 0);
        return `• ${b.name} (${b.role}):\n  GMV: ${vn(gmvSum, 1)} / ${vn(gmvKpiSum, 1)} ${b.metrics.gmv.unit} (${vn((gmvSum / gmvKpiSum) * 100, 1)}%)`;
      });
      return `KPI Cá nhân — BDM Performance:\n\n${lines.join("\n")}\n\nXem chi tiết tại "KPI Cá nhân" trên sidebar.`;
    },
  },
  {
    keys: ["tỷ giá", "ngoại hối", "forex", "usd", "eur", "ngoại tệ"],
    answer: () =>
      `Dữ liệu tỷ giá ngoại hối được cập nhật realtime từ API.\n\n` +
      `Để xem tỷ giá hiện tại, vui lòng truy cập "Báo cáo Thị trường ngoại hối" trên sidebar.\n\n` +
      `Hỗ trợ các cặp tiền: USD, EUR, GBP, JPY, CNY, SGD, THB, KRW so với VND.`,
  },
  {
    keys: ["chứng khoán", "cổ phiếu", "vn-index", "vnindex", "stock", "hose"],
    answer: () =>
      `Dữ liệu thị trường chứng khoán Việt Nam được cập nhật realtime từ TCBS/VNDirect API.\n\n` +
      `Để xem thông tin hiện tại, truy cập "Báo cáo Thị trường chứng khoán" trên sidebar.\n` +
      `Có thể tra cứu chi tiết từng mã cổ phiếu (FPT, VNM, VCB, HPG...) với biểu đồ 30 ngày.`,
  },
];

function monthDetail(idx) {
  if (idx >= N) return `Chưa có dữ liệu thực đạt cho Tháng ${idx + 1}.`;
  return `Chi tiết Tháng ${idx + 1}/2026:\n\n` +
    `• GMV: ${vn(FALLBACK_ACT.gmv[idx], 1)} tỷ (KH: ${vn(FALLBACK_TGT.gmv[idx], 1)} tỷ, đạt ${pct(FALLBACK_ACT.gmv[idx], FALLBACK_TGT.gmv[idx])})\n` +
    `• Doanh thu: ${vn(FALLBACK_ACT.dt[idx], 1)} tỷ (KH: ${vn(FALLBACK_TGT.dt[idx], 1)} tỷ, đạt ${pct(FALLBACK_ACT.dt[idx], FALLBACK_TGT.dt[idx])})\n` +
    `• Lợi nhuận: ${vn(FALLBACK_ACT.ln[idx], 1)} tỷ (KH: ${vn(FALLBACK_TGT.ln[idx], 1)} tỷ, đạt ${pct(FALLBACK_ACT.ln[idx], FALLBACK_TGT.ln[idx])})\n` +
    `• Biên LN: ${vn((FALLBACK_ACT.ln[idx] / FALLBACK_ACT.dt[idx]) * 100, 1)}%` +
    (idx > 0
      ? `\n\nSo với T${idx}:\n` +
        `• GMV: ${FALLBACK_ACT.gmv[idx] >= FALLBACK_ACT.gmv[idx - 1] ? "↑" : "↓"} ${vn(Math.abs(FALLBACK_ACT.gmv[idx] - FALLBACK_ACT.gmv[idx - 1]), 1)} tỷ\n` +
        `• DT: ${FALLBACK_ACT.dt[idx] >= FALLBACK_ACT.dt[idx - 1] ? "↑" : "↓"} ${vn(Math.abs(FALLBACK_ACT.dt[idx] - FALLBACK_ACT.dt[idx - 1]), 1)} tỷ\n` +
        `• LN: ${FALLBACK_ACT.ln[idx] >= FALLBACK_ACT.ln[idx - 1] ? "↑" : "↓"} ${vn(Math.abs(FALLBACK_ACT.ln[idx] - FALLBACK_ACT.ln[idx - 1]), 1)} tỷ`
      : "");
}

function bestWorstMonth() {
  const gmvArr = FALLBACK_ACT.gmv;
  const bestIdx = gmvArr.indexOf(Math.max(...gmvArr));
  const worstIdx = gmvArr.indexOf(Math.min(...gmvArr));
  return `Tháng GMV cao nhất: T${bestIdx + 1} (${vn(gmvArr[bestIdx], 1)} tỷ)\n` +
    `Tháng GMV thấp nhất: T${worstIdx + 1} (${vn(gmvArr[worstIdx], 1)} tỷ)`;
}

const THANKS = ["cảm ơn", "thanks", "thank", "tks"];

function isGreeting(q) {
  const trimmed = q.trim().replace(/[?!.,]/g, "").trim();
  const greetExact = ["xin chào", "hello", "hi", "chào", "hey", "chao", "alo"];
  if (greetExact.includes(trimmed)) return true;
  if (/^(xin )?chào\b/.test(trimmed)) return true;
  if (/^h(i|ello|ey)\b/.test(trimmed)) return true;
  return false;
}

export function getLocalAnswer(question) {
  const q = (" " + question.toLowerCase().normalize("NFC") + " ")
    .replace(/[?!.,]/g, " ");

  if (isGreeting(question.toLowerCase().normalize("NFC"))) {
    return "Xin chào! Tôi là Trợ lý Khối Kinh doanh AI của Galaxy Pay Dashboard. Bạn có thể hỏi tôi về:\n\n" +
      "• GMV, Doanh thu, Lợi nhuận — tổng quan & chi tiết theo tháng\n" +
      "• KPI Company, KPI Khối, KPI Cá nhân (BDM)\n" +
      "• Sale Pipeline — cơ hội kinh doanh & tiến độ dự án\n" +
      "• Sản phẩm — GTGD/SLGD 7 sản phẩm\n" +
      "• OTA, Loa thanh toán, BHXH — dịch vụ & số liệu\n" +
      "• Kênh bán (KHCN/KHDN) & CTV — hiệu quả giới thiệu\n" +
      "• Tỷ giá ngoại hối — dữ liệu realtime\n" +
      "• Chứng khoán Việt Nam — VN-Index & giá cổ phiếu realtime\n" +
      "• Galaxy Pay: biểu phí, đối tác, SME in a Box, SoftPOS\n\n" +
      "Hãy hỏi tôi bất cứ điều gì!";
  }

  if (THANKS.some((t) => q.includes(t))) {
    return "Không có gì! Nếu cần thêm thông tin về dashboard, cứ hỏi tôi nhé.";
  }

  const matches = KNOWLEDGE.filter((k) => k.keys.some((key) => q.includes(key)));

  if (matches.length > 0) {
    return matches.map((m) => m.answer()).join("\n\n---\n\n");
  }

  return `Tôi chưa tìm thấy thông tin phù hợp cho câu hỏi này.\n\nBạn có thể thử hỏi về:\n` +
    `• "Tổng quan tình hình kinh doanh"\n` +
    `• "Sale Pipeline và tiến độ dự án"\n` +
    `• "KPI cá nhân BDM"\n` +
    `• "Báo cáo sản phẩm"\n` +
    `• "Dịch vụ OTA / Loa thanh toán"\n` +
    `• "Kênh bán KHCN KHDN"\n` +
    `• "Tỷ giá ngoại hối"\n` +
    `• "Chứng khoán VN-Index"` ;
}
