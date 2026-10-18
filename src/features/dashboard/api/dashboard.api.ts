import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { DashboardRange, DashboardSummary } from "../types";

export const dashboardApi = {
  summary: async (range: DashboardRange) =>
    (await apiClient.get<ApiResponse<DashboardSummary>>(API_ENDPOINTS.admin.summary, { params: { range } })).data.data,
};
