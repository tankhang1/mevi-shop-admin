import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi } from "../../api";
import type { ProductCategoryInput } from "../../types";
import { catalogKeys } from "../query-keys";
import { useInvalidateCategories } from "./invalidate";

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({ mutationFn: (data: ProductCategoryInput) => categoryApi.create(data), onSuccess: invalidate });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductCategoryInput }) => categoryApi.update(id, data),
    onSuccess: invalidate,
  });
}

/** 409 = category still has products (see `isConflictError`) */
export function useDeleteCategory() {
  const qc = useQueryClient();
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: number) => categoryApi.remove(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: catalogKeys.category(id) });
      return invalidate();
    },
  });
}
