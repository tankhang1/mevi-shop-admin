import type { BaseUnit, Product } from "@/features/product/types";
import type { ListParams, Paginated } from "@/types/api";

export type StockStatus = "in_stock" | "low" | "out";

export type InventoryItem = Pick<
  Product,
  | "id"
  | "name"
  | "sku"
  | "category"
  | "images"
  | "shopId"
  | "shopName"
  | "status"
  | "stock"
  | "lowStockThreshold"
  | "source"
  | "farmId"
  | "packaging"
  | "variants"
  | "suppliers"
  | "variantThresholds"
  | "variantStock"
  | "isAgricultural"
  | "baseUnit"
  | "cropId"
  | "cropName"
  | "sources"
  | "gardenStock"
> & {
  /** The product this row belongs to — `id` is per row (product + quy cách) in the stock list */
  productId: string;
  /** Set on stock-list rows: `stock` / `lowStockThreshold` / `stockStatus` are for this quy cách */
  variant?: string;
  stockStatus: StockStatus;
  /** Farm stock changes waiting for approval */
  pendingCount?: number;
};

/** in = nhập kho, out = xuất kho, adjust = kiểm kê (set the counted total) */
export type MovementType = "in" | "out" | "adjust";

/** Where stock came from / went to: Mevi, a farmer household, a delivered order. `external` = older records */
export type MovementSource = "mevi" | "farm" | "external" | "order";

/** Farm-product changes wait for admin approval; everything else applies immediately */
export type MovementStatus = "pending" | "approved" | "rejected";

export interface StockMovement {
  id: string;
  code?: string;
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
  /** Quy cách the goods came in */
  variant?: string;
  /** Nông sản: đơn vị cơ bản và cây trồng */
  unit?: BaseUnit;
  cropId?: number;
  cropName?: string;
  /** Vườn cung ứng */
  regionId?: number;
  regionName?: string;
  /** Inbound: which farm (if any) and the price paid per unit */
  farmId?: string;
  farmName?: string;
  importPrice?: number;
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
  /** Inbound only — mevi applies at once, farm waits for approval */
  source?: MovementSource;
  variant?: string;
  /** source = farm or nông sản */
  farmId?: string;
  regionId?: number;
  unit?: BaseUnit;
  /** Per unit of `variant`, for both Mevi and farm imports */
  importPrice?: number;
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
  /** closed = đã duyệt + từ chối (everything already reviewed) */
  status?: "all" | "closed" | MovementStatus;
  source?: MovementSource;
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
  /** Đề xuất cung ứng đã duyệt — all time / reviewed today */
  approved: number;
  approvedToday: number;
}

export interface SupplyRequestListParams extends ListParams {
  status?: "all" | MovementStatus;
  farmId?: string;
  productId?: string;
  shopId?: string;
}

export interface SupplyRequestSummary {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
}

export type SupplyRequestPage = Paginated<StockMovement> & { summary: SupplyRequestSummary };

