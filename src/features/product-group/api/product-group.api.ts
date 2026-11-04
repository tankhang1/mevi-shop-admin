import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type {
  ProductGroup,
  ProductGroupDetail,
  ProductGroupInput,
  ProductGroupListParams,
} from "../types";

const EP = API_ENDPOINTS.admin.productGroups;

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

export const productGroupApi = {
  list: async (params?: ProductGroupListParams): Promise<Paginated<ProductGroup>> => {
    const res = await realApiClient.get<unknown>(EP.base, { params });
    const raw = unwrap<unknown>(res.data);
    const list: Array<Record<string, unknown>> = Array.isArray(raw)
      ? (raw as Array<Record<string, unknown>>)
      : raw && typeof raw === "object" && "content" in raw && Array.isArray((raw as { content: unknown[] }).content)
        ? ((raw as { content: Array<Record<string, unknown>> }).content)
        : raw && typeof raw === "object" && "items" in raw && Array.isArray((raw as { items: unknown[] }).items)
          ? ((raw as { items: Array<Record<string, unknown>> }).items)
          : [];

    const items: ProductGroup[] = list.map((c) => ({
      id: String(c.id ?? ""),
      shopId: String(c.shopId ?? ""),
      name: String(c.name ?? "Danh mục"),
      handle: c.handle ? String(c.handle) : undefined,
      description: c.description ? String(c.description) : undefined,
      productCount: typeof c.productCount === "number" ? c.productCount : 0,
      productIds: [],
      createdAt: String(c.createdAt ?? new Date().toISOString()),
    }));

    return {
      items,
      total: items.length,
      page: 1,
      size: items.length || 10,
    };
  },

  detail: async (id: string) => {
    const res = await realApiClient.get<unknown>(EP.detail(id));
    return unwrap<ProductGroupDetail>(res.data);
  },

  create: async (data: ProductGroupInput) => {
    const res = await realApiClient.post<unknown>(EP.base, data);
    return unwrap<ProductGroup>(res.data);
  },

  update: async (id: string, data: ProductGroupInput) => {
    const res = await realApiClient.put<unknown>(EP.detail(id), data);
    return unwrap<ProductGroup>(res.data);
  },

  remove: async (id: string) => {
    await realApiClient.delete(EP.detail(id));
  },

  /** Replaces the group's member list */
  setProducts: async (id: string, productIds: string[]) => {
    const res = await realApiClient.put<ApiResponse<ProductGroup>>(EP.products(), {
      categoryId: Number(id) || id,
      productIds,
    });
    return unwrap<ProductGroup>(res.data);
  },
};
