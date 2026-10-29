import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Crop, Farm, Garden } from "./types";

export type * from "./types";
export * from "./constants";

export const farmApi = {
  list: async () => (await apiClient.get<ApiResponse<Farm[]>>(API_ENDPOINTS.admin.farms)).data.data,
  gardens: async () => (await apiClient.get<ApiResponse<Garden[]>>(API_ENDPOINTS.admin.farmGardens)).data.data,
  crops: async () => (await apiClient.get<ApiResponse<Crop[]>>(API_ENDPOINTS.admin.crops)).data.data,
};

export function useFarms() {
  return useQuery({ queryKey: ["farms"], queryFn: farmApi.list, staleTime: 5 * 60_000 });
}

export function useGardens() {
  return useQuery({ queryKey: ["farm-gardens"], queryFn: farmApi.gardens, staleTime: 5 * 60_000 });
}

export function useCrops() {
  return useQuery({ queryKey: ["crops"], queryFn: farmApi.crops, staleTime: 5 * 60_000 });
}
