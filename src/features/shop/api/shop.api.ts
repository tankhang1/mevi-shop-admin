import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import {
  cleanFilters,
  toSpringPageParams,
} from "@/lib/pagination";
import type { ApiResponse, Paginated, SpringPage } from "@/types/api";
import type {
  Shop,
  ShopAdminInput,
  ShopListParams,
  ShopProfileInput,
} from "../types";

const EP = API_ENDPOINTS.admin.shops;

const unwrap = <T>(data: unknown): T => {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    (data as { data: unknown }).data !== undefined
  ) {
    return (data as { data: T }).data;
  }
  return data as T;
};

export const shopApi = {
  // Root only
  list: async (params?: ShopListParams) => {
    const pageParams = params
      ? toSpringPageParams(cleanFilters(params as Record<string, unknown>))
      : undefined;
    const res = await realApiClient.get<
      SpringPage<Shop> | ApiResponse<Paginated<Shop>> | Paginated<Shop>
    >(EP.base, { params: pageParams });
    const raw = unwrap<SpringPage<Shop> | Paginated<Shop>>(res.data);
    if ("content" in raw && Array.isArray(raw.content)) {
      const items = (raw.content as unknown as Record<string, unknown>[]).map(
        (w) => ({
          id: String(w.id),
          slug: String(w.code || w.id),
          name: String(w.name || w.brandName || `Shop #${w.id}`),
          tagline: "",
          description: String(w.description || ""),
          location:
            [w.ward, w.district, w.province].filter(Boolean).join(", ") || "",
          logoUrl: String(w.imageUrl || ""),
          coverUrl: "",
          brandColor: "#214c3a",
          contactName: String(w.representative || ""),
          phone: "",
          email: "",
          address: String(w.address || ""),
          verified: true,
          active: w.status === "ACTIVE" || w.status === "active",
          followers: 0,
          responseRate: 100,
          productCount: 0,
          rating: 5,
          reviewCount: 0,
          joinedAt: String(w.createdAt || new Date().toISOString()),
        }),
      );
      return {
        items,
        page: (raw.page ?? 0) + 1,
        size: raw.size ?? items.length,
        total: raw.totalElements ?? items.length,
      };
    }
    if ("items" in raw && Array.isArray(raw.items)) {
      return raw as Paginated<Shop>;
    }
    return { items: [], page: 1, size: 10, total: 0 };
  },

  get: async (id: string) => {
    const res = await realApiClient.get<Shop | ApiResponse<Shop>>(EP.detail(id));
    return unwrap<Shop>(res.data);
  },

  update: async (id: string, data: ShopAdminInput) => {
    const res = await realApiClient.patch<Shop | ApiResponse<Shop>>(
      EP.detail(id),
      data,
    );
    return unwrap<Shop>(res.data);
  },

  // Shop admin — their own shop, resolved from the token
  me: async () => {
    const res = await realApiClient.get<Shop | ApiResponse<Shop>>(EP.me);
    return unwrap<Shop>(res.data);
  },

  updateMe: async (data: ShopProfileInput) => {
    const res = await realApiClient.put<Shop | ApiResponse<Shop>>(EP.me, data);
    return unwrap<Shop>(res.data);
  },
};
