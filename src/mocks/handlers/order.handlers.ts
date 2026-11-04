import { API_ENDPOINTS } from "@/config/api-endpoints";
import { ORDER_FLOW, isFinalOrderStatus } from "@/features/order/constants";
import type { Order, OrderDetail, OrderStatus, ShippingCarrier } from "@/features/order/types";
import { db } from "../db";
import { deductOrderStock } from "./inventory.handlers";
import { actor, assertOwns, scoped } from "../scope";
import { HttpError, type MockHandler, paginate } from "../utils";

const BASE = API_ENDPOINTS.admin.orders.base; // "/api/shop/orders"
const OLD_BASE = "/api/admin/shop/orders";

const normalizeStatus = (s: string): OrderStatus => {
  if (s === "new") return "CONFIRMED";
  if (s === "completed") return "DELIVERED";
  if (s === "cancelled") return "CANCELLED";
  return s as OrderStatus;
};

const teamName = (id?: string | null) => (id ? db.dispatchTeams.find((t) => t.id === id)?.name : undefined);
const staffName = (id?: string | null) => (id ? db.staff.find((s) => s.id === id)?.name : undefined);

/** Shop scope, plus staff only reach orders assigned to them */
const findOwned = (id: string | number) => {
  const strId = String(id);
  const o = assertOwns(db.orders.find((x) => String(x.id) === strId), "Không tìm thấy đơn hàng");
  const { staffId } = actor();
  if (staffId && o.assigneeId !== staffId) throw new HttpError(404, "Không tìm thấy đơn hàng");
  return o;
};

function formatOrder(o: (typeof db.orders)[number]): Order {
  const status = normalizeStatus(o.status);
  const tName = teamName(o.teamId);
  const sName = staffName(o.assigneeId);
  const agency = o.agencyId ? db.agencies.find((a) => a.id === o.agencyId) : undefined;

  const items = (o.items ?? []).map((it, idx) => {
    const p = db.products.find((x) => x.id === it.productId);
    return {
      ...it,
      id: it.id ?? `item-${o.id}-${idx}`,
      product: {
        id: it.productId,
        code: p?.sku ?? `PRD-${it.productId}`,
        title: it.name ?? p?.name,
        imageUrl: it.image ?? p?.images?.[0],
      },
      name: it.name ?? p?.name,
      image: it.image ?? p?.images?.[0],
      sku: it.sku ?? p?.sku,
      unitPrice: it.price,
      lineTotal: (it.unitPrice ?? it.price ?? 0) * it.quantity,
    };
  });

  return {
    ...o,
    status,
    recipient: {
      name: o.recipientName ?? "Khách hàng",
      phone: o.recipientPhone ?? "0900000000",
      province: o.province ?? "TP. Hồ Chí Minh",
      district: o.ward ?? "Quận 1",
      addressLine: o.address ?? "",
    },
    customer: {
      id: o.customerId ?? 1,
      code: o.customerCode ?? "KH-001",
      fullName: o.customerName ?? o.recipientName ?? "Khách hàng",
      phoneNumber: o.customerPhone ?? o.recipientPhone,
      email: o.customerEmail ?? null,
    },
    items,
    storefront: agency ? { id: agency.id, name: agency.name } : null,
    commission: o.commissionRate
      ? {
          rate: o.commissionRate,
          amount: Math.round((o.total * o.commissionRate) / 100),
          status: o.commissionPaidAt
            ? "PAID"
            : status === "DELIVERED"
              ? "PAYABLE"
              : status === "CANCELLED"
                ? "CANCELLED"
                : "PENDING",
        }
      : null,
    dispatchGroup: o.teamId ? { id: o.teamId, name: tName ?? `Nhóm #${o.teamId}` } : null,
    assignee: o.assigneeId ? { id: o.assigneeId, fullName: sName ?? `NV #${o.assigneeId}` } : null,
    shippingCarrier: (o.carrier as ShippingCarrier) ?? null,
    teamName: tName,
    assigneeName: sName,
  };
}

function toDetail(o: (typeof db.orders)[number]): OrderDetail {
  const base = formatOrder(o);
  return {
    ...base,
    shopName: db.shops.find((s) => s.id === o.shopId)?.name,
    agencyName: o.agencyId ? db.agencies.find((a) => a.id === o.agencyId)?.name : undefined,
    customerId: db.customers.find((c) => c.phone === (o.customerPhone ?? o.recipientPhone))?.id,
  };
}

