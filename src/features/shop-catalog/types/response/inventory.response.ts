import type { BaseUnit, StockStatus } from "../enums";

/** One row per quy cách, plus one đơn vị tính row for products with baseUnit */
export interface InventoryRow {
  product: { id: number; code: string; title: string; thumbnailUrl: string | null };
  /** Quy cách row; null on the đơn vị tính row */
  variant: { id: number; title: string; sku: string; unitQuantity: number | null; availableQuantity: number } | null;
  /** Đơn vị tính row; null on quy cách rows */
  unit: { unit: BaseUnit; sku: string } | null;
  category: { id: number; name: string } | null;
  /** Row's own stock (quy cách: excludes quy đổi) */
  inventoryQuantity: number;
  lowStockThreshold: number | null;
  stockStatus: StockStatus;
}

export interface StockStatusCounts {
  outOfStock: number;
  lowStock: number;
  inStock: number;
}

export interface InventorySummary {
  variants: StockStatusCounts;
  units: StockStatusCounts;
  movements: {
    pending: number;
    approved: number;
    /** Approved on `dataThrough` (auto-approved ones by creation time) */
    approvedToday: number;
  };
  /** Today in VN time, yyyy-MM-dd */
  dataThrough: string;
}
