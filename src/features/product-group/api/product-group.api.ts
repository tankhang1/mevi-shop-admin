import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type { ProductGroup, ProductGroupDetail, ProductGroupInput, ProductGroupListParams } from "../types";

const EP = API_ENDPOINTS.admin.productGroups;

export const productGroupApi = {
  list: async (params: ProductGroupListParams) =>
    (await apiClient.get<ApiResponse<Paginated<ProductGroup>>>(EP.base, { params })).data.data,

  detail: async (id: string) => (await apiClient.get<ApiResponse<ProductGroupDetail>>(EP.detail(id))).data.data,

  create: async (data: ProductGroupInput) =>
    (await apiClient.post<ApiResponse<ProductGroup>>(EP.base, data)).data.data,

  update: async (id: string, data: ProductGroupInput) =>
    (await apiClient.put<ApiResponse<ProductGroup>>(EP.detail(id), data)).data.data,

  remove: async (id: string) => {
    await apiClient.delete(EP.detail(id));
  },

  /** Replaces the group's member list */
  setProducts: async (id: string, productIds: string[]) =>
    (await apiClient.put<ApiResponse<ProductGroup>>(EP.products(id), { productIds })).data.data,
};
