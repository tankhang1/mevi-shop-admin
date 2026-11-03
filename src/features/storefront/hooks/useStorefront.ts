import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { SpringPage } from "@/types/api";
import { getActiveWorkspaceId, storefrontApi } from "../api/storefront.api";
import type {
  ListStorefrontCatalogParams,
  ListStorefrontProductsParams,
  StorefrontPhotoFormat,
  StorefrontPhotoType,
  StorefrontProductItem,
  UpdateStorefrontProfileInput,
} from "../types";

export const storefrontKeys = {
  all: ["storefront"] as const,
  profile: (workspaceId?: string | number | null) =>
    [
      ...storefrontKeys.all,
      "profile",
      String(workspaceId ?? "current"),
    ] as const,
  products: (workspaceId?: string | number | null) =>
    [
      ...storefrontKeys.all,
      "products",
      String(workspaceId ?? "current"),
    ] as const,
  productList: (
    params?: ListStorefrontProductsParams,
    workspaceId?: string | number | null,
  ) => [...storefrontKeys.products(workspaceId), "list", params ?? {}] as const,
  catalog: (workspaceId?: string | number | null) =>
    [
      ...storefrontKeys.all,
      "catalog",
      String(workspaceId ?? "current"),
    ] as const,
  catalogList: (
    params?: ListStorefrontCatalogParams,
    workspaceId?: string | number | null,
  ) => [...storefrontKeys.catalog(workspaceId), "list", params ?? {}] as const,
};

export function useStorefrontProfile(workspaceId?: string | number | null) {
  const resolvedWsId =
    workspaceId ??
    (typeof window !== "undefined" ? getActiveWorkspaceId() : null);
  return useQuery({
    queryKey: storefrontKeys.profile(resolvedWsId ?? "current"),
    queryFn: async () => {
      try {
        return await storefrontApi.getProfile(resolvedWsId!);
      } catch (err: unknown) {
        // Backend trả 404 khi workspace chưa có hồ sơ gian hàng
        if (isAxiosError(err) && err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!resolvedWsId,
  });
}

export function useUpdateStorefrontProfile(
  workspaceId?: string | number | null,
) {
  const queryClient = useQueryClient();
  const resolvedWsId =
    workspaceId ??
    (typeof window !== "undefined" ? getActiveWorkspaceId() : null);
  return useMutation({
    mutationFn: (input: UpdateStorefrontProfileInput) =>
      storefrontApi.updateProfile(input, resolvedWsId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: storefrontKeys.profile(resolvedWsId ?? "current"),
      });
    },
  });
}

export function useUploadStorefrontPhoto(workspaceId?: string | number | null) {
  const resolvedWsId =
    workspaceId ??
    (typeof window !== "undefined" ? getActiveWorkspaceId() : null);
  return useMutation({
    mutationFn: ({
      type,
      file,
      format,
    }: {
      type: StorefrontPhotoType;
      file: File;
      format?: StorefrontPhotoFormat;
    }) =>
      storefrontApi.uploadPhoto(type, file, format, resolvedWsId ?? undefined),
  });
}

export function useStorefrontCatalogProducts(
  params?: ListStorefrontCatalogParams,
  workspaceId?: string | number | null,
) {
  const resolvedWsId =
    workspaceId ??
    (typeof window !== "undefined" ? getActiveWorkspaceId() : null);
  return useQuery({
    queryKey: storefrontKeys.catalogList(params, resolvedWsId ?? "current"),
    queryFn: () => storefrontApi.getCatalogProducts(params, resolvedWsId!),
    enabled: !!resolvedWsId,
    placeholderData: (prev) => prev,
  });
}

export function useStorefrontProducts(
  params?: ListStorefrontProductsParams,
  workspaceId?: string | number | null,
) {
  const resolvedWsId =
    workspaceId ??
    (typeof window !== "undefined" ? getActiveWorkspaceId() : null);
  return useQuery({
    queryKey: storefrontKeys.productList(params, resolvedWsId ?? "current"),
    queryFn: () => storefrontApi.getStorefrontProducts(params, resolvedWsId!),
    enabled: !!resolvedWsId,
    placeholderData: (prev) => prev,
  });
}

export function useAddStorefrontProducts(workspaceId?: string | number | null) {
  const queryClient = useQueryClient();
  const resolvedWsId =
    workspaceId ??
    (typeof window !== "undefined" ? getActiveWorkspaceId() : null);
  return useMutation({
    mutationFn: (productIds: number[]) =>
      storefrontApi.addProducts(productIds, resolvedWsId ?? undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: storefrontKeys.products(resolvedWsId ?? "current"),
      });
      queryClient.invalidateQueries({
        queryKey: storefrontKeys.catalog(resolvedWsId ?? "current"),
      });
    },
  });
}

