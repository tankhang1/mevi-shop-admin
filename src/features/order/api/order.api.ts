import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import {
  cleanFilters,
  fromSpringPage,
  toSpringPageParams,
} from "@/lib/pagination";
import type { ApiResponse, Paginated, SpringPage } from "@/types/api";
import type {
  Order,
  OrderDetail,
  OrderListParams,
  OrderProcessingInput,
  OrderStatusCounts,
  OrderStatusUpdateInput,
} from "../types";

const EP = API_ENDPOINTS.admin.orders;

const unwrap = <T>(data: unknown): T => {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    (data as { data: unknown }).data !== undefined
  ) {
    return (data as { data: T }).data;
  }
  return data as T;
};

export const orderApi = {
  /** Lấy danh sách đơn đặt hàng */
  list: async (params?: OrderListParams) => {
    const pageParams = params
      ? toSpringPageParams(cleanFilters(params as Record<string, unknown>))
      : undefined;
    const res = await realApiClient.get<
      SpringPage<Order> | ApiResponse<Paginated<Order>> | Paginated<Order>
    >(EP.base, {
      params: pageParams,
    });
    const raw = unwrap<SpringPage<Order> | Paginated<Order>>(res.data);
    if ("content" in raw && Array.isArray(raw.content)) {
      return (
        fromSpringPage(raw as SpringPage<Order>) ?? {
          items: [],
          page: 1,
          size: 10,
          total: 0,
        }
      );
    }
    if ("items" in raw && Array.isArray(raw.items)) {
      return raw as Paginated<Order>;
    }
    return { items: [], page: 1, size: 10, total: 0 };
  },

  /** Lấy số lượng đơn theo từng trạng thái (status-counts) */
  statusCounts: async (params?: Partial<OrderListParams>) => {
    const res = await realApiClient.get<
      OrderStatusCounts | ApiResponse<OrderStatusCounts>
    >(EP.statusCounts, { params });
    return unwrap<OrderStatusCounts>(res.data);
  },

  /** Chi tiết đơn hàng */
  detail: async (id: string | number) => {
    const res = await realApiClient.get<OrderDetail | ApiResponse<OrderDetail>>(
      EP.detail(id),
    );
    return unwrap<OrderDetail>(res.data);
  },

  /** Cập nhật trạng thái đơn (tiến bước hoặc hủy kèm lý do) */
  updateStatus: async (
    id: string | number,
    input:
      | OrderStatusUpdateInput
      | { status: Order["status"]; note?: string; reason?: string },
  ) => {
    const body = {
      status: input.status,
      reason: input.reason ?? input.note,
    };
    const res = await realApiClient.put<Order | ApiResponse<Order>>(
      EP.status(id),
      body,
    );
    return unwrap<Order>(res.data);
  },

  /** Cập nhật toàn bộ thông tin xử lý / điều phối / vận chuyển (PUT /processing) */
  updateProcessing: async (
    id: string | number,
    input: OrderProcessingInput,
  ) => {
    const res = await realApiClient.put<Order | ApiResponse<Order>>(
      EP.processing(id),
      input,
    );
    return unwrap<Order>(res.data);
  },

  /** Tương thích cũ: Gán nhóm / người phụ trách */
  assign: async (
    id: string | number,
    teamId: string | null,
    assigneeId: string | null,
  ) => {
    const res = await realApiClient.put<Order | ApiResponse<Order>>(
      EP.processing(id),
      {
        dispatchGroupId: teamId ? Number(teamId) || teamId : null,
        assigneeUserId: assigneeId ? Number(assigneeId) || assigneeId : null,
      },
    );
    return unwrap<Order>(res.data);
  },

  /** Tương thích cũ: Ghi chú nội bộ */
  updateNote: async (id: string | number, internalNote: string) => {
    const res = await realApiClient.put<Order | ApiResponse<Order>>(
      EP.processing(id),
      { internalNote },
    );
    return unwrap<Order>(res.data);
  },

  /** Tương thích cũ: Cập nhật vận đơn */
  updateTracking: async (
    id: string | number,
    data: { carrier: string; trackingCode: string },
  ) => {
    const res = await realApiClient.put<Order | ApiResponse<Order>>(
      EP.processing(id),
      {
        shippingCarrier: data.carrier,
        trackingCode: data.trackingCode,
      },
    );
    return unwrap<Order>(res.data);
  },
};
