import type { Product } from "@/features/product/types";
import type { ListParams, Paginated } from "@/types/api";

export type StockStatus = "in_stock" | "low" | "out";

export type InventoryItem = Pick<
  Product,
  "id" | "name" | "sku" | "category" | "images" | "shopId" | "shopName" | "status" | "stock" | "lowStockThreshold" | "source" | "farmId"
> & { stockStatus: StockStatus; /** Farm stock changes waiting for approval */ pendingCount?: number };

/** in = nhập kho, out = xuất kho, adjust = kiểm kê (set the counted total) */
export type MovementType = "in" | "out" | "adjust";

/** Where stock came from / went to: a farmer household, an outside supplier, or a delivered order */
export type MovementSource = "farm" | "external" | "order";

/** Farm-product changes wait for admin approval; everything else applies immediately */
export type MovementStatus = "pending" | "approved" | "rejected";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  shopId: string;
  shopName?: string;
  type: MovementType;
  source?: MovementSource;
  status: MovementStatus;
  /** Delivered order that took the stock out */
  orderId?: string;
  orderCode?: string;
  /** Signed change — for pending ones, the change that will be added on approval */
  delta: number;
  /** Stock before/after it was applied; pending ones show the projection at request time */
  before: number;
  after: number;
  note?: string;
  createdBy: string;
  createdAt: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

export interface AdjustStockInput {
  type: MovementType;
  /** Inbound only */
  source?: MovementSource;
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
  status?: "all" | MovementStatus;
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
  /** Farm stock changes waiting for approval */
  pending: number;
}
