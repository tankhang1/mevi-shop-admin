import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type { Shop, ShopAdminInput, ShopListParams, ShopProfileInput } from "../types";

const EP = API_ENDPOINTS.admin.shops;

export const shopApi = {
  // Root only
  list: async (params: ShopListParams) =>
    (await apiClient.get<ApiResponse<Paginated<Shop>>>(EP.base, { params })).data.data,
  get: async (id: string) => (await apiClient.get<ApiResponse<Shop>>(EP.detail(id))).data.data,
  update: async (id: string, data: ShopAdminInput) =>
    (await apiClient.patch<ApiResponse<Shop>>(EP.detail(id), data)).data.data,

  // Shop admin — their own shop, resolved from the token
  me: async () => (await apiClient.get<ApiResponse<Shop>>(EP.me)).data.data,
  updateMe: async (data: ShopProfileInput) => (await apiClient.put<ApiResponse<Shop>>(EP.me, data)).data.data,
};
