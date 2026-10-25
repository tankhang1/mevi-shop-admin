import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { RevenueReport, RevenueReportParams } from "./types";

export type * from "./types";

export const reportApi = {
  revenue: async (params: RevenueReportParams) =>
    (await apiClient.get<ApiResponse<RevenueReport>>(API_ENDPOINTS.admin.reports.revenue, { params })).data.data,
};

export function useRevenueReport(params: RevenueReportParams) {
  return useQuery({
    queryKey: ["reports", "revenue", params],
    queryFn: () => reportApi.revenue(params),
    placeholderData: keepPreviousData,
  });
}
