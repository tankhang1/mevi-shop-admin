import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type { InventoryRow, InventoryRowListParams, InventorySummary } from "../types";

export const catalogInventoryApi = {
  list: async (params: InventoryRowListParams) =>
    (await realApiClient.get<SpringPage<InventoryRow>>(API_ENDPOINTS.admin.catalog.inventory, { params })).data,

  summary: async () => (await realApiClient.get<InventorySummary>(API_ENDPOINTS.admin.catalog.inventorySummary)).data,
};
