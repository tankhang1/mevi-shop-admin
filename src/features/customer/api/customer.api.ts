import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import {
  cleanFilters,
  fromSpringPage,
  toSpringPageParams,
} from "@/lib/pagination";
import type { ApiResponse, Paginated, SpringPage } from "@/types/api";
import type {
  CustomerInput,
  CustomerListParams,
  CustomerStats,
  CustomerWithStats,
} from "../types";

const EP = API_ENDPOINTS.admin.customers;

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

export const customerApi = {
  list: async (params?: CustomerListParams) => {
    const pageParams = params
      ? toSpringPageParams(cleanFilters(params as Record<string, unknown>))
      : undefined;
    const res = await apiClient.get<
      | SpringPage<CustomerWithStats>
      | ApiResponse<Paginated<CustomerWithStats>>
      | Paginated<CustomerWithStats>
    >(EP.base, { params: pageParams });
    const raw = unwrap<
      SpringPage<CustomerWithStats> | Paginated<CustomerWithStats>
    >(res.data);
    if ("content" in raw && Array.isArray(raw.content)) {
      return (
        fromSpringPage(raw as SpringPage<CustomerWithStats>) ?? {
          items: [],
          page: 1,
          size: 10,
          total: 0,
        }
      );
    }
    if ("items" in raw && Array.isArray(raw.items)) {
      return raw as Paginated<CustomerWithStats>;
    }
    return { items: [], page: 1, size: 10, total: 0 };
  },

  stats: async () => {
    const res = await apiClient.get<CustomerStats | ApiResponse<CustomerStats>>(
      EP.stats,
    );
    return unwrap<CustomerStats>(res.data);
  },

  detail: async (id: string) => {
    const res = await apiClient.get<
      CustomerWithStats | ApiResponse<CustomerWithStats>
    >(EP.detail(id));
    return unwrap<CustomerWithStats>(res.data);
  },

  create: async (data: CustomerInput) => {
    const res = await apiClient.post<
      CustomerWithStats | ApiResponse<CustomerWithStats>
    >(EP.base, data);
    return unwrap<CustomerWithStats>(res.data);
  },

  update: async (id: string, data: CustomerInput) => {
    const res = await apiClient.put<
      CustomerWithStats | ApiResponse<CustomerWithStats>
    >(EP.detail(id), data);
    return unwrap<CustomerWithStats>(res.data);
  },
};
