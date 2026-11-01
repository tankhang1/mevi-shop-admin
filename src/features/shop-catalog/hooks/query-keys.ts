import type {
  CatalogProductListParams,
  FarmZoneGroupListParams,
  FarmZoneListParams,
  InventoryRowListParams,
  StockMovementCountParams,
  StockMovementListParams,
} from "../types";

export const catalogKeys = {
  all: ["shop-catalog"] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  category: (id: number) => [...catalogKeys.categories(), id] as const,
  products: () => [...catalogKeys.all, "products"] as const,
  productList: (params: CatalogProductListParams) => [...catalogKeys.products(), "list", params] as const,
  product: (id: number) => [...catalogKeys.products(), "detail", id] as const,
  stock: () => [...catalogKeys.all, "stock"] as const,
  movements: (params: StockMovementListParams) => [...catalogKeys.stock(), "movements", params] as const,
  movementCounts: (params: StockMovementCountParams) => [...catalogKeys.stock(), "counts", params] as const,
  inventory: (params: InventoryRowListParams) => [...catalogKeys.stock(), "inventory", params] as const,
  farm: () => [...catalogKeys.all, "farm"] as const,
  zoneGroups: (params: FarmZoneGroupListParams) => [...catalogKeys.farm(), "groups", params] as const,
  zones: (params: FarmZoneListParams) => [...catalogKeys.farm(), "zones", params] as const,
};
