import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productGroupApi } from "../api/product-group.api";
import type { ProductGroupInput, ProductGroupListParams } from "../types";

export const productGroupKeys = {
  all: ["product-groups"] as const,
  list: (params: ProductGroupListParams) => [...productGroupKeys.all, "list", params] as const,
  detail: (id: string) => [...productGroupKeys.all, "detail", id] as const,
};

export function useProductGroups(params: ProductGroupListParams = {}) {
  return useQuery({
    queryKey: productGroupKeys.list(params),
    queryFn: () => productGroupApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useProductGroup(id: string | undefined) {
  return useQuery({
    queryKey: productGroupKeys.detail(id ?? ""),
    queryFn: () => productGroupApi.detail(id!),
    enabled: !!id,
  });
}

function useInvalidateGroups() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: productGroupKeys.all });
}

export function useCreateProductGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({ mutationFn: (data: ProductGroupInput) => productGroupApi.create(data), onSuccess: invalidate });
}

export function useUpdateProductGroup() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductGroupInput }) => productGroupApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteProductGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productGroupApi.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: productGroupKeys.detail(id) });
      return qc.invalidateQueries({ queryKey: productGroupKeys.all });
    },
  });
}

export function useSetGroupProducts() {
  const invalidate = useInvalidateGroups();
  return useMutation({
    mutationFn: ({ id, productIds }: { id: string; productIds: string[] }) => productGroupApi.setProducts(id, productIds),
    onSuccess: invalidate,
  });
}
