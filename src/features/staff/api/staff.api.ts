import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse, Paginated } from "@/types/api";
import type { Staff, StaffInput, StaffListParams, StaffStatus } from "../types";

const EP = API_ENDPOINTS.admin.staff;

export const staffApi = {
  list: async (params: StaffListParams) =>
    (await apiClient.get<ApiResponse<Paginated<Staff>>>(EP.base, { params })).data.data,

  create: async (data: StaffInput) => (await apiClient.post<ApiResponse<Staff>>(EP.base, data)).data.data,

  update: async (id: string, data: Partial<StaffInput> & { status?: StaffStatus }) =>
    (await apiClient.patch<ApiResponse<Staff>>(EP.detail(id), data)).data.data,

  remove: async (id: string) => {
    await apiClient.delete(EP.detail(id));
  },

  resendInvite: async (id: string) => (await apiClient.post<ApiResponse<Staff>>(EP.resendInvite(id))).data.data,
};
