import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "../../api";
import { catalogKeys } from "../query-keys";

export function useCategories() {
  return useQuery({ queryKey: catalogKeys.categories(), queryFn: categoryApi.list });
}

export function useCategory(id: number | undefined) {
  return useQuery({ queryKey: catalogKeys.category(id ?? 0), queryFn: () => categoryApi.detail(id!), enabled: !!id });
}