const getFilteredOrders = (query: Record<string, unknown>) => {
  const { staffId } = actor();
  const sorted = scoped(db.orders, query.shopId as string)
    .filter((o) => !staffId || o.assigneeId === staffId)
    .map(formatOrder)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const has = (v: unknown) => !!v && v !== "all";
  const like = (actual: string | undefined | null, wanted: unknown) =>
    (actual ?? "").toLowerCase().includes(String(wanted).trim().toLowerCase());
  const groupProducts = has(query.productGroupId)
    ? (db.productGroups.find((g) => g.id === query.productGroupId)?.productIds ?? [])
    : null;

  const from = has(query.from) ? `${query.from}T00:00:00` : null;
  const to = has(query.to) ? `${query.to}T23:59:59.999` : null;
  const dateOf = (o: Order) => (query.dateField === "deliveredAt" ? o.deliveredAt : o.createdAt);
  const local = (iso: string) => {
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 23);
  };

  return sorted.filter((o) => {
    const date = dateOf(o);
    const targetStatus = has(query.status) ? normalizeStatus(String(query.status)) : null;

    const rName = o.recipient?.name ?? o.recipientName ?? "";
    const rPhone = o.recipient?.phone ?? o.recipientPhone ?? "";
    const rProvince = o.recipient?.province ?? o.province;
    const rDistrict = o.recipient?.district ?? o.ward;

    return (
      (!targetStatus || o.status === targetStatus) &&
      (!query.agencyId || o.agencyId === query.agencyId) &&
      (!query.storefrontId || o.storefront?.id === query.storefrontId || o.agencyId === query.storefrontId) &&
      (!has(query.unassigned) || (query.unassigned === "true" || query.unassigned === true ? !o.dispatchGroup : !!o.dispatchGroup)) &&
      (!has(query.dispatchGroupId) || String(o.dispatchGroup?.id) === String(query.dispatchGroupId)) &&
      (!has(query.teamId) || (query.teamId === "none" ? !o.teamId : o.teamId === query.teamId)) &&
      (!has(query.assigneeUserId) || String(o.assignee?.id) === String(query.assigneeUserId)) &&
      (!has(query.assigneeId) || o.assigneeId === query.assigneeId) &&
      (!has(query.commissionStatus) || o.commission?.status === query.commissionStatus) &&
      (!has(query.productId) || !!o.items?.some((it) => it.productId === query.productId)) &&
      (!groupProducts || !!o.items?.some((it) => it.productId && groupProducts.includes(it.productId))) &&
      (!from || (!!date && local(date) >= from)) &&
      (!to || (!!date && local(date) <= to)) &&
      (!has(query.code) || like(o.code, query.code)) &&
      (!has(query.keyword) ||
        like(o.code, query.keyword) ||
        like(rName, query.keyword) ||
        like(rPhone, query.keyword) ||
        like(o.trackingCode, query.keyword)) &&
      (!has(query.province) || rProvince === query.province) &&
      (!has(query.ward) || rDistrict === query.ward)
    );
  });
};

