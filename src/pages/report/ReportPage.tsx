import { useEffect, useMemo, useRef, useState } from "react";
import { Redirect, useLocation, useParams } from "wouter";
import { Banknote, HandCoins, Package, ShoppingBag } from "lucide-react";
import {
  type Column,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  StatsCard,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  EmptyBlock,
  LoadingBlock,
  StatusPill,
} from "@/components/common/ui-bits";
import { AGENCY_KIND } from "@/features/agency";
import {
  type CategoryRevenueItem,
  type FarmRevenueItem,
  type PartnerRevenueItem,
  type RevenueGroupBy,
  type RevenueReport,
  type RevenueRow,
  useCategoryRevenueList,
  useCategoryRevenueSummary,
  useCategoryRevenueTop10,
  useFarmRevenueList,
  useFarmRevenueSummary,
  useFarmRevenueTop10,
  usePartnerRevenueList,
  usePartnerRevenueSummary,
  usePartnerRevenueTop10,
} from "@/features/report";
import { ROUTES } from "@/config/routes";
import { useAccess } from "@/features/auth";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { formatVnd } from "@/lib/format";
import { ReportFilters } from "./components/ReportFilters";
import {
  type ReportFilterState,
  defaultFilters,
} from "./components/report-filters";
import { ShopSalesReport } from "./components/ShopSalesReport";
import { ReportTrendChart } from "./components/ReportTrendChart";
import { RevenueMobileCard } from "./components/RevenueMobileCard";
import { RevenueBars } from "./components/RevenueBars";
import { TopSeriesChart } from "./components/TopSeriesChart";

const VIEWS: {
  value: RevenueGroupBy;
  label: string;
  entity: string;
  note?: string;
}[] = [
  { value: "agency", label: "Đại lý / CTV", entity: "Đại lý / CTV" },
  { value: "product", label: "Sản phẩm", entity: "Sản phẩm" },
  {
    value: "group",
    label: "Nhóm sản phẩm",
    entity: "Nhóm sản phẩm",
    note: "Sản phẩm thuộc nhiều nhóm được tính vào từng nhóm, nên tổng các dòng có thể lớn hơn tổng doanh thu.",
  },
  { value: "farm", label: "Nông hộ", entity: "Nông hộ / HTX" },
];

const nf = new Intl.NumberFormat("vi-VN");

