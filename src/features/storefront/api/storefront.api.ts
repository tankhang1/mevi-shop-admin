import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { SpringPage } from "@/types/api";
import type { PartnerProfile } from "@/features/partner";
import type {
  ListStorefrontCatalogParams,
  ListStorefrontProductsParams,
  StorefrontCatalogItem,
  StorefrontPhotoFormat,
  StorefrontPhotoType,
  StorefrontPhotoUploadResponse,
  StorefrontProductItem,
  UpdateStorefrontProfileInput,
} from "../types";

const EP = API_ENDPOINTS.shop.profile;
const CATALOG_EP = API_ENDPOINTS.shop.catalog;
const STORAGE_EP = API_ENDPOINTS.storage.storefrontPhotos;

export function getActiveWorkspaceId(
  workspaceId?: string | number | null,
): string | null {
  if (workspaceId != null && String(workspaceId).trim() !== "") {
    return String(workspaceId).trim();
  }
  if (typeof window === "undefined") return null;
  const raw =
    window.sessionStorage?.getItem("admin_selected_workspace") ||
    window.localStorage?.getItem("admin_selected_workspace") ||
    null;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null && parsed.id) {
      return String(parsed.id);
    }
  } catch {
    // raw was a plain string ID
  }
  return raw.trim() || null;
}

const makeHeaders = (workspaceId?: string | number | null) => {
  const wsId = getActiveWorkspaceId(workspaceId);
  return wsId ? { "X-Workspace-Id": wsId } : undefined;
};

export const storefrontApi = {
  // ── Hồ sơ gian hàng ──
  getProfile: async (workspaceId?: string | number | null) => {
    const res = await realApiClient.get<PartnerProfile>(EP.base, {
      headers: makeHeaders(workspaceId),
    });
    return res.data;
  },

  updateProfile: async (
    input: UpdateStorefrontProfileInput,
    workspaceId?: string | number | null,
  ) => {
    const res = await realApiClient.put<PartnerProfile>(EP.base, input, {
      headers: makeHeaders(workspaceId),
    });
    return res.data;
  },

  uploadPhoto: async (
    type: StorefrontPhotoType,
    file: File,
    format: StorefrontPhotoFormat = "WEBP",
    workspaceId?: string | number | null,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await realApiClient.post<StorefrontPhotoUploadResponse>(
      `${STORAGE_EP}?type=${type}&format=${format}`,
      formData,
      {
        headers: {
          ...makeHeaders(workspaceId),
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  },

  // ── Sản phẩm của gian hàng ──
  getCatalogProducts: async (
    params?: ListStorefrontCatalogParams,
    workspaceId?: string | number | null,
  ) => {
    const res = await realApiClient.get<SpringPage<StorefrontCatalogItem>>(
      CATALOG_EP.products,
      {
        params,
        headers: makeHeaders(workspaceId),
      },
    );
    return {
      ...res.data,
      content: (res.data.content || []).map((item) => ({
        ...item,
        id: item.product.id,
      })),
    };
  },

  getStorefrontProducts: async (
    params?: ListStorefrontProductsParams,
    workspaceId?: string | number | null,
  ) => {
    const res = await realApiClient.get<SpringPage<StorefrontProductItem>>(
      EP.products,
      {
        params,
        headers: makeHeaders(workspaceId),
      },
    );
    return {
      ...res.data,
      content: (res.data.content || []).map((item) => ({
        ...item,
        id: item.product.id,
      })),
    };
  },

  addProducts: async (productIds: number[], workspaceId?: string | number | null) => {
    await realApiClient.post(
      EP.products,
      { productIds },
      { headers: makeHeaders(workspaceId) },
    );
  },

  reorderProducts: async (
    productIds: number[],
    workspaceId?: string | number | null,
  ) => {
    await realApiClient.put(
      EP.productOrder,
      { productIds },
      { headers: makeHeaders(workspaceId) },
    );
  },

  updateProductVisibility: async (
    productId: number | string,
    visible: boolean,
    workspaceId?: string | number | null,
  ) => {
    await realApiClient.put(
      EP.productVisibility(productId),
      { visible },
      { headers: makeHeaders(workspaceId) },
    );
  },

  removeProduct: async (
    productId: number | string,
    workspaceId?: string | number | null,
  ) => {
    await realApiClient.delete(EP.productDelete(productId), {
      headers: makeHeaders(workspaceId),
    });
  },
};
