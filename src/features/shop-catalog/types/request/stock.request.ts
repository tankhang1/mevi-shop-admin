import type { PageParams } from "@/types/api";
import type { StockMovementSource, StockMovementStatus, StockMovementType } from "../enums";

export interface StockMovementListParams extends PageParams {
  productId?: number;
  status?: StockMovementStatus;
  type?: StockMovementType;
  source?: StockMovementSource;
}

export type StockMovementCountParams = Omit<StockMovementListParams, "status" | "page" | "size">;

export interface StockReceiptInput {
  variantId: number;
  source: StockMovementSource;
  /** Required when source = FARM */
  productionZoneId?: number;
  /** Required when FARM and the zone has several subjects in the product's supply sources */
  productionSubjectId?: number;
  quantity: number;
  unitCost: number;
  note?: string | null;
}

export interface StockAdjustmentInput {
  variantId: number;
  /** Non-zero, signed */
  quantity: number;
  note: string;
}

export interface ApproveStockMovementInput {
  /** Omitted = keep the proposed cost */
  unitCost?: number;
}

export interface RejectStockMovementInput {
  reason: string;
}
