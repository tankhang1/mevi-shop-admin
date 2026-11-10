import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ROUTES } from "@/config/routes";
import { Banknote, CalendarDays, Package, ShoppingBag } from "lucide-react";
import {
  type Column,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { LoadingBlock } from "@/components/common/ui-bits";
import {
  type ProductRevenueReportItem,
  type RevenueReport,
  type RevenueRow,
  mapPartnerReportToRevenueReport,
  mapProductReportToRevenueReport,
  useProductRevenueList,
  useProductRevenueSummary,
  useProductRevenueTop10,
} from "@/features/report";
import { useAccess } from "@/features/auth";
import { usePartnerReport } from "@/features/partner";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { formatVnd } from "@/lib/format";
import { ReportTrendChart } from "./ReportTrendChart";
import { RevenueBars } from "./RevenueBars";
import { RevenueMobileCard } from "./RevenueMobileCard";
import { TopSeriesChart } from "./TopSeriesChart";
import { ReportFilters } from "./ReportFilters";
import { type ReportFilterState, defaultFilters } from "./report-filters";

const nf = new Intl.NumberFormat("vi-VN");

const columns: Column<ProductRevenueReportItem>[] = [
  {
    key: "product",
    label: "Sản phẩm",
    mobilePriority: "primary",
    render: (_, r) => (
      <div className="flex items-center gap-2.5 min-w-0">
        {r.product.imageUrl && (
          <img
            src={r.product.imageUrl}
            alt={r.product.title}
            className="h-10 w-10 shrink-0 rounded-md object-cover border"
          />
        )}
        <div className="min-w-0">
          <div className="font-medium truncate">{r.product.title}</div>
          {r.product.code && (
            <div className="text-xs text-muted-foreground font-mono">{r.product.code}</div>
          )}
        </div>
      </div>
    ),
  },
  {
    key: "orderCount",
    label: "Số đơn",
    sortable: true,
    render: (v) => <span className="tabular-nums">{nf.format(Number(v))}</span>,
  },
  {
    key: "quantity",
    label: "Số lượng bán",
    sortable: true,
    render: (v) => <span className="tabular-nums">{nf.format(Number(v))}</span>,
  },
  {
    key: "revenue",
    label: "Doanh thu",
    sortable: true,
    mobilePriority: "secondary",
    render: (v) => (
      <span className="whitespace-nowrap font-semibold tabular-nums">
        {formatVnd(Number(v))}
      </span>
    ),
  },
  {
    key: "share",
    label: "Tỉ trọng",
    sortable: true,
    mobilePriority: "badge",
    render: (v) => (
      <span className="tabular-nums text-muted-foreground">{String(v)}%</span>
    ),
  },
];

/**
 * One seller's sales: all-time + this-month revenue, revenue over time, best sellers and
 * per-product trend. Shop admins get their own shop (backend scopes by token); root passes
 * `agencyId` to see one đại lý / CTV's referred sales.
 */
export function ShopSalesReport({ agencyId }: { agencyId?: string } = {}) {
  const { isRoot } = useAccess();
  const shopFilter = useShopFilter();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<ReportFilterState>(() =>
    defaultFilters(shopFilter.initialShopId),
  );
  const [, navigate] = useLocation();
  const range = { from: filters.from, to: filters.to };

  const table = useTableParams();

  // Order list pre-filtered to the completed orders behind this product's figure
  const openOrders = (r: ProductRevenueReportItem) => {
    const q = new URLSearchParams({
      productId: String(r.product.id),
      status: "DELIVERED",
      paymentStatus: "PAID",
      ...range,
    });
    if (agencyId) q.set("agencyId", agencyId);
    if (isRoot && filters.shopId !== "all") q.set("shopId", filters.shopId);
    navigate(`${ROUTES.orders}?${q}`);
  };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const categoryId =
    filters.category && filters.category !== "all"
      ? filters.category
      : undefined;

  // 1. Nếu có agencyId: gọi API Báo cáo đối tác legacy
  const {
    data: partnerReport,
    isLoading: isPartnerLoading,
  } = usePartnerReport(agencyId, {
    from: filters.from,
    to: filters.to,
    categoryId,
  });

  // 2. Nếu không có agencyId: gọi API Báo cáo doanh thu theo sản phẩm (BE notice 2026-11-09)
  const reportQueryFilters = useMemo(
    () => ({
      from: filters.from,
      to: filters.to,
      source:
        filters.source === "agency"
          ? ("REFERRAL" as const)
          : filters.source === "direct"
            ? ("DIRECT" as const)
            : ("" as const),
      categoryId,
      storefrontId:
        isRoot && filters.shopId !== "all" ? filters.shopId : undefined,
    }),
    [filters, categoryId, isRoot],
  );

  // 2.1. Thẻ số liệu & biểu đồ
  const {
    data: productSummary,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
  } = useProductRevenueSummary(!agencyId ? reportQueryFilters : undefined);

  // 2.2. Danh sách phân trang + tìm kiếm
  const {
    data: productPage,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useProductRevenueList(
    !agencyId
      ? {
          ...reportQueryFilters,
          keyword: table.params.keyword,
          page: table.params.page,
          size: table.params.size,
        }
      : undefined,
  );

  // 2.3. Top 10 sản phẩm bán chạy (không truyền keyword)
  const { data: top10Page } = useProductRevenueTop10(
    !agencyId ? reportQueryFilters : undefined,
  );

  const reportChartData: RevenueReport | undefined = useMemo(() => {
    if (agencyId && partnerReport) {
      return mapPartnerReportToRevenueReport(
        partnerReport,
        filters.from,
        filters.to,
      );
    }
    if (!agencyId && productSummary) {
      return mapProductReportToRevenueReport(productSummary);
    }
    return undefined;
  }, [agencyId, partnerReport, productSummary, filters.from, filters.to]);

  const top10Rows: RevenueRow[] = useMemo(() => {
    if (top10Page?.items) {
      return top10Page.items.map((it) => ({
        id: String(it.product.id),
        label: it.product.title,
        sub: it.product.code,
        orders: it.orderCount,
        units: it.quantity,
        revenue: it.revenue,
        share: it.share,
      }));
    }
    return [];
  }, [top10Page]);

  const isLoading = agencyId ? isPartnerLoading : isSummaryLoading;
  const isFetching = agencyId ? false : isSummaryFetching || isListFetching;

  const stats = useMemo(() => {
    if (agencyId && partnerReport) {
      return [
        {
          title: "Tổng doanh thu",
          value: formatVnd(partnerReport.totalRevenue),
          note: `${nf.format(partnerReport.totalDeliveredOrders)} đơn hoàn tất`,
          icon: Banknote,
        },
        {
          title: `Doanh thu tháng ${currentMonth}`,
          value: formatVnd(partnerReport.monthRevenue),
          note: "Từ đầu tháng đến nay",
          icon: CalendarDays,
        },
        {
          title: "Đơn tháng này",
          value: nf.format(partnerReport.monthDeliveredOrders),
          note: "Đơn hoàn tất",
          icon: ShoppingBag,
        },
        {
          title: "Sản phẩm bán tháng này",
          value: nf.format(partnerReport.monthQuantity),
          note: "Tổng số lượng",
          icon: Package,
        },
      ];
    }

    if (!agencyId && productSummary) {
      return [
        {
          title: "Doanh thu",
          value: formatVnd(productSummary.revenue),
          note: `${nf.format(productSummary.deliveredOrders)} đơn hoàn tất`,
          icon: Banknote,
        },
        {
          title: "Đơn hoàn tất",
          value: nf.format(productSummary.deliveredOrders),
          note: "Đơn hoàn tất trong kỳ",
          icon: ShoppingBag,
        },
        {
          title: "Sản phẩm đã bán",
          value: nf.format(productSummary.quantity),
          note: "Tổng số lượng bán ra",
          icon: Package,
        },
        {
          title: "Số sản phẩm có doanh thu",
          value: nf.format(productSummary.productCount),
          note: "Mặt hàng phát sinh đơn",
          icon: CalendarDays,
        },
      ];
    }

    return [];
  }, [agencyId, partnerReport, productSummary, currentMonth]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-3 sm:p-5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-sm">
              <s.icon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
              <span className="truncate">{s.title}</span>
            </div>
            <div className="mt-1 truncate text-base font-bold tabular-nums sm:text-2xl">
              {s.value}
            </div>
            <div className="truncate text-[11px] text-muted-foreground sm:text-xs">
              {s.note}
            </div>
          </div>
        ))}
      </div>

      <ReportFilters
        value={filters}
        onChange={setFilters}
        showShopFilter={isRoot && !agencyId}
        initialShopId={shopFilter.initialShopId}
        showSource={!agencyId}
      />

      {isLoading || !reportChartData ? (
        <LoadingBlock />
      ) : (
        <>
          <ReportTrendChart report={reportChartData} />
          {top10Rows.length > 0 && (
            <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Top sản phẩm bán chạy
                  </CardTitle>
                </CardHeader>
                <CardContent className={isFetching ? "opacity-60" : undefined}>
                  <RevenueBars rows={top10Rows} />
                </CardContent>
              </Card>
              <TopSeriesChart report={reportChartData} entity="Sản phẩm" />
            </div>
          )}
          <div className="min-w-0">
            <DataTable
              {...table.bind(productPage, isListLoading || isListFetching)}
              columns={columns}
              searchPlaceholder="Tìm sản phẩm..."
              filterable={false}
              enableMobileCard
              onRowClick={openOrders}
              renderMobileCard={(r) => (
                <RevenueMobileCard
                  row={{
                    id: String(r.product.id),
                    label: r.product.title,
                    sub: r.product.code,
                    orders: r.orderCount,
                    units: r.quantity,
                    revenue: r.revenue,
                    share: r.share,
                  }}
                  showCommission={false}
                  onClick={() => openOrders(r)}
                />
              )}
              columnToggleable={!isMobile}
              downloadable={!isMobile}
            />
          </div>
        </>
      )}
    </div>
  );
}
