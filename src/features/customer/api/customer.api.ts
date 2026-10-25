import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type { CustomerInput, CustomerListParams, CustomerStats, CustomerWithStats } from "../types";

const EP = API_ENDPOINTS.admin.customers;

export const customerApi = {
  list: async (params: CustomerListParams) =>
    (await apiClient.get<ApiResponse<Paginated<CustomerWithStats>>>(EP.base, { params })).data.data,

  stats: async () => (await apiClient.get<ApiResponse<CustomerStats>>(EP.stats)).data.data,

  detail: async (id: string) => (await apiClient.get<ApiResponse<CustomerWithStats>>(EP.detail(id))).data.data,

  create: async (data: CustomerInput) =>
    (await apiClient.post<ApiResponse<CustomerWithStats>>(EP.base, data)).data.data,

  update: async (id: string, data: CustomerInput) =>
    (await apiClient.put<ApiResponse<CustomerWithStats>>(EP.detail(id), data)).data.data,
};
