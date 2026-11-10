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

/** Filter chung cho các API báo cáo (BE notice 2026-11-09) */
export interface ReportFilterParams {
  from?: string;
  to?: string;
  source?: "REFERRAL" | "DIRECT" | "";
  storefrontId?: number | string;
  categoryId?: number | string;
  keyword?: string;
  page?: number;
  size?: number;
  granularity?: "DAY" | "WEEK" | "MONTH";
  top?: number;
}

export interface ReportSeriesPoint {
  period: string;
  revenue: number;
  orderCount: number;
}

// ── 1. Báo cáo sản phẩm ──
export interface ProductRevenueReportItem {
  id?: string | number;
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

export type ProductRevenueReportSeries = ReportSeriesPoint;

export interface ProductRevenueSummary {
  from: string;
  to: string;
  revenue: number;
  deliveredOrders: number;
  quantity: number;
  productCount: number;
  series: ReportSeriesPoint[];
  topProducts: ProductRevenueReportTopItem[];
}

// Legacy alias
export type ProductRevenueReport = ProductRevenueSummary & {
  products?: ProductRevenueReportItem[];
};
export type ProductRevenueReportParams = ReportFilterParams;

// ── 2. Báo cáo đại lý / CTV ──
export interface PartnerRevenueTopItem {
  storefrontId: number;
  name: string;
  revenue: number[];
}

export interface PartnerRevenueSummary {
  from: string;
  to: string;
  revenue: number;
  deliveredOrders: number;
  quantity: number;
  commission: number;
  series: ReportSeriesPoint[];
  topPartners: PartnerRevenueTopItem[];
}

export interface PartnerRevenueItem {
  id?: string | number;
  storefrontId: number | null;
  name: string | null;
  partnerType: "AGENCY" | "COLLABORATOR" | null;
  commissionRate: number | null;
  orderCount: number;
  quantity: number;
  revenue: number;
  share: number;
  commission: number | null;
}

// ── 3. Báo cáo nông hộ / HTX ──
export interface FarmRevenueTopItem {
  workspaceId: number;
  name: string;
  revenue: number[];
}

export interface FarmRevenueSummary {
  from: string;
  to: string;
  revenue: number;
  deliveredOrders: number;
  quantity: number;
  farmCount: number;
  series: ReportSeriesPoint[];
  topFarms: FarmRevenueTopItem[];
}

export interface FarmRevenueItem {
  id?: string | number;
  workspaceId: number;
  name: string;
  organizationTypeName?: string | null;
  district?: string | null;
  province?: string | null;
  orderCount: number;
  quantity: number;
  revenue: number;
  share: number;
}

// ── 4. Báo cáo nhóm sản phẩm (Danh mục) ──
export interface CategoryRevenueTopItem {
  categoryId: number;
  name: string;
  revenue: number[];
}

export interface CategoryRevenueSummary {
  from: string;
  to: string;
  revenue: number;
  deliveredOrders: number;
  quantity: number;
  categoryCount: number;
  series: ReportSeriesPoint[];
  topCategories: CategoryRevenueTopItem[];
}

export interface CategoryRevenueItem {
  id?: string | number;
  categoryId: number;
  name: string;
  productCount: number;
  orderCount: number;
  quantity: number;
  revenue: number;
  share: number;
}
