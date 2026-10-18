import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "../api/shop.api";
import type { ShopAdminInput, ShopListParams, ShopProfileInput } from "../types";

export const shopKeys = {
  all: ["shops"] as const,
  list: (params: ShopListParams) => [...shopKeys.all, "list", params] as const,
  detail: (id: string) => [...shopKeys.all, "detail", id] as const,
  me: () => [...shopKeys.all, "me"] as const,
};

export function useShops(params: ShopListParams = {}, enabled = true) {
  return useQuery({
    queryKey: shopKeys.list(params),
    queryFn: () => shopApi.list(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useShop(id: string | undefined) {
  return useQuery({ queryKey: shopKeys.detail(id ?? ""), queryFn: () => shopApi.get(id!), enabled: !!id });
}

export function useMyShop(enabled = true) {
  return useQuery({ queryKey: shopKeys.me(), queryFn: shopApi.me, enabled });
}

export function useUpdateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ShopAdminInput }) => shopApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: shopKeys.all }),
  });
}

export function useUpdateMyShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ShopProfileInput) => shopApi.updateMe(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: shopKeys.all }),
  });
}
