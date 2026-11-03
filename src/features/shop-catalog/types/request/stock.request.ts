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
  /** Omitted/null = phiếu theo đơn vị tính (product must have baseUnit) */
  variantId?: number | null;
  source: StockMovementSource;
  /** Required when source = FARM — a vườn in the product's supplySources */
  productionZoneId?: number;
  /** ≤ 3 decimals for đơn vị tính; integer for quy cách */
  quantity: number;
  unitCost: number;
  note?: string | null;
}

export interface StockAdjustmentInput {
  /** Omitted/null = đơn vị tính */
  variantId?: number | null;
  /** Non-zero, signed; ≤ 3 decimals for đơn vị tính */
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
