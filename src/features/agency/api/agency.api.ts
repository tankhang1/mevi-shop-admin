import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, ListParams, Paginated } from "@/types/api";
import type { Agency, AgencyInput, CommissionListParams, CommissionPage } from "../types";

const EP = API_ENDPOINTS.admin.agencies;

export const agencyApi = {
  list: async (params: ListParams) =>
    (await apiClient.get<ApiResponse<Paginated<Agency>>>(EP.base, { params })).data.data,

  get: async (id: string) => (await apiClient.get<ApiResponse<Agency>>(EP.detail(id))).data.data,

  create: async (data: AgencyInput) => (await apiClient.post<ApiResponse<Agency>>(EP.base, data)).data.data,

  update: async (id: string, data: Partial<Agency>) =>
    (await apiClient.patch<ApiResponse<Agency>>(EP.detail(id), data)).data.data,

  remove: async (id: string) => {
    await apiClient.delete(EP.detail(id));
  },

  commissions: async (id: string, params: CommissionListParams) =>
    (await apiClient.get<ApiResponse<CommissionPage>>(EP.commissions(id), { params })).data.data,

  payout: async (id: string, orderIds: string[]) =>
    (await apiClient.post<ApiResponse<{ count: number; amount: number }>>(EP.payout(id), { orderIds })).data.data,
};
