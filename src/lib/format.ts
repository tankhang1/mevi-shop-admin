export const formatVnd = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });

/** ISO UTC → Vietnam time, whatever the browser's time zone */
export const formatDateVN = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" });

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

/** Format integer digits with "." thousand separators (e.g. 100000 → "100.000") */
export function formatVndDigits(
  val: number | string | undefined | null,
): string {
  if (val === undefined || val === null || val === "") return "";
  const num =
    typeof val === "number"
      ? val
      : Number(String(val).replace(/\D/g, ""));
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    num,
  );
}

/** Parse string with thousand separators into integer number */
export function parseVndDigits(val: string): number | undefined {
  const digits = val.replace(/\D/g, "");
  if (!digits) return undefined;
  const num = Number(digits);
  return isNaN(num) ? undefined : num;
}