export function useReorderStorefrontProducts(
  workspaceId?: string | number | null,
) {
  const queryClient = useQueryClient();
  const resolvedWsId =
    workspaceId ??
    (typeof window !== "undefined" ? getActiveWorkspaceId() : null);
  const targetProductsKey = storefrontKeys.products(resolvedWsId ?? "current");

  return useMutation({
    mutationFn: (productIds: number[]) =>
      storefrontApi.reorderProducts(productIds, resolvedWsId ?? undefined),
    onMutate: async (productIds) => {
      // 1. Huỷ các queries dở dang để tránh race condition
      await queryClient.cancelQueries({ queryKey: targetProductsKey });

      // 2. Snapshot cache hiện tại để hoàn tác nếu gặp sự cố
      const previousQueries = queryClient.getQueriesData<
        SpringPage<StorefrontProductItem>
      >({ queryKey: targetProductsKey });

      // 3. Cập nhật lạc quan (optimistic) cho tất cả product queries của storefront
      queryClient.setQueriesData<SpringPage<StorefrontProductItem>>(
        { queryKey: targetProductsKey },
        (old) => {
          if (!old || !old.content) return old;
          const map = new Map(old.content.map((item) => [item.product.id, item]));
          const reordered: StorefrontProductItem[] = [];

          for (const id of productIds) {
            const found = map.get(id);
            if (found) {
              reordered.push(found);
              map.delete(id);
            }
          }
          // Thêm các item khác nếu có (ngoài trang hoặc chưa có trong productIds)
          for (const remaining of map.values()) {
            reordered.push(remaining);
          }

          return {
            ...old,
            content: reordered,
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      // Rollback về snapshot nếu request thất bại
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      // Đánh dấu stale ngầm mà không kích hoạt refetch gây giật màn hình
      queryClient.invalidateQueries({
        queryKey: targetProductsKey,
        refetchType: "none",
      });
    },
  });
}

export function useUpdateStorefrontProductVisibility(
  workspaceId?: string | number | null,
) {
  const queryClient = useQueryClient();
  const resolvedWsId =
    workspaceId ??
    (typeof window !== "undefined" ? getActiveWorkspaceId() : null);
  const targetProductsKey = storefrontKeys.products(resolvedWsId ?? "current");

  return useMutation({
    mutationFn: ({
      productId,
      visible,
    }: {
      productId: number | string;
      visible: boolean;
    }) =>
      storefrontApi.updateProductVisibility(
        productId,
        visible,
        resolvedWsId ?? undefined,
      ),
    onMutate: async ({ productId, visible }) => {
      await queryClient.cancelQueries({ queryKey: targetProductsKey });

      const previousQueries = queryClient.getQueriesData<
        SpringPage<StorefrontProductItem>
      >({ queryKey: targetProductsKey });

      const numId = Number(productId);
      queryClient.setQueriesData<SpringPage<StorefrontProductItem>>(
        { queryKey: targetProductsKey },
        (old) => {
          if (!old || !old.content) return old;
          return {
            ...old,
            content: old.content.map((item) =>
              item.product.id === numId ? { ...item, visible } : item,
            ),
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: targetProductsKey,
        refetchType: "none",
      });
    },
  });
}

export function useRemoveStorefrontProduct(
  workspaceId?: string | number | null,
) {
  const queryClient = useQueryClient();
  const resolvedWsId =
    workspaceId ??
    (typeof window !== "undefined" ? getActiveWorkspaceId() : null);
  const targetProductsKey = storefrontKeys.products(resolvedWsId ?? "current");

  return useMutation({
    mutationFn: (productId: number | string) =>
      storefrontApi.removeProduct(productId, resolvedWsId ?? undefined),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: targetProductsKey });

      const previousQueries = queryClient.getQueriesData<
        SpringPage<StorefrontProductItem>
      >({ queryKey: targetProductsKey });

      const numId = Number(productId);
      queryClient.setQueriesData<SpringPage<StorefrontProductItem>>(
        { queryKey: targetProductsKey },
        (old) => {
          if (!old || !old.content) return old;
          const filtered = old.content.filter(
            (item) => item.product.id !== numId,
          );
          return {
            ...old,
            content: filtered,
            totalElements: Math.max(
              0,
              (old.totalElements ?? old.content.length) - 1,
            ),
          };
        },
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: targetProductsKey,
        refetchType: "none",
      });
      // Đồng bộ catalog để sản phẩm vừa gỡ lại xuất hiện trong catalog
      queryClient.invalidateQueries({
        queryKey: storefrontKeys.catalog(resolvedWsId ?? "current"),
      });
    },
  });
}
