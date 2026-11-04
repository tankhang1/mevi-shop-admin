import { Fragment } from "react";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ORDER_FLOW, ORDER_STATUS, type OrderDetail, type OrderStatus } from "@/features/order";
import { formatDate } from "@/lib/format";

export function OrderTimeline({ order }: { order: OrderDetail }) {
  const history = order.statusHistory ?? [];
  const isCancelled = order.status === "CANCELLED" || order.status === "cancelled";

  // Tổng hợp các bước đã đạt
  const reached = new Set<string>();
  if (order.createdAt) reached.add("PENDING");
  if (order.confirmedAt) reached.add("CONFIRMED");
  if (order.shippingAt) reached.add("SHIPPING");
  if (order.deliveredAt) {
    reached.add("DELIVERED");
    reached.add("completed");
  }
  if (order.cancelledAt || isCancelled) {
    reached.add("CANCELLED");
    reached.add("cancelled");
  }

  // Bổ sung từ history
  history.forEach((e) => reached.add(e.status));

  // Tùy theo trạng thái hiện tại
  if (order.status === "CONFIRMED") reached.add("CONFIRMED");
  if (order.status === "SHIPPING") {
    reached.add("CONFIRMED");
    reached.add("SHIPPING");
  }
  if (order.status === "DELIVERED" || order.status === "completed") {
    reached.add("CONFIRMED");
    reached.add("SHIPPING");
    reached.add("DELIVERED");
  }

  const steps: OrderStatus[] = isCancelled
    ? [...ORDER_FLOW.filter((s) => reached.has(s)), "CANCELLED"]
    : ORDER_FLOW;

  // Bước hiện tại đang chờ
  const current = steps.find((s) => !reached.has(s));

  const getTimeForStep = (s: OrderStatus) => {
    const ev = history.find((e) => e.status === s);
    if (ev) return { at: ev.at, by: ev.by, note: ev.note };
    if (s === "PENDING" && order.createdAt) return { at: order.createdAt, by: "Khách hàng" };
    if (s === "CONFIRMED" && order.confirmedAt) return { at: order.confirmedAt, by: "Hệ thống" };
    if (s === "SHIPPING" && order.shippingAt) return { at: order.shippingAt, by: "Nhân viên điều phối" };
    if ((s === "DELIVERED" || s === "completed") && order.deliveredAt) return { at: order.deliveredAt, by: "Vận chuyển" };
    if ((s === "CANCELLED" || s === "cancelled") && order.cancelledAt) {
      return {
        at: order.cancelledAt,
        by: order.cancelledBy?.fullName ?? "Người bán",
        note: order.cancelReason ?? undefined,
      };
    }
    return null;
  };

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
      {steps.map((s, i) => {
        const info = getTimeForStep(s);
        const done = reached.has(s);
        const isCancel = s === "CANCELLED" || s === "cancelled";
        const isCurrent = s === current;
        const nextDone = i < steps.length - 1 && reached.has(steps[i + 1]);

        return (
          <Fragment key={s}>
            <li className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
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
                  {ORDER_STATUS[s]?.label ?? s}
                </div>
                {info ? (
                  <div className="truncate text-xs text-muted-foreground">
                    {formatDate(info.at)} · {info.by}
                  </div>
                ) : (
                  isCurrent && <div className="text-xs font-medium text-amber-600">Đang chờ</div>
                )}
                {info?.note && <div className="mt-0.5 text-xs text-destructive">{info.note}</div>}
              </div>
            </li>
            {i < steps.length - 1 && (
              <li
                aria-hidden
                className={cn(
                  "ml-[17px] h-4 w-0.5 rounded-full sm:mx-5 sm:ml-5 sm:h-0.5 sm:w-auto sm:min-w-8 sm:flex-1",
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
