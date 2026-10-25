import { useState } from "react";
import { Redirect, useParams } from "wouter";
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
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import {
  type RevenueGroupBy,
  type RevenueRow,
  useRevenueReport,
} from "@/features/report";
import { ROUTES } from "@/config/routes";
import { useShopFilter } from "@/features/shop";
import { formatVnd } from "@/lib/format";
import { ReportFilters } from "./components/ReportFilters";
import {
  type ReportFilterState,
  defaultFilters,
} from "./components/report-filters";
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
  const isMobile = useIsMobile();
  const { kind } = useParams<{ kind: string }>();
  const view = VIEWS.find((v) => v.value === kind);
  const groupBy: RevenueGroupBy = view?.value ?? "agency";
  const [filters, setFilters] = useState<ReportFilterState>(() =>
    defaultFilters(shopFilter.initialShopId),
  );
  const { data, isLoading, isFetching } = useRevenueReport({
    groupBy,
    from: filters.from,
    to: filters.to,
    category: filters.category,
    source: filters.source,
    shopId: shopFilter.isRoot ? filters.shopId : undefined,
  });
  const isAgency = groupBy === "agency";
  // Hooks above run for every route; bail out only after them
  if (!view) return <Redirect to={ROUTES.report("agency")} replace />;

  const columns: Column<RevenueRow>[] = [
    {
      key: "label",
      label: view.entity,
      mobilePriority: "primary",
      render: (_, r) => (
        <div className="min-w-0">
          <div
            className={
              r.id === "none"
                ? "font-medium text-muted-foreground"
                : "font-medium"
            }
          >
            {r.label}
          </div>
          {r.sub && (
            <div className="text-xs text-muted-foreground">{r.sub}</div>
          )}
        </div>
      ),
    },
    {
      key: "orders",
      label: "Số đơn",
      sortable: true,
      render: (v) => (
        <span className="tabular-nums">{nf.format(Number(v))}</span>
      ),
    },
    {
      key: "units",
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
    ...(isAgency
      ? [
          {
            key: "commission",
            label: "Hoa hồng",
            sortable: true,
            render: (v: unknown) => (
              <span className="whitespace-nowrap tabular-nums">
                {v ? formatVnd(Number(v)) : "—"}
              </span>
            ),
          } satisfies Column<RevenueRow>,
        ]
      : []),
  ];

  const statItems = data
    ? [
        { title: "Doanh thu", value: formatVnd(data.totals.revenue), icon: Banknote },
        { title: "Đơn hoàn tất", value: nf.format(data.totals.orders), icon: ShoppingBag },
        { title: "Sản phẩm đã bán", value: nf.format(data.totals.units), icon: Package },
        isAgency
          ? { title: "Hoa hồng phát sinh", value: formatVnd(data.totals.commission ?? 0), icon: HandCoins }
          : {
              title: `Số ${view.entity.toLowerCase()} có doanh thu`,
              value: data.rows.filter((r) => r.id !== "none").length,
              icon: Package,
            },
      ]
    : [];

  return (
    <div className="space-y-4 sm:space-y-5">
      <ReportFilters
        value={filters}
        onChange={setFilters}
        shopOptions={shopFilter.filter?.options}
        initialShopId={shopFilter.initialShopId}
      />

      {isLoading || !data ? (
        <LoadingBlock />
      ) : (
        <>
          {/* Mobile: 2×2 compact tiles — money values are too wide for one row */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            {statItems.map((it) => (
              <div key={it.title} className="rounded-xl border bg-card p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <it.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{it.title}</span>
                </div>
                <div className="mt-1 truncate text-base font-bold tabular-nums">{it.value}</div>
              </div>
            ))}
          </div>
          <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
            {statItems.map((it) => (
              <StatsCard key={it.title} title={it.title} value={it.value} icon={it.icon} />
            ))}
          </div>

          {data.rows.length === 0 ? (
            <Card>
              <EmptyBlock>
                Chưa có đơn hoàn tất trong khoảng thời gian này.
              </EmptyBlock>
            </Card>
          ) : (
            <>
              <ReportTrendChart report={data} />
              <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
                <TopSeriesChart report={data} entity={view.entity} />
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
                    <RevenueBars rows={data.rows} />
                  </CardContent>
                </Card>
              </div>
              <div className="min-w-0">
                <DataTable
                  data={data.rows}
                  columns={columns}
                  loading={isFetching}
                  searchPlaceholder={`Tìm ${view.entity.toLowerCase()}...`}
                  filterable={false}
                  enableMobileCard
                  renderMobileCard={(r) => <RevenueMobileCard row={r} showCommission={isAgency} />}
                  columnToggleable={!isMobile}
                  downloadable={!isMobile}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
