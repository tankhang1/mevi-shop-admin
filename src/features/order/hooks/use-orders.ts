import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";
import { orderApi } from "../api/order.api";
import type { OrderListParams, OrderStatus } from "../types";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params: OrderListParams) => [...orderKeys.all, "list", params] as const,
};

export function useOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => orderApi.updateStatus(id, status),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: orderKeys.all }),
        qc.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]),
  });
}
