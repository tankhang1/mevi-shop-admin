import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { CategoryListParams, ProductCategory, ProductCategoryInput } from "../types";

const EP = API_ENDPOINTS.admin.catalog.categories;

export const categoryApi = {
  /** Not paged, sorted by sortOrder then id */
  list: async (params: CategoryListParams = {}) => (await realApiClient.get<ProductCategory[]>(EP.base, { params })).data,

  detail: async (id: number) => (await realApiClient.get<ProductCategory>(EP.detail(id))).data,

  create: async (data: ProductCategoryInput) => (await realApiClient.post<ProductCategory>(EP.base, data)).data,

  update: async (id: number, data: ProductCategoryInput) =>
    (await realApiClient.put<ProductCategory>(EP.detail(id), data)).data,

  /** 409 while the category still has products */
  remove: async (id: number) => {
    await realApiClient.delete(EP.detail(id));
  },
};