export default function ReportPage() {
  const shopFilter = useShopFilter();
  const { isRoot } = useAccess();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { kind } = useParams<{ kind: string }>();
  const view = VIEWS.find((v) => v.value === kind);
  const groupBy: RevenueGroupBy = view?.value ?? "agency";

  const [filters, setFilters] = useState<ReportFilterState>(() =>
    defaultFilters(shopFilter.initialShopId),
  );

  const table = useTableParams();
  const { reset } = table;
  const prevKindRef = useRef(kind);

  useEffect(() => {
    if (prevKindRef.current !== kind) {
      prevKindRef.current = kind;
      reset();
    }
  }, [kind, reset]);

  const isProductReport = kind === "product" || kind === "sales";
  const isAgency = groupBy === "agency";
  const isFarm = groupBy === "farm";
  const isGroup = groupBy === "group";

  // Filter chung
  const commonFilters = useMemo(
    () => ({
      from: filters.from,
      to: filters.to,
      source:
        filters.source === "agency"
          ? ("REFERRAL" as const)
          : filters.source === "direct"
            ? ("DIRECT" as const)
            : ("" as const),
      categoryId:
        filters.category && filters.category !== "all"
          ? filters.category
          : undefined,
      storefrontId:
        shopFilter.isRoot && filters.shopId !== "all"
          ? filters.shopId
          : undefined,
    }),
    [filters, shopFilter.isRoot],
  );

  // 1. Đại lý / CTV (Module ②)
  const {
    data: partnerSummary,
    isLoading: isPartnerSummaryLoading,
    isFetching: isPartnerSummaryFetching,
  } = usePartnerRevenueSummary(commonFilters, {
    enabled: isAgency && !isProductReport,
  });
  const {
    data: partnerList,
    isLoading: isPartnerListLoading,
    isFetching: isPartnerListFetching,
  } = usePartnerRevenueList(
    {
      ...commonFilters,
      keyword: table.params.keyword,
      page: table.params.page,
      size: table.params.size,
    },
    { enabled: isAgency && !isProductReport },
  );
  const { data: partnerTop10 } = usePartnerRevenueTop10(commonFilters, {
    enabled: isAgency && !isProductReport,
  });

  // 2. Nông hộ / HTX (Module ③)
  const {
    data: farmSummary,
    isLoading: isFarmSummaryLoading,
    isFetching: isFarmSummaryFetching,
  } = useFarmRevenueSummary(commonFilters, {
    enabled: isFarm && !isProductReport,
  });
  const {
    data: farmList,
    isLoading: isFarmListLoading,
    isFetching: isFarmListFetching,
  } = useFarmRevenueList(
    {
      ...commonFilters,
      keyword: table.params.keyword,
      page: table.params.page,
      size: table.params.size,
    },
    { enabled: isFarm && !isProductReport },
  );
  const { data: farmTop10 } = useFarmRevenueTop10(commonFilters, {
    enabled: isFarm && !isProductReport,
  });

  // 3. Nhóm sản phẩm (Module ④)
  const {
    data: groupSummary,
    isLoading: isGroupSummaryLoading,
    isFetching: isGroupSummaryFetching,
  } = useCategoryRevenueSummary(commonFilters, {
    enabled: isGroup && !isProductReport,
  });
  const {
    data: groupList,
    isLoading: isGroupListLoading,
    isFetching: isGroupListFetching,
  } = useCategoryRevenueList(
    {
      ...commonFilters,
      keyword: table.params.keyword,
      page: table.params.page,
      size: table.params.size,
    },
    { enabled: isGroup && !isProductReport },
  );
  const { data: groupTop10 } = useCategoryRevenueTop10(commonFilters, {
    enabled: isGroup && !isProductReport,
  });

  // Chart data mapping
  const chartReport: RevenueReport | null = useMemo(() => {
    if (isAgency && partnerSummary) {
      return {
        groupBy: "agency",
        from: partnerSummary.from,
        to: partnerSummary.to,
        bucket: "day",
        trend: (partnerSummary.series ?? []).map((s) => ({
          date: s.period,
          revenue: s.revenue,
          orders: s.orderCount,
        })),
        topSeries: (partnerSummary.topPartners ?? []).map((tp) => ({
          id: String(tp.storefrontId),
          label: tp.name,
          values: tp.revenue,
        })),
        totals: {
          revenue: partnerSummary.revenue,
          orders: partnerSummary.deliveredOrders,
          units: partnerSummary.quantity,
          commission: partnerSummary.commission,
        },
        rows: [],
      };
    }
    if (isFarm && farmSummary) {
      return {
        groupBy: "farm",
        from: farmSummary.from,
        to: farmSummary.to,
        bucket: "day",
        trend: (farmSummary.series ?? []).map((s) => ({
          date: s.period,
          revenue: s.revenue,
          orders: s.orderCount,
        })),
        topSeries: (farmSummary.topFarms ?? []).map((tf) => ({
          id: String(tf.workspaceId),
          label: tf.name,
          values: tf.revenue,
        })),
        totals: {
          revenue: farmSummary.revenue,
          orders: farmSummary.deliveredOrders,
          units: farmSummary.quantity,
        },
        rows: [],
      };
    }
    if (isGroup && groupSummary) {
      return {
        groupBy: "group",
        from: groupSummary.from,
        to: groupSummary.to,
        bucket: "day",
        trend: (groupSummary.series ?? []).map((s) => ({
          date: s.period,
          revenue: s.revenue,
          orders: s.orderCount,
        })),
        topSeries: (groupSummary.topCategories ?? []).map((tc) => ({
          id: String(tc.categoryId),
          label: tc.name,
          values: tc.revenue,
        })),
        totals: {
          revenue: groupSummary.revenue,
          orders: groupSummary.deliveredOrders,
          units: groupSummary.quantity,
        },
        rows: [],
      };
    }
    return null;
  }, [isAgency, isFarm, isGroup, partnerSummary, farmSummary, groupSummary]);

  // Top 10 bars
  const top10Rows: RevenueRow[] = useMemo(() => {
    if (isAgency && partnerTop10?.items) {
      return partnerTop10.items.map((it) => ({
        id: it.storefrontId != null ? String(it.storefrontId) : "none",
        label: it.name || "Bán trực tiếp",
        sub:
          it.partnerType === "AGENCY"
            ? "Đại lý"
            : it.partnerType === "COLLABORATOR"
              ? "CTV"
              : undefined,
        orders: it.orderCount,
        units: it.quantity,
        revenue: it.revenue,
        share: it.share,
        commission: it.commission ?? undefined,
        kind:
          it.partnerType === "AGENCY"
            ? "agency"
            : it.partnerType === "COLLABORATOR"
              ? "ctv"
              : undefined,
      }));
    }
    if (isFarm && farmTop10?.items) {
      return farmTop10.items.map((it) => ({
        id: String(it.workspaceId),
        label: it.name,
        sub: [
          it.organizationTypeName,
          [it.district, it.province].filter(Boolean).join(", "),
        ]
          .filter(Boolean)
          .join(" · "),
        orders: it.orderCount,
        units: it.quantity,
        revenue: it.revenue,
        share: it.share,
      }));
    }
    if (isGroup && groupTop10?.items) {
      return groupTop10.items.map((it) => ({
        id: String(it.categoryId),
        label: it.name,
        sub: `${it.productCount} sản phẩm`,
        orders: it.orderCount,
        units: it.quantity,
        revenue: it.revenue,
        share: it.share,
      }));
    }
    return [];
  }, [isAgency, isFarm, isGroup, partnerTop10, farmTop10, groupTop10]);

  // Stat items
  const statItems = useMemo(() => {
    if (isAgency && partnerSummary) {
      return [
        {
          title: "Doanh thu",
          value: formatVnd(partnerSummary.revenue),
          icon: Banknote,
        },
        {
          title: "Đơn hoàn tất",
          value: nf.format(partnerSummary.deliveredOrders),
          icon: ShoppingBag,
        },
        {
          title: "Sản phẩm đã bán",
          value: nf.format(partnerSummary.quantity),
          icon: Package,
        },
        {
          title: "Hoa hồng phát sinh",
          value: formatVnd(partnerSummary.commission),
          icon: HandCoins,
        },
      ];
    }
    if (isFarm && farmSummary) {
      return [
        {
          title: "Doanh thu",
          value: formatVnd(farmSummary.revenue),
          icon: Banknote,
        },
        {
          title: "Đơn hoàn tất",
          value: nf.format(farmSummary.deliveredOrders),
          icon: ShoppingBag,
        },
        {
          title: "Sản phẩm đã bán",
          value: nf.format(farmSummary.quantity),
          icon: Package,
        },
        {
          title: "Số nông hộ / HTX có doanh thu",
          value: nf.format(farmSummary.farmCount),
          icon: Package,
        },
      ];
    }
    if (isGroup && groupSummary) {
      return [
        {
          title: "Doanh thu",
          value: formatVnd(groupSummary.revenue),
          icon: Banknote,
        },
        {
          title: "Đơn hoàn tất",
          value: nf.format(groupSummary.deliveredOrders),
          icon: ShoppingBag,
        },
        {
          title: "Sản phẩm đã bán",
          value: nf.format(groupSummary.quantity),
          icon: Package,
        },
        {
          title: "Số nhóm sản phẩm có doanh thu",
          value: nf.format(groupSummary.categoryCount),
          icon: Package,
        },
      ];
    }
    return [];
  }, [isAgency, isFarm, isGroup, partnerSummary, farmSummary, groupSummary]);

  // Column definitions for each dimension
  const partnerColumns: Column<PartnerRevenueItem>[] = [
    {
      key: "name",
      label: "Đại lý / CTV",
      mobilePriority: "primary",
      render: (_, r) => {
        const isDirect = r.storefrontId === null;
        return (
          <div className="min-w-0">
            <div
              className={
                isDirect ? "font-medium text-muted-foreground" : "font-medium"
              }
            >
              {isDirect ? "—" : r.name}
              {r.partnerType && (
                <StatusPill
                  {...AGENCY_KIND[
                    r.partnerType === "AGENCY" ? "agency" : "ctv"
                  ]}
                  className={`ml-2 align-middle ${
                    AGENCY_KIND[r.partnerType === "AGENCY" ? "agency" : "ctv"]
                      .className
                  }`}
                />
              )}
            </div>
            {r.commissionRate != null && (
              <div className="text-xs text-muted-foreground">
                Hoa hồng {r.commissionRate}%
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "orderCount",
      label: "Số đơn",
      sortable: true,
      render: (v) => (
        <span className="tabular-nums">{nf.format(Number(v))}</span>
      ),
    },
    {
      key: "quantity",
      label: "Số lượng bán",
      sortable: true,
      render: (v) => (
        <span className="tabular-nums">{nf.format(Number(v))}</span>
      ),
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
    {
      key: "commission",
      label: "Hoa hồng",
      sortable: true,
      render: (v) => (
        <span className="whitespace-nowrap tabular-nums">
          {v != null ? formatVnd(Number(v)) : "—"}
        </span>
      ),
    },
  ];

  const farmColumns: Column<FarmRevenueItem>[] = [
    {
      key: "name",
      label: "Nông hộ / HTX",
      mobilePriority: "primary",
      render: (_, r) => {
        const sub = [
          r.organizationTypeName,
          [r.district, r.province].filter(Boolean).join(", "),
        ]
          .filter(Boolean)
          .join(" · ");
        return (
          <div className="min-w-0">
            <div className="font-medium">{r.name}</div>
            {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
          </div>
        );
      },
    },
    {
      key: "orderCount",
      label: "Số đơn",
      sortable: true,
      render: (v) => (
        <span className="tabular-nums">{nf.format(Number(v))}</span>
      ),
    },
    {
      key: "quantity",
      label: "Số lượng bán",
      sortable: true,
      render: (v) => (
        <span className="tabular-nums">{nf.format(Number(v))}</span>
      ),
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

  const groupColumns: Column<CategoryRevenueItem>[] = [
    {
      key: "name",
      label: "Nhóm sản phẩm",
      mobilePriority: "primary",
      render: (_, r) => (
        <div className="min-w-0">
          <div className="font-medium">{r.name}</div>
          <div className="text-xs text-muted-foreground">
            {r.productCount} sản phẩm
          </div>
        </div>
      ),
    },
    {
      key: "orderCount",
      label: "Số đơn",
      sortable: true,
      render: (v) => (
        <span className="tabular-nums">{nf.format(Number(v))}</span>
      ),
    },
    {
      key: "quantity",
      label: "Số lượng bán",
      sortable: true,
      render: (v) => (
        <span className="tabular-nums">{nf.format(Number(v))}</span>
      ),
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

  const openAgency = (r: PartnerRevenueItem) => {
    if (r.storefrontId != null) {
      navigate(ROUTES.agencyReport(String(r.storefrontId)));
    }
  };

  const openGroupOrders = (r: CategoryRevenueItem) => {
    const q = new URLSearchParams({
      categoryId: String(r.categoryId),
      status: "completed",
      from: filters.from,
      to: filters.to,
    });
    if (shopFilter.isRoot && filters.shopId !== "all") {
      q.set("shopId", filters.shopId);
    }
    navigate(`${ROUTES.orders}?${q}`);
  };

  // Safe checks & returns AFTER all hooks have executed
  if (isProductReport) {
    return <ShopSalesReport />;
  }
  if (!view) return <Redirect to={ROUTES.report("agency")} replace />;
  if (!isRoot && (groupBy === "agency" || groupBy === "farm"))
    return <Redirect to={ROUTES.report("sales")} replace />;

  const isLoading =
    (isAgency && (isPartnerSummaryLoading || isPartnerListLoading)) ||
    (isFarm && (isFarmSummaryLoading || isFarmListLoading)) ||
    (isGroup && (isGroupSummaryLoading || isGroupListLoading));

  const isFetching =
    (isAgency && (isPartnerSummaryFetching || isPartnerListFetching)) ||
    (isFarm && (isFarmSummaryFetching || isFarmListFetching)) ||
    (isGroup && (isGroupSummaryFetching || isGroupListFetching));

  const activePageData = isAgency ? partnerList : isFarm ? farmList : groupList;

  return (
    <div className="space-y-4 sm:space-y-5">
      <ReportFilters
        value={filters}
        onChange={setFilters}
        showShopFilter={shopFilter.isRoot}
        initialShopId={shopFilter.initialShopId}
      />

      {isLoading || !chartReport ? (
        <LoadingBlock />
      ) : (
        <>
          {/* Mobile: 2×2 compact tiles */}
          <div className="grid grid-cols-2 gap-2 md:hidden!">
            {statItems.map((it) => (
              <div key={it.title} className="rounded-xl border bg-card p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <it.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{it.title}</span>
                </div>
                <div className="mt-1 truncate text-base font-bold tabular-nums">
                  {it.value}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden gap-4 md:grid! md:grid-cols-2 xl:grid-cols-4">
            {statItems.map((it) => (
              <StatsCard
                key={it.title}
                title={it.title}
                value={it.value}
                icon={it.icon}
              />
            ))}
          </div>

          {!activePageData || activePageData.total === 0 ? (
            <Card>
              <EmptyBlock>
                Chưa có đơn hoàn tất trong khoảng thời gian này.
              </EmptyBlock>
            </Card>
          ) : (
            <>
              <ReportTrendChart report={chartReport} />
              <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
                <TopSeriesChart report={chartReport} entity={view.entity} />
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Top 10 theo doanh thu
                    </CardTitle>
                    {view.note && (
                      <p className="text-xs text-muted-foreground">
                        {view.note}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent
                    className={isFetching ? "opacity-60" : undefined}
                  >
                    <RevenueBars rows={top10Rows} />
                  </CardContent>
                </Card>
              </div>

              <div className="min-w-0">
                {isAgency && (
                  <DataTable
                    {...table.bind(partnerList, isFetching)}
                    columns={partnerColumns}
                    searchPlaceholder="Tìm đại lý / ctv..."
                    filterable={false}
                    enableMobileCard
                    onRowClick={openAgency}
                    renderMobileCard={(r) => (
                      <RevenueMobileCard
                        row={{
                          id:
                            r.storefrontId != null
                              ? String(r.storefrontId)
                              : "none",
                          label: r.storefrontId == null ? "—" : r.name || "—",
                          sub:
                            r.commissionRate != null
                              ? `Hoa hồng ${r.commissionRate}%`
                              : undefined,
                          orders: r.orderCount,
                          units: r.quantity,
                          revenue: r.revenue,
                          share: r.share,
                          commission: r.commission ?? undefined,
                          kind:
                            r.partnerType === "AGENCY"
                              ? "agency"
                              : r.partnerType === "COLLABORATOR"
                                ? "ctv"
                                : undefined,
                        }}
                        showCommission={true}
                        onClick={
                          r.storefrontId != null
                            ? () => openAgency(r)
                            : undefined
                        }
                      />
                    )}
                    columnToggleable={!isMobile}
                    downloadable={!isMobile}
                  />
                )}

                {isFarm && (
                  <DataTable
                    {...table.bind(farmList, isFetching)}
                    columns={farmColumns}
                    searchPlaceholder="Tìm nông hộ / htx..."
                    filterable={false}
                    enableMobileCard
                    renderMobileCard={(r) => (
                      <RevenueMobileCard
                        row={{
                          id: String(r.workspaceId),
                          label: r.name,
                          sub: [
                            r.organizationTypeName,
                            [r.district, r.province].filter(Boolean).join(", "),
                          ]
                            .filter(Boolean)
                            .join(" · "),
                          orders: r.orderCount,
                          units: r.quantity,
                          revenue: r.revenue,
                          share: r.share,
                        }}
                        showCommission={false}
                      />
                    )}
                    columnToggleable={!isMobile}
                    downloadable={!isMobile}
                  />
                )}

                {isGroup && (
                  <DataTable
                    {...table.bind(groupList, isFetching)}
                    columns={groupColumns}
                    searchPlaceholder="Tìm nhóm sản phẩm..."
                    filterable={false}
                    enableMobileCard
                    onRowClick={openGroupOrders}
                    renderMobileCard={(r) => (
                      <RevenueMobileCard
                        row={{
                          id: String(r.categoryId),
                          label: r.name,
                          sub: `${r.productCount} sản phẩm`,
                          orders: r.orderCount,
                          units: r.quantity,
                          revenue: r.revenue,
                          share: r.share,
                        }}
                        showCommission={false}
                        onClick={() => openGroupOrders(r)}
                      />
                    )}
                    columnToggleable={!isMobile}
                    downloadable={!isMobile}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
