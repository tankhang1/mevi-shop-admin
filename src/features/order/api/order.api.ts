import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type { Order, OrderDetail, OrderListParams, OrderStatus } from "../types";

const EP = API_ENDPOINTS.admin.orders;

export const orderApi = {
  list: async (params: OrderListParams) =>
    (await apiClient.get<ApiResponse<Paginated<Order>>>(EP.base, { params })).data.data,

  detail: async (id: string) => (await apiClient.get<ApiResponse<OrderDetail>>(EP.detail(id))).data.data,

  updateStatus: async (id: string, status: OrderStatus, note?: string) =>
    (await apiClient.patch<ApiResponse<Order>>(EP.status(id), { status, note })).data.data,

  assign: async (id: string, teamId: string | null, assigneeId: string | null) =>
    (await apiClient.patch<ApiResponse<Order>>(EP.assign(id), { teamId, assigneeId })).data.data,

  updateNote: async (id: string, internalNote: string) =>
    (await apiClient.patch<ApiResponse<Order>>(EP.note(id), { internalNote })).data.data,
};
