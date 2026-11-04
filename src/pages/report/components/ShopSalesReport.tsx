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
  type RevenueRow,
  mapPartnerReportToRevenueReport,
  mapProductReportToRevenueReport,
  useProductRevenueReport,
} from "@/features/report";
import { useAccess } from "@/features/auth";
import { usePartnerReport } from "@/features/partner";
import { useShopFilter } from "@/features/shop";
import { formatVnd } from "@/lib/format";
import { ReportTrendChart } from "./ReportTrendChart";
import { RevenueBars } from "./RevenueBars";
import { RevenueMobileCard } from "./RevenueMobileCard";
import { TopSeriesChart } from "./TopSeriesChart";
import { ReportFilters } from "./ReportFilters";
import { type ReportFilterState, defaultFilters } from "./report-filters";

const nf = new Intl.NumberFormat("vi-VN");

const columns: Column<RevenueRow>[] = [
  {
    key: "label",
    label: "Sản phẩm",
    mobilePriority: "primary",
    render: (_, r) => (
      <div className="min-w-0">
        <div className="font-medium">{r.label}</div>
        {r.sub && <div className="text-xs text-muted-foreground">{r.sub}</div>}
      </div>
    ),
  },
  {
    key: "orders",
    label: "Số đơn",
    sortable: true,
    render: (v) => <span className="tabular-nums">{nf.format(Number(v))}</span>,
  },
  {
    key: "units",
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
  // Order list pre-filtered to the completed orders behind this product's figure
  const openOrders = (r: RevenueRow) => {
    const q = new URLSearchParams({
      productId: r.id,
      status: "completed",
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

  // 1. Nếu có agencyId: gọi API Báo cáo đối tác (Mục 13.6)
  const {
    data: partnerReport,
    isLoading: isPartnerLoading,
    isFetching: isPartnerFetching,
  } = usePartnerReport(agencyId, {
    from: filters.from,
    to: filters.to,
    categoryId,
  });

  // 2. Nếu không có agencyId: gọi API Báo cáo doanh thu theo sản phẩm (Mục 14)
  const {
    data: productReport,
    isLoading: isProductLoading,
    isFetching: isProductFetching,
  } = useProductRevenueReport(
    !agencyId
      ? {
          from: filters.from,
          to: filters.to,
          source:
            filters.source === "agency"
              ? "REFERRAL"
              : filters.source === "direct"
                ? "DIRECT"
                : "",
          categoryId,
          storefrontId:
            isRoot && filters.shopId !== "all" ? filters.shopId : undefined,
        }
      : undefined,
  );

  const data = useMemo(() => {
    if (agencyId && partnerReport) {
      return mapPartnerReportToRevenueReport(
        partnerReport,
        filters.from,
        filters.to,
      );
    }
    if (!agencyId && productReport) {
      return mapProductReportToRevenueReport(productReport);
    }
    return undefined;
  }, [agencyId, partnerReport, productReport, filters.from, filters.to]);

  const isLoading = agencyId ? isPartnerLoading : isProductLoading;
  const isFetching = agencyId ? isPartnerFetching : isProductFetching;

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

    if (!agencyId && productReport) {
      return [
        {
          title: "Doanh thu",
          value: formatVnd(productReport.revenue),
          note: `${nf.format(productReport.deliveredOrders)} đơn hoàn tất`,
          icon: Banknote,
        },
        {
          title: "Đơn hoàn tất",
          value: nf.format(productReport.deliveredOrders),
          note: "Đơn hoàn tất trong kỳ",
          icon: ShoppingBag,
        },
        {
          title: "Sản phẩm đã bán",
          value: nf.format(productReport.quantity),
          note: "Tổng số lượng bán ra",
          icon: Package,
        },
        {
          title: "Số sản phẩm có doanh thu",
          value: nf.format(productReport.productCount),
          note: "Mặt hàng phát sinh đơn",
          icon: CalendarDays,
        },
      ];
    }

    return [];
  }, [agencyId, partnerReport, productReport, currentMonth]);

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

      {isLoading || !data ? (
        <LoadingBlock />
      ) : (
        <>
          <ReportTrendChart report={data} />
          {data.rows.length > 0 && (
            <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Top sản phẩm bán chạy
                  </CardTitle>
                </CardHeader>
                <CardContent className={isFetching ? "opacity-60" : undefined}>
                  <RevenueBars rows={data.rows} />
                </CardContent>
              </Card>
              <TopSeriesChart report={data} entity="Sản phẩm" />
            </div>
          )}
          <div className="min-w-0">
            <DataTable
              data={data.rows}
              columns={columns}
              loading={isFetching}
              searchPlaceholder="Tìm sản phẩm..."
              filterable={false}
              enableMobileCard
              onRowClick={openOrders}
              renderMobileCard={(r) => (
                <RevenueMobileCard
                  row={r}
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
