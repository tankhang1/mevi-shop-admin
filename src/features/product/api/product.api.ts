import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import {
  cleanFilters,
  fromSpringPage,
  toSpringPageParams,
} from "@/lib/pagination";
import type { Paginated, SpringPage } from "@/types/api";
import type {
  ModerateProductInput,
  Product,
  ProductInput,
  ProductListParams,
  ProductStats,
  ProductStatus,
} from "../types";

const EP = API_ENDPOINTS.admin.products;

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

const mapBackendProduct = (p: Record<string, unknown>): Product => {
  const categoryName =
    p.category && typeof p.category === "object" && "name" in p.category
      ? String((p.category as { name: unknown }).name)
      : String(p.category || "Nông sản");

  return {
    id: String(p.id ?? ""),
    name: String(p.title || p.name || ""),
    sku: String(p.code || p.sku || ""),
    category: categoryName,
    price:
      typeof p.minPrice === "number"
        ? p.minPrice
        : typeof p.price === "number"
          ? p.price
          : 0,
    salePrice:
      typeof p.compareAtPrice === "number"
        ? p.compareAtPrice
        : typeof p.salePrice === "number"
          ? p.salePrice
          : null,
    status: (String(p.status || "").toLowerCase() === "active"
      ? "approved"
      : "pending") as ProductStatus,
    listed: p.status === "ACTIVE",
    images: p.thumbnailUrl ? [String(p.thumbnailUrl)] : [],
    certifications: [],
    shopId: String(p.shopId ?? ""),
    stock: typeof p.totalInventory === "number" ? p.totalInventory : 0,
    lowStockThreshold: 10,
    variants: [],
    sources: [],
    suppliers: [],
    createdAt: String(p.createdAt || new Date().toISOString()),
  };
};

export const productApi = {
  list: async (params?: ProductListParams): Promise<Paginated<Product>> => {
    const pageParams = params
      ? toSpringPageParams(cleanFilters(params as Record<string, unknown>))
      : undefined;
    const res = await realApiClient.get<unknown>(EP.base, {
      params: pageParams,
    });
    const raw = unwrap<Record<string, unknown>>(res.data);

    if (raw && "content" in raw && Array.isArray(raw.content)) {
      const pageData = fromSpringPage(
        raw as unknown as SpringPage<Record<string, unknown>>,
      );
      return {
        items: (pageData?.items ?? []).map(mapBackendProduct),
        page: pageData?.page ?? 1,
        size: pageData?.size ?? 10,
        total: pageData?.total ?? 0,
      };
    }

    if (raw && "items" in raw && Array.isArray(raw.items)) {
      return {
        items: (raw.items as Array<Record<string, unknown>>).map(
          mapBackendProduct,
        ),
        page: typeof raw.page === "number" ? raw.page : 1,
        size: typeof raw.size === "number" ? raw.size : 10,
        total: typeof raw.total === "number" ? raw.total : 0,
      };
    }

    if (Array.isArray(raw)) {
      const items = (raw as Array<Record<string, unknown>>).map(
        mapBackendProduct,
      );
      return {
        items,
        page: 1,
        size: items.length || 10,
        total: items.length,
      };
    }

    return { items: [], page: 1, size: 10, total: 0 };
  },

  stats: async () => {
    const res = await realApiClient.get<unknown>(EP.stats);
    return unwrap<ProductStats>(res.data);
  },

  detail: async (id: string) => {
    const res = await realApiClient.get<unknown>(EP.detail(id));
    const raw = unwrap<Record<string, unknown>>(res.data);
    return mapBackendProduct(raw);
  },

  create: async (data: ProductInput) => {
    const res = await realApiClient.post<unknown>(EP.base, data);
    return unwrap<Product>(res.data);
  },

  update: async (id: string, data: ProductInput) => {
    const res = await realApiClient.put<unknown>(EP.detail(id), data);
    return unwrap<Product>(res.data);
  },

  remove: async (id: string) => {
    await realApiClient.delete(EP.detail(id));
  },

  moderate: async (id: string, data: ModerateProductInput) => {
    const res = await realApiClient.patch<unknown>(EP.moderate(id), data);
    return unwrap<Product>(res.data);
  },

  setListing: async (id: string, listed: boolean) => {
    const res = await realApiClient.patch<unknown>(EP.listing(id), { listed });
    return unwrap<Product>(res.data);
  },
};
