import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, ListParams, Paginated } from "@/types/api";
import type { Agency, AgencyInput } from "../types";

const EP = API_ENDPOINTS.admin.agencies;

export const agencyApi = {
  list: async (params: ListParams) =>
    (await apiClient.get<ApiResponse<Paginated<Agency>>>(EP.base, { params })).data.data,

  create: async (data: AgencyInput) => (await apiClient.post<ApiResponse<Agency>>(EP.base, data)).data.data,

  update: async (id: string, data: Partial<Agency>) =>
    (await apiClient.patch<ApiResponse<Agency>>(EP.detail(id), data)).data.data,
};
