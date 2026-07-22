// Payment soundbox / speaker device silhouette with broadcasting sound waves —
// used to theme the DV Loa thanh toán report.
export default function SoundboxIcon({ size = 24, color = "#f59e0b", waves = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x={4} y={7} width={10} height={12} rx={2.5} fill={color} />
      <circle cx={9} cy={11.2} r={1.7} fill="#0a0b12" opacity={0.35} />
      <circle cx={9} cy={15.6} r={2.4} fill="#0a0b12" opacity={0.35} />
      <rect x={7.2} y={8.1} width={3.6} height={1} rx={0.5} fill="#0a0b12" opacity={0.35} />
      {waves && (
        <>
          <path d="M17 9.5a5 5 0 0 1 0 6" stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.85} />
          <path d="M19.3 7.3a8.5 8.5 0 0 1 0 10.4" stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.5} />
        </>
      )}
    </svg>
  );
}