export const orderHandlers: MockHandler[] = [
  // 1. Status Counts
  {
    method: "GET",
    path: `${BASE}/status-counts`,
    handle: ({ query }) => {
      const q = { ...query };
      delete q.status;
      const allMatches = getFilteredOrders(q);

      const counts = {
        pending: 0,
        confirmed: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0,
        total: allMatches.length,
      };

      for (const o of allMatches) {
        if (o.status === "PENDING") counts.pending++;
        else if (o.status === "CONFIRMED") counts.confirmed++;
        else if (o.status === "SHIPPING") counts.shipping++;
        else if (o.status === "DELIVERED") counts.delivered++;
        else if (o.status === "CANCELLED") counts.cancelled++;
      }

      return { data: counts };
    },
  },
  // 2. List orders (Hỗ trợ cả BASE và OLD_BASE)
  {
    method: "GET",
    path: BASE,
    handle: ({ query }) => {
      const rows = getFilteredOrders(query);
      return {
        data: paginate(
          rows,
          query,
          (o) =>
            `${o.code} ${o.trackingCode ?? ""} ${o.customer?.code ?? ""} ${o.customer?.fullName ?? ""} ${o.customer?.phoneNumber ?? ""} ${o.recipient?.name ?? o.recipientName} ${o.recipient?.phone ?? o.recipientPhone} ${o.shopName ?? ""}`,
        ),
      };
    },
  },
  {
    method: "GET",
    path: OLD_BASE,
    handle: ({ query }) => {
      const rows = getFilteredOrders(query);
      return {
        data: paginate(
          rows,
          query,
          (o) =>
            `${o.code} ${o.trackingCode ?? ""} ${o.recipient?.name ?? o.recipientName} ${o.recipient?.phone ?? o.recipientPhone}`,
        ),
      };
    },
  },
  // 3. Detail order
  {
    method: "GET",
    path: `${BASE}/:id`,
    handle: ({ params }) => ({ data: toDetail(findOwned(params.id)) }),
  },
  {
    method: "GET",
    path: `${OLD_BASE}/:id`,
    handle: ({ params }) => ({ data: toDetail(findOwned(params.id)) }),
  },
  // 4. Update status (PUT /status)
  {
    method: "PUT",
    path: `${BASE}/:id/status`,
    handle: ({ params, body }: { params: Record<string, string>; body: { status: OrderStatus; reason?: string; note?: string } }) => {
      const o = findOwned(params.id);
      const currentStatus = normalizeStatus(o.status);
      const newStatus = normalizeStatus(body.status);

      if (isFinalOrderStatus(currentStatus)) {
        throw new HttpError(400, "Đơn hàng đã kết thúc, không thể đổi trạng thái");
      }
      if (newStatus !== "CANCELLED" && ORDER_FLOW.indexOf(newStatus) <= ORDER_FLOW.indexOf(currentStatus)) {
        throw new HttpError(400, "Không thể chuyển đơn về bước trước");
      }
      const cancelReason = body.reason?.trim() || body.note?.trim();
      if (newStatus === "CANCELLED" && !cancelReason) {
        throw new HttpError(400, "Vui lòng nhập lý do huỷ đơn");
      }

      if (newStatus === "DELIVERED") {
        deductOrderStock(o, actor().user.name ?? "—");
        o.deliveredAt = new Date().toISOString();
      }
      if (newStatus === "CANCELLED") {
        o.cancelledAt = new Date().toISOString();
        o.cancelReason = cancelReason;
      }
      o.status = newStatus;
      o.statusHistory = [
        ...(o.statusHistory ?? []),
        { status: newStatus, at: new Date().toISOString(), by: actor().user.name ?? "—", note: cancelReason },
      ];
      return { data: formatOrder(o) };
    },
  },
  // 5. Update processing (PUT /processing)
  {
    method: "PUT",
    path: `${BASE}/:id/processing`,
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: {
        dispatchGroupId?: number | string | null;
        assigneeUserId?: number | string | null;
        shippingCarrier?: string | null;
        trackingCode?: string | null;
        internalNote?: string | null;
      };
    }) => {
      const o = findOwned(params.id);
      if (body.dispatchGroupId !== undefined) {
        const team = body.dispatchGroupId ? db.dispatchTeams.find((t) => t.id === String(body.dispatchGroupId)) : null;
        if (body.dispatchGroupId && !team) throw new HttpError(400, "Không tìm thấy nhóm điều phối");
        o.teamId = team?.id ?? null;
      }
      if (body.assigneeUserId !== undefined) {
        o.assigneeId = body.assigneeUserId ? String(body.assigneeUserId) : null;
      }
      if (body.shippingCarrier !== undefined) {
        o.carrier = body.shippingCarrier?.trim() || null;
      }
      if (body.trackingCode !== undefined) {
        o.trackingCode = body.trackingCode?.trim() || null;
      }
      if (body.internalNote !== undefined) {
        o.internalNote = body.internalNote?.trim() || null;
      }
      return { data: formatOrder(o) };
    },
  },
  // Backward compatibility: PATCH endpoints
  {
    method: "PATCH",
    path: `${OLD_BASE}/:id/status`,
    handle: ({ params, body }: { params: Record<string, string>; body: { status: OrderStatus; note?: string } }) => {
      const o = findOwned(params.id);
      const newStatus = normalizeStatus(body.status);
      o.status = newStatus;
      if (newStatus === "DELIVERED") o.deliveredAt = new Date().toISOString();
      if (newStatus === "CANCELLED") o.cancelReason = body.note;
      return { data: formatOrder(o) };
    },
  },
];
