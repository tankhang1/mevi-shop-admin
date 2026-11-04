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
  /** Agency report only — đại lý vs CTV */
  kind?: "agency" | "ctv";
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
  /** One agency / CTV's referred orders only */
  agencyId?: string;
  /** Root only */
  shopId?: string;
}

/** Báo cáo doanh thu theo sản phẩm (BE notice 2026-11-03 mục 14) */
export interface ProductRevenueReportItem {
  product: {
    id: number | string;
    code: string;
    title: string;
    imageUrl?: string;
  };
  orderCount: number;
  quantity: number;
  revenue: number;
  share: number;
}

export interface ProductRevenueReportTopItem {
  product: {
    id: number | string;
    code: string;
    title: string;
    imageUrl?: string;
  };
  revenue: number[];
}

export interface ProductRevenueReportSeries {
  period: string;
  revenue: number;
  orderCount: number;
}

export interface ProductRevenueReport {
  from: string;
  to: string;
  revenue: number;
  deliveredOrders: number;
  quantity: number;
  productCount: number;
  series: ProductRevenueReportSeries[];
  products: ProductRevenueReportItem[];
  topProducts: ProductRevenueReportTopItem[];
}

export interface ProductRevenueReportParams {
  from?: string;
  to?: string;
  granularity?: "DAY" | "WEEK" | "MONTH";
  source?: "REFERRAL" | "DIRECT" | "";
  storefrontId?: number | string;
  categoryId?: number | string;
}
