import { useState } from "react";
import {
  type Column,
  DataTable,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  ORDER_STATUS,
  ORDER_STATUSES,
  type Order,
  type OrderListParams,
  type OrderStatus,
  isFinalOrderStatus,
  useOrders,
  useUpdateOrderStatus,
} from "@/features/order";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import {
  orderColumns,
  orderFilters,
} from "@/features/order/components/order-columns";

export default function OrderListPage() {
  const { toast } = useToast();
  const shopFilter = useShopFilter();
  const table = useTableParams<Pick<OrderListParams, "status"> & { shopId: string }>({
    status: "all",
    shopId: shopFilter.initialShopId,
  });
  const { data: page, isFetching } = useOrders(table.params);
  const update = useUpdateOrderStatus();
  // Status picks are staged here and only applied after the admin confirms
  const [pending, setPending] = useState<{
    order: Order;
    next: OrderStatus;
  } | null>(null);

  const confirmChange = async () => {
    if (!pending) return;
    const { order: o, next } = pending;
    try {
      await update.mutateAsync({ id: o.id, status: next });
      toast({
        title: "Đã cập nhật đơn hàng",
        description: `${o.code} → ${ORDER_STATUS[next].label}`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: getErrorMessage(e),
      });
    } finally {
      setPending(null);
    }
  };

  const columns: Column<Order>[] = [
    ...orderColumns.slice(0, 2),
    ...shopFilter.column<Order>(),
    ...orderColumns.slice(2),
    {
      key: "changeStatus",
      label: "Đổi trạng thái",
      width: "180px",
      render: (_, o) => (
        <Select
          value={o.status}
          onValueChange={(v) =>
            v !== o.status && setPending({ order: o, next: v as OrderStatus })
          }
          disabled={isFinalOrderStatus(o.status) || update.isPending}
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  const finalStep = pending && isFinalOrderStatus(pending.next);

  return (
    <>
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={shopFilter.filter ? [shopFilter.filter, ...orderFilters] : orderFilters}
        searchPlaceholder="Tìm theo mã đơn, người nhận, SĐT..."
        enableMobileCard
      />
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        loading={update.isPending}
        destructive={!!finalStep}
        title={`Đổi trạng thái đơn ${pending?.order.code ?? ""}?`}
        confirmLabel={pending?.next === "cancelled" ? "Huỷ đơn" : "Xác nhận"}
        onConfirm={() => void confirmChange()}
        description={
          pending && (
            <>
              <p>
                <span className="font-medium text-foreground">
                  {ORDER_STATUS[pending.order.status].label}
                </span>{" "}
                →{" "}
                <span className="font-medium text-foreground">
                  {ORDER_STATUS[pending.next].label}
                </span>
              </p>
              <p>
                Người nhận: {pending.order.recipientName} ·{" "}
                {pending.order.recipientPhone}
              </p>
              {finalStep && (
                <p className="font-medium text-destructive">
                  Không thể hoàn tác sau khi xác nhận.
                </p>
              )}
            </>
          )
        }
      />
    </>
  );
}
