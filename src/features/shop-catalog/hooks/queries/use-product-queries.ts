import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { catalogProductApi } from "../../api";
import type { CatalogProductListParams, CatalogProductStatusCountParams } from "../../types";
import { catalogKeys } from "../query-keys";

export function useCatalogProducts(params: CatalogProductListParams = {}) {
  return useQuery({
    queryKey: catalogKeys.productList(params),
    queryFn: () => catalogProductApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCatalogProductStatusCounts(params: CatalogProductStatusCountParams = {}) {
  return useQuery({
    queryKey: catalogKeys.productStatusCounts(params),
    queryFn: () => catalogProductApi.statusCounts(params),
    placeholderData: keepPreviousData,
  });
}

export function useCatalogProduct(id: number | undefined) {
  return useQuery({
    queryKey: catalogKeys.product(id ?? 0),
    queryFn: () => catalogProductApi.detail(id!),
    enabled: !!id,
  });
}
