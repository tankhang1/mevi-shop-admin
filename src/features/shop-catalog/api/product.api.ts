import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type {
  CatalogProduct,
  CatalogProductInput,
  CatalogProductListItem,
  BulkSetProductCategoryInput,
  CatalogProductListParams,
  CatalogProductStatusCountParams,
  CatalogProductStatusCounts,
  LowStockThresholdInput,
  ProductStatus,
} from "../types";

const EP = API_ENDPOINTS.admin.catalog.products;

export const catalogProductApi = {
  list: async (params: CatalogProductListParams) =>
    (await realApiClient.get<SpringPage<CatalogProductListItem>>(EP.base, { params })).data,

  /** Pass the list's filters so counts match the list */
  statusCounts: async (params: CatalogProductStatusCountParams = {}) =>
    (await realApiClient.get<CatalogProductStatusCounts>(EP.statusCounts, { params })).data,

  detail: async (id: number) => (await realApiClient.get<CatalogProduct>(EP.detail(id))).data,

  create: async (data: CatalogProductInput) => (await realApiClient.post<CatalogProduct>(EP.base, data)).data,

  update: async (id: number, data: CatalogProductInput) =>
    (await realApiClient.put<CatalogProduct>(EP.detail(id), data)).data,

  remove: async (id: number) => {
    await realApiClient.delete(EP.detail(id));
  },

  setStatus: async (id: number, status: ProductStatus) =>
    (await realApiClient.put<CatalogProduct>(EP.status(id), { status })).data,

  /** Only the listed variants are written; others keep their threshold */
  setLowStockThresholds: async (id: number, thresholds: LowStockThresholdInput[]) =>
    (await realApiClient.put<CatalogProduct>(EP.lowStockThresholds(id), { thresholds })).data,

  /** 204, all-or-nothing; 400 `fieldErrors["productIds[i]"]` / `categoryId`, 503 if public shop sync fails */
  bulkSetCategory: async (data: BulkSetProductCategoryInput) => {
    await realApiClient.put(EP.bulkCategory, data);
  },
};
