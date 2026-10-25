import { Check, X } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ORDER_FLOW, ORDER_STATUS, type OrderDetail } from "@/features/order";
import { formatDate } from "@/lib/format";

/** Horizontal stepper of the normal flow, with when/who for every step reached */
export function OrderTimeline({ order }: { order: OrderDetail }) {
  const history = order.statusHistory ?? [];
  const cancelled = history.find((e) => e.status === "cancelled");
  const reached = new Set(history.map((e) => e.status));
  const steps = cancelled
    ? [...ORDER_FLOW.filter((s) => reached.has(s)), "cancelled" as const]
    : ORDER_FLOW;

  return (
    <ol className="grid gap-4 sm:flex sm:gap-0">
      {steps.map((s, i) => {
        const event = history.find((e) => e.status === s);
        const done = !!event;
        const isCancel = s === "cancelled";
        return (
          <li
            key={s}
            className="relative flex gap-3 sm:flex-1 sm:flex-col sm:items-center sm:text-center"
          >
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute hidden h-0.5 sm:left-1/2 sm:top-4 sm:block sm:w-full",
                  history.some((e) => e.status === steps[i + 1])
                    ? "bg-primary"
                    : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background text-xs font-semibold",
                isCancel
                  ? "border-destructive bg-destructive text-white"
                  : done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "text-muted-foreground",
              )}
            >
              {isCancel ? (
                <X className="h-4 w-4" />
              ) : done ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </span>
            <div className="min-w-0 sm:mt-2 sm:px-1">
              <div
                className={cn(
                  "text-sm font-medium",
                  !done && "text-muted-foreground",
                )}
              >
                {ORDER_STATUS[s].label}
              </div>
              {event && (
                <>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(event.at)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.by}
                  </div>
                  {event.note && (
                    <div className="mt-0.5 text-xs text-destructive">
                      {event.note}
                    </div>
                  )}
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
