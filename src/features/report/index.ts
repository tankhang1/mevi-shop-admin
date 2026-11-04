import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient, realApiClient } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { PartnerReport } from "@/features/partner/types";
import type {
  ProductRevenueReport,
  ProductRevenueReportParams,
  RevenueReport,
  RevenueReportParams,
} from "./types";

export type * from "./types";

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

export const reportApi = {
  /**
   * Báo cáo doanh thu đa chiều (agency, group, farm)
   * Hiện tại backend chưa có API báo cáo tổng hợp cho các chiều này, dùng mock qua apiClient
   */
  revenue: async (params: RevenueReportParams) => {
    const res = await apiClient.get<RevenueReport | ApiResponse<RevenueReport>>(
      API_ENDPOINTS.admin.reports.revenue,
      { params },
    );
    return unwrap<RevenueReport>(res.data);
  },

  /** Báo cáo doanh thu theo sản phẩm (BE notice 2026-11-03 mục 14) */
  productRevenue: async (params?: ProductRevenueReportParams) => {
    const res = await realApiClient.get<
      ProductRevenueReport | ApiResponse<ProductRevenueReport>
    >(API_ENDPOINTS.admin.reports.products, { params });
    return unwrap<ProductRevenueReport>(res.data);
  },
};

export function useRevenueReport(
  params: RevenueReportParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["reports", "revenue", params],
    queryFn: () => reportApi.revenue(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useProductRevenueReport(params?: ProductRevenueReportParams) {
  return useQuery({
    queryKey: ["reports", "products", params],
    queryFn: () => reportApi.productRevenue(params),
    placeholderData: keepPreviousData,
  });
}

export function mapProductReportToRevenueReport(
  rep: ProductRevenueReport,
): RevenueReport {
  return {
    groupBy: "product",
    from: rep.from,
    to: rep.to,
    bucket: "day",
    trend: (rep.series ?? []).map((s) => ({
      date: s.period,
      revenue: s.revenue,
      orders: s.orderCount,
    })),
    topSeries: (rep.topProducts ?? []).map((tp) => ({
      id: String(tp.product.id),
      label: tp.product.title,
      values: tp.revenue,
    })),
    totals: {
      revenue: rep.revenue,
      orders: rep.deliveredOrders,
      units: rep.quantity,
    },
    rows: (rep.products ?? []).map((p) => ({
      id: String(p.product.id),
      label: p.product.title,
      sub: p.product.code,
      orders: p.orderCount,
      units: p.quantity,
      revenue: p.revenue,
      share: p.share,
    })),
  };
}

export function mapPartnerReportToRevenueReport(
  rep: PartnerReport,
  from: string,
  to: string,
): RevenueReport {
  return {
    groupBy: "product",
    from,
    to,
    bucket: "day",
    trend: (rep.series ?? []).map((s) => ({
      date: s.period,
      revenue: s.revenue,
      orders: s.orderCount,
    })),
    topSeries: (rep.topProducts ?? []).map((tp) => ({
      id: String(tp.product.id),
      label: tp.product.title,
      values: tp.revenue,
    })),
    totals: {
      revenue: rep.totalRevenue,
      orders: rep.totalDeliveredOrders,
      units: rep.monthQuantity ?? 0,
    },
    rows: (rep.products ?? []).map((p) => ({
      id: String(p.product.id),
      label: p.product.title,
      sub: p.product.code,
      orders: p.orderCount,
      units: p.quantity,
      revenue: p.revenue,
      share: p.share,
    })),
  };
}
