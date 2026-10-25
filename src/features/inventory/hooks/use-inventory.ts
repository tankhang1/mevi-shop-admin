import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productKeys } from "@/features/product/hooks/use-products";
import { inventoryApi } from "../api/inventory.api";
import type { AdjustStockInput, InventoryListParams, MovementListParams } from "../types";

export const inventoryKeys = {
  all: ["inventory"] as const,
  list: (params: InventoryListParams) => [...inventoryKeys.all, "list", params] as const,
  stats: () => [...inventoryKeys.all, "stats"] as const,
  movements: (params: MovementListParams) => [...inventoryKeys.all, "movements", params] as const,
};

export function useInventory(params: InventoryListParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useInventoryStats() {
  return useQuery({ queryKey: inventoryKeys.stats(), queryFn: inventoryApi.stats });
}

export function useStockMovements(params: MovementListParams = {}) {
  return useQuery({
    queryKey: inventoryKeys.movements(params),
    queryFn: () => inventoryApi.movements(params),
    placeholderData: keepPreviousData,
  });
}

/** Stock shows on product views too */
function useInvalidateInventory() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: inventoryKeys.all }),
      qc.invalidateQueries({ queryKey: productKeys.all }),
    ]);
}

export function useAdjustStock() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: AdjustStockInput }) =>
      inventoryApi.adjust(productId, data),
    onSuccess: invalidate,
  });
}

export function useSetLowStockThreshold() {
  const invalidate = useInvalidateInventory();
  return useMutation({
    mutationFn: ({ productId, value }: { productId: string; value: number }) => inventoryApi.setThreshold(productId, value),
    onSuccess: invalidate,
  });
}
