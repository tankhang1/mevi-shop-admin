import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Farm } from "./types";

export type * from "./types";
export * from "./constants";

export const farmApi = {
  list: async () => (await apiClient.get<ApiResponse<Farm[]>>(API_ENDPOINTS.admin.farms)).data.data,
};

export function useFarms() {
  return useQuery({ queryKey: ["farms"], queryFn: farmApi.list, staleTime: 5 * 60_000 });
}
