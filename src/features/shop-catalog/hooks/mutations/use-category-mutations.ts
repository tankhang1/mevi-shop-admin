import { useMutation } from "@tanstack/react-query";
import { categoryApi } from "../../api";
import type { ProductCategoryInput } from "../../types";
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

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({ mutationFn: (id: number) => categoryApi.remove(id), onSuccess: invalidate });
}
