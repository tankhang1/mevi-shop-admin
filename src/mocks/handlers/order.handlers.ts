import { API_ENDPOINTS } from "@/config/api-endpoints";
import { ORDER_FLOW, isFinalOrderStatus } from "@/features/order/constants";
import type { Order, OrderDetail, OrderStatus } from "@/features/order/types";
import { db } from "../db";
import { deductOrderStock } from "./inventory.handlers";
import { actor, assertOwns, requireShopAdmin, scoped } from "../scope";
import { HttpError, type MockHandler, paginate } from "../utils";

const BASE = API_ENDPOINTS.admin.orders.base;

const teamName = (id?: string | null) => (id ? db.dispatchTeams.find((t) => t.id === id)?.name : undefined);
const staffName = (id?: string | null) => (id ? db.staff.find((s) => s.id === id)?.name : undefined);

/** Shop scope, plus staff only reach orders assigned to them */
const findOwned = (id: string) => {
  const o = assertOwns(db.orders.find((x) => x.id === id), "Không tìm thấy đơn hàng");
  const { staffId } = actor();
  if (staffId && o.assigneeId !== staffId) throw new HttpError(404, "Không tìm thấy đơn hàng");
  return o;
};

function toDetail(o: Order): OrderDetail {
  return {
    ...o,
    shopName: db.shops.find((s) => s.id === o.shopId)?.name,
    agencyName: o.agencyId ? db.agencies.find((a) => a.id === o.agencyId)?.name : undefined,
    customerId: db.customers.find((c) => c.phone === (o.customerPhone ?? o.recipientPhone))?.id,
    teamName: teamName(o.teamId),
    assigneeName: staffName(o.assigneeId),
    items: (o.items ?? []).map((it) => {
      const p = db.products.find((x) => x.id === it.productId);
      return { ...it, image: p?.images[0], sku: p?.sku };
    }),
  };
}

