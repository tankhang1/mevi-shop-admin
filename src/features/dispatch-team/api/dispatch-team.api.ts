import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type { DispatchTeam, DispatchTeamInput, DispatchTeamListParams, DispatchTeamRow } from "../types";

const EP = API_ENDPOINTS.admin.dispatchTeams;

export const dispatchTeamApi = {
  list: async (params: DispatchTeamListParams) =>
    (await apiClient.get<ApiResponse<Paginated<DispatchTeamRow>>>(EP.base, { params })).data.data,

  create: async (data: DispatchTeamInput) => (await apiClient.post<ApiResponse<DispatchTeam>>(EP.base, data)).data.data,

  update: async (id: string, data: Partial<DispatchTeamInput>) =>
    (await apiClient.patch<ApiResponse<DispatchTeam>>(EP.detail(id), data)).data.data,

  remove: async (id: string) => {
    await apiClient.delete(EP.detail(id));
  },

  autoAssign: async () =>
    (await apiClient.post<ApiResponse<{ assigned: number; unmatched: number }>>(EP.autoAssign)).data.data,
};
