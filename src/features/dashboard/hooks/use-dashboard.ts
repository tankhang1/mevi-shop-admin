import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardRange } from "../types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (range: DashboardRange) => [...dashboardKeys.all, "summary", range] as const,
};

export function useDashboardSummary(range: DashboardRange) {
  return useQuery({
    queryKey: dashboardKeys.summary(range),
    queryFn: () => dashboardApi.summary(range),
    placeholderData: keepPreviousData,
  });
}
