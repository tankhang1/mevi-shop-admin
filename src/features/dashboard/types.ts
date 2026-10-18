import type { Order, OrderStatus } from "@/features/order/types";

export type DashboardRange = 7 | 30 | 90;

/** Current value + same-length previous period, for the delta badge */
export interface Metric {
  value: number;
  previous: number;
}

export interface DashboardSummary {
  range: DashboardRange;
  kpis: {
    /** Sum of completed orders in range */
    revenue: Metric;
    orders: Metric;
    avgOrderValue: Metric;
    /** 0..1 */
    cancelRate: Metric;
  };
  /** Point-in-time counts (not range-bound) */
  snapshot: {
    productCount: number;
    pendingProducts: number;
    newOrders: number;
    activeAgencies: number;
    agencyCount: number;
  };
  /** One point per day, oldest first */
  trend: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  categoryRevenue: { category: string; revenue: number }[];
  topProducts: { id: string; name: string; image?: string; sold: number; revenue: number }[];
  recentOrders: Order[];
}
