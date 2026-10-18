import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { DashboardSummary } from "@/features/dashboard/types";
import { db } from "../db";
import type { MockHandler } from "../utils";

export const dashboardHandlers: MockHandler[] = [
  {
    method: "GET",
    path: API_ENDPOINTS.admin.summary,
    handle: () => {
      const summary: DashboardSummary = {
        productCount: db.products.length,
        pendingCount: db.products.filter((p) => p.status === "pending").length,
        orderCount: db.orders.length,
        newOrderCount: db.orders.filter((o) => o.status === "new").length,
        revenue: db.orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total, 0),
        recentOrders: [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
      };
      return { data: summary };
    },
  },
];
