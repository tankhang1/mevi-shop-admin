import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { ProductStatus } from "@/features/shop-catalog";

type Filter = "all" | ProductStatus;

export interface ProductStatusCounts {
  total: number;
  active: number;
  inactive: number;
}

const CHIPS: { value: Filter; label: string; count: (s: ProductStatusCounts) => number }[] = [
  { value: "all", label: "Tất cả", count: (s) => s.total },
  { value: "ACTIVE", label: "Đang kinh doanh", count: (s) => s.active },
  { value: "INACTIVE", label: "Tạm ngưng", count: (s) => s.inactive },
];

interface Props {
  stats?: ProductStatusCounts;
  status: Filter;
  onStatusChange: (status: Filter) => void;
}

/** Mobile header: business-status chips that filter the list */
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
                {stats ? c.count(stats) : "–"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
