import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type {
  AdjustStockInput,
  InventoryItem,
  InventoryListParams,
  InventoryStats,
  MovementListParams,
  MovementPage,
  StockMovement,
} from "../types";

const EP = API_ENDPOINTS.admin.inventory;

export const inventoryApi = {
  list: async (params: InventoryListParams) =>
    (await apiClient.get<ApiResponse<Paginated<InventoryItem>>>(EP.base, { params })).data.data,

  stats: async () => (await apiClient.get<ApiResponse<InventoryStats>>(EP.stats)).data.data,

  movements: async (params: MovementListParams) =>
    (await apiClient.get<ApiResponse<MovementPage>>(EP.movements, { params })).data.data,

  adjust: async (productId: string, data: AdjustStockInput) =>
    (await apiClient.post<ApiResponse<StockMovement>>(EP.adjust(productId), data)).data.data,

  approve: async (movementId: string) =>
    (await apiClient.post<ApiResponse<StockMovement>>(EP.approve(movementId))).data.data,

  reject: async (movementId: string, reason: string) =>
    (await apiClient.post<ApiResponse<StockMovement>>(EP.reject(movementId), { reason })).data.data,

  setThreshold: async (productId: string, lowStockThreshold: number) =>
    (await apiClient.patch<ApiResponse<InventoryItem>>(EP.threshold(productId), { lowStockThreshold })).data.data,
};
