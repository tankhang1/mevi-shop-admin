import { Check, MapPin, Network, Package, Truck, X } from "lucide-react";
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

/** Mobile order card: hiển thị gọn gàng, thao tác nhanh */
export function OrderMobileCard({ order: o, helpers, onDeliver, onCancel }: Props) {
  const open = !isFinalOrderStatus(o.status);
  const units = (o.items ?? []).reduce((s, it) => s + it.quantity, 0);

  const customerName =
    o.customer?.fullName ?? o.customerName ?? o.recipient?.name ?? o.recipientName ?? "—";
  const customerCode = o.customer?.code ?? o.customerCode;
  const recipientName = o.recipient?.name ?? o.recipientName;
  const address =
    o.recipient?.addressLine ||
    (o.recipient?.district && o.recipient?.province
      ? `${o.recipient.district}, ${o.recipient.province}`
      : o.address || "—");
  const dispatchName = o.dispatchGroup?.name ?? o.teamName;
  const assigneeName = o.assignee?.fullName ?? o.assigneeName;

  const statusCfg = ORDER_STATUS[o.status] ?? {
    label: String(o.status),
    className: "bg-muted",
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-xs",
        open && "border-l-4 border-l-sky-500",
      )}
    >
      <button
        type="button"
        onClick={helpers.onView}
        className="block w-full space-y-2 p-3.5 text-left active:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold">{o.code}</span>
          <StatusPill label={statusCfg.label} className={statusCfg.className} />
          <span className="ml-auto text-[11px] text-muted-foreground">
            {formatDate(o.createdAt)}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <p className="truncate font-semibold text-sm">
              {customerName}
              {customerCode && (
                <span className="ml-1 font-mono text-[11px] font-normal text-muted-foreground">
                  {customerCode}
                </span>
              )}
            </p>
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {recipientName && recipientName !== customerName && `${recipientName} · `}
              {address}
            </p>
            {o.trackingCode && (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Truck className="h-3 w-3 shrink-0" />
                <span className="font-mono text-foreground font-medium">{o.trackingCode}</span>
                {o.shippingCarrier && ` · ${o.shippingCarrier}`}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-base font-bold tabular-nums text-primary">
              {formatVnd(o.total)}
            </p>
            {units > 0 && (
              <p className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
                <Package className="h-3 w-3" /> {units} sản phẩm
              </p>
            )}
          </div>
        </div>

        {dispatchName && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Network className="h-3 w-3" /> {dispatchName}
            {assigneeName && ` · ${assigneeName}`}
          </p>
        )}
      </button>

      {open && (
        <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-3 py-2">
          <button
            type="button"
            onClick={() => onCancel(o)}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
          >
            <X className="h-3.5 w-3.5" /> Huỷ đơn
          </button>
          <button
            type="button"
            onClick={() => onDeliver(o)}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
          >
            <Check className="h-3.5 w-3.5" /> Đã giao
          </button>
        </div>
      )}
    </div>
  );
}
