import { Link } from "wouter";
import { ClipboardCheck, Package, ShoppingCart, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ROUTES } from "@/config/routes";
import { useDashboardSummary } from "@/features/dashboard";
import { ORDER_STATUS } from "@/features/order";
import { formatDate, formatVnd } from "@/lib/format";
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();
  if (isLoading || !data) return <LoadingBlock />;

  const stats = [
    { label: "Sản phẩm", value: data.productCount, icon: Package, href: ROUTES.products },
    { label: "Chờ duyệt", value: data.pendingCount, icon: ClipboardCheck, href: ROUTES.productApproval },
    { label: "Đơn hàng", value: data.orderCount, sub: `${data.newOrderCount} đơn mới`, icon: ShoppingCart, href: ROUTES.orders },
    { label: "Doanh thu", value: formatVnd(data.revenue), sub: "Đơn hoàn tất", icon: Wallet, href: ROUTES.orders },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#214c3a]/10 text-[#214c3a]">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="truncate text-2xl font-bold">{s.value}</p>
                  {s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Đơn hàng gần đây</CardTitle>
          <Link href={ROUTES.orders} className="text-sm text-primary hover:underline">
            Xem tất cả
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {data.recentOrders.length === 0 ? (
            <EmptyBlock>Chưa có đơn hàng</EmptyBlock>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Người nhận</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.code}</TableCell>
                    <TableCell>{o.recipientName}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(o.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right">{formatVnd(o.total)}</TableCell>
                    <TableCell>
                      <StatusPill {...ORDER_STATUS[o.status]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
