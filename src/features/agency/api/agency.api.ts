import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import {
  cleanFilters,
  fromSpringPage,
  toSpringPageParams,
} from "@/lib/pagination";
import type {
  ApiResponse,
  ListParams,
  Paginated,
  SpringPage,
} from "@/types/api";
import type {
  Agency,
  AgencyInput,
  CommissionListParams,
  CommissionPage,
} from "../types";

const EP = API_ENDPOINTS.admin.agencies;

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

export const agencyApi = {
  list: async (params?: ListParams) => {
    const pageParams = params
      ? toSpringPageParams(cleanFilters(params as Record<string, unknown>))
      : undefined;
    const res = await realApiClient.get<
      SpringPage<Agency> | ApiResponse<Paginated<Agency>> | Paginated<Agency>
    >(EP.base, { params: pageParams });
    const raw = unwrap<SpringPage<Agency> | Paginated<Agency>>(res.data);
    if ("content" in raw && Array.isArray(raw.content)) {
      return (
        fromSpringPage(raw as SpringPage<Agency>) ?? {
          items: [],
          page: 1,
          size: 10,
          total: 0,
        }
      );
    }
    if ("items" in raw && Array.isArray(raw.items)) {
      return raw as Paginated<Agency>;
    }
    return { items: [], page: 1, size: 10, total: 0 };
  },

  get: async (id: string) => {
    const res = await realApiClient.get<Agency | ApiResponse<Agency>>(
      EP.detail(id),
    );
    return unwrap<Agency>(res.data);
  },

  create: async (data: AgencyInput) => {
    const res = await realApiClient.post<Agency | ApiResponse<Agency>>(
      EP.base,
      data,
    );
    return unwrap<Agency>(res.data);
  },

  update: async (id: string, data: Partial<Agency>) => {
    const res = await realApiClient.patch<Agency | ApiResponse<Agency>>(
      EP.detail(id),
      data,
    );
    return unwrap<Agency>(res.data);
  },

  remove: async (id: string) => {
    await realApiClient.delete(EP.detail(id));
  },

  commissions: async (id: string, params: CommissionListParams) => {
    const res = await realApiClient.get<
      CommissionPage | ApiResponse<CommissionPage>
    >(EP.commissions(id), { params });
    return unwrap<CommissionPage>(res.data);
  },

  payout: async (id: string, orderIds: string[]) => {
    const res = await realApiClient.post<
      | { count: number; amount: number }
      | ApiResponse<{ count: number; amount: number }>
    >(EP.payout(id), { orderIds });
    return unwrap<{ count: number; amount: number }>(res.data);
  },
};
