import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  DashboardRange,
  DashboardSummary,
} from "@/features/dashboard/types";
import { ORDER_STATUSES } from "@/features/order/constants";
import type { Order } from "@/features/order/types";
import { db } from "../db";
import { actor, scoped } from "../scope";
import type { MockHandler } from "../utils";

const DAY = 86_400_000;
const startOfDay = (t: number) =>
  new Date(new Date(t).toDateString()).getTime();

function periodStats(orders: Order[]) {
  const completed = orders.filter((o) => o.status === "completed");
  const revenue = completed.reduce((s, o) => s + o.total, 0);
  return {
    revenue,
    orders: orders.length,
    avgOrderValue: completed.length
      ? Math.round(revenue / completed.length)
      : 0,
    cancelRate: orders.length
      ? orders.filter((o) => o.status === "cancelled").length / orders.length
      : 0,
  };
}

export const dashboardHandlers: MockHandler[] = [
  {
    method: "GET",
    path: API_ENDPOINTS.admin.summary,
    handle: ({ query }) => {
      const range = (Number(query.range) || 30) as DashboardRange;
      const today = startOfDay(Date.now());
      const from = today - (range - 1) * DAY;
      const prevFrom = from - range * DAY;
      const at = (o: Order) => new Date(o.createdAt).getTime();

      const { isRoot } = actor();
      const orders = scoped(db.orders);
      const products = scoped(db.products);
      const reviews = scoped(db.reviews).filter((r) => !r.hidden);
      const current = orders.filter((o) => at(o) >= from);
      const previous = orders.filter(
        (o) => at(o) >= prevFrom && at(o) < from,
      );
      const cur = periodStats(current);
      const prev = periodStats(previous);
      const metric = (k: keyof typeof cur) => ({
        value: cur[k],
        previous: prev[k],
      });

      const trend = Array.from({ length: range }, (_, i) => {
        const dayStart = from + i * DAY;
        const day = current.filter(
          (o) => at(o) >= dayStart && at(o) < dayStart + DAY,
        );
        return {
          date: new Date(dayStart).toISOString(),
          revenue: day
            .filter((o) => o.status === "completed")
            .reduce((s, o) => s + o.total, 0),
          orders: day.length,
        };
      });

      const productById = new Map(products.map((p) => [p.id, p]));
      const sales = new Map<string, { sold: number; revenue: number }>();
      const byCategory = new Map<string, number>();
      for (const o of current) {
        if (o.status !== "completed") continue;
        for (const it of o.items ?? []) {
          const s = sales.get(it.productId) ?? { sold: 0, revenue: 0 };
          s.sold += it.quantity;
          s.revenue += it.quantity * it.price;
          sales.set(it.productId, s);
          const cat = productById.get(it.productId)?.category ?? "Khác";
          byCategory.set(
            cat,
            (byCategory.get(cat) ?? 0) + it.quantity * it.price,
          );
        }
      }

      const summary: DashboardSummary = {
        range,
        kpis: {
          revenue: metric("revenue"),
          orders: metric("orders"),
          avgOrderValue: metric("avgOrderValue"),
          cancelRate: metric("cancelRate"),
        },
        snapshot: {
          productCount: products.length,
          pendingProducts: products.filter((p) => p.status === "pending")
            .length,
          newOrders: orders.filter((o) => o.status === "new").length,
          unrepliedReviews: reviews.filter((r) => !r.reply).length,
          averageRating: reviews.length
            ? reviews.reduce((t, r) => t + r.rating, 0) / reviews.length
            : 0,
          // Partner counts only make sense for Mevi staff
          ...(isRoot && {
            activeAgencies: db.agencies.filter((a) => a.active).length,
            agencyCount: db.agencies.length,
            shopCount: db.shops.filter((s) => s.active).length,
          }),
        },
        trend,
        ordersByStatus: ORDER_STATUSES.map((status) => ({
          status,
          count: current.filter((o) => o.status === status).length,
        })),
        categoryRevenue: [...byCategory]
          .map(([category, revenue]) => ({ category, revenue }))
          .sort((a, b) => b.revenue - a.revenue),
        topProducts: [...sales]
          .map(([id, s]) => ({
            id,
            name: productById.get(id)?.name ?? id,
            image: productById.get(id)?.images[0],
            ...s,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5),
        recentOrders: [...orders]
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 6),
      };
      return { data: summary };
    },
  },
];
