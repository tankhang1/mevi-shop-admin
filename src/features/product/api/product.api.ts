import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type { ModerateProductInput, Product, ProductInput, ProductListParams } from "../types";

const EP = API_ENDPOINTS.admin.products;

export const productApi = {
  list: async (params: ProductListParams) =>
    (await apiClient.get<ApiResponse<Paginated<Product>>>(EP.base, { params })).data.data,

  detail: async (id: string) => (await apiClient.get<ApiResponse<Product>>(EP.detail(id))).data.data,

  create: async (data: ProductInput) => (await apiClient.post<ApiResponse<Product>>(EP.base, data)).data.data,

  update: async (id: string, data: ProductInput) =>
    (await apiClient.put<ApiResponse<Product>>(EP.detail(id), data)).data.data,

  remove: async (id: string) => {
    await apiClient.delete(EP.detail(id));
  },

  moderate: async (id: string, data: ModerateProductInput) =>
    (await apiClient.patch<ApiResponse<Product>>(EP.moderate(id), data)).data.data,
};
