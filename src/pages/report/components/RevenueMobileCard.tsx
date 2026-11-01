import { ChevronRight } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import { AGENCY_KIND } from "@/features/agency";
import type { RevenueRow } from "@/features/report";
import { formatVnd } from "@/lib/format";

const nf = new Intl.NumberFormat("vi-VN");

/** Revenue headline + share bar; counts and commission folded into one line */
export function RevenueMobileCard({
  row: r,
  showCommission,
  onClick,
}: {
  row: RevenueRow;
  showCommission: boolean;
  /** Agency report: open that đại lý / CTV's own report */
  onClick?: () => void;
}) {
  return (
    <div
      className={cn("rounded-2xl border bg-card p-3 shadow-sm", onClick && "cursor-pointer active:bg-muted/50")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className={cn("truncate text-sm font-semibold", r.id === "none" && "text-muted-foreground")}>
              {r.label}
            </h3>
            {r.kind && <StatusPill {...AGENCY_KIND[r.kind]} className={cn("shrink-0", AGENCY_KIND[r.kind].className)} />}
          </div>
          {r.sub && <p className="truncate text-xs text-muted-foreground">{r.sub}</p>}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold tabular-nums">{formatVnd(r.revenue)}</div>
          <div className="flex items-center justify-end gap-0.5 text-[11px] tabular-nums text-muted-foreground">
            {r.share}%{onClick && <ChevronRight className="h-3.5 w-3.5" />}
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(r.share, 100)}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {nf.format(r.orders)} đơn · {nf.format(r.units)} sp
        {showCommission && (
          <>
            {" · "}Hoa hồng{" "}
            <span className="font-medium text-foreground tabular-nums">
              {r.commission ? formatVnd(r.commission) : "—"}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
