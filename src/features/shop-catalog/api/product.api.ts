import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type {
  CatalogProduct,
  CatalogProductInput,
  CatalogProductListItem,
  CatalogProductListParams,
  LowStockThresholdInput,
  ProductStatus,
} from "../types";

const EP = API_ENDPOINTS.admin.catalog.products;

export const catalogProductApi = {
  list: async (params: CatalogProductListParams) =>
    (await apiClient.get<SpringPage<CatalogProductListItem>>(EP.base, { params })).data,

  detail: async (id: number) => (await apiClient.get<CatalogProduct>(EP.detail(id))).data,

  create: async (data: CatalogProductInput) => (await apiClient.post<CatalogProduct>(EP.base, data)).data,

  update: async (id: number, data: CatalogProductInput) =>
    (await apiClient.put<CatalogProduct>(EP.detail(id), data)).data,

  remove: async (id: number) => {
    await apiClient.delete(EP.detail(id));
  },

  setStatus: async (id: number, status: ProductStatus) =>
    (await apiClient.put<CatalogProduct>(EP.status(id), { status })).data,

  /** Only the listed variants are written; others keep their threshold */
  setLowStockThresholds: async (id: number, thresholds: LowStockThresholdInput[]) =>
    (await apiClient.put<CatalogProduct>(EP.lowStockThresholds(id), { thresholds })).data,
};
