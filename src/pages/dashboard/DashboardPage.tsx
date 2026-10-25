import { useState } from "react";
import { Link } from "wouter";
import { Ban, Receipt, ShoppingCart, Wallet } from "lucide-react";
import {
  DataTable,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useAccess } from "@/features/auth";
import { type DashboardRange, useDashboardSummary } from "@/features/dashboard";
import { ORDER_STATUS } from "@/features/order";
import { orderColumns } from "@/features/order/components/order-columns";
import { formatCompactVnd, formatPercent, formatVnd } from "@/lib/format";
import { BarList } from "./components/BarList";
import { KpiCard } from "./components/KpiCard";
import { MobileKpis } from "./components/MobileKpis";
import { SnapshotStrip } from "./components/SnapshotStrip";
import { TopProducts } from "./components/TopProducts";
import { TrendChart } from "./components/TrendChart";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: 7, label: "7 ngày" },
  { value: 30, label: "30 ngày" },
  { value: 90, label: "90 ngày" },
];

export default function DashboardPage() {
  const [range, setRange] = useState<DashboardRange>(30);
  const { isRoot } = useAccess();
  const isMobile = useIsMobile();
  const { data, isLoading, isFetching } = useDashboardSummary(range);

  // Mobile: the range picker sits next to the page title as a compact select
  usePageActions(
    () =>
      isMobile && (
        <Select value={String(range)} onValueChange={(v) => setRange(Number(v) as DashboardRange)}>
          <SelectTrigger className="h-9 w-[7.5rem]" aria-label="Khoảng thời gian">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={String(r.value)}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    [isMobile, range],
  );

  if (isLoading || !data) return <LoadingBlock />;

  const rangeLabel = RANGES.find((r) => r.value === range)!.label;
  const totalOrders = data.ordersByStatus.reduce((s, x) => s + x.count, 0);

  return (
    <div className={isFetching ? "space-y-5 opacity-70 transition-opacity" : "space-y-5 transition-opacity"}>
      {/* Filters live in one row above everything they control */}
      {/* Mobile has the range select in the title row instead */}
      {!isMobile && (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Số liệu {rangeLabel} gần nhất · doanh thu tính trên đơn hoàn tất
        </p>
        <Tabs value={String(range)} onValueChange={(v) => setRange(Number(v) as DashboardRange)}>
          <TabsList>
            {RANGES.map((r) => (
              <TabsTrigger key={r.value} value={String(r.value)}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      )}

      <SnapshotStrip snapshot={data.snapshot} isRoot={isRoot} />

      {isMobile ? (
        <MobileKpis kpis={data.kpis} rangeLabel={rangeLabel} />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Doanh thu" metric={data.kpis.revenue} format={formatVnd} icon={Wallet} rangeLabel={rangeLabel} />
        <KpiCard label="Đơn hàng" metric={data.kpis.orders} format={String} icon={ShoppingCart} rangeLabel={rangeLabel} />
        <KpiCard
          label="Giá trị đơn trung bình"
          metric={data.kpis.avgOrderValue}
          format={formatCompactVnd}
          icon={Receipt}
          rangeLabel={rangeLabel}
        />
        <KpiCard
          label="Tỷ lệ huỷ"
          metric={data.kpis.cancelRate}
          format={(n) => formatPercent(n)}
          icon={Ban}
          inverse
          rangeLabel={rangeLabel}
        />
      </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TrendChart trend={data.trend} />
        </div>
        <BarList
          title="Đơn theo trạng thái"
          subtitle={`${totalOrders} đơn trong ${rangeLabel}`}
          items={data.ordersByStatus.map((s) => ({
            key: s.status,
            label: <StatusPill {...ORDER_STATUS[s.status]} />,
            value: s.count,
            display: `${s.count} · ${totalOrders ? formatPercent(s.count / totalOrders, 0) : "0%"}`,
          }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopProducts items={data.topProducts} />
        <BarList
          title="Doanh thu theo danh mục"
          subtitle="Đơn hoàn tất"
          items={data.categoryRevenue.map((c) => ({
            key: c.category,
            label: c.category,
            value: c.revenue,
            display: formatCompactVnd(c.revenue),
          }))}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Đơn hàng gần đây</h2>
          <Link href={ROUTES.orders} className="text-sm font-medium text-primary hover:underline">
            Xem tất cả
          </Link>
        </div>
        {isMobile ? (
          // A short list, no table chrome / pager on a phone
          <div className="space-y-2">
            {data.recentOrders.slice(0, 4).map((o) => (
            <Link key={o.id} href={ROUTES.orderDetail(o.id)} className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2.5 shadow-xs">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{o.code}</span>
                  <StatusPill {...ORDER_STATUS[o.status]} />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {o.recipientName} · {new Date(o.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums">{formatCompactVnd(o.total)}</span>
            </Link>
            ))}
          </div>
        ) : (
          <DataTable
            columns={orderColumns.filter((c) => c.key !== "address")}
            data={data.recentOrders}
            pageSize={6}
            searchable={false}
            columnToggleable={false}
            downloadable={false}
            enableMobileCard
          />
        )}
      </section>
    </div>
  );
}
