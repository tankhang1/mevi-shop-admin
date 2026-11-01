import type { StockStatus } from "../enums";

export interface InventoryRow {
  product: { id: number; code: string; title: string; thumbnailUrl: string | null };
  variant: { id: number; title: string; sku: string };
  category: { id: number; name: string } | null;
  inventoryQuantity: number;
  lowStockThreshold: number | null;
  stockStatus: StockStatus;
}
