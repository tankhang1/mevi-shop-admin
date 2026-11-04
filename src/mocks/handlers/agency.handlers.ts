import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { Agency, AgencyInput, Commission, CommissionStatus } from "@/features/agency/types";
import type { Order } from "@/features/order/types";
import { db } from "../db";
import { requireRoot } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const BASE = API_ENDPOINTS.admin.agencies.base;

function findAgency(id: string) {
  const a = db.agencies.find((x) => x.id === id);
  if (!a) throw new HttpError(404, "Không tìm thấy đại lý");
  return a;
}

function commissionOf(o: Order, fallbackRate: number): Commission {
  const rate = o.commissionRate ?? fallbackRate;
  const status: CommissionStatus =
    o.status === "cancelled" ? "void" : o.status !== "completed" ? "pending" : o.commissionPaidAt ? "paid" : "payable";
  return {
    id: o.id,
    orderId: o.id,
    orderCode: o.code,
    orderTotal: o.total,
    orderStatus: o.status,
    rate,
    amount: Math.round((o.total * rate) / 100),
    status,
    paidAt: o.commissionPaidAt ?? null,
    createdAt: o.createdAt,
  };
}

export const agencyHandlers: MockHandler[] = [
  {
    method: "GET",
    path: BASE,
    handle: ({ query }) => (requireRoot(), {
      data: paginate(db.agencies, query, (a) => `${a.name} ${a.slug}`),
    }),
  },
  {
    method: "POST",
    path: BASE,
    handle: ({ body }: { body: AgencyInput }) => {
      requireRoot();
      if (db.agencies.some((a) => a.slug === body.slug))
        throw new HttpError(409, "Slug đã tồn tại");
      const agency: Agency = {
        ...body,
        id: uid("a"),
        active: true,
        createdAt: new Date().toISOString(),
      };
      db.agencies.unshift(agency);
      return { data: agency };
    },
  },
  {
    method: "GET",
    path: `${BASE}/:id`,
    handle: ({ params }) => {
      requireRoot();
      const a = db.agencies.find((x) => x.id === params.id);
      if (!a) throw new HttpError(404, "Không tìm thấy đại lý");
      return { data: a };
    },
  },
  {
    method: "PATCH",
    path: `${BASE}/:id`,
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: Partial<Agency>;
    }) => {
      requireRoot();
      const a = db.agencies.find((x) => x.id === params.id);
      if (!a) throw new HttpError(404, "Không tìm thấy đại lý");
      if (
        body.slug &&
        db.agencies.some((x) => x.slug === body.slug && x.id !== a.id)
      ) {
        throw new HttpError(409, "Slug đã tồn tại");
      }
      Object.assign(a, body);
      return { data: a };
    },
  },
  {
    method: "GET",
    path: `${BASE}/:id/commissions`,
    handle: ({ params, query }) => {
      requireRoot();
      const a = findAgency(params.id);
      const all = db.orders
        .filter((o) => o.agencyId === a.id)
        .map((o) => commissionOf(o, a.commissionRate))
        .sort((x, y) => y.createdAt.localeCompare(x.createdAt));
      const summary = { pending: 0, payable: 0, paid: 0, void: 0 };
      all.forEach((c) => (summary[c.status] += c.amount));
      const rows = all.filter((c) => !query.status || query.status === "all" || c.status === query.status);
      return { data: { ...paginate(rows, query, (c) => c.orderCode), summary } };
    },
  },
  {
    method: "POST",
    path: `${BASE}/:id/commissions/payout`,
    handle: ({ params, body }: { params: Record<string, string>; body: { orderIds: string[] } }) => {
      requireRoot();
      const a = findAgency(params.id);
      const now = new Date().toISOString();
      let count = 0;
      let amount = 0;
      for (const o of db.orders) {
        if (o.agencyId !== a.id || !body.orderIds?.includes(o.id)) continue;
        const c = commissionOf(o, a.commissionRate);
        if (c.status !== "payable") continue;
        o.commissionPaidAt = now;
        count++;
        amount += c.amount;
      }
      if (!count) throw new HttpError(400, "Không có hoa hồng nào cần thanh toán");
      return { data: { count, amount } };
    },
  },
  {
    method: "DELETE",
    path: `${BASE}/:id`,
    handle: ({ params }) => {
      requireRoot();
      const i = db.agencies.findIndex((x) => x.id === params.id);
      if (i < 0) throw new HttpError(404, "Không tìm thấy đại lý");
      db.agencies.splice(i, 1);
      // Orders stay in history but lose the referral link
      db.orders.forEach((o) => {
        if (o.agencyId === params.id) o.agencyId = undefined;
      });
      return { data: null };
    },
  },
  // ── Partner Profiles Mock Handlers (Mục 13) ──
  {
    method: "GET",
    path: "/api/admin/shop/partner-profiles/:id/order-stats",
    handle: ({ params }) => {
      const a = findAgency(params.id);
      const orders = db.orders.filter((o) => o.agencyId === a.id);
      const delivered = orders.filter((o) => o.status === "DELIVERED" || o.status === "completed");
      const rev = delivered.reduce((s, o) => s + o.total, 0);

      return {
        data: {
          orders: {
            pending: orders.filter((o) => o.status === "PENDING" || o.status === "new").length,
            confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
            shipping: orders.filter((o) => o.status === "SHIPPING").length,
            delivered: delivered.length,
            cancelled: orders.filter((o) => o.status === "CANCELLED" || o.status === "cancelled").length,
            total: orders.length,
          },
          deliveredRevenue: rev,
          averageOrderValue: delivered.length ? Math.round(rev / delivered.length) : 0,
        },
      };
    },
  },
  {
    method: "GET",
    path: "/api/admin/shop/partner-profiles/:id/commission-summary",
    handle: ({ params }) => {
      const a = findAgency(params.id);
      const orders = db.orders.filter((o) => o.agencyId === a.id);
      const rate = a.commissionRate ?? 8;

      let pendingAmount = 0;
      let payableAmount = 0;
      let payableOrderCount = 0;
      let paidAmount = 0;

      for (const o of orders) {
        const amt = Math.round((o.total * (o.commissionRate ?? rate)) / 100);
        if (o.commissionPaidAt) {
          paidAmount += amt;
        } else if (o.status === "DELIVERED" || o.status === "completed") {
          payableAmount += amt;
          payableOrderCount++;
        } else if (o.status !== "CANCELLED" && o.status !== "cancelled") {
          pendingAmount += amt;
        }
      }

      return {
        data: {
          commissionRate: rate,
          pendingAmount,
          payableAmount,
          payableOrderCount,
          paidAmount,
        },
      };
    },
  },
  {
    method: "POST",
    path: "/api/admin/shop/partner-profiles/:id/commission-payouts",
    handle: ({ params, body }: { params: Record<string, string>; body?: { note?: string } }) => {
      const a = findAgency(params.id);
      const now = new Date().toISOString();
      let count = 0;
      let amount = 0;

      for (const o of db.orders) {
        if (o.agencyId !== a.id || o.commissionPaidAt) continue;
        if (o.status === "DELIVERED" || o.status === "completed") {
          o.commissionPaidAt = now;
          count++;
          amount += Math.round((o.total * (o.commissionRate ?? a.commissionRate)) / 100);
        }
      }

      if (!count) throw new HttpError(409, "Không còn hoa hồng nào cần thanh toán");

      return {
        data: {
          id: Math.floor(Math.random() * 1000) + 1,
          storefrontId: Number(a.id) || 9001,
          amount,
          orderCount: count,
          note: body?.note?.trim() || null,
          paidBy: { id: 1, fullName: "Quản trị viên" },
          paidAt: now,
        },
      };
    },
  },
  {
    method: "GET",
    path: "/api/admin/shop/partner-profiles/:id/commission-payouts",
    handle: () => ({
      data: [
        {
          id: 1,
          storefrontId: 9001,
          amount: 178960,
          orderCount: 3,
          note: "Chuyển khoản Vietcombank tháng trước",
          paidBy: { id: 1, fullName: "Lê Chủ Shop" },
          paidAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        },
      ],
    }),
  },
  {
    method: "PUT",
    path: "/api/admin/shop/partner-profiles/:id/commission",
    handle: ({ params, body }: { params: Record<string, string>; body: { commissionRate: number } }) => {
      const a = findAgency(params.id);
      if (body.commissionRate < 0 || body.commissionRate > 100) {
        throw new HttpError(400, "Tỷ lệ hoa hồng không hợp lệ (0-100%)");
      }
      a.commissionRate = body.commissionRate;
      return { data: a };
    },
  },
  {
    method: "GET",
    path: "/api/admin/shop/partner-profiles/:id/report",
    handle: ({ params, query }) => {
      const a = findAgency(params.id);
      const orders = db.orders.filter((o) => o.agencyId === a.id && (o.status === "DELIVERED" || o.status === "completed"));
      const rev = orders.reduce((s, o) => s + o.total, 0);

      return {
        data: {
          totalRevenue: rev,
          totalDeliveredOrders: orders.length,
          monthRevenue: Math.round(rev * 0.4),
          monthDeliveredOrders: Math.max(1, Math.round(orders.length * 0.4)),
          monthQuantity: orders.reduce((s, o) => s + (o.items ?? []).reduce((q, it) => q + it.quantity, 0), 0),
          dataThrough: new Date().toISOString().slice(0, 10),
          series: [
            { period: String(query.from || "2026-10-05"), revenue: Math.round(rev * 0.3), orderCount: 3 },
            { period: String(query.to || "2026-11-03"), revenue: Math.round(rev * 0.7), orderCount: 7 },
          ],
          products: db.products.slice(0, 5).map((p, i) => ({
            product: { id: p.id, code: p.sku, title: p.name, imageUrl: p.images[0] },
            orderCount: 4 - i,
            quantity: 10 + i * 2,
            revenue: (p.salePrice ?? p.price) * (10 + i * 2),
            share: 20.0,
          })),
          topProducts: db.products.slice(0, 5).map((p) => ({
            product: { id: p.id, code: p.sku, title: p.name, imageUrl: p.images[0] },
            revenue: [100000, 200000],
          })),
        },
      };
    },
  },
];
