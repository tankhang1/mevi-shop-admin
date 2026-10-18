export const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

/** 1_250_000 → "1,25 tr" · 3_400_000_000 → "3,4 tỷ" — for axes and tight tiles */
export const formatCompactVnd = (n: number) => {
  const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: v < 10 ? 2 : 1 }).format(v);
  if (Math.abs(n) >= 1e9) return `${fmt(n / 1e9)} tỷ`;
  if (Math.abs(n) >= 1e6) return `${fmt(n / 1e6)} tr`;
  if (Math.abs(n) >= 1e3) return `${fmt(n / 1e3)} k`;
  return String(n);
};

export const formatPercent = (ratio: number, digits = 1) =>
  new Intl.NumberFormat("vi-VN", { style: "percent", maximumFractionDigits: digits }).format(ratio);
