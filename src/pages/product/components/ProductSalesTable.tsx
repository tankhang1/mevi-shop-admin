import { useLocation } from "wouter";
import { type Column, DataTable, type TableFilterDef, useIsMobile } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { ORDER_STATUS, ORDER_STATUSES, type Order, type OrderStatus, useOrders } from "@/features/order";
import { useTableParams } from "@/hooks/useTableParams";
import { formatVnd } from "@/lib/format";

const dt = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });

const statusFilter: TableFilterDef = {
  key: "status",
  label: "Trạng thái",
  options: ORDER_STATUSES.map((s) => ({ label: ORDER_STATUS[s].label, value: s })),
};

/** "Lịch sử bán hàng" of one product — orders containing it (GET /orders?productId=) */
export function ProductSalesTable({ productId }: { productId: string | number }) {
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();
  const table = useTableParams<{ status: string }>({ status: "all" });
  const { status, ...rest } = table.params;
  const { data, isFetching } = useOrders({
    ...rest,
    productId: String(productId),
    status: status === "all" ? undefined : (status as OrderStatus),
  });

  /** This product's lines in the order (an order may hold several variants of it) */
  const lines = (o: Order) =>
    (o.items ?? []).filter((it) => String(it.product?.id ?? it.productId) === String(productId));

  const columns: Column<Order>[] = [
    {
      key: "code",
      label: "Mã đơn",
      mobilePriority: "primary",
      render: (_, o) => (
        <div className="whitespace-nowrap">
          <div className="font-mono text-sm font-medium">{o.code}</div>
          <div className="text-xs text-muted-foreground">{dt.format(new Date(o.createdAt))}</div>
        </div>
      ),
    },
    {
      key: "customer",
      label: "Khách hàng",
      mobilePriority: "secondary",
      render: (_, o) => (
        <div className="min-w-0 text-sm">
          <div className="truncate">{o.customer?.fullName ?? o.customerName ?? o.recipientName ?? "—"}</div>
          <div className="text-xs text-muted-foreground">
            {o.customer?.phoneNumber ?? o.customerPhone ?? o.recipientPhone ?? ""}
          </div>
        </div>
      ),
    },
    {
      key: "items",
      label: "Quy cách × SL",
      render: (_, o) => {
        const ls = lines(o);
        if (!ls.length) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="space-y-0.5 text-sm">
            {ls.map((it, i) => (
              <div key={it.id ?? i} className="whitespace-nowrap">
                {it.variant?.title ?? it.name} <span className="font-semibold tabular-nums">× {it.quantity}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: "lineTotal",
      label: "Thành tiền",
      render: (_, o) => {
        const ls = lines(o);
        const sum = ls.reduce((s, it) => s + (it.lineTotal ?? it.price * it.quantity), 0);
        return <span className="whitespace-nowrap tabular-nums">{ls.length ? formatVnd(sum) : "—"}</span>;
      },
    },
    {
      key: "storefront",
      label: "Gian hàng",
      render: (_, o) => (
        <span className="whitespace-nowrap text-sm">{o.storefront?.name ?? o.shopName ?? o.agencyName ?? "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (_, o) => <StatusPill {...(ORDER_STATUS[o.status] ?? { label: o.status, className: "" })} />,
    },
  ];

  return (
    <DataTable
      {...table.bind(data, isFetching)}
      columns={columns}
      filters={[statusFilter]}
      searchPlaceholder="Tìm theo mã đơn, khách hàng..."
      onRowClick={(o: Order) => navigate(ROUTES.orderDetail(o.id))}
      enableMobileCard
      columnToggleable={!isMobile}
      downloadable={!isMobile}
    />
  );
}
