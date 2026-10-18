import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type { Order, OrderListParams, OrderStatus } from "../types";

const EP = API_ENDPOINTS.admin.orders;

export const orderApi = {
  list: async (params: OrderListParams) =>
    (await apiClient.get<ApiResponse<Paginated<Order>>>(EP.base, { params })).data.data,

  updateStatus: async (id: string, status: OrderStatus) =>
    (await apiClient.patch<ApiResponse<Order>>(EP.status(id), { status })).data.data,
};
