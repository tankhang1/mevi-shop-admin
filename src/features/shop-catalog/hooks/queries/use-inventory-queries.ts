import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { catalogInventoryApi } from "../../api";
import type { InventoryRowListParams } from "../../types";
import { catalogKeys } from "../query-keys";

export function useCatalogInventory(params: InventoryRowListParams = {}) {
  return useQuery({
    queryKey: catalogKeys.inventory(params),
    queryFn: () => catalogInventoryApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: [...catalogKeys.stock(), "inventory-summary"],
    queryFn: () => catalogInventoryApi.summary(),
  });
}
