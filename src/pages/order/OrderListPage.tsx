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
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { orderColumns, orderFilters } from "@/features/order/components/order-columns";

export default function OrderListPage() {
  const { toast } = useToast();
  const table = useTableParams<Pick<OrderListParams, "status">>({ status: "all" });
  const { data: page, isFetching } = useOrders(table.params);
  const update = useUpdateOrderStatus();

  const changeStatus = async (o: Order, next: OrderStatus) => {
    try {
      await update.mutateAsync({ id: o.id, status: next });
      toast({ title: "Đã cập nhật đơn hàng", description: `${o.code} → ${ORDER_STATUS[next].label}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const columns: Column<Order>[] = [
    ...orderColumns,
    {
      key: "changeStatus",
      label: "Đổi trạng thái",
      width: "180px",
      render: (_, o) => (
        <Select
          value={o.status}
          onValueChange={(v) => void changeStatus(o, v as OrderStatus)}
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

  return (
    <DataTable
      {...table.bind(page, isFetching)}
      columns={columns}
      filters={orderFilters}
      searchPlaceholder="Tìm theo mã đơn, người nhận, SĐT..."
      enableMobileCard
    />
  );
}
