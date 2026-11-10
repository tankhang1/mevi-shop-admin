import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient, realApiClient } from "@/lib/axios";
import { cleanFilters, fromSpringPage, toSpringPageParams } from "@/lib/pagination";
import type { ApiResponse, Paginated, SpringPage } from "@/types/api";
import type { PartnerReport } from "@/features/partner/types";
import type {
  CategoryRevenueItem,
  CategoryRevenueSummary,
  FarmRevenueItem,
  FarmRevenueSummary,
  PartnerRevenueItem,
  PartnerRevenueSummary,
  ProductRevenueReportItem,
  ProductRevenueReportParams,
  ProductRevenueSummary,
  ReportFilterParams,
  RevenueReport,
  RevenueReportParams,
} from "./types";

export type * from "./types";

const EP = API_ENDPOINTS.admin.reports;

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

async function fetchSummary<T>(endpoint: string, params?: ReportFilterParams): Promise<T> {
  const clean = params ? cleanFilters(params as Record<string, unknown>) : undefined;
  const res = await realApiClient.get<T | ApiResponse<T>>(endpoint, { params: clean });
  return unwrap<T>(res.data);
}

function ensureRowId<T>(item: T): T & { id: string | number } {
  const anyItem = item as Record<string, unknown>;
  if (anyItem.id != null) return item as T & { id: string | number };
  if (
    anyItem.product &&
    typeof anyItem.product === "object" &&
    (anyItem.product as { id: unknown }).id != null
  ) {
    return { ...item, id: String((anyItem.product as { id: unknown }).id) };
  }
  if (anyItem.storefrontId !== undefined) {
    return {
      ...item,
      id: anyItem.storefrontId != null ? String(anyItem.storefrontId) : "direct",
    };
  }
  if (anyItem.workspaceId != null) {
    return { ...item, id: String(anyItem.workspaceId) };
  }
  if (anyItem.categoryId != null) {
    return { ...item, id: String(anyItem.categoryId) };
  }
  return { ...item, id: Math.random().toString(36).slice(2) };
}

async function fetchSpringPage<T>(
  endpoint: string,
  params?: ReportFilterParams,
): Promise<Paginated<T & { id: string | number }>> {
  const pageParams = params
    ? toSpringPageParams(cleanFilters(params as Record<string, unknown>))
    : undefined;
  const res = await realApiClient.get<SpringPage<T> | ApiResponse<SpringPage<T>>>(
    endpoint,
    { params: pageParams },
  );
  const raw = unwrap<SpringPage<T> | Paginated<T>>(res.data);
  if ("content" in raw && Array.isArray(raw.content)) {
    const p = fromSpringPage(raw as SpringPage<T>);
    return {
      items: (p?.items ?? []).map(ensureRowId),
      page: p?.page ?? 1,
      size: p?.size ?? 10,
      total: p?.total ?? 0,
    };
  }
  if ("items" in raw && Array.isArray(raw.items)) {
    const p = raw as Paginated<T>;
    return {
      items: (p.items ?? []).map(ensureRowId),
      page: p.page,
      size: p.size,
      total: p.total,
    };
  }
  return { items: [], page: 1, size: 10, total: 0 };
}

export const reportApi = {
  /**
   * Báo cáo doanh thu đa chiều legacy
   */
  revenue: async (params: RevenueReportParams) => {
    const res = await apiClient.get<RevenueReport | ApiResponse<RevenueReport>>(
      EP.revenue,
      { params },
    );
    return unwrap<RevenueReport>(res.data);
  },

  // ── 1. Báo cáo doanh thu theo sản phẩm ──
  productSummary: (params?: ReportFilterParams) =>
    fetchSummary<ProductRevenueSummary>(EP.productSummary, params),

  productList: (params?: ReportFilterParams) =>
    fetchSpringPage<ProductRevenueReportItem>(EP.products, params),

  // Legacy compat
  productRevenue: (params?: ProductRevenueReportParams) =>
    fetchSummary<ProductRevenueSummary>(EP.productSummary, params),

  // ── 2. Báo cáo doanh thu theo đại lý / CTV ──
  partnerSummary: (params?: ReportFilterParams) =>
    fetchSummary<PartnerRevenueSummary>(EP.partnerSummary, params),

  partnerList: (params?: ReportFilterParams) =>
    fetchSpringPage<PartnerRevenueItem>(EP.partners, params),

  // ── 3. Báo cáo doanh thu theo nông hộ / HTX ──
  farmSummary: (params?: ReportFilterParams) =>
    fetchSummary<FarmRevenueSummary>(EP.farmSummary, params),

  farmList: (params?: ReportFilterParams) =>
    fetchSpringPage<FarmRevenueItem>(EP.farms, params),

  // ── 4. Báo cáo doanh thu theo nhóm sản phẩm ──
  categorySummary: (params?: ReportFilterParams) =>
    fetchSummary<CategoryRevenueSummary>(EP.categorySummary, params),

  categoryList: (params?: ReportFilterParams) =>
    fetchSpringPage<CategoryRevenueItem>(EP.categories, params),
};

