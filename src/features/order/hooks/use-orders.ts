import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";
import { orderApi } from "../api/order.api";
import type {
  OrderListParams,
  OrderPaymentStatus,
  OrderProcessingInput,
  OrderStatus,
} from "../types";

export const orderKeys = {
  all: ["orders"] as const,
  list: (params: OrderListParams) =>
    [...orderKeys.all, "list", params] as const,
  statusCounts: (params?: Partial<OrderListParams>) =>
    [...orderKeys.all, "status-counts", params] as const,
  detail: (id: string | number) =>
    [...orderKeys.all, "detail", String(id)] as const,
};

export function useOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrderStatusCounts(params?: Partial<OrderListParams>) {
  return useQuery({
    queryKey: orderKeys.statusCounts(params),
    queryFn: () => orderApi.statusCounts(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: string | number | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => orderApi.detail(id!),
    enabled: id !== undefined && id !== "",
  });
}

export function useUpdateOrderNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      internalNote,
    }: {
      id: string | number;
      internalNote: string;
    }) => orderApi.updateNote(id, internalNote),
    onSuccess: (_, { id }) =>
      Promise.all([
        qc.invalidateQueries({ queryKey: orderKeys.detail(id) }),
        qc.invalidateQueries({ queryKey: orderKeys.all }),
      ]),
  });
}

export function useUpdateOrderTracking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string | number;
      carrier: string;
      trackingCode: string;
    }) => orderApi.updateTracking(id, data),
    onSuccess: (_, { id }) =>
      Promise.all([
        qc.invalidateQueries({ queryKey: orderKeys.detail(id) }),
        qc.invalidateQueries({ queryKey: orderKeys.all }),
      ]),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
      reason,
    }: {
      id: string | number;
      status: OrderStatus;
      note?: string;
      reason?: string;
    }) => orderApi.updateStatus(id, { status, note, reason }),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: orderKeys.all }),
        qc.invalidateQueries({ queryKey: dashboardKeys.all }),
        qc.invalidateQueries({ queryKey: ["inventory"] }),
        qc.invalidateQueries({ queryKey: ["products"] }),
      ]),
  });
}

export function useUpdateOrderProcessing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string | number } & OrderProcessingInput) =>
      orderApi.updateProcessing(id, data),
    onSuccess: (_, { id }) =>
      Promise.all([
        qc.invalidateQueries({ queryKey: orderKeys.detail(id) }),
        qc.invalidateQueries({ queryKey: orderKeys.all }),
        qc.invalidateQueries({ queryKey: ["dispatch-teams"] }),
        qc.invalidateQueries({ queryKey: ["dispatch-groups"] }),
      ]),
  });
}

export function useAssignOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      teamId,
      assigneeId,
    }: {
      id: string | number;
      teamId: string | number | null;
      assigneeId: string | number | null;
    }) =>
      orderApi.assign(
        id,
        teamId ? String(teamId) : null,
        assigneeId ? String(assigneeId) : null,
      ),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: orderKeys.all }),
        qc.invalidateQueries({ queryKey: ["dispatch-teams"] }),
        qc.invalidateQueries({ queryKey: ["dispatch-groups"] }),
      ]),
  });
}

/** Ghi nhận thanh toán đơn hàng (PUT /api/shop/orders/{id}/payment) — BE notice 2026-11-10 */
export function useUpdateOrderPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      paymentStatus,
    }: {
      id: string | number;
      paymentStatus: OrderPaymentStatus;
    }) => orderApi.updatePayment(id, paymentStatus),
    onSuccess: (updated, { id }) =>
      Promise.all([
        qc.setQueryData(orderKeys.detail(id), updated),
        qc.invalidateQueries({ queryKey: orderKeys.all }),
        qc.invalidateQueries({ queryKey: dashboardKeys.all }),
        qc.invalidateQueries({ queryKey: ["commissions"] }),
      ]),
  });
}
