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
        <div className="font-medium">{o.code}</div>
        <div className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</div>
      </div>
    ),
  },
  {
    key: "customerName",
    label: "Khách hàng",
    mobilePriority: "secondary",
    render: (_, o) => (
      <div className="whitespace-nowrap">
        <div>{o.customerName ?? o.recipientName}</div>
        <div className="text-xs text-muted-foreground">
          {o.customerCode && <span className="font-mono">{o.customerCode} · </span>}
          {o.customerPhone ?? o.recipientPhone}
        </div>
      </div>
    ),
  },
  {
    key: "address",
    label: "Giao đến",
    render: (_, o) => (
      <div className="min-w-52 text-sm">
        <div>
          {o.recipientName} · <span className="text-muted-foreground">{o.recipientPhone}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {o.ward && o.province ? `${o.ward}, ${o.province}` : o.address}
        </div>
      </div>
    ),
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
    render: (v) => <StatusPill {...ORDER_STATUS[v as OrderStatus]} />,
  },
];

export const orderFilters: TableFilterDef[] = [
  {
    key: "status",
    label: "Trạng thái",
    options: ORDER_STATUSES.map((s) => ({ label: ORDER_STATUS[s].label, value: s })),
  },
];
