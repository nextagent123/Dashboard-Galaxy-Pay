import { ReportHeader } from "./ui/PageHeader";
import Icon from "./ui/Icon";

export default function ComingSoon({ eyebrow, title, subtitle, icon }) {
  return (
    <>
      <ReportHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <section
        style={{
          flex: 1,
          minHeight: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          textAlign: "center",
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed rgba(255,255,255,0.12)",
          borderRadius: 18,
          padding: 48,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: "rgba(124,108,255,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9d8bff",
          }}
        >
          <Icon paths={icon} size={30} strokeWidth={1.6} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#ecedf5" }}>Phân hệ đang được xây dựng</div>
          <div style={{ fontSize: 13.5, color: "#8a8fa6", marginTop: 8, maxWidth: 420, lineHeight: 1.6 }}>
            Nội dung báo cáo này chưa được thiết kế. Khi có số liệu và yêu cầu cụ thể, phân hệ sẽ được bổ sung vào đây.
          </div>
        </div>
      </section>
    </>
  );
}
