import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type { InventoryRow, InventoryRowListParams } from "../types";

export const catalogInventoryApi = {
  list: async (params: InventoryRowListParams) =>
    (await apiClient.get<SpringPage<InventoryRow>>(API_ENDPOINTS.admin.catalog.inventory, { params })).data,
};
