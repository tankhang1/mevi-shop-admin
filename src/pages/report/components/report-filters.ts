import type { OrderSource } from "@/features/report";

export type RangePreset = "7" | "30" | "90" | "365" | "custom";

export interface ReportFilterState {
  preset: RangePreset;
  from: string;
  to: string;
  category: string;
  source: OrderSource;
  shopId: string;
}

export const PRESETS: { value: RangePreset; label: string }[] = [
  { value: "7", label: "7 ngày" },
  { value: "30", label: "30 ngày" },
  { value: "90", label: "90 ngày" },
  { value: "365", label: "12 tháng" },
  { value: "custom", label: "Tuỳ chọn" },
];

export const isoDay = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return z.toISOString().slice(0, 10);
};

/** Last N days up to today */
export const rangeFor = (days: number) => ({
  from: isoDay(new Date(Date.now() - (days - 1) * 86_400_000)),
  to: isoDay(new Date()),
});

export const defaultFilters = (shopId = "all"): ReportFilterState => ({
  preset: "30",
  ...rangeFor(30),
  category: "all",
  source: "all",
  shopId,
});
