import type { ElementType } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { Metric } from "@/features/dashboard";
import { formatPercent } from "@/lib/format";

interface Props {
  label: string;
  metric: Metric;
  format: (n: number) => string;
  icon: ElementType;
  /** For metrics where going up is bad (e.g. cancel rate) */
  inverse?: boolean;
  rangeLabel: string;
}

export function KpiCard({ label, metric, format, icon: Icon, inverse, rangeLabel }: Props) {
  const { value, previous } = metric;
  const change = previous ? (value - previous) / previous : null;
  const flat = change === null || Math.abs(change) < 0.005;
  const good = !flat && (change! > 0) !== !!inverse;
  const Arrow = flat ? Minus : change! > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-[28px]">{format(value)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold tabular-nums",
              flat ? "bg-muted text-muted-foreground" : good ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
            )}
          >
            <Arrow className="h-3.5 w-3.5" aria-hidden />
            {change === null ? "—" : formatPercent(Math.abs(change))}
            <span className="sr-only">{flat ? "không đổi" : change! > 0 ? "tăng" : "giảm"}</span>
          </span>
          <span className="text-muted-foreground">
            so với {rangeLabel} trước ({format(previous)})
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
