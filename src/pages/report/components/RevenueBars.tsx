import type { RevenueRow } from "@/features/report";
import { formatVnd } from "@/lib/format";

const compact = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Top-N ranked bars — labels stay readable, unlike a pie with many slices */
export function RevenueBars({
  rows,
  limit = 10,
}: {
  rows: RevenueRow[];
  limit?: number;
}) {
  const top = rows.slice(0, limit);
  const max = Math.max(1, ...top.map((r) => r.revenue));
  return (
    <ol className="space-y-2.5">
      {top.map((r, i) => (
        <li
          key={r.id}
          className="grid grid-cols-[1.25rem_minmax(0,11rem)_minmax(0,1fr)_auto] items-center gap-3 text-sm"
        >
          <span className="text-right text-xs tabular-nums text-muted-foreground">
            {i + 1}
          </span>
          <span className="truncate" title={r.label}>
            {r.label}
          </span>
          <span className="h-2.5 overflow-hidden rounded-full bg-muted">
            <span
              className={
                r.id === "none"
                  ? "block h-full rounded-full bg-muted-foreground/40"
                  : "block h-full rounded-full bg-primary"
              }
              style={{ width: `${(r.revenue / max) * 100}%` }}
            />
          </span>
          <span
            className="w-24 text-right tabular-nums"
            title={formatVnd(r.revenue)}
          >
            <span className="font-medium">{compact.format(r.revenue)}</span>
            <span className="ml-1 text-xs text-muted-foreground">
              {r.share}%
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
