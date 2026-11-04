import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ORDER_STATUS, ORDER_STATUSES, type OrderStatusCounts } from "@/features/order";

/** Thanh lọc trạng thái kèm số lượng đếm realtime (hỗ trợ cả desktop và mobile) */
export function OrderStatusChips({
  value,
  onChange,
  counts,
}: {
  value: string;
  onChange: (v: string) => void;
  counts?: OrderStatusCounts;
}) {
  const getCount = (val: string) => {
    if (!counts) return undefined;
    if (val === "all") return counts.total;
    if (val === "PENDING") return counts.pending;
    if (val === "CONFIRMED") return counts.confirmed;
    if (val === "SHIPPING") return counts.shipping;
    if (val === "DELIVERED") return counts.delivered;
    if (val === "CANCELLED") return counts.cancelled;
    return undefined;
  };

  const chips = [
    { value: "all", label: "Tất cả" },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS[s].label })),
  ];

  return (
    <div className="-mx-1 mb-3.5 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
      {chips.map((c) => {
        const count = getCount(c.value);
        const isActive = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-xs font-semibold"
                : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <span>{c.label}</span>
            {count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
