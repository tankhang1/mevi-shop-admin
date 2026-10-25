import { type ReactNode, useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  Banknote,
  CalendarClock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShoppingBag,
  StickyNote,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import {
  EmptyBlock,
  LoadingBlock,
} from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useCustomer } from "@/features/customer";
import { type OrderListParams, useOrders } from "@/features/order";
import {
  orderColumns,
  orderFilters,
} from "@/features/order/components/order-columns";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDate, formatVnd } from "@/lib/format";
import { CustomerFormDialog } from "./components/CustomerFormDialog";
import { Initials } from "./CustomerListPage";

const Row = ({
  icon: Icon,
  children,
}: {
  icon: typeof Phone;
  children: ReactNode;
}) => (
  <div className="flex items-start gap-2.5 text-sm">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <div className="min-w-0 break-words">
      {children || <span className="text-muted-foreground">—</span>}
    </div>
  </div>
);

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { data: c, isLoading, isError } = useCustomer(id);
  const [editing, setEditing] = useState(false);
  const table = useTableParams<Pick<OrderListParams, "status">>({
    status: "all",
  });
  const { data: page, isFetching } = useOrders({
    ...table.params,
    customerId: id,
  });

  usePageActions(
    () =>
      c && (
        <Button onClick={() => setEditing(true)}>
          <Pencil className="mr-1.5 h-4 w-4" /> Sửa thông tin
        </Button>
      ),
    [c?.id],
  );

  if (isLoading) return <LoadingBlock />;
  if (isError || !c) return <EmptyBlock>Không tìm thấy khách hàng.</EmptyBlock>;

  const avg = c.orderCount ? Math.round(c.totalSpent / c.orderCount) : 0;

  return (
    <div className="space-y-5">
      <BackLink to={ROUTES.customers} label="Danh sách khách hàng" />

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <Initials name={c.name} size="h-14 w-14 text-lg" />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{c.name}</h2>
              </div>
            </div>
            <div className="space-y-2.5 border-t pt-4">
              <Row icon={Phone}>
                <a
                  href={`tel:${c.phone}`}
                  className="text-primary hover:underline"
                >
                  {c.phone}
                </a>
              </Row>
              <Row icon={Mail}>
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="text-primary hover:underline"
                  >
                    {c.email}
                  </a>
                )}
              </Row>
              <Row icon={MapPin}>{c.address}</Row>
              <Row icon={CalendarClock}>Khách từ {formatDate(c.createdAt)}</Row>
            </div>
            {c.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 border-t pt-4">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="border-t pt-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <StickyNote className="h-3.5 w-3.5" /> Ghi chú nội bộ
              </div>
              <p className="whitespace-pre-line text-sm">
                {c.note || (
                  <span className="text-muted-foreground">
                    Chưa có ghi chú.
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Tổng đơn",
                value: String(c.orderCount),
                icon: ShoppingBag,
              },
              {
                label: "Đã chi tiêu",
                value: formatVnd(c.totalSpent),
                icon: Banknote,
                note: "Đơn hoàn tất",
              },
              {
                label: "Giá trị TB / đơn",
                value: formatVnd(avg),
                icon: Banknote,
              },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <s.icon className="h-4 w-4" /> {s.label}
                  </div>
                  <div className="mt-1 text-xl font-bold tabular-nums">
                    {s.value}
                  </div>
                  {c.lastOrderAt && s.label === "Tổng đơn" && (
                    <div className="text-xs text-muted-foreground">
                      Gần nhất {formatDate(c.lastOrderAt)}
                    </div>
                  )}
                  {s.note && (
                    <div className="text-xs text-muted-foreground">
                      {s.note}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lịch sử mua hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                {...table.bind(page, isFetching)}
                columns={orderColumns}
                onView={(o) => navigate(ROUTES.orderDetail(o.id))}
                filters={orderFilters}
                searchPlaceholder="Tìm theo mã đơn..."
                enableMobileCard
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <CustomerFormDialog
        open={editing}
        onOpenChange={setEditing}
        customer={c}
      />
    </div>
  );
}
