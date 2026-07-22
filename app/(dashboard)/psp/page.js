"use client";

import { ReportHeader } from "@/components/ui/PageHeader";

const ACCENT = "#0891B2";
const GP1 = "#0F3D8C";
const GP2 = "#0B6FA4";

const PARTNERS = [
  { name: "Galaxy Pay", color: `linear-gradient(135deg, ${GP1}, ${ACCENT})` },
  { name: "HDBank", color: "#34d399" },
  { name: "VietinBank", color: "#7c6cff" },
  { name: "Vietcombank", color: "#0F766E" },
];

const PROVIDERS = [
  {
    title: "Thẻ / Tài khoản thanh toán",
    badge: "Trực tiếp",
    badgeType: "direct",
    headGrad: `linear-gradient(135deg, rgba(15,61,140,0.25), rgba(8,145,178,0.15))`,
    content: (
      <>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Cybersource", "Mastercard", "Adyen"].map((n) => (
            <Chip key={n} large>{n}</Chip>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
          {["Visa", "Mastercard", "Amex", "JCB", "UnionPay"].map((n) => (
            <Chip key={n}>{n}</Chip>
          ))}
        </div>
        <GroupLabel>Nội địa</GroupLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          <Chip>NAPAS</Chip>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
          Thẻ/Tài khoản TT Nội địa và Quốc tế
        </div>
        <GroupLabel>Big Tech Payment</GroupLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {["G Pay", "Samsung Pay", "Apple Pay"].map((n) => (
            <Chip key={n}>{n}</Chip>
          ))}
        </div>
      </>
    ),
  },
  {
    title: "Ví điện tử & QR",
    badge: "Trực tiếp",
    badgeType: "direct",
    headGrad: `linear-gradient(135deg, rgba(13,148,136,0.25), rgba(8,145,178,0.15))`,
    content: (
      <>
        <div style={{ textAlign: "center", padding: "6px 0" }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#6B9CF0" }}>SkyPay</div>
          <div style={{ fontSize: 10, color: "var(--text-dim)" }}>Ví điện tử tích hợp</div>
        </div>
        <GroupLabel>Đổi SkyPoint</GroupLabel>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Chip style={{ borderColor: "#B45309", color: "#FBBF24" }}>💰 SkyPoint</Chip>
        </div>
        <GroupLabel>Ví điện tử khác</GroupLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {["MoMo", "ZaloPay", "VNPay", "Viettel Money"].map((n) => (
            <Chip key={n}>{n}</Chip>
          ))}
        </div>
        <GroupLabel>Mã QR</GroupLabel>
        <div style={{ display: "flex" }}>
          <Chip style={{ flex: 1, textAlign: "center", justifyContent: "center" }}>VietQR Code</Chip>
        </div>
      </>
    ),
  },
  {
    title: "Đa tiền tệ quốc tế",
    badge: "Mở rộng",
    badgeType: "new",
    headGrad: `linear-gradient(135deg, rgba(8,145,178,0.25), rgba(15,61,140,0.15))`,
    content: (
      <>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Cybersource", "Mastercard"].map((n) => (
            <Chip key={n} large>{n}</Chip>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
          Payment Gateway Services
        </div>
        <GroupLabel>Tiền tệ hỗ trợ</GroupLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {["RM", "¥", "$", "$", "₹", "¥", "$", "NT$", "₩", "S$", "฿", "Rp"].map((c, i) => (
            <CurrencyDot key={i}>{c}</CurrencyDot>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
          12+ tiền tệ · 13+ thị trường
        </div>
      </>
    ),
  },
  {
    title: "Alternative Payment",
    badge: "Mở rộng",
    badgeType: "new",
    headGrad: `linear-gradient(135deg, rgba(124,58,237,0.2), rgba(8,145,178,0.15))`,
    content: (
      <>
        {[
          { flag: "🇨🇳", name: "Alipay+", detail: "CNY · Alipay Hub" },
          { flag: "🇦🇺", name: "PayID / POLi", detail: "AUD · Azupay" },
          { flag: "🇰🇷", name: "Smartro", detail: "KRW · KakaoPay" },
          { flag: "🇮🇳", name: "PayU", detail: "INR · UPI" },
          { flag: "🇹🇭", name: "2C2P", detail: "THB · JPY" },
          { flag: "🇮🇩", name: "DOKU", detail: "IDR · QRIS" },
          { flag: "🇪🇺", name: "Adyen Hub", detail: "EUR · iDEAL" },
        ].map((a) => (
          <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
            <span style={{ fontSize: 16, width: 24, textAlign: "center", flexShrink: 0 }}>{a.flag}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-dim)" }}>{a.detail}</div>
            </div>
          </div>
        ))}
      </>
    ),
  },
];

const MARKETS = [
  { flag: "🇻🇳", name: "Việt Nam", psp: "VND · NAPAS · MoMo · ZaloPay", methods: ["Thẻ", "VietQR", "CK", "Ví"], live: true },
  { flag: "🌐", name: "Thẻ quốc tế", psp: "Cybs · MPGS · Adyen", methods: ["Visa", "MC", "JCB", "Amex", "UnionPay"], live: true },
  { flag: "🇰🇷", name: "Hàn Quốc", psp: "KRW · Smartro", methods: ["KakaoPay", "TossPay", "NaverPay"] },
  { flag: "🇯🇵", name: "Nhật Bản", psp: "JPY · 2C2P", methods: ["PayPay", "Konbini"] },
  { flag: "🇨🇳", name: "Trung Quốc", psp: "CNY · Alipay Hub", methods: ["Alipay", "WeChat Pay"] },
  { flag: "🇮🇳", name: "Ấn Độ", psp: "INR · PayU", methods: ["UPI", "PhonePe", "LazyPay"] },
  { flag: "🇮🇩", name: "Indonesia", psp: "IDR · DOKU", methods: ["QRIS", "OVO", "BRI Ceria"] },
  { flag: "🇦🇺", name: "Úc · NZ", psp: "AUD · Azupay · POLi", methods: ["PayID", "Afterpay", "Zip"] },
  { flag: "🇪🇺", name: "Châu Âu", psp: "EUR · Adyen Hub", methods: ["iDEAL", "Klarna", "Trustly"] },
];

const STATS = [
  { val: "10+", label: "PSP quốc tế" },
  { val: "13+", label: "Thị trường" },
  { val: "40+", label: "Phương thức TT" },
  { val: "3", label: "Ngân hàng QT (VN)" },
];

function Chip({ children, large, style }) {
  return (
    <span
      style={{
        padding: large ? "8px 12px" : "6px 10px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.04)",
        fontSize: large ? 13 : 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function GroupLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 600,
        color: "#6B9CF0",
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginTop: 10,
        marginBottom: 2,
      }}
    >
      <span style={{ width: 14, height: 1, background: "var(--border)" }} />
      {children}
    </div>
  );
}

function CurrencyDot({ children }) {
  return (
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        color: "var(--text-dim)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      {children}
    </span>
  );
}

const badgeStyles = {
  direct: { background: "rgba(13,148,136,0.2)", color: "#2DD4BF" },
  new: { background: "rgba(8,145,178,0.2)", color: "#22D3EE" },
};

export default function PspPage() {
  return (
    <>
      <ReportHeader
        eyebrow="GALAXY PAY · QUẢN LÝ ĐẦU VÀO"
        title="Nền tảng điều phối thanh toán"
        subtitle="Payment Orchestration Platform — Quy hoạch đầu vào PSP"
      />

      {/* Flow diagram */}
      <section className="card" style={{ padding: "28px 32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 24, flexWrap: "wrap" }}>
          <FlowNode icon="🏪" label="Merchant" />
          <FlowArrow />
          <FlowNode
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10A15 15 0 0 1 12 2z" />
              </svg>
            }
            label="Payment Orchestration"
            platform
          />
          <FlowArrow />
          <FlowNode icon="💻" label="Web" />
          <FlowNode icon="📱" label="Mobile" />
          <FlowNode icon="💳" label="POS / SDK" />
        </div>

        {/* Partners */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          {PARTNERS.map((p) => (
            <span
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 7,
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.03)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.color }} />
              {p.name}
            </span>
          ))}
        </div>

        {/* Axis */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", margin: "12px 0 20px", height: 32 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#F87171", position: "relative", zIndex: 1 }}>Việt Nam</span>
          <div style={{ position: "absolute", left: 70, right: 70, top: "50%", height: 0, borderTop: "2px dashed var(--border)" }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#A78BFA", position: "relative", zIndex: 1 }}>Quốc tế</span>
        </div>

        {/* Provider grid */}
        <style>{`
          .psp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
          @media (max-width: 1024px) { .psp-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 640px)  { .psp-grid { grid-template-columns: 1fr; } }
          .psp-card {
            border: 1px solid var(--border);
            border-radius: 16px;
            background: rgba(255,255,255,0.02);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
            animation: pspFadeUp 0.5s ease both;
          }
          .psp-card:nth-child(1) { animation-delay: 0s; }
          .psp-card:nth-child(2) { animation-delay: 0.08s; }
          .psp-card:nth-child(3) { animation-delay: 0.16s; }
          .psp-card:nth-child(4) { animation-delay: 0.24s; }
          .psp-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px -8px rgba(8,145,178,0.25);
            border-color: rgba(107,156,240,0.35);
          }
          @keyframes pspFadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="psp-grid">
          {PROVIDERS.map((p) => (
            <div key={p.title} className="psp-card">
              <div
                style={{
                  padding: "14px 16px 12px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: p.headGrad,
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{p.title}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 999,
                    ...badgeStyles[p.badgeType],
                  }}
                >
                  {p.badge}
                </span>
              </div>
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                {p.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Global coverage */}
      <section className="card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            Phạm vi toàn cầu
            <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: "rgba(52,211,153,0.15)", color: "#34d399" }}>Tương lai</span>
          </h2>
          <div style={{ display: "flex", gap: 12 }}>
            <LegendItem color="#34d399" label="Đang chạy" />
            <LegendItem color="#22D3EE" label="Mở rộng" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {MARKETS.map((m) => (
            <div
              key={m.name}
              style={{
                padding: 14,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{m.flag} {m.name}</span>
                {m.live && (
                  <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 999, background: "rgba(52,211,153,0.15)", color: "#34d399" }}>
                    Đang chạy
                  </span>
                )}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--text-dim)" }}>{m.psp}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                {m.methods.map((mt) => (
                  <span key={mt} style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: "rgba(107,156,240,0.15)", color: "#6B9CF0" }}>
                    {mt}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              border: "1px dashed rgba(107,156,240,0.4)",
              background: "rgba(107,156,240,0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              gap: 4,
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6B9CF0" }}>Có thể mở rộng</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>PSP mới cắm vào cùng lớp điều phối</div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginTop: 18,
            padding: 20,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${GP1}, ${GP2} 50%, ${ACCENT})`,
            boxShadow: `0 6px 24px -6px rgba(15,61,140,0.3)`,
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ padding: "18px 16px", borderRadius: 12, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)" }}>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: "white" }}>
                {s.val}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 5, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Galaxy Pay · ©2025 — Bảo mật — Galaxy Pay Confidential
      </div>
    </>
  );
}

function FlowNode({ icon, label, platform }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 80 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          ...(platform
            ? {
                background: `linear-gradient(135deg, ${GP1}, ${ACCENT})`,
                color: "white",
                border: "none",
                boxShadow: `0 6px 18px -4px rgba(8,145,178,0.35)`,
              }
            : {
                background: "rgba(107,156,240,0.1)",
                border: "1px solid var(--border)",
              }),
        }}
      >
        {icon}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: platform ? "#6B9CF0" : "var(--text-dim)", textAlign: "center", maxWidth: 90 }}>
        {label}
      </span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "0 6px", flexShrink: 0 }}>
      <div style={{ width: 40, height: 0, borderTop: "2px dashed var(--border)" }} />
      <div style={{ width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: "8px solid #6B9CF0" }} />
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "var(--text-dim)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
      {label}
    </div>
  );
}