// ── Query Keys Factory ──
export const reportKeys = {
  all: ["reports"] as const,
  revenue: (params: RevenueReportParams) => [...reportKeys.all, "revenue", params] as const,
  products: {
    summary: (params?: ReportFilterParams) => [...reportKeys.all, "products", "summary", params] as const,
    list: (params?: ReportFilterParams) => [...reportKeys.all, "products", "list", params] as const,
    top10: (params?: ReportFilterParams) => [...reportKeys.all, "products", "top10", params] as const,
  },
  partners: {
    summary: (params?: ReportFilterParams) => [...reportKeys.all, "partners", "summary", params] as const,
    list: (params?: ReportFilterParams) => [...reportKeys.all, "partners", "list", params] as const,
    top10: (params?: ReportFilterParams) => [...reportKeys.all, "partners", "top10", params] as const,
  },
  farms: {
    summary: (params?: ReportFilterParams) => [...reportKeys.all, "farms", "summary", params] as const,
    list: (params?: ReportFilterParams) => [...reportKeys.all, "farms", "list", params] as const,
    top10: (params?: ReportFilterParams) => [...reportKeys.all, "farms", "top10", params] as const,
  },
  categories: {
    summary: (params?: ReportFilterParams) => [...reportKeys.all, "categories", "summary", params] as const,
    list: (params?: ReportFilterParams) => [...reportKeys.all, "categories", "list", params] as const,
    top10: (params?: ReportFilterParams) => [...reportKeys.all, "categories", "top10", params] as const,
  },
};

// ── React Query Hooks ──
export function useRevenueReport(
  params: RevenueReportParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: reportKeys.revenue(params),
    queryFn: () => reportApi.revenue(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

// 1. Sản phẩm
export function useProductRevenueSummary(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: reportKeys.products.summary(params),
    queryFn: () => reportApi.productSummary(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useProductRevenueList(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: reportKeys.products.list(params),
    queryFn: () => reportApi.productList(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useProductRevenueTop10(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  const queryParams = { ...params, page: 0, size: 10, keyword: undefined };
  return useQuery({
    queryKey: reportKeys.products.top10(queryParams),
    queryFn: () => reportApi.productList(queryParams),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

// Legacy compat
export const useProductRevenueReport = useProductRevenueSummary;

// 2. Đại lý / CTV
export function usePartnerRevenueSummary(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: reportKeys.partners.summary(params),
    queryFn: () => reportApi.partnerSummary(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function usePartnerRevenueList(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: reportKeys.partners.list(params),
    queryFn: () => reportApi.partnerList(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function usePartnerRevenueTop10(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  const queryParams = { ...params, page: 0, size: 10, keyword: undefined };
  return useQuery({
    queryKey: reportKeys.partners.top10(queryParams),
    queryFn: () => reportApi.partnerList(queryParams),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

// 3. Nông hộ / HTX
export function useFarmRevenueSummary(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: reportKeys.farms.summary(params),
    queryFn: () => reportApi.farmSummary(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useFarmRevenueList(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: reportKeys.farms.list(params),
    queryFn: () => reportApi.farmList(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useFarmRevenueTop10(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  const queryParams = { ...params, page: 0, size: 10, keyword: undefined };
  return useQuery({
    queryKey: reportKeys.farms.top10(queryParams),
    queryFn: () => reportApi.farmList(queryParams),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

// 4. Nhóm sản phẩm (Danh mục)
export function useCategoryRevenueSummary(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: reportKeys.categories.summary(params),
    queryFn: () => reportApi.categorySummary(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useCategoryRevenueList(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: reportKeys.categories.list(params),
    queryFn: () => reportApi.categoryList(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

export function useCategoryRevenueTop10(
  params?: ReportFilterParams,
  options?: { enabled?: boolean },
) {
  const queryParams = { ...params, page: 0, size: 10, keyword: undefined };
  return useQuery({
    queryKey: reportKeys.categories.top10(queryParams),
    queryFn: () => reportApi.categoryList(queryParams),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  });
}

// ── Legacy Helpers ──
export function mapProductReportToRevenueReport(
  rep: ProductRevenueSummary,
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
    rows: [],
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
