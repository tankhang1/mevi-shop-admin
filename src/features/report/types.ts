export type RevenueGroupBy = "agency" | "product" | "group" | "farm";

export interface RevenueRow {
  /** Entity id, or "none" for the catch-all row (bán trực tiếp / chưa phân nhóm / chưa gắn nông hộ) */
  id: string;
  label: string;
  /** Second line, e.g. SKU, farm location, agency rate */
  sub?: string;
  orders: number;
  units: number;
  revenue: number;
  /** % of the period's total revenue */
  share: number;
  /** Agency report only — commission earned on that revenue */
  commission?: number;
}

/** Time bucket picked by the backend from the range length */
export type TrendBucket = "day" | "week" | "month";

export interface TrendPoint {
  /** Bucket start, ISO date */
  date: string;
  revenue: number;
  orders: number;
}

/** One of the top entities, revenue per trend bucket (same order as `trend`) */
export interface TrendSeries {
  id: string;
  label: string;
  values: number[];
}

export interface RevenueReport {
  groupBy: RevenueGroupBy;
  from: string;
  to: string;
  bucket: TrendBucket;
  trend: TrendPoint[];
  topSeries: TrendSeries[];
  totals: { revenue: number; orders: number; units: number; commission?: number };
  rows: RevenueRow[];
}

export type OrderSource = "all" | "agency" | "direct";

export interface RevenueReportParams {
  groupBy: RevenueGroupBy;
  /** Inclusive, YYYY-MM-DD */
  from: string;
  to: string;
  /** Product category — keeps only matching order lines */
  category?: string;
  /** Orders through an agency / CTV link vs direct sales */
  source?: OrderSource;
  /** Root only */
  shopId?: string;
}
