import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { categoryApi } from "../../api";
import type { CategoryListParams } from "../../types";
import { catalogKeys } from "../query-keys";

export function useCategories(params: CategoryListParams = {}) {
  return useQuery({
    queryKey: catalogKeys.categoryList(params),
    queryFn: () => categoryApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCategory(id: number | undefined) {
  return useQuery({ queryKey: catalogKeys.category(id ?? 0), queryFn: () => categoryApi.detail(id!), enabled: !!id });
}
