import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type {
  ContentBlockType,
  PublicContentBlocksResponse,
} from "../types";

const EP = API_ENDPOINTS.admin.contentBlocks;
const PUBLIC_EP = API_ENDPOINTS.public.contentBlocks;

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

export const contentBlockApi = {
  /** GET /api/admin/shop/content-blocks/{block} */
  getBlock: async <T>(block: ContentBlockType): Promise<T> => {
    const res = await realApiClient.get<T | ApiResponse<T>>(EP.block(block));
    return unwrap<T>(res.data);
  },

  /** PUT /api/admin/shop/content-blocks/{block}/settings?version={version} */
  updateSettings: async <T>(
    block: ContentBlockType,
    version: number,
    settings: unknown,
  ): Promise<T> => {
    const res = await realApiClient.put<T | ApiResponse<T>>(
      EP.settings(block, version),
      settings,
    );
    return unwrap<T>(res.data);
  },

  /** POST /api/admin/shop/content-blocks/{block}/items */
  createItem: async <T>(block: ContentBlockType, item: unknown): Promise<T> => {
    const res = await realApiClient.post<T | ApiResponse<T>>(
      EP.items(block),
      item,
    );
    return unwrap<T>(res.data);
  },

  /** PUT /api/admin/shop/content-blocks/{block}/items/{id}?version={version} */
  updateItem: async <T>(
    block: ContentBlockType,
    id: string,
    version: number,
    item: unknown,
  ): Promise<T> => {
    const res = await realApiClient.put<T | ApiResponse<T>>(
      EP.item(block, id, version),
      item,
    );
    return unwrap<T>(res.data);
  },

  /** DELETE /api/admin/shop/content-blocks/{block}/items/{id} */
  deleteItem: async (block: ContentBlockType, id: string): Promise<void> => {
    await realApiClient.delete(EP.item(block, id));
  },

  /** PUT /api/admin/shop/content-blocks/{block}/items/order */
  reorderItems: async (
    block: ContentBlockType,
    ids: string[],
  ): Promise<void> => {
    await realApiClient.put(EP.order(block), { ids });
  },

  /** GET /api/public/shop/content-blocks?block= */
  getPublic: async (
    block?: ContentBlockType,
  ): Promise<PublicContentBlocksResponse> => {
    const res = await realApiClient.get<
      PublicContentBlocksResponse | ApiResponse<PublicContentBlocksResponse>
    >(PUBLIC_EP, {
      params: block ? { block } : undefined,
    });
    return unwrap<PublicContentBlocksResponse>(res.data);
  },
};

