"use client";

import { useState, useMemo } from "react";
import { ReportHeader } from "@/components/ui/PageHeader";

const GP1 = "#0F3D8C";
const GP2 = "#0B6FA4";
const ACCENT = "#0891B2";
const DIRECT = "#2DD4BF";
const BANK = "#F59E0B";
const HUB = "#22D3EE";
const PLAN = "#6B9CF0";

const CONTRACTS = [
  { id: 1, partner: "VietinBank & Vietjet", svc: "Cổng thanh toán (Báo có ngoại tệ)", svcKey: "cong-tt", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "giantiep", modelDesc: "Cổng CYBS — Gián tiếp qua Master merchant VTB" },
  { id: 2, partner: "HDBank & Vietjet", svc: "Cổng thanh toán (Báo có ngoại tệ)", svcKey: "cong-tt", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "giantiep", modelDesc: "Cổng MPGS — Gián tiếp qua Master merchant HDB" },
  { id: 3, partner: "BVBank", svc: "Chi hộ", svcKey: "chi-ho", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 4, partner: "HDBank", svc: "Chi hộ IBFT", svcKey: "chi-ho", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 5, partner: "HDBank", svc: "E-COM", svcKey: "ecom", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "giantiep", modelDesc: "Cổng MPGS — Gián tiếp qua Master merchant HDB" },
  { id: 6, partner: "NAPAS", svc: "E-COM", svcKey: "ecom", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 7, partner: "MoMo", svc: "E-COM", svcKey: "ecom", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 8, partner: "ZaloPay", svc: "E-COM", svcKey: "ecom", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 9, partner: "Viettel Money", svc: "E-COM", svcKey: "ecom", type: "tgtt", deploy: "expired", validity: "Hết hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp — Đã thanh lý" },
  { id: 10, partner: "VietinBank", svc: "E-COM", svcKey: "ecom", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "giantiep", modelDesc: "Cổng CYBS — Gián tiếp qua Master merchant VTB" },
  { id: 11, partner: "HyperVerge", svc: "e-KYC", svcKey: "ekyc", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 12, partner: "Verichains", svc: "e-KYC", svcKey: "ekyc", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 13, partner: "TT Dữ liệu dân cư & CCCD", svc: "IDCheck", svcKey: "ekyc", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 14, partner: "Monex", svc: "MCC", svcKey: "khac", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 15, partner: "HDBank", svc: "Ngân hàng bảo trợ", svcKey: "khac", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 16, partner: "HDBank", svc: "POS / SoftPOS", svcKey: "pos", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 17, partner: "DOKU", svc: "Referral", svcKey: "referral", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "khac", modelDesc: "—" },
  { id: 18, partner: "Vạn Lộc Xuân", svc: "Referral", svcKey: "referral", type: "ngoai", deploy: "pending", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 19, partner: "BVBank", svc: "Thu hộ", svcKey: "thu-ho", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 20, partner: "HDBank", svc: "Thu hộ QR_VA", svcKey: "thu-ho", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 21, partner: "HDBank", svc: "Thuê SDK Tap to phone", svcKey: "khac", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "khac", modelDesc: "—" },
  { id: 22, partner: "HDBank", svc: "Ví điện tử", svcKey: "vi", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 23, partner: "VNPay", svc: "Ví điện tử", svcKey: "vi", type: "tgtt", deploy: "expired", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp — Đã thanh lý" },
  { id: 24, partner: "iMedia", svc: "Ví điện tử", svcKey: "vi", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "khac", modelDesc: "—" },
  { id: 25, partner: "BIDV", svc: "Ví điện tử", svcKey: "vi", type: "tgtt", deploy: "live", validity: "Còn hiệu lực", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 26, partner: "Finan (SBH)", svc: "Vietjet SkyPOS", svcKey: "khac", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "khac", modelDesc: "—" },
  { id: 27, partner: "HDBank", svc: "Soundbox", svcKey: "khac", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "khac", modelDesc: "—" },
  { id: 28, partner: "Nice Solutions", svc: "OTA", svcKey: "khac", type: "ngoai", deploy: "live", validity: "Còn hiệu lực", model: "khac", modelDesc: "—" },
  { id: 29, partner: "VCB", svc: "Cổng thanh toán", svcKey: "cong-tt", type: "tgtt", deploy: "pending", validity: "Đang triển khai", model: "giantiep", modelDesc: "Cổng CYBS — Gián tiếp qua Master merchant VCB" },
  { id: 30, partner: "VCB", svc: "Thu hộ topup", svcKey: "thu-ho", type: "tgtt", deploy: "pending", validity: "Đang triển khai", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 31, partner: "MBBank", svc: "Thu hộ topup", svcKey: "thu-ho", type: "tgtt", deploy: "pending", validity: "Đang triển khai", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
  { id: 32, partner: "BIDV", svc: "Thu hộ topup", svcKey: "thu-ho", type: "tgtt", deploy: "pending", validity: "Đang triển khai", model: "tructiep", modelDesc: "Hợp tác trực tiếp" },
];

const ROADMAP = [
  { flag: "🌐", name: "Cybersource & MPGS", desc: "Chuyển từ qua NH sang trực tiếp. NH giữ vai trò acquiring & quyết toán.", from: "qua NH", fromColor: BANK, to: "Trực tiếp", toColor: DIRECT },
  { flag: "🇰🇷", name: "Smartro (Hàn Quốc)", desc: "Chuyển từ Hub sang trực tiếp. KakaoPay, TossPay, NaverPay.", from: "qua Hub", fromColor: HUB, to: "Trực tiếp", toColor: DIRECT },
  { flag: "🇯🇵", name: "2C2P (Nhật · Thái)", desc: "Chuyển từ Hub sang trực tiếp. PayPay, Konbini.", from: "qua Hub", fromColor: HUB, to: "Trực tiếp", toColor: DIRECT },
  { flag: "🇮🇳", name: "PayU (Ấn Độ)", desc: "Chuyển từ Hub sang trực tiếp. UPI, PhonePe, LazyPay.", from: "qua Hub", fromColor: HUB, to: "Trực tiếp", toColor: DIRECT },
  { flag: "🇮🇩", name: "DOKU (Indonesia)", desc: "Chuyển từ Hub sang trực tiếp. QRIS, OVO, ShopeePay.", from: "qua Hub", fromColor: HUB, to: "Trực tiếp", toColor: DIRECT },
  { flag: "🇪🇺", name: "Adyen (Châu Âu · Úc)", desc: "Chuyển từ Hub sang trực tiếp. iDEAL, Klarna, Trustly, PayID.", from: "qua Hub", fromColor: HUB, to: "Trực tiếp", toColor: DIRECT },
];

const SVC_OPTIONS = [
  { value: "all", label: "Tất cả dịch vụ" },
  { value: "cong-tt", label: "Cổng thanh toán" },
  { value: "ecom", label: "E-COM" },
  { value: "vi", label: "Ví điện tử" },
  { value: "thu-ho", label: "Thu hộ / Thu hộ topup" },
  { value: "chi-ho", label: "Chi hộ / Chi hộ IBFT" },
  { value: "pos", label: "POS / SoftPOS" },
  { value: "ekyc", label: "e-KYC / IDCheck" },
  { value: "referral", label: "Referral" },
  { value: "khac", label: "Khác" },
];

const MODEL_OPTIONS = [
  { value: "all", label: "Tất cả mô hình" },
  { value: "tructiep", label: "Trực tiếp" },
  { value: "giantiep", label: "Gián tiếp qua NH" },
  { value: "khac", label: "Khác" },
];

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        border: active ? `1px solid ${GP1}` : "1px solid var(--border)",
        background: active ? GP1 : "transparent",
        color: active ? "white" : "var(--text-dim)",
        cursor: "pointer",
        transition: "all .15s",
      }}
    >
      {children}
    </button>
  );
}

