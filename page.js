"use client";

import { useState } from "react";
import Link from "next/link";
import { getHome, getAiInsights } from "@/lib/metrics";
import { METRIC_ICON_PATHS } from "@/lib/icons";
import { FEATURES } from "@/lib/nav";
import Icon from "@/components/ui/Icon";
import KpiCardShell from "@/components/ui/KpiCardShell";
import SegmentedTabs from "@/components/ui/SegmentedTabs";
import SectionCard from "@/components/ui/SectionCard";
import { PageHeader, DateBadge } from "@/components/ui/PageHeader";
import BarTrendChart from "@/components/charts/BarTrendChart";
import AiInsightPanel from "@/components/ui/AiInsightPanel";

const PERIOD_OPTIONS = [
  { value: "month", label: "Tháng" },
  { value: "quarter", label: "Quý" },
  { value: "h1", label: "H1" },
  { value: "year", label: "Năm" },
];

export default function HomePage() {
  const [period, setPeriod] = useState("year");
  const data = getHome(period);
  const aiInsights = getAiInsights(data);

  return (
    <>
      <AiInsightPanel insights={aiInsights} />

      <PageHeader
        eyebrow="GALAXY PAY · BÁO CÁO KHỐI KINH DOANH"
        title="Tổng quan hoạt động kinh doanh"
        subtitle={data.periodRange}
        right={
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <SegmentedTabs options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
            <DateBadge>Số liệu đến 16/07/2026</DateBadge>
          </div>
        }
      />

      <section className="grid-3">
        {data.metrics.map((m) => (
          <KpiCardShell key={m.key} label={m.label} icon={<Icon paths={METRIC_ICON_PATHS[m.key]} />} iconBg={m.iconBg} glow={m.glow}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 14, position: "relative" }}>
              <span className="mono" style={{ fontSize: 27, fontWeight: 700, letterSpacing: -0.5 }}>{m.value}</span>
              <span style={{ fontSize: 13, color: "#8a8fa6", fontWeight: 600 }}>{m.unit}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, position: "relative" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, padding: "3px 8px", borderRadius: 7, color: m.deltaColor, background: m.deltaBg }}>
                {m.deltaArrow} {m.delta}
              </span>
              <span style={{ fontSize: 11.5, color: "#7a7e92" }}>so với kỳ trước</span>
            </div>
            <div style={{ marginTop: 16, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8a8fa6", marginBottom: 6 }}>
                <span>{m.compLabel}</span>
                <span className="mono" style={{ fontWeight: 700, color: m.h1Color }}>{m.h1pct}</span>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: m.h1bar, borderRadius: 6, background: "linear-gradient(90deg,#7c6cff,#b98cff)" }} />
              </div>
            </div>
          </KpiCardShell>
        ))}
      </section>

      <section className="grid-home-split">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Tiến độ hoàn thành mục tiêu 2026</h2>
              <div style={{ fontSize: 12, color: "#8a8fa6", marginTop: 3 }}>Thực đạt lũy kế so với Target năm · vạch ▏ = Target H1</div>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#a7abbe" }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(90deg,#7c6cff,#b98cff)" }} />Thực đạt
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#a7abbe" }}>
                <span style={{ width: 2, height: 12, background: "#fbbf24" }} />Target H1
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
            {data.targets.map((t) => (
              <div key={t.name} style={{ padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.055)" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#ecedf5", whiteSpace: "nowrap", flexShrink: 0 }}>{t.name}</span>
                  <span style={{ fontSize: 12, color: "#8a8fa6", whiteSpace: "nowrap" }}>
                    Thực đạt <b className="mono" style={{ color: "#ecedf5" }}>{t.actual}</b> / Năm <b className="mono" style={{ color: "#c9cbd8" }}>{t.year}</b>
                  </span>
                </div>
                <div style={{ position: "relative", height: 14, borderRadius: 8, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, width: t.fill, borderRadius: 8, background: "linear-gradient(90deg,#6d5efc,#b98cff)" }} />
                </div>
                <div style={{ position: "relative", height: 0 }}>
                  <div style={{ position: "absolute", top: -16, left: t.h1mark, width: 2, height: 16, background: "#fbbf24", boxShadow: "0 0 6px rgba(251,191,36,0.6)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9 }}>
                  <span style={{ fontSize: 11.5, color: "#8a8fa6" }}>
                    Target H1: <b className="mono" style={{ color: "#c9cbd8" }}>{t.h1}</b> · Đạt H1 <b style={{ color: t.h1Color }}>{t.h1pct}</b>
                  </span>
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 800, color: "#c3b9ff" }}>{t.yearPct} năm</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(165deg, rgba(124,108,255,0.16), rgba(255,255,255,0.012))",
            border: "1px solid rgba(124,108,255,0.24)",
            borderRadius: 18,
            padding: 22,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Summary mục tiêu H1</h2>
          <div style={{ fontSize: 12, color: "#a7abbe", marginTop: 3 }}>Lũy kế T1–T6 vs Target H1 (bình quân GMV/DT/LN)</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "20px 0 4px" }}>
            <span
              className="mono"
              style={{
                fontSize: 44, fontWeight: 700,
                background: "linear-gradient(120deg,#c3b9ff,#fff)",
                WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
            >
              73,0%
            </span>
          </div>
          <div style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 8, color: "#fbbf24", background: "rgba(251,191,36,0.12)" }}>
            ↓ Chậm hơn tiến độ (đã qua 6/6 tháng)
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "20px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: "#b9bccb" }}>Chỉ số bám tiến độ H1</span>
              <span className="mono" style={{ fontWeight: 700, color: "#fbbf24" }}>1 / 3</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: "#b9bccb" }}>GMV lũy kế T1–T6</span>
              <span className="mono" style={{ fontWeight: 700 }}>{data.trendTotal}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: "#b9bccb" }}>Biên lợi nhuận gộp</span>
              <span className="mono" style={{ fontWeight: 700 }}>{data.marginPct}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, color: "#b9bccb" }}>Cần chú ý</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fb7185" }}>{data.attentionLabel}</span>
            </div>
          </div>

          <Link
            href="/khoi"
            style={{
              marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: 12, borderRadius: 12, textDecoration: "none", fontSize: 13, fontWeight: 700,
              color: "#0a0b12", background: "linear-gradient(90deg,#8a7dff,#c3b9ff)",
            }}
          >
            Xem báo cáo chi tiết →
          </Link>
        </div>
      </section>

      <SectionCard
        title="Xu hướng GMV theo tháng 2026"
        subtitle={null}
        right={
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{data.trendTotal}</span>
            <span style={{ fontSize: 12, color: "#8a8fa6" }}>lũy kế T1–T6</span>
          </div>
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11.5, color: "#8a8fa6", marginTop: 6, marginBottom: -8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(180deg,#b98cff,#7c6cff)" }} />Thực đạt (T1–T6)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "repeating-linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.18) 3px,transparent 3px,transparent 6px)" }} />Kế hoạch (T6–T12)
          </span>
          <span style={{ color: "#5f6377" }}>Đơn vị: tỷ VND</span>
        </div>
        <BarTrendChart data={data.trend} />
      </SectionCard>

      <section className="grid-2">
        <SectionCard
          title="Xu hướng Doanh thu theo tháng 2026"
          right={
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{data.trendTotalDT}</span>
              <span style={{ fontSize: 11, color: "#8a8fa6" }}>lũy kế T1–T6</span>
            </div>
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11.5, color: "#8a8fa6", marginTop: 6, marginBottom: -6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(180deg,#6ee7b7,#34d399)" }} />Thực đạt (T1–T6)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "repeating-linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.18) 3px,transparent 3px,transparent 6px)" }} />Kế hoạch (T6–T12)
            </span>
          </div>
          <BarTrendChart data={data.trendDT} heightPx={180} gap="6px" maxBarWidth={34} valueFontSize={9.5} labelFontSize={10} />
        </SectionCard>

        <SectionCard
          title="Xu hướng Lợi nhuận theo tháng 2026"
          right={
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{data.trendTotalLN}</span>
              <span style={{ fontSize: 11, color: "#8a8fa6" }}>lũy kế T1–T6</span>
            </div>
          }
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11.5, color: "#8a8fa6", marginTop: 6, marginBottom: -6 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "linear-gradient(180deg,#fcd34d,#f59e0b)" }} />Thực đạt (T1–T6)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: "repeating-linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0.18) 3px,transparent 3px,transparent 6px)" }} />Kế hoạch (T6–T12)
            </span>
          </div>
          <BarTrendChart data={data.trendLN} heightPx={180} gap="6px" maxBarWidth={34} valueFontSize={9.5} labelFontSize={10} />
        </SectionCard>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Phân hệ báo cáo</h2>
          <span style={{ fontSize: 12, color: "#8a8fa6" }}>Truy cập nhanh</span>
        </div>
        <div className="grid-4">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              style={{
                textDecoration: "none", display: "flex", flexDirection: "column", gap: 14, padding: 18,
                borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: f.iconBg }}>
                  <Icon paths={f.icon} />
                </span>
                {f.href === "/" && (
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: "#9d8bff", padding: "3px 8px", borderRadius: 6, background: "rgba(124,108,255,0.14)" }}>
                    ĐANG XEM
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ecedf5" }}>{f.title}</div>
                <div style={{ fontSize: 12, color: "#8a8fa6", marginTop: 4, lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
