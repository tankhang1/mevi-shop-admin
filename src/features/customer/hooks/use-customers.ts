import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cleanFilters, toSpringPageParams } from "@/lib/pagination";
import type { ListParams, SpringPage } from "@/types/api";
import { shopCustomerApi } from "../api/shop-customer.api";
import type { ShopCustomer, ShopCustomerCreateInput, ShopCustomerProfileInput } from "../types";

export type CustomerTableParams = ListParams & { tag?: string };

export const customerKeys = {
  all: ["shop-customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (params: CustomerTableParams) => [...customerKeys.lists(), params] as const,
  summary: () => [...customerKeys.all, "summary"] as const,
  detail: (id: number) => [...customerKeys.all, "detail", id] as const,
};

/** Takes 1-based table params (useTableParams); returns the raw Spring page */
export function useCustomers(params: CustomerTableParams = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => shopCustomerApi.list(toSpringPageParams(cleanFilters(params as Record<string, unknown>))),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerSummary() {
  return useQuery({ queryKey: customerKeys.summary(), queryFn: shopCustomerApi.summary });
}

/**
 * BE has no GET-by-id yet, so the detail page reads the row from any loaded list page.
 * Opening the detail URL directly (or after reload) finds nothing until the list is loaded.
 */
export function useCustomer(id: number | undefined) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: customerKeys.detail(id ?? 0),
    enabled: id != null && !Number.isNaN(id),
    queryFn: () => {
      for (const [, page] of qc.getQueriesData<SpringPage<ShopCustomer>>({ queryKey: customerKeys.lists() })) {
        const hit = page?.content.find((c) => c.id === id);
        if (hit) return hit;
      }
      throw new Error("Không tìm thấy khách hàng");
    },
    retry: false,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ShopCustomerCreateInput) => shopCustomerApi.create(data),
    onSuccess: (c) => {
      qc.setQueryData(customerKeys.detail(c.id), c);
      qc.invalidateQueries({ queryKey: customerKeys.lists() });
      qc.invalidateQueries({ queryKey: customerKeys.summary() });
    },
  });
}

export function useUpdateCustomerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ShopCustomerProfileInput }) =>
      shopCustomerApi.updateProfile(id, data),
    onSuccess: (c) => {
      qc.setQueryData(customerKeys.detail(c.id), c);
      qc.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
