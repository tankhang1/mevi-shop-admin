import { API_ENDPOINTS } from "@/config/api-endpoints";
import { VIP_SPEND } from "@/features/customer/constants";
import type { Customer, CustomerInput, CustomerSegment, CustomerWithStats } from "@/features/customer/types";
import { db } from "../db";
import { actor, scoped } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const EP = API_ENDPOINTS.admin.customers;

/** Purchase stats over the orders the caller may see (own shop for shop admins) */
function withStats(c: Customer): CustomerWithStats {
  const orders = scoped(db.orders).filter((o) => o.recipientPhone === c.phone);
  const done = orders.filter((o) => o.status === "completed");
  const totalSpent = done.reduce((s, o) => s + o.total, 0);
  const segment: CustomerSegment = totalSpent >= VIP_SPEND ? "vip" : orders.length >= 2 ? "returning" : "new";
  return {
    ...c,
    orderCount: orders.length,
    totalSpent,
    lastOrderAt: orders.reduce<string | null>((m, o) => (!m || o.createdAt > m ? o.createdAt : m), null),
    segment,
  };
}

/** Root sees everyone; a shop admin sees customers who ordered from their shop */
function visible() {
  const { shopId } = actor();
  const rows = db.customers.map(withStats);
  return shopId ? rows.filter((c) => c.orderCount > 0 || c.createdByShopId === shopId) : rows;
}

function findVisible(id: string) {
  const c = visible().find((x) => x.id === id);
  if (!c) throw new HttpError(404, "Không tìm thấy khách hàng");
  return c;
}

function assertPhoneFree(phone: string, exceptId?: string) {
  if (db.customers.some((c) => c.phone === phone && c.id !== exceptId)) {
    throw new HttpError(409, "Số điện thoại đã thuộc về khách hàng khác");
  }
}

const clean = (b: CustomerInput) => ({
  name: b.name.trim(),
  phone: b.phone.trim(),
  email: b.email?.trim() || undefined,
  address: b.address?.trim() || undefined,
  tags: [...new Set((b.tags ?? []).map((t) => t.trim()).filter(Boolean))],
  note: b.note?.trim() || undefined,
});

export const customerHandlers: MockHandler[] = [
  {
    method: "GET",
    path: EP.base,
    handle: ({ query }) => {
      const rows = visible()
        .filter((c) => !query.segment || query.segment === "all" || c.segment === query.segment)
        .filter((c) => !query.tag || query.tag === "all" || c.tags.includes(String(query.tag)))
        .sort((a, b) => (b.lastOrderAt ?? b.createdAt).localeCompare(a.lastOrderAt ?? a.createdAt));
      return { data: paginate(rows, query, (c) => `${c.name} ${c.phone} ${c.email ?? ""} ${c.tags.join(" ")}`) };
    },
  },
  {
    method: "GET",
    path: EP.stats,
    handle: () => {
      const rows = visible();
      // Since the 1st of the current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      return {
        data: {
          total: rows.length,
          newThisMonth: rows.filter((c) => c.createdAt >= monthStart).length,
          returning: rows.filter((c) => c.segment === "returning").length,
          vip: rows.filter((c) => c.segment === "vip").length,
        },
      };
    },
  },
  {
    method: "GET",
    path: `${EP.base}/:id`,
    handle: ({ params }) => ({ data: findVisible(params.id) }),
  },
  {
    method: "POST",
    path: EP.base,
    handle: ({ body }: { body: CustomerInput }) => {
      const data = clean(body);
      assertPhoneFree(data.phone);
      const c: Customer = { ...data, id: uid("c"), createdAt: new Date().toISOString(), createdByShopId: actor().shopId };
      db.customers.unshift(c);
      return { data: withStats(c) };
    },
  },
  {
    method: "PUT",
    path: `${EP.base}/:id`,
    handle: ({ params, body }: { params: Record<string, string>; body: CustomerInput }) => {
      findVisible(params.id);
      const c = db.customers.find((x) => x.id === params.id)!;
      const data = clean(body);
      assertPhoneFree(data.phone, c.id);
      // Past orders are matched by phone, so keep them linked when the number changes
      if (data.phone !== c.phone) {
        db.orders.forEach((o) => {
          if (o.recipientPhone === c.phone) o.recipientPhone = data.phone;
        });
      }
      Object.assign(c, data);
      return { data: withStats(c) };
    },
  },
];
