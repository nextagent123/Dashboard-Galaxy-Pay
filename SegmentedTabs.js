export default function SegmentedTabs({ options, value, onChange, size = "md" }) {
  const pad = size === "sm" ? "7px 13px" : "7px 16px";
  const fontSize = size === "sm" ? 12.5 : 13;
  return (
    <div className="seg-tabs">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={active ? "seg-tab active" : "seg-tab"}
            style={{ padding: pad, fontSize }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
