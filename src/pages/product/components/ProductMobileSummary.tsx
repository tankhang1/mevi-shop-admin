import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { ProductStats, ProductStatus } from "@/features/product";

type Filter = "all" | ProductStatus;

const CHIPS: { value: Filter; label: string; count: keyof ProductStats }[] = [
  { value: "all", label: "Tất cả", count: "total" },
  { value: "approved", label: "Đã duyệt", count: "approved" },
  { value: "pending", label: "Chờ duyệt", count: "pending" },
  { value: "rejected", label: "Từ chối", count: "rejected" },
];

interface Props {
  stats?: ProductStats;
  status: Filter;
  onStatusChange: (status: Filter) => void;
}

/** Mobile header: status chips that filter the list, plus a one-line shelf summary */
export function ProductMobileSummary({ stats, status, onStatusChange }: Props) {

  return (
    <div className="space-y-2.5">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
        {CHIPS.map((c) => {
          const active = status === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onStatusChange(c.value)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-background text-foreground",
              )}
            >
              {c.label}
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums",
                  active ? "bg-white/25" : "bg-muted text-muted-foreground",
                )}
              >
                {stats?.[c.count] ?? "–"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
