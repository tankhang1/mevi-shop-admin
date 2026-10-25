import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ORDER_STATUS, ORDER_STATUSES } from "@/features/order";

/** Mobile status filter — one tap instead of opening the filter menu */
export function OrderStatusChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const chips = [{ value: "all", label: "Tất cả" }, ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS[s].label }))];
  return (
    <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
      {chips.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onChange(c.value)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === c.value ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-background",
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
