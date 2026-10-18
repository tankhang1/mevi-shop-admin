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
    key: "recipientName",
    label: "Người nhận",
    mobilePriority: "secondary",
    render: (_, o) => (
      <div>
        <div>{o.recipientName}</div>
        <div className="text-xs text-muted-foreground">{o.recipientPhone}</div>
      </div>
    ),
  },
  { key: "address", label: "Địa chỉ", render: (v) => <span className="block min-w-48 text-sm">{String(v)}</span> },
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
