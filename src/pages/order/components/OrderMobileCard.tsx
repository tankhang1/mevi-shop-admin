import { Check, MapPin, Network, Package, Phone, Truck, X } from "lucide-react";
import { type MobileCardHelpers, cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import { ORDER_STATUS, type Order, isFinalOrderStatus } from "@/features/order";
import { formatDate, formatVnd } from "@/lib/format";

interface Props {
  order: Order;
  helpers: MobileCardHelpers<Order>;
  onDeliver: (o: Order) => void;
  onCancel: (o: Order) => void;
}

/** Mobile order card: who/where/how much at a glance, quick actions for open orders */
export function OrderMobileCard({ order: o, helpers, onDeliver, onCancel }: Props) {
  const open = !isFinalOrderStatus(o.status);
  const units = (o.items ?? []).reduce((s, it) => s + it.quantity, 0);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm",
        open && "border-l-4 border-l-sky-500",
      )}
    >
      <button type="button" onClick={helpers.onView} className="block w-full space-y-2 p-3.5 text-left active:bg-muted/50">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold">{o.code}</span>
          <StatusPill {...ORDER_STATUS[o.status]} />
          <span className="ml-auto text-[11px] text-muted-foreground">{formatDate(o.createdAt)}</span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <p className="truncate font-semibold">{o.recipientName}</p>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> {o.address}
            </p>
            {o.trackingCode && (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Truck className="h-3 w-3 shrink-0" />
                <span className="font-mono text-foreground">{o.trackingCode}</span>
                {o.carrier && ` · ${o.carrier}`}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-base font-bold tabular-nums text-primary">{formatVnd(o.total)}</p>
            {units > 0 && (
              <p className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                <Package className="h-3 w-3" /> {units} sản phẩm
              </p>
            )}
          </div>
        </div>

        {o.teamName && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Network className="h-3 w-3" /> {o.teamName}
            {o.assigneeName && ` · ${o.assigneeName}`}
          </p>
        )}
      </button>

      <div className="flex items-center gap-2 border-t bg-muted/30 px-3 py-2">
        <a
          href={`tel:${o.recipientPhone}`}
          className="flex items-center gap-1.5 text-xs font-medium text-primary"
        >
          <Phone className="h-3.5 w-3.5" /> {o.recipientPhone}
        </a>
        {open && (
          <div className="ml-auto flex gap-1.5">
            <button
              type="button"
              onClick={() => onCancel(o)}
              className="flex h-8 items-center gap-1 rounded-full border bg-background px-3 text-xs font-medium text-destructive"
            >
              <X className="h-3.5 w-3.5" /> Huỷ
            </button>
            <button
              type="button"
              onClick={() => onDeliver(o)}
              className="flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground"
            >
              <Check className="h-3.5 w-3.5" /> Đã giao
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
