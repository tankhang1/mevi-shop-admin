import type { TrendBucket } from "@/features/report";

/** Axis/tooltip label for a bucket start */
export function bucketLabel(iso: string, bucket: TrendBucket, long = false) {
  const d = new Date(iso);
  if (bucket === "month")
    return d.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" });
  const day = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
  if (bucket === "week") return long ? `Tuần từ ${day}` : day;
  return long
    ? d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      })
    : day;
}

export const BUCKET_LABEL: Record<TrendBucket, string> = {
  day: "ngày",
  week: "tuần",
  month: "tháng",
};

/** Categorical slots 1–5 of the validated reference palette (light surface), fixed order — never cycled */
export const SERIES_COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
];