export const orderHandlers: MockHandler[] = [
  {
    method: "GET",
    path: BASE,
    handle: ({ query }) => {
      const withShop = (o: (typeof db.orders)[number]) => ({
        ...o,
        shopName: db.shops.find((s) => s.id === o.shopId)?.name,
        teamName: teamName(o.teamId),
        assigneeName: staffName(o.assigneeId),
      });
      const customerPhone = query.customerId
        ? db.customers.find((c) => c.id === query.customerId)?.phone ?? "—"
        : undefined;
      const { staffId } = actor();
      const sorted = scoped(db.orders, query.shopId)
        .filter((o) => !staffId || o.assigneeId === staffId).map(withShop).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
      const has = (v: unknown) => !!v && v !== "all";
      const like = (actual: string | undefined | null, wanted: unknown) =>
        (actual ?? "").toLowerCase().includes(String(wanted).trim().toLowerCase());
      const groupProducts = has(query.productGroupId)
        ? (db.productGroups.find((g) => g.id === query.productGroupId)?.productIds ?? [])
        : null;
      // `to` is a day — include all of it
      const from = has(query.from) ? `${query.from}T00:00:00` : null;
      const to = has(query.to) ? `${query.to}T23:59:59.999` : null;
      const dateOf = (o: Order) => (query.dateField === "deliveredAt" ? o.deliveredAt : o.createdAt);
      const local = (iso: string) => {
        const d = new Date(iso);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 23);
      };
      const rows = sorted.filter((o) => {
        const buyerPhone = o.customerPhone ?? o.recipientPhone;
        const date = dateOf(o);
        return (
          (!has(query.status) || o.status === query.status) &&
          (!query.agencyId || o.agencyId === query.agencyId) &&
          (!customerPhone || buyerPhone === customerPhone) &&
          (!has(query.teamId) || (query.teamId === "none" ? !o.teamId : o.teamId === query.teamId)) &&
          (!has(query.assigneeId) || o.assigneeId === query.assigneeId) &&
          (!has(query.productId) || !!o.items?.some((it) => it.productId === query.productId)) &&
          (!groupProducts || !!o.items?.some((it) => groupProducts.includes(it.productId))) &&
          (!from || (!!date && local(date) >= from)) &&
          (!to || (!!date && local(date) <= to)) &&
          (!has(query.code) || like(o.code, query.code)) &&
          (!has(query.province) || o.province === query.province) &&
          (!has(query.ward) || o.ward === query.ward) &&
          (!has(query.customerCode) || like(o.customerCode, query.customerCode)) &&
          (!has(query.customerPhone) || like(buyerPhone, query.customerPhone))
        );
      });
      return {
        data: paginate(
          rows,
          query,
          (o) =>
            `${o.code} ${o.trackingCode ?? ""} ${o.customerCode ?? ""} ${o.customerName ?? ""} ${o.customerPhone ?? ""} ${o.recipientName} ${o.recipientPhone} ${o.shopName ?? ""}`,
        ),
      };
    },
  },
  {
    method: "GET",
    path: `${BASE}/:id`,
    handle: ({ params }) => ({ data: toDetail(findOwned(params.id)) }),
  },
  {
    method: "PATCH",
    path: `${BASE}/:id/assign`,
    handle: ({ params, body }: { params: Record<string, string>; body: { teamId: string | null; assigneeId: string | null } }) => {
      // Moving an order to someone else is the admin's call
      requireShopAdmin();
      const o = findOwned(params.id);
      const team = body.teamId ? db.dispatchTeams.find((t) => t.id === body.teamId) : null;
      if (body.teamId && !team) throw new HttpError(400, "Không tìm thấy nhóm điều phối");
      if (body.assigneeId && !team?.memberIds.includes(body.assigneeId))
        throw new HttpError(400, "Người xử lý phải là thành viên của nhóm");
      o.teamId = team?.id ?? null;
      o.assigneeId = team ? body.assigneeId || null : null;
      return { data: o };
    },
  },
  {
    method: "PATCH",
    path: `${BASE}/:id/tracking`,
    handle: ({ params, body }: { params: Record<string, string>; body: { carrier?: string; trackingCode?: string } }) => {
      const o = findOwned(params.id);
      o.carrier = body.carrier?.trim() || null;
      o.trackingCode = body.trackingCode?.trim() || null;
      return { data: o };
    },
  },
  {
    method: "PATCH",
    path: `${BASE}/:id/note`,
    handle: ({ params, body }: { params: Record<string, string>; body: { internalNote: string } }) => {
      const o = findOwned(params.id);
      o.internalNote = body.internalNote?.trim() || null;
      return { data: o };
    },
  },
  {
    method: "PATCH",
    path: `${BASE}/:id/status`,
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: { status: OrderStatus; note?: string };
    }) => {
      const o = findOwned(params.id);
      if (isFinalOrderStatus(o.status))
        throw new HttpError(
          400,
          "Đơn hàng đã kết thúc, không thể đổi trạng thái",
        );
      // Forward only: steps can be skipped but never undone
      if (body.status !== "cancelled" && ORDER_FLOW.indexOf(body.status) <= ORDER_FLOW.indexOf(o.status))
        throw new HttpError(400, "Không thể chuyển đơn về bước trước");
      if (body.status === "cancelled" && !body.note?.trim())
        throw new HttpError(400, "Vui lòng nhập lý do huỷ đơn");
      // Delivery takes the goods out of the warehouse
      if (body.status === "completed") deductOrderStock(o, actor().user.name ?? "—");
      o.status = body.status;
      if (body.status === "completed") o.deliveredAt = new Date().toISOString();
      if (body.status === "cancelled") o.cancelReason = body.note!.trim();
      o.statusHistory = [
        ...(o.statusHistory ?? []),
        { status: body.status, at: new Date().toISOString(), by: actor().user.name ?? "—", note: body.note?.trim() || undefined },
      ];
      return { data: o };
    },
  },
];
