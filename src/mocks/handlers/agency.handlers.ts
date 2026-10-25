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
];
