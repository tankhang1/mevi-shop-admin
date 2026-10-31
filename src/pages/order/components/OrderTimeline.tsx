import { Fragment } from "react";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ORDER_FLOW, ORDER_STATUS, type OrderDetail } from "@/features/order";
import { formatDate } from "@/lib/format";

/**
 * Steps of the normal flow in one row (stacked on mobile): icon with label + when/who beside it,
 * a connector filling the gap, and "Đang chờ" on the step the order is heading to.
 */
export function OrderTimeline({ order }: { order: OrderDetail }) {
  const history = order.statusHistory ?? [];
  const cancelled = history.find((e) => e.status === "cancelled");
  const reached = new Set(history.map((e) => e.status));
  const steps = cancelled
    ? [...ORDER_FLOW.filter((s) => reached.has(s)), "cancelled" as const]
    : ORDER_FLOW;
  // First step not reached yet — the one being worked on
  const current = steps.find((s) => !reached.has(s));

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
      {steps.map((s, i) => {
        const event = history.find((e) => e.status === s);
        const done = !!event;
        const isCancel = s === "cancelled";
        const isCurrent = s === current;
        const nextDone = i < steps.length - 1 && reached.has(steps[i + 1]);
        return (
          <Fragment key={s}>
            <li className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  isCancel
                    ? "bg-destructive text-white"
                    : done
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-amber-50 text-amber-600 ring-2 ring-amber-200"
                        : "bg-muted text-muted-foreground",
                )}
              >
                {isCancel ? (
                  <X className="h-4 w-4" />
                ) : done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0">
                <div className={cn("text-sm font-semibold", !done && !isCurrent && "text-muted-foreground")}>
                  {ORDER_STATUS[s].label}
                </div>
                {event ? (
                  <div className="truncate text-xs text-muted-foreground">
                    {formatDate(event.at)} · {event.by}
                  </div>
                ) : (
                  isCurrent && <div className="text-xs font-medium text-amber-600">Đang chờ</div>
                )}
                {event?.note && <div className="mt-0.5 text-xs text-destructive">{event.note}</div>}
              </div>
            </li>
            {i < steps.length - 1 && (
              <li
                aria-hidden
                className={cn(
                  // Vertical stub under the icon on mobile, a flexible line between steps on desktop
                  "ml-[17px] h-4 w-0.5 rounded-full sm:mx-5 sm:ml-5 sm:h-0.5 sm:w-auto sm:min-w-8 sm:flex-1",
                  // Done → solid; still ahead → dashed
                  nextDone
                    ? "bg-primary"
                    : "bg-border sm:bg-transparent sm:bg-[repeating-linear-gradient(90deg,var(--color-border)_0_6px,transparent_6px_12px)]",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
