import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";
import { orderApi } from "../api/order.api";
import type { OrderListParams, OrderStatus } from "../types";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params: OrderListParams) => [...orderKeys.all, "list", params] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => orderApi.detail(id!),
    enabled: !!id,
  });
}

export function useUpdateOrderNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, internalNote }: { id: string; internalNote: string }) => orderApi.updateNote(id, internalNote),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: orderKeys.detail(id) }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
      orderApi.updateStatus(id, status, note),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: orderKeys.all }),
        qc.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]),
  });
}

export function useAssignOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, teamId, assigneeId }: { id: string; teamId: string | null; assigneeId: string | null }) =>
      orderApi.assign(id, teamId, assigneeId),
    // Team workload counts change too
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: orderKeys.all }),
        qc.invalidateQueries({ queryKey: ["dispatch-teams"] }),
      ]),
  });
}
