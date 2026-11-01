import type { PageParams } from "@/types/api";
import type { StockStatus } from "../enums";

export interface InventoryRowListParams extends PageParams {
  categoryId?: number;
  stockStatus?: StockStatus;
}
