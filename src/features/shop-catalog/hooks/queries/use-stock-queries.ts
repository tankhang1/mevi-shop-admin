import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { stockApi } from "../../api";
import type { StockMovementCountParams, StockMovementListParams } from "../../types";
import { catalogKeys } from "../query-keys";

export function useCatalogStockMovements(params: StockMovementListParams = {}) {
  return useQuery({
    queryKey: catalogKeys.movements(params),
    queryFn: () => stockApi.movements(params),
    placeholderData: keepPreviousData,
  });
}

export function useStockMovementCounts(params: StockMovementCountParams = {}) {
  return useQuery({ queryKey: catalogKeys.movementCounts(params), queryFn: () => stockApi.statusCounts(params) });
}
