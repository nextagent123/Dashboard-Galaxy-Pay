// Shared hover tooltip for chart components. Charts wrap their own root in a
// position:relative div and render this positioned by percentage (x/y as %
// of the chart's own box) so it works regardless of the chart's internal
// coordinate system (SVG viewBox or plain flex/div layout).
export default function ChartTooltip({ x, y, align = "top", children }) {
  if (x == null || y == null) return null;
  const isTop = align === "top";
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: isTop ? "translate(-50%, -100%) translateY(-10px)" : "translate(-50%, 0) translateY(10px)",
        background: "rgba(13,14,23,0.97)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 9,
        padding: "7px 11px",
        fontSize: 11.5,
        color: "#ecedf5",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        zIndex: 30,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}
