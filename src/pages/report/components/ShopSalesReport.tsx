import { useState } from "react";
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
  Tabs,
  TabsList,
  TabsTrigger,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { type RevenueRow, useRevenueReport } from "@/features/report";
import { formatVnd } from "@/lib/format";
import { ReportTrendChart } from "./ReportTrendChart";
import { RevenueBars } from "./RevenueBars";
import { RevenueMobileCard } from "./RevenueMobileCard";
import { TopSeriesChart } from "./TopSeriesChart";
import { PRESETS, isoDay, rangeFor } from "./report-filters";

const nf = new Intl.NumberFormat("vi-VN");
/** Far enough back to cover every order — "all time" for the total tile */
const ALL_TIME_FROM = "2000-01-01";

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
  { key: "orders", label: "Số đơn", sortable: true, render: (v) => <span className="tabular-nums">{nf.format(Number(v))}</span> },
  { key: "units", label: "Số lượng bán", sortable: true, render: (v) => <span className="tabular-nums">{nf.format(Number(v))}</span> },
  {
    key: "revenue",
    label: "Doanh thu",
    sortable: true,
    mobilePriority: "secondary",
    render: (v) => <span className="whitespace-nowrap font-semibold tabular-nums">{formatVnd(Number(v))}</span>,
  },
  {
    key: "share",
    label: "Tỉ trọng",
    sortable: true,
    mobilePriority: "badge",
    render: (v) => <span className="tabular-nums text-muted-foreground">{String(v)}%</span>,
  },
];

/**
 * One seller's sales: all-time + this-month revenue, revenue over time, best sellers and
 * per-product trend. Shop admins get their own shop (backend scopes by token); root passes
 * `agencyId` to see one đại lý / CTV's referred sales.
 */
export function ShopSalesReport({ agencyId }: { agencyId?: string } = {}) {
  const isMobile = useIsMobile();
  const [preset, setPreset] = useState("30");
  const [, navigate] = useLocation();
  const range = rangeFor(Number(preset));
  // Order list pre-filtered to the completed orders behind this product's figure
  const openOrders = (r: RevenueRow) => {
    const q = new URLSearchParams({ productId: r.id, status: "completed", ...range });
    if (agencyId) q.set("agencyId", agencyId);
    navigate(`${ROUTES.orders}?${q}`);
  };
  const today = isoDay(new Date());
  const now = new Date();
  const monthFrom = isoDay(new Date(now.getFullYear(), now.getMonth(), 1));

  const { data: allTime } = useRevenueReport({ groupBy: "product", agencyId, from: ALL_TIME_FROM, to: today });
  const { data: month } = useRevenueReport({ groupBy: "product", agencyId, from: monthFrom, to: today });
  const { data, isLoading, isFetching } = useRevenueReport({ groupBy: "product", agencyId, ...range });

  const stats = [
    { title: "Tổng doanh thu", value: allTime ? formatVnd(allTime.totals.revenue) : "—", note: allTime ? `${nf.format(allTime.totals.orders)} đơn hoàn tất` : "", icon: Banknote },
    { title: `Doanh thu tháng ${now.getMonth() + 1}`, value: month ? formatVnd(month.totals.revenue) : "—", note: "Từ đầu tháng đến nay", icon: CalendarDays },
    { title: "Đơn tháng này", value: month ? nf.format(month.totals.orders) : "—", note: "Đơn hoàn tất", icon: ShoppingBag },
    { title: "Sản phẩm bán tháng này", value: month ? nf.format(month.totals.units) : "—", note: "Tổng số lượng", icon: Package },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.title} className="rounded-xl border bg-card p-3 sm:p-5">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-sm">
              <s.icon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
              <span className="truncate">{s.title}</span>
            </div>
            <div className="mt-1 truncate text-base font-bold tabular-nums sm:text-2xl">{s.value}</div>
            <div className="truncate text-[11px] text-muted-foreground sm:text-xs">{s.note}</div>
          </div>
        ))}
      </div>

      <Tabs value={preset} onValueChange={setPreset}>
        <TabsList className="grid w-full grid-cols-4 md:inline-flex! md:w-auto!">
          {PRESETS.filter((p) => p.value !== "custom").map((p) => (
            <TabsTrigger key={p.value} value={p.value} className="px-1 text-xs md:px-3 md:text-sm">
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading || !data ? (
        <LoadingBlock />
      ) : data.rows.length === 0 ? (
        <Card>
          <EmptyBlock>Chưa có đơn hoàn tất trong khoảng thời gian này.</EmptyBlock>
        </Card>
      ) : (
        <>
          <ReportTrendChart report={data} />
          <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top sản phẩm bán chạy</CardTitle>
              </CardHeader>
              <CardContent className={isFetching ? "opacity-60" : undefined}>
                <RevenueBars rows={data.rows} />
              </CardContent>
            </Card>
            <TopSeriesChart report={data} entity="Sản phẩm" />
          </div>
          <div className="min-w-0">
            <DataTable
              data={data.rows}
              columns={columns}
              loading={isFetching}
              searchPlaceholder="Tìm sản phẩm..."
              filterable={false}
              enableMobileCard
              onRowClick={openOrders}
              renderMobileCard={(r) => <RevenueMobileCard row={r} showCommission={false} onClick={() => openOrders(r)} />}
              columnToggleable={!isMobile}
              downloadable={!isMobile}
            />
          </div>
        </>
      )}
    </div>
  );
}
