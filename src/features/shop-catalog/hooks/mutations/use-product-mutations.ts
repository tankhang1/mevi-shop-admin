import { useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogProductApi } from "../../api";
import type { BulkSetProductCategoryInput, CatalogProductInput, LowStockThresholdInput, ProductStatus } from "../../types";
import { catalogKeys } from "../query-keys";
import { useInvalidateCategories, useInvalidateProducts } from "./invalidate";

export function useCreateCatalogProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({ mutationFn: (data: CatalogProductInput) => catalogProductApi.create(data), onSuccess: invalidate });
}

export function useUpdateCatalogProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CatalogProductInput }) => catalogProductApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteCatalogProduct() {
  const qc = useQueryClient();
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: number) => catalogProductApi.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: catalogKeys.product(id) });
      return invalidate();
    },
  });
}

export function useSetCatalogProductStatus() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ProductStatus }) => catalogProductApi.setStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useSetLowStockThresholds() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, thresholds }: { id: number; thresholds: LowStockThresholdInput[] }) =>
      catalogProductApi.setLowStockThresholds(id, thresholds),
    onSuccess: invalidate,
  });
}

/** Moves products and changes `productCount` of both categories */
export function useBulkSetProductCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (data: BulkSetProductCategoryInput) => catalogProductApi.bulkSetCategory(data),
    onSuccess: invalidate,
  });
}
