import { useState } from "react";
import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  ORDER_STATUS,
  ORDER_STATUSES,
  type OrderStatus,
  isFinalOrderStatus,
  useOrders,
  useUpdateOrderStatus,
} from "@/features/order";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate, formatVnd } from "@/lib/format";
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";

type Filter = "all" | OrderStatus;
const FILTERS: Filter[] = ["all", "new", "confirmed", "processing", "shipped", "completed", "cancelled"];

export default function OrderListPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<Filter>("all");
  const { data: page, isLoading } = useOrders({ status });
  const data = page?.items ?? [];
  const update = useUpdateOrderStatus();

  const changeStatus = async (id: string, code: string, next: OrderStatus) => {
    try {
      await update.mutateAsync({ id, status: next });
      toast({ title: "Đã cập nhật đơn hàng", description: `${code} → ${ORDER_STATUS[next].label}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Tabs value={status} onValueChange={(v) => setStatus(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f}>
                {f === "all" ? "Tất cả" : ORDER_STATUS[f].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-x-auto">
        {isLoading ? (
          <LoadingBlock />
        ) : data.length === 0 ? (
          <EmptyBlock>Không có đơn hàng</EmptyBlock>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Người nhận</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-48">Đổi trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <div className="font-medium">{o.code}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div>{o.recipientName}</div>
                    <div className="text-xs text-muted-foreground">{o.recipientPhone}</div>
                  </TableCell>
                  <TableCell className="min-w-56 text-sm">{o.address}</TableCell>
                  <TableCell className="whitespace-nowrap text-right font-medium">{formatVnd(o.total)}</TableCell>
                  <TableCell>
                    <StatusPill {...ORDER_STATUS[o.status]} />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(v) => void changeStatus(o.id, o.code, v as OrderStatus)}
                      disabled={isFinalOrderStatus(o.status)}
                    >
                      <SelectTrigger className="h-9">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
