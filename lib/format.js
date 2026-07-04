// Vietnamese number formatting — ported 1:1 from the original dc.html logic.
// Thousands separator "." + decimal separator ",".
export function vn(n, d = 1) {
  const neg = n < 0;
  n = Math.abs(n);
  let [a, b] = n.toFixed(d).split(".");
  a = a.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "-" : "") + (d > 0 ? a + "," + b : a);
}

// Large "tỷ" values: no decimals once >= 1000, else 1 decimal.
export function vnTy(n) {
  return n >= 1000 ? vn(n, 0) : vn(n, 1);
}

export function pctS(n) {
  return vn(n, 1) + "%";
}

// Threshold coloring used across progress bars: >=85 green, >=60 amber, else red.
export function cCol(p) {
  return p >= 85 ? "#34d399" : p >= 60 ? "#fbbf24" : "#fb7185";
}
export function cBar(p) {
  return p >= 85
    ? "linear-gradient(90deg,#34d399,#6ee7b7)"
    : p >= 60
      ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
      : "linear-gradient(90deg,#e11d48,#fb7185)";
}

// Looser threshold used on Khối KPI cards / runrate: >=100 green, >=80 amber, else red.
export function pctColor(p) {
  return p >= 100 ? "#34d399" : p >= 80 ? "#fbbf24" : "#fb7185";
}
export function pctBarBg(p) {
  return p >= 100
    ? "linear-gradient(90deg,#34d399,#6ee7b7)"
    : p >= 80
      ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
      : "linear-gradient(90deg,#e11d48,#fb7185)";
}

export const sum = (a) => a.reduce((x, y) => x + y, 0);

// vi-VN locale formatting used by the product/OTA/Loa/personal-KPI sections.
export function vnLoc(n, d = 1) {
  return (n || 0).toLocaleString("vi-VN", { minimumFractionDigits: d, maximumFractionDigits: d });
}
export function vnInt(n) {
  return (n || 0).toLocaleString("vi-VN");
}
