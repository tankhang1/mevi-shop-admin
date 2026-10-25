import type { ElementType } from "react";
import { ArrowDownRight, ArrowUpRight, Ban, Minus, Receipt, ShoppingCart, Wallet } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { DashboardSummary, Metric } from "@/features/dashboard";
import { formatCompactVnd, formatPercent, formatVnd } from "@/lib/format";

/** Change vs previous period; `inverse` for metrics where up is bad (cancel rate) */
function delta(metric: Metric, inverse = false) {
  const change = metric.previous ? (metric.value - metric.previous) / metric.previous : null;
  const flat = change === null || Math.abs(change) < 0.005;
  const good = !flat && change! > 0 !== inverse;
  return { change, flat, good, Arrow: flat ? Minus : change! > 0 ? ArrowUpRight : ArrowDownRight };
}

function Tile({ label, value, metric, icon: Icon, inverse }: { label: string; value: string; metric: Metric; icon: ElementType; inverse?: boolean }) {
  const d = delta(metric, inverse);
  return (
    <div className="rounded-2xl border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 text-lg font-bold leading-none tabular-nums">{value}</p>
      <span
        className={cn(
          "mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums",
          d.flat ? "text-muted-foreground" : d.good ? "text-emerald-700" : "text-red-600",
        )}
      >
        <d.Arrow className="h-3 w-3" />
        {d.change === null ? "—" : formatPercent(Math.abs(d.change), 0)}
      </span>
    </div>
  );
}

/** Mobile: revenue as a highlight card, the other three KPIs as a compact row */
export function MobileKpis({ kpis, rangeLabel }: { kpis: DashboardSummary["kpis"]; rangeLabel: string }) {
  const rev = delta(kpis.revenue);
  return (
    <div className="space-y-2.5">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-700 via-emerald-600 to-emerald-500 p-4 text-white shadow-md">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-1.5 text-xs font-medium text-white/85">
          <Wallet className="h-3.5 w-3.5" /> Doanh thu {rangeLabel}
        </div>
        <p className="relative mt-1 text-3xl font-bold tabular-nums">{formatVnd(kpis.revenue.value)}</p>
        <p className="relative mt-1 flex items-center gap-1.5 text-xs text-white/85">
          <span className="inline-flex items-center gap-0.5 rounded-md bg-white/20 px-1.5 py-0.5 font-semibold text-white">
            <rev.Arrow className="h-3.5 w-3.5" />
            {rev.change === null ? "—" : formatPercent(Math.abs(rev.change))}
          </span>
          so với kỳ trước ({formatCompactVnd(kpis.revenue.previous)})
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Tile label="Đơn hàng" value={String(kpis.orders.value)} metric={kpis.orders} icon={ShoppingCart} />
        <Tile label="TB / đơn" value={formatCompactVnd(kpis.avgOrderValue.value)} metric={kpis.avgOrderValue} icon={Receipt} />
        <Tile label="Tỷ lệ huỷ" value={formatPercent(kpis.cancelRate.value, 0)} metric={kpis.cancelRate} icon={Ban} inverse />
      </div>
    </div>
  );
}
