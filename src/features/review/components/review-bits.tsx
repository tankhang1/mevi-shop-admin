import { Star } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { ReviewStats } from "../types";

export function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn(cls, n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
      ))}
    </span>
  );
}

/** Average + 5→1 star bars, as on the storefront product page */
export function RatingSummary({ stats }: { stats: ReviewStats }) {
  const max = Math.max(1, ...stats.distribution);
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="shrink-0 text-center sm:w-32">
        <p className="text-4xl font-bold tabular-nums">{stats.total ? stats.average.toFixed(1) : "—"}</p>
        <Stars value={stats.average} size="md" />
        <p className="mt-1 text-xs text-muted-foreground">{stats.total} đánh giá</p>
      </div>
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star - 1];
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-8 shrink-0 text-muted-foreground tabular-nums">{star} ★</span>
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-amber-400" style={{ width: `${(count / max) * 100}%` }} />
              </div>
              <span className="w-8 shrink-0 text-right tabular-nums">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
