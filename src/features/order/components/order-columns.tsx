import type { Column, TableFilterDef } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import { ORDER_STATUS, ORDER_STATUSES } from "../constants";
import type { Order, OrderStatus } from "../types";
import { formatDate, formatVnd } from "@/lib/format";

/** Read-only order columns — shared by the order list and the dashboard */
export const orderColumns: Column<Order>[] = [
  {
    key: "code",
    label: "Mã đơn",
    mobilePriority: "primary",
    render: (_, o) => (
      <div>
        <div className="font-medium font-mono">{o.code}</div>
        <div className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</div>
      </div>
    ),
  },
  {
    key: "customerName",
    label: "Khách hàng",
    mobilePriority: "secondary",
    render: (_, o) => {
      const name = o.customer?.fullName ?? o.customerName ?? o.recipient?.name ?? o.recipientName ?? "—";
      const code = o.customer?.code ?? o.customerCode;
      const phone = o.customer?.phoneNumber ?? o.customerPhone ?? o.recipient?.phone ?? o.recipientPhone;
      return (
        <div className="whitespace-nowrap">
          <div>{name}</div>
          <div className="text-xs text-muted-foreground">
            {code && <span className="font-mono">{code} · </span>}
            {phone}
          </div>
        </div>
      );
    },
  },
  {
    key: "address",
    label: "Giao đến",
    render: (_, o) => {
      const recipientName = o.recipient?.name ?? o.recipientName ?? "—";
      const recipientPhone = o.recipient?.phone ?? o.recipientPhone ?? "";
      const address =
        o.recipient?.addressLine ||
        (o.recipient?.district && o.recipient?.province
          ? `${o.recipient.district}, ${o.recipient.province}`
          : o.address || "—");

      return (
        <div className="min-w-52 text-sm">
          <div>
            {recipientName} {recipientPhone && <span className="text-muted-foreground">· {recipientPhone}</span>}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-1">{address}</div>
        </div>
      );
    },
  },
  {
    key: "total",
    label: "Tổng tiền",
    sortable: true,
    render: (v) => <span className="whitespace-nowrap font-medium">{formatVnd(Number(v))}</span>,
  },
  {
    key: "status",
    label: "Trạng thái",
    mobilePriority: "badge",
    render: (v) => {
      const cfg = ORDER_STATUS[v as OrderStatus] ?? { label: String(v), className: "bg-muted" };
      return <StatusPill label={cfg.label} className={cfg.className} />;
    },
  },
];

export const orderFilters: TableFilterDef[] = [
  {
    key: "status",
    label: "Trạng thái",
    options: ORDER_STATUSES.map((s) => ({ label: ORDER_STATUS[s].label, value: s })),
  },
];
