import { API_ENDPOINTS } from "@/config/api-endpoints";
import { isFinalOrderStatus } from "@/features/order/constants";
import type { OrderStatus } from "@/features/order/types";
import { db } from "../db";
import { assertOwns, scoped } from "../scope";
import { HttpError, type MockHandler, paginate } from "../utils";

const BASE = API_ENDPOINTS.admin.orders.base;

export const orderHandlers: MockHandler[] = [
  {
    method: "GET",
    path: BASE,
    handle: ({ query }) => {
      const withShop = (o: (typeof db.orders)[number]) => ({
        ...o,
        shopName: db.shops.find((s) => s.id === o.shopId)?.name,
      });
      const sorted = scoped(db.orders, query.shopId).map(withShop).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
      const rows = sorted.filter(
        (o) =>
          (!query.status ||
            query.status === "all" ||
            o.status === query.status) &&
          (!query.agencyId || o.agencyId === query.agencyId),
      );
      return {
        data: paginate(
          rows,
          query,
          (o) => `${o.code} ${o.recipientName} ${o.recipientPhone} ${o.shopName ?? ""}`,
        ),
      };
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
      body: { status: OrderStatus };
    }) => {
      const o = assertOwns(
        db.orders.find((x) => x.id === params.id),
        "Không tìm thấy đơn hàng",
      );
      if (isFinalOrderStatus(o.status))
        throw new HttpError(
          400,
          "Đơn hàng đã kết thúc, không thể đổi trạng thái",
        );
      o.status = body.status;
      return { data: o };
    },
  },
];
