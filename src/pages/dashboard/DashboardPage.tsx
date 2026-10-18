import { useState } from "react";
import { Link } from "wouter";
import { Ban, Receipt, ShoppingCart, Wallet } from "lucide-react";
import { DataTable, Tabs, TabsList, TabsTrigger } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { type DashboardRange, useDashboardSummary } from "@/features/dashboard";
import { ORDER_STATUS } from "@/features/order";
import { orderColumns } from "@/features/order/components/order-columns";
import { formatCompactVnd, formatPercent, formatVnd } from "@/lib/format";
import { BarList } from "./components/BarList";
import { KpiCard } from "./components/KpiCard";
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
  const { data, isLoading, isFetching } = useDashboardSummary(range);
  if (isLoading || !data) return <LoadingBlock />;

  const rangeLabel = RANGES.find((r) => r.value === range)!.label;
  const totalOrders = data.ordersByStatus.reduce((s, x) => s + x.count, 0);

  return (
    <div className={isFetching ? "space-y-5 opacity-70 transition-opacity" : "space-y-5 transition-opacity"}>
      {/* Filters live in one row above everything they control */}
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

      <SnapshotStrip snapshot={data.snapshot} />

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
        <DataTable
          columns={orderColumns.filter((c) => c.key !== "address")}
          data={data.recentOrders}
          pageSize={6}
          searchable={false}
          columnToggleable={false}
          downloadable={false}
          enableMobileCard
        />
      </section>
    </div>
  );
}
