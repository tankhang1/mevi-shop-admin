import { MessageSquareWarning, Star } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { Stars } from "@/features/review/components/review-bits";
import type { ReviewStats } from "@/features/review";
import { formatPercent } from "@/lib/format";

interface Props {
  stats?: ReviewStats;
  replied: string;
  rating: string;
  onReplied: (v: string) => void;
  onRating: (v: string) => void;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-background",
      )}
    >
      {children}
    </button>
  );
}

/** Mobile: one compact summary card + chip filters instead of two big cards and stacked selects */
export function ReviewMobileHeader({ stats, replied, rating, onReplied, onRating }: Props) {
  const max = Math.max(1, ...(stats?.distribution ?? [0]));
  const unreplied = stats?.unreplied ?? 0;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="shrink-0 text-center">
            <p className="text-4xl font-bold leading-none tabular-nums">{stats?.total ? stats.average.toFixed(1) : "—"}</p>
            <div className="mt-1.5">
              <Stars value={stats?.average ?? 0} />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{stats?.total ?? 0} đánh giá</p>
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats?.distribution[star - 1] ?? 0;
              return (
                <div key={star} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-3 text-right tabular-nums text-muted-foreground">{star}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="w-4 text-right tabular-nums text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {stats && stats.total > 0 && (
          <button
            type="button"
            onClick={() => onReplied(replied === "no" ? "all" : "no")}
            disabled={!unreplied}
            className={cn(
              "mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm",
              unreplied ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800",
            )}
          >
            <MessageSquareWarning className="h-4 w-4 shrink-0" />
            <span className="flex-1">
              {unreplied ? (
                <>
                  <b>{unreplied}</b> đánh giá chưa trả lời
                </>
              ) : (
                "Đã trả lời tất cả đánh giá"
              )}
            </span>
            <span className="text-xs opacity-75">Phản hồi {formatPercent(1 - unreplied / stats.total, 0)}</span>
          </button>
        )}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
        <Chip active={replied === "all"} onClick={() => onReplied("all")}>
          Tất cả
        </Chip>
        <Chip active={replied === "no"} onClick={() => onReplied("no")}>
          Chưa trả lời
          {!!unreplied && (
            <span className={cn("rounded-full px-1.5 text-xs", replied === "no" ? "bg-white/25" : "bg-amber-100 text-amber-800")}>
              {unreplied}
            </span>
          )}
        </Chip>
        <Chip active={replied === "yes"} onClick={() => onReplied("yes")}>
          Đã trả lời
        </Chip>
        <span className="w-px shrink-0 bg-border" />
        {["5", "4", "3", "2", "1"].map((s) => (
          <Chip key={s} active={rating === s} onClick={() => onRating(rating === s ? "all" : s)}>
            {s}
            <Star className={cn("h-3.5 w-3.5", rating === s ? "fill-white" : "fill-amber-400 text-amber-400")} />
          </Chip>
        ))}
      </div>
    </div>
  );
}
