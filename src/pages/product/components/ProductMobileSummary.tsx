import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { ProductListParams, ProductStats } from "@/features/product";

type Filter = NonNullable<ProductListParams["listed"]>;

const CHIPS: { value: Filter; label: string; count: (s: ProductStats) => number }[] = [
  { value: "all", label: "Tất cả", count: (s) => s.total },
  { value: "true", label: "Đang kinh doanh", count: (s) => s.listed },
  { value: "false", label: "Tạm ngưng", count: (s) => s.total - s.listed },
];

interface Props {
  stats?: ProductStats;
  listed: Filter;
  onListedChange: (listed: Filter) => void;
}

/** Mobile header: business-status chips that filter the list */
export function ProductMobileSummary({ stats, listed, onListedChange }: Props) {

  return (
    <div className="space-y-2.5">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
        {CHIPS.map((c) => {
          const active = listed === c.value;
          return (
            <button
              key={c.value}
              type="button"
              onClick={() => onListedChange(c.value)}
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
