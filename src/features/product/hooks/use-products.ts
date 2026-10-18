import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";
import { productApi } from "../api/product.api";
import type { ModerateProductInput, ProductInput, ProductListParams } from "../types";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductListParams) => [...productKeys.all, "list", params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ""),
    queryFn: () => productApi.detail(id!),
    enabled: !!id,
  });
}

/** Products change the dashboard counters too */
function useInvalidateProducts() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: productKeys.all }),
      qc.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]);
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({ mutationFn: (data: ProductInput) => productApi.create(data), onSuccess: invalidate });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductInput }) => productApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({ mutationFn: (id: string) => productApi.remove(id), onSuccess: invalidate });
}

export function useModerateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModerateProductInput }) => productApi.moderate(id, data),
    onSuccess: invalidate,
  });
}
