import type { Order } from "@/features/order/types";

export interface DashboardSummary {
  productCount: number;
  pendingCount: number;
  orderCount: number;
  newOrderCount: number;
  /** Sum of completed orders */
  revenue: number;
  recentOrders: Order[];
}
