import { API_ENDPOINTS } from "@/config/api-endpoints";
import { isFinalOrderStatus } from "@/features/order/constants";
import type { OrderStatus } from "@/features/order/types";
import { db } from "../db";
import { HttpError, type MockHandler, paginate } from "../utils";

const BASE = API_ENDPOINTS.admin.orders.base;

export const orderHandlers: MockHandler[] = [
  {
    method: "GET",
    path: BASE,
    handle: ({ query }) => {
      const sorted = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const rows = query.status && query.status !== "all" ? sorted.filter((o) => o.status === query.status) : sorted;
      return { data: paginate(rows, query, (o) => `${o.code} ${o.recipientName} ${o.recipientPhone}`) };
    },
  },
  {
    method: "PATCH",
    path: `${BASE}/:id/status`,
    handle: ({ params, body }: { params: Record<string, string>; body: { status: OrderStatus } }) => {
      const o = db.orders.find((x) => x.id === params.id);
      if (!o) throw new HttpError(404, "Không tìm thấy đơn hàng");
      if (isFinalOrderStatus(o.status)) throw new HttpError(400, "Đơn hàng đã kết thúc, không thể đổi trạng thái");
      o.status = body.status;
      return { data: o };
    },
  },
];
