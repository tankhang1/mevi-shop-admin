import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ProductCategory, ProductCategoryInput } from "../types";

const EP = API_ENDPOINTS.admin.catalog.categories;

export const categoryApi = {
  list: async () => (await apiClient.get<ProductCategory[]>(EP.base)).data,

  detail: async (id: number) => (await apiClient.get<ProductCategory>(EP.detail(id))).data,

  create: async (data: ProductCategoryInput) => (await apiClient.post<ProductCategory>(EP.base, data)).data,

  update: async (id: number, data: ProductCategoryInput) =>
    (await apiClient.put<ProductCategory>(EP.detail(id), data)).data,

  /** 409 while the category still has products */
  remove: async (id: number) => {
    await apiClient.delete(EP.detail(id));
  },
};
