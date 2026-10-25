import type { Product } from "@/features/product/types";
import type { ListParams, Paginated } from "@/types/api";

export type StockStatus = "in_stock" | "low" | "out";

export type InventoryItem = Pick<
  Product,
  "id" | "name" | "sku" | "category" | "images" | "shopId" | "shopName" | "status" | "stock" | "lowStockThreshold"
> & { stockStatus: StockStatus };

/** in = nhập kho, out = xuất kho, adjust = kiểm kê (set the counted total) */
export type MovementType = "in" | "out" | "adjust";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  shopId: string;
  shopName?: string;
  type: MovementType;
  /** Signed change applied to stock */
  delta: number;
  before: number;
  after: number;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface AdjustStockInput {
  type: MovementType;
  /** Units moved for in/out; the counted total for adjust */
  quantity: number;
  note?: string;
}

export interface InventoryListParams extends ListParams {
  stockStatus?: "all" | StockStatus;
  /** Root only — shop admins are always scoped to their own shop */
  shopId?: string;
}

export interface MovementListParams extends ListParams {
  type?: "all" | MovementType;
  productId?: string;
  shopId?: string;
}

/** Totals over every movement matching the filters (not just the current page) */
export interface MovementSummary {
  count: number;
  totalIn: number;
  totalOut: number;
}

export type MovementPage = Paginated<StockMovement> & { summary: MovementSummary };

export interface InventoryStats {
  products: number;
  units: number;
  low: number;
  out: number;
}