function SelectFilter({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "5px 28px 5px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.04)",
        color: "var(--text-dim)",
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239CA3AF'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function FlowDiagramSVG() {
  const svgStr = buildFlowSvg();
  return (
    <div
      className="card"
      suppressHydrationWarning
      style={{ padding: 0, overflowX: "auto", flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: svgStr }}
    />
  );
}

function buildFlowSvg() {
  const W = 1340, H = 1020;
  const FONT = "system-ui, sans-serif";
  const ink = "#EFF1F7", ink3 = "#5A6478";
  const card = "#0E1628", bdr = "rgba(255,255,255,0.07)", sf = "#070C1A";
  const chipBg = "rgba(107,156,240,0.12)", chipTxt = "#93B5F0";

  const R = (x,y,w,h,r,fill,stroke,sw) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke?` stroke="${stroke}" stroke-width="${sw||1}"`:""}/>`;

  const bezier = (x1,y1,x2,y2,color,dashed,id) => {
    const my = y1 + (y2-y1)*0.45;
    const d = dashed ? ' stroke-dasharray="7 4"' : "";
    return `<defs><marker id="${id}" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${color}"/></marker></defs>
      <path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="2"${d} marker-end="url(#${id})"/>`;
  };

  const hArrow = (x1,y1,x2,y2,color,id) => {
    const mx = x1+(x2-x1)*0.5;
    return `<defs><marker id="${id}" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${color}"/></marker></defs>
      <path d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}" fill="none" stroke="${color}" stroke-width="1.8" marker-end="url(#${id})"/>`;
  };

  const cx = W/2, cy = 100;
  let o = R(0,0,W,H,16,sf);

  o += `<defs>
    <linearGradient id="gp" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E4FAE"/><stop offset="50%" stop-color="#1A8FC9"/><stop offset="100%" stop-color="#22B8CF"/>
    </linearGradient>
    <filter id="fs"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#1E4FAE" flood-opacity="0.22"/></filter>
  </defs>`;

  // Merchant
  o += R(cx-90,18,180,38,10,card,bdr,1);
  o += `<text x="${cx}" y="42" font-size="13" font-weight="700" fill="${ink}" text-anchor="middle" font-family="${FONT}">Merchant / App</text>`;
  o += bezier(cx,56,cx,cy-32,"#4B7BD5",true,"a0");

  // Galaxy Pay Platform
  o += R(cx-220,cy-32,440,82,18,"url(#gp)");
  o += `<rect x="${cx-220}" y="${cy-32}" width="440" height="82" rx="18" fill="none" filter="url(#fs)"/>`;
  o += `<text x="${cx}" y="${cy+2}" font-size="22" font-weight="700" fill="white" text-anchor="middle" font-family="${FONT}">Galaxy Pay Platform</text>`;
  o += `<text x="${cx}" y="${cy+20}" font-size="11" fill="white" fill-opacity="0.7" text-anchor="middle" font-family="${FONT}">Payment Orchestration Platform</text>`;
  let cx2 = cx - 148;
  ["Định tuyến","Token hóa","Đối soát","Rủi ro","Dự phòng"].forEach(t => {
    const tw = t.length*6+14;
    o += R(cx2,cy+28,tw,20,6,"rgba(255,255,255,0.13)");
    o += `<text x="${cx2+tw/2}" y="${cy+41}" font-size="9" fill="white" fill-opacity="0.8" text-anchor="middle" font-family="${FONT}">${t}</text>`;
    cx2 += tw+6;
  });

  const LX=60, LY=270, MX=460, MY=300, RX=830, RY=260;

  // Bezier arrows from GP to 3 sections
  o += bezier(cx-140,cy+50,LX+180,LY-8,BANK,true,"a1");
  o += bezier(cx,cy+50,MX+120,MY-8,DIRECT,false,"a2");
  o += bezier(cx+140,cy+50,RX+120,RY-8,HUB,true,"a3");

  // === LEFT: QUA NGÂN HÀNG ===
  const lW=380, lH=320;
  o += R(LX,LY,lW,lH,14,card,bdr,1);
  o += R(LX,LY,lW,40,14,"rgba(245,158,11,0.08)");
  o += R(LX,LY+26,lW,14,0,"rgba(245,158,11,0.08)");
  o += `<text x="${LX+18}" y="${LY+26}" font-size="11" font-weight="700" letter-spacing="0.06em" fill="${BANK}" font-family="${FONT}">QUA NGÂN HÀNG HỢP TÁC</text>`;
  o += `<text x="${LX+lW-18}" y="${LY+26}" font-size="10" fill="${ink3}" text-anchor="end" font-family="${FONT}">Hiện tại</text>`;

  const c1y = LY+58;
  o += R(LX+16,c1y,170,76,10,card,bdr,1);
  o += `<text x="${LX+28}" y="${c1y+22}" font-size="14" font-weight="700" fill="${ink}" font-family="${FONT}">Cybersource</text>`;
  o += `<text x="${LX+28}" y="${c1y+37}" font-size="10" fill="${ink3}" font-family="${FONT}">A Visa Solution</text>`;
  let mx1 = LX+28;
  ["Visa","MC","JCB","Amex"].forEach(m => {
    const tw=m.length*6+12;
    o += R(mx1,c1y+46,tw,20,5,chipBg);
    o += `<text x="${mx1+tw/2}" y="${c1y+59}" font-size="9" font-weight="600" fill="${chipTxt}" text-anchor="middle" font-family="${FONT}">${m}</text>`;
    mx1 += tw+4;
  });
  o += `<circle cx="${LX+170}" cy="${c1y+14}" r="5" fill="${DIRECT}"/>`;

  o += hArrow(LX+186,c1y+30,LX+240,c1y+16,BANK,"a4");
  o += hArrow(LX+186,c1y+46,LX+240,c1y+56,BANK,"a5");
  o += R(LX+240,c1y+2,120,32,8,"rgba(245,158,11,0.08)",BANK,1.2);
  o += `<text x="${LX+300}" y="${c1y+23}" font-size="11" font-weight="700" fill="${BANK}" text-anchor="middle" font-family="${FONT}">Vietcombank</text>`;
  o += R(LX+240,c1y+42,120,32,8,"rgba(245,158,11,0.08)",BANK,1.2);
  o += `<text x="${LX+300}" y="${c1y+63}" font-size="11" font-weight="700" fill="${BANK}" text-anchor="middle" font-family="${FONT}">VietinBank</text>`;

  const c2y = LY+155;
  o += R(LX+16,c2y,170,76,10,card,bdr,1);
  o += `<text x="${LX+28}" y="${c2y+22}" font-size="14" font-weight="700" fill="${ink}" font-family="${FONT}">MPGS</text>`;
  o += `<text x="${LX+28}" y="${c2y+37}" font-size="10" fill="${ink3}" font-family="${FONT}">Mastercard Gateway</text>`;
  let mx2 = LX+28;
  ["Visa","MC","JCB"].forEach(m => {
    const tw=m.length*6+12;
    o += R(mx2,c2y+46,tw,20,5,chipBg);
    o += `<text x="${mx2+tw/2}" y="${c2y+59}" font-size="9" font-weight="600" fill="${chipTxt}" text-anchor="middle" font-family="${FONT}">${m}</text>`;
    mx2 += tw+4;
  });
  o += `<circle cx="${LX+170}" cy="${c2y+14}" r="5" fill="${DIRECT}"/>`;
  o += hArrow(LX+186,c2y+38,LX+240,c2y+38,BANK,"a6");
  o += R(LX+240,c2y+22,120,32,8,"rgba(245,158,11,0.08)",BANK,1.2);
  o += `<text x="${LX+300}" y="${c2y+43}" font-size="11" font-weight="700" fill="${BANK}" text-anchor="middle" font-family="${FONT}">HDBank</text>`;

  o += R(LX+16,LY+258,lW-32,42,8,"rgba(107,156,240,0.06)",PLAN,1);
  o += `<text x="${LX+lW/2}" y="${LY+284}" font-size="11" font-weight="600" fill="${PLAN}" text-anchor="middle" font-family="${FONT}">Kế hoạch: chuyển kết nối trực tiếp</text>`;

  // === CENTER: TRỰC TIẾP ===
  const mW=240, mH=290;
  o += R(MX,MY,mW,mH,14,card,bdr,1);
  o += R(MX,MY,mW,40,14,"rgba(45,212,191,0.06)");
  o += R(MX,MY+26,mW,14,0,"rgba(45,212,191,0.06)");
  o += `<text x="${MX+16}" y="${MY+26}" font-size="11" font-weight="700" letter-spacing="0.06em" fill="${DIRECT}" font-family="${FONT}">KẾT NỐI TRỰC TIẾP</text>`;
  o += `<text x="${MX+mW-16}" y="${MY+26}" font-size="10" fill="${ink3}" text-anchor="end" font-family="${FONT}">Hiện tại</text>`;

  [{name:"NAPAS",sub:"Liên ngân hàng VN",tags:["Thẻ nội địa","VietQR"]},{name:"MoMo",sub:"Ví điện tử",tags:["Ví MoMo","QR"]},{name:"ZaloPay",sub:"Ví điện tử",tags:["Ví ZaloPay","QR"]}].forEach((d,i) => {
    const dy = MY+56+i*76;
    o += R(MX+14,dy,mW-28,66,10,"rgba(45,212,191,0.06)",DIRECT,1);
    o += `<circle cx="${MX+32}" cy="${dy+18}" r="6" fill="${DIRECT}"/>`;
    o += `<path d="M${MX+28} ${dy+18} l3 3.5 l6-7" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += `<text x="${MX+44}" y="${dy+22}" font-size="13" font-weight="700" fill="${ink}" font-family="${FONT}">${d.name}</text>`;
    o += `<text x="${MX+44}" y="${dy+36}" font-size="10" fill="${ink3}" font-family="${FONT}">${d.sub}</text>`;
    let tx = MX+28;
    d.tags.forEach(t => {
      const tw=t.length*5.5+12;
      o += R(tx,dy+42,tw,18,4,chipBg);
      o += `<text x="${tx+tw/2}" y="${dy+54}" font-size="8.5" font-weight="600" fill="${chipTxt}" text-anchor="middle" font-family="${FONT}">${t}</text>`;
      tx += tw+4;
    });
  });

  // === RIGHT: QUA HUB ===
  const rW=440, rH=480;
  o += R(RX,RY,rW,rH,14,card,bdr,1);
  o += R(RX,RY,rW,40,14,"rgba(34,211,238,0.06)");
  o += R(RX,RY+26,rW,14,0,"rgba(34,211,238,0.06)");
  o += `<text x="${RX+18}" y="${RY+26}" font-size="11" font-weight="700" letter-spacing="0.06em" fill="${HUB}" font-family="${FONT}">QUA HUB (CHƯA TRỰC TIẾP)</text>`;
  o += `<text x="${RX+rW-18}" y="${RY+26}" font-size="10" fill="${ink3}" text-anchor="end" font-family="${FONT}">Mở rộng</text>`;

  [{name:"Smartro",region:"Hàn Quốc",cur:"KRW",tags:["KakaoPay","TossPay","NaverPay"]},{name:"2C2P",region:"Thái · Nhật",cur:"THB/JPY",tags:["PayPay","Konbini"]},{name:"PayU",region:"Ấn Độ",cur:"INR",tags:["UPI","PhonePe","LazyPay"]},{name:"DOKU",region:"Indonesia",cur:"IDR",tags:["QRIS","OVO","ShopeePay"]},{name:"Alipay+",region:"Trung Quốc",cur:"CNY",tags:["Alipay","WeChat Pay"]},{name:"Adyen",region:"Châu Âu · Úc",cur:"EUR/AUD",tags:["iDEAL","Klarna","Trustly"]},{name:"POLi",region:"Úc · NZ",cur:"AUD/NZD",tags:["POLi","Afterpay","Zip"]}].forEach((h,i) => {
    const hy = RY+52+i*54;
    o += R(RX+14,hy,rW-28,46,8,"rgba(34,211,238,0.04)",HUB,0.8);
    o += `<text x="${RX+28}" y="${hy+20}" font-size="13" font-weight="700" fill="${ink}" font-family="${FONT}">${h.name}</text>`;
    o += `<text x="${RX+28}" y="${hy+34}" font-size="9" fill="${ink3}" font-family="${FONT}">${h.region} — ${h.cur}</text>`;
    let tx = RX+160;
    h.tags.forEach(t => {
      const tw=t.length*5.5+12;
      o += R(tx,hy+12,tw,20,5,chipBg);
      o += `<text x="${tx+tw/2}" y="${hy+25}" font-size="9" font-weight="600" fill="${chipTxt}" text-anchor="middle" font-family="${FONT}">${t}</text>`;
      tx += tw+4;
    });
  });

  o += R(RX+14,RY+rH-46,rW-28,34,8,"rgba(107,156,240,0.06)",PLAN,1);
  o += `<text x="${RX+rW/2}" y="${RY+rH-24}" font-size="11" font-weight="600" fill="${PLAN}" text-anchor="middle" font-family="${FONT}">Kế hoạch: chuyển toàn bộ sang kết nối trực tiếp</text>`;

  // === FOOTER: Vai trò ngân hàng ===
  const fy = H-130;
  o += R(40,fy,W-80,115,14,card,bdr,1);
  o += `<text x="${W/2}" y="${fy+24}" font-size="14" font-weight="700" fill="${ink}" text-anchor="middle" font-family="${FONT}">Vai trò Ngân hàng trong tương lai</text>`;
  [{icon:"\u{1F4B2}",t:"Quyết toán",d:"Settlement & Clearing"},{icon:"\u{1F3E2}",t:"Acquiring",d:"Merchant Acquiring"},{icon:"\u{1F91D}",t:"BD & Hợp tác",d:"Business Development"},{icon:"\u{1F6E1}",t:"Compliance",d:"AML / KYC / PCI-DSS"}].forEach((r,i) => {
    const rw=260, rg=20, rsx=(W-(4*260+3*20))/2;
    const rx=rsx+i*(rw+rg);
    o += R(rx,fy+36,rw,64,10,sf,bdr,1);
    o += `<text x="${rx+rw/2}" y="${fy+60}" font-size="20" text-anchor="middle">${r.icon}</text>`;
    o += `<text x="${rx+rw/2}" y="${fy+78}" font-size="12" font-weight="700" fill="${ink}" text-anchor="middle" font-family="${FONT}">${r.t}</text>`;
    o += `<text x="${rx+rw/2}" y="${fy+92}" font-size="9" fill="${ink3}" text-anchor="middle" font-family="${FONT}">${r.d}</text>`;
  });

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">${o}</svg>`;
}

export default function DoiTacPage() {
  const [filters, setFilters] = useState({ type: "all", deploy: "all", svc: "all", model: "all" });

  const filtered = useMemo(() => {
    return CONTRACTS.filter((c) => {
      if (filters.type !== "all" && c.type !== filters.type) return false;
      if (filters.deploy !== "all") {
        if (filters.deploy === "live" && c.deploy !== "live") return false;
        if (filters.deploy === "pending" && c.deploy === "live") return false;
      }
      if (filters.svc !== "all" && c.svcKey !== filters.svc) return false;
      if (filters.model !== "all" && c.model !== filters.model) return false;
      return true;
    });
  }, [filters]);

  const set = (dim, val) => setFilters((f) => ({ ...f, [dim]: val }));

  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · QUẢN LÝ ĐẦU VÀO"
        title="Kiến trúc tổng thể kết nối đối tác"
        subtitle="Flow diagram — Trực tiếp, qua Ngân hàng, qua Hub"
      />

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "14px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 10 }}>
        {[
          { color: DIRECT, label: "Kết nối trực tiếp" },
          { color: BANK, label: "Qua ngân hàng hợp tác" },
          { color: HUB, label: "Qua Hub (chưa trực tiếp)" },
          { color: PLAN, label: "Kế hoạch chuyển trực tiếp" },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: "var(--text-dim)" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* SVG Flow Diagram */}
      <FlowDiagramSVG />

      {/* Transition */}
      <section className="card" style={{ padding: "22px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 1fr", gap: 20, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5, color: BANK }}>Hiện tại</div>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
              Cybs & MPGS <HL color="rgba(245,158,11,0.15)">qua ngân hàng</HL> (HDB, CTG, VCB). PSP quốc tế <HL color="rgba(245,158,11,0.15)">qua Hub</HL>, chưa trực tiếp.
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${GP1}, ${ACCENT})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px -3px rgba(15,61,140,0.35)`, margin: "0 auto" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5, color: DIRECT }}>Tương lai</div>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
              Toàn bộ PSP <HL color="rgba(45,212,191,0.15)">kết nối trực tiếp</HL>. Ngân hàng chuyển vai trò quyết toán, acquiring & BD.
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="card" style={{ padding: "28px 30px" }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          Lộ trình chuyển đổi kết nối trực tiếp
          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "rgba(13,148,136,0.15)", color: DIRECT }}>Kế hoạch</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {ROADMAP.map((r) => (
            <div key={r.name} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 12, padding: 16, border: "1px solid var(--border)", borderRadius: 10, alignItems: "start" }}>
              <span style={{ fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>{r.flag}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3, lineHeight: 1.4 }}>{r.desc}</div>
                <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 5, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: r.fromColor }} />
                  {r.from} →
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: r.toColor }} />
                  {r.to}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contract checklist */}
      <section className="card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Checklist đối tác đầu vào</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatPill bg={`linear-gradient(135deg, ${GP1}, ${ACCENT})`} color="white">
              <span style={{ fontSize: 18, fontWeight: 800 }}>32</span> hợp đồng
            </StatPill>
            <StatPill bg="rgba(13,148,136,0.15)" color={DIRECT}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>19</span> TGTT
            </StatPill>
            <StatPill bg="rgba(124,58,237,0.12)" color="#A78BFA">
              <span style={{ fontSize: 18, fontWeight: 800 }}>13</span> Ngoài TGTT
            </StatPill>
            <StatPill bg="rgba(52,211,153,0.15)" color="#34d399">
              <span style={{ fontSize: 18, fontWeight: 800 }}>27</span> Golive
            </StatPill>
            <StatPill bg="rgba(245,158,11,0.15)" color={BANK}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>5</span> Chưa/Đang triển khai
            </StatPill>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", whiteSpace: "nowrap" }}>Loại hình:</span>
            <FilterBtn active={filters.type === "all"} onClick={() => set("type", "all")}>Tất cả</FilterBtn>
            <FilterBtn active={filters.type === "tgtt"} onClick={() => set("type", "tgtt")}>TGTT (19)</FilterBtn>
            <FilterBtn active={filters.type === "ngoai"} onClick={() => set("type", "ngoai")}>Ngoài TGTT (13)</FilterBtn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", whiteSpace: "nowrap" }}>Triển khai:</span>
            <FilterBtn active={filters.deploy === "all"} onClick={() => set("deploy", "all")}>Tất cả</FilterBtn>
            <FilterBtn active={filters.deploy === "live"} onClick={() => set("deploy", "live")}>Golive (27)</FilterBtn>
            <FilterBtn active={filters.deploy === "pending"} onClick={() => set("deploy", "pending")}>Chưa golive (5)</FilterBtn>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", whiteSpace: "nowrap" }}>Dịch vụ:</span>
            <SelectFilter value={filters.svc} onChange={(v) => set("svc", v)} options={SVC_OPTIONS} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", whiteSpace: "nowrap" }}>Mô hình:</span>
            <SelectFilter value={filters.model} onChange={(v) => set("model", v)} options={MODEL_OPTIONS} />
          </div>
          <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)", fontWeight: 600, padding: "4px 10px", borderRadius: 999, background: "rgba(8,145,178,0.1)" }}>
            {filtered.length} / 32 hợp đồng
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12, border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <thead>
              <tr>
                {["#", "", "Đối tác", "Dịch vụ", "Loại hình", "Triển khai", "Hiệu lực", "Mô hình hợp tác"].map((h) => (
                  <th
                    key={h}
                    style={{
                      background: `linear-gradient(135deg, rgba(15,61,140,0.12), rgba(8,145,178,0.06))`,
                      padding: "10px 12px",
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: 11,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  style={{
                    opacity: c.deploy === "expired" ? 0.5 : 1,
                  }}
                >
                  <td style={{ ...tdStyle, color: "var(--text-faint)", fontWeight: 600, textAlign: "center", width: 36 }}>{c.id}</td>
                  <td style={tdStyle}>
                    <CheckDot status={c.deploy} />
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{c.partner}</td>
                  <td style={tdStyle}>{c.svc}</td>
                  <td style={tdStyle}>
                    <TypeBadge type={c.type} />
                  </td>
                  <td style={tdStyle}>
                    <DeployBadge deploy={c.deploy} />
                  </td>
                  <td style={{ ...tdStyle, fontSize: 11 }}>{c.validity}</td>
                  <td style={{ ...tdStyle, fontSize: 11, color: "var(--text-faint)", maxWidth: 260 }}>{c.modelDesc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Galaxy Pay · ©2025 — Bảo mật — Galaxy Pay Confidential
      </div>
    </>
  );
}

const tdStyle = {
  padding: "9px 12px",
  borderBottom: "1px solid var(--border-faint)",
  verticalAlign: "middle",
};

function HL({ color, children }) {
  return <span style={{ padding: "1px 4px", borderRadius: 4, background: color }}>{children}</span>;
}

function StatPill({ bg, color, children }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: bg, color }}>
      {children}
    </span>
  );
}

function CheckDot({ status }) {
  const s = {
    live: { bg: "#059669", border: "#059669", check: true },
    pending: { bg: "rgba(217,119,6,0.2)", border: "#D97706", check: false },
    expired: { bg: "rgba(220,38,38,0.2)", border: "#DC2626", check: false },
  }[status] || { bg: "transparent", border: "var(--border)", check: false };

  return (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: "50%",
        border: `2px solid ${s.border}`,
        background: s.bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 8,
        color: "white",
      }}
    >
      {s.check && "✓"}
    </span>
  );
}

function TypeBadge({ type }) {
  const isTgtt = type === "tgtt";
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 999,
      fontSize: 10,
      fontWeight: 600,
      background: isTgtt ? "rgba(13,148,136,0.15)" : "rgba(124,58,237,0.12)",
      color: isTgtt ? "#2DD4BF" : "#A78BFA",
    }}>
      {isTgtt ? "TGTT" : "Ngoài TGTT"}
    </span>
  );
}

function DeployBadge({ deploy }) {
  const styles = {
    live: { bg: "rgba(5,150,105,0.15)", color: "#34d399", label: "Golive" },
    pending: { bg: "rgba(217,119,6,0.15)", color: "#FBBF24", label: "Chưa golive" },
    expired: { bg: "rgba(220,38,38,0.15)", color: "#F87171", label: "Đã thanh lý" },
  }[deploy] || { bg: "transparent", color: "var(--text-dim)", label: deploy };

  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: styles.bg, color: styles.color }}>
      {styles.label}
    </span>
  );
}
