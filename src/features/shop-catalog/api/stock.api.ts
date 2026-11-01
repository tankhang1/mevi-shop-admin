import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type {
  ApproveStockMovementInput,
  RejectStockMovementInput,
  StockAdjustmentInput,
  StockMovement,
  StockMovementCountParams,
  StockMovementListParams,
  StockMovementStatusCounts,
  StockReceiptInput,
} from "../types";

const EP = API_ENDPOINTS.admin.catalog;

export const stockApi = {
  receipt: async (productId: number, data: StockReceiptInput) =>
    (await realApiClient.post<StockMovement>(EP.products.stockReceipts(productId), data)).data,

  adjust: async (productId: number, data: StockAdjustmentInput) =>
    (await realApiClient.post<StockMovement>(EP.products.stockAdjustments(productId), data)).data,

  movements: async (params: StockMovementListParams) =>
    (await realApiClient.get<SpringPage<StockMovement>>(EP.stockMovements.base, { params })).data,

  statusCounts: async (params: StockMovementCountParams) =>
    (await realApiClient.get<StockMovementStatusCounts>(EP.stockMovements.statusCounts, { params })).data,

  approve: async (movementId: number, data: ApproveStockMovementInput = {}) =>
    (await realApiClient.post<StockMovement>(EP.stockMovements.approve(movementId), data)).data,

  reject: async (movementId: number, data: RejectStockMovementInput) =>
    (await realApiClient.post<StockMovement>(EP.stockMovements.reject(movementId), data)).data,
};
