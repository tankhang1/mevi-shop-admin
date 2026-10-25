import { type ReactNode, useState } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowRight,
  Handshake,
  MapPin,
  Phone,
  StickyNote,
  Store,
  User,
  XCircle,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  useIsMobile,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  EmptyBlock,
  LoadingBlock,
  StatusPill,
} from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useAccess } from "@/features/auth";
import {
  NEXT_STEP_LABEL,
  ORDER_STATUS,
  isFinalOrderStatus,
  nextOrderStatus,
  useOrder,
  useUpdateOrderNote,
  useUpdateOrderStatus,
} from "@/features/order";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate, formatVnd } from "@/lib/format";
import { CancelOrderDialog } from "./components/CancelOrderDialog";
import { OrderDispatchCard } from "./components/OrderDispatchCard";
import { OrderTimeline } from "./components/OrderTimeline";

const Row = ({
  icon: Icon,
  children,
}: {
  icon: typeof Phone;
  children: ReactNode;
}) => (
  <div className="flex items-start gap-2.5 text-sm">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <div className="min-w-0 break-words">{children}</div>
  </div>
);

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isRoot } = useAccess();
  const isMobile = useIsMobile();
  const { data: order, isLoading, isError } = useOrder(id);
  const update = useUpdateOrderStatus();
  const saveNote = useUpdateOrderNote();
  const [confirmNext, setConfirmNext] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const next = order && nextOrderStatus(order.status);

  const actions = order && !isFinalOrderStatus(order.status) && (
    <>
      <Button
        variant="outline"
        className="flex-1 text-destructive hover:text-destructive md:flex-none"
        onClick={() => setCancelling(true)}
      >
        <XCircle className="mr-1.5 h-4 w-4" /> Huỷ đơn
      </Button>
      {next && (
        <Button className="flex-[2] md:flex-none" onClick={() => setConfirmNext(true)}>
          {NEXT_STEP_LABEL[next]} <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      )}
    </>
  );

  // Mobile: actions go to a sticky bar above the bottom nav so the title keeps its room
  usePageActions(() => !isMobile && actions, [order?.id, order?.status, isMobile]);

  if (isLoading) return <LoadingBlock />;
  if (isError || !order)
    return <EmptyBlock>Không tìm thấy đơn hàng.</EmptyBlock>;

  const changeStatus = async (status: typeof order.status, reason?: string) => {
    try {
      await update.mutateAsync({ id: order.id, status, note: reason });
      toast({
        title: "Đã cập nhật đơn hàng",
        description: `${order.code} → ${ORDER_STATUS[status].label}`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: getErrorMessage(e),
      });
    } finally {
      setConfirmNext(false);
      setCancelling(false);
    }
  };

  const onSaveNote = async () => {
    try {
      await saveNote.mutateAsync({ id: order.id, internalNote: note ?? "" });
      toast({ title: "Đã lưu ghi chú" });
      setNote(null);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể lưu",
        description: getErrorMessage(e),
      });
    }
  };

  const subtotal = order.items.reduce((s, it) => s + it.quantity * it.price, 0);
  const units = order.items.reduce((s, it) => s + it.quantity, 0);
  const noteValue = note ?? order.internalNote ?? "";

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <BackLink to={ROUTES.orders} label="Đơn đặt hàng" />
        <span className="font-mono text-sm font-semibold">{order.code}</span>
        <StatusPill {...ORDER_STATUS[order.status]} />
        <span className="text-xs text-muted-foreground">
          Đặt lúc {formatDate(order.createdAt)}
        </span>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <OrderTimeline order={order} />
          {order.status === "cancelled" && order.cancelReason && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              Lý do huỷ: {order.cancelReason}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="h-fit">
          <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
            <CardTitle className="text-base">
              Sản phẩm{" "}
              <span className="font-normal text-muted-foreground">
                · {units} món
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <ul className="divide-y">
              {order.items.map((it) => (
                <li key={it.productId} className="flex items-start gap-3 py-3">
                  <img
                    src={it.image || placeholder}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-md border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={ROUTES.productDetail(it.productId)}
                      className="line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {it.name}
                    </Link>
                    <div className="flex flex-wrap gap-x-1.5 text-xs text-muted-foreground">
                      {it.sku && <span className="font-mono">{it.sku}</span>}
                      <span className="whitespace-nowrap">
                        {formatVnd(it.price)} × {it.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-sm font-semibold">
                    {formatVnd(it.price * it.quantity)}
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tạm tính</dt>
                <dd>{formatVnd(subtotal)}</dd>
              </div>
              {order.total !== subtotal && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    Phí vận chuyển / giảm giá
                  </dt>
                  <dd>{formatVnd(order.total - subtotal)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <dt>Tổng cộng</dt>
                <dd className="text-primary">{formatVnd(order.total)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-4 sm:space-y-5">
          <Card>
            <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
              <CardTitle className="text-base">Người nhận</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 p-4 pt-0 sm:p-6 sm:pt-0">
              <Row icon={User}>
                {order.customerId ? (
                  <Link
                    href={ROUTES.customerDetail(order.customerId)}
                    className="font-medium text-primary hover:underline"
                  >
                    {order.recipientName}
                  </Link>
                ) : (
                  <span className="font-medium">{order.recipientName}</span>
                )}
              </Row>
              <Row icon={Phone}>
                <a
                  href={`tel:${order.recipientPhone}`}
                  className="text-primary hover:underline"
                >
                  {order.recipientPhone}
                </a>
              </Row>
              <Row icon={MapPin}>{order.address}</Row>
            </CardContent>
          </Card>

          {(isRoot || order.agencyName) && (
            <Card>
              <CardContent className="space-y-2.5 p-4 sm:p-5">
                {isRoot && <Row icon={Store}>{order.shopName ?? "—"}</Row>}
                {order.agencyName && (
                  <Row icon={Handshake}>
                    Qua đại lý{" "}
                    {isRoot && order.agencyId ? (
                      <Link
                        href={ROUTES.agencyDetail(order.agencyId)}
                        className="font-medium text-primary hover:underline"
                      >
                        {order.agencyName}
                      </Link>
                    ) : (
                      <span className="font-medium">{order.agencyName}</span>
                    )}
                  </Row>
                )}
              </CardContent>
            </Card>
          )}

          <OrderDispatchCard
            key={`${order.id}-${order.teamId}-${order.assigneeId}`}
            order={order}
          />

          <Card>
            <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
              <CardTitle className="flex items-center gap-1.5 text-base">
                <StickyNote className="h-4 w-4" /> Ghi chú nội bộ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-0 sm:p-6 sm:pt-0">
              <Textarea
                rows={3}
                value={noteValue}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Chỉ người bán thấy — VD: khách hẹn giao sau 17h"
              />
              {note !== null && note !== (order.internalNote ?? "") && (
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setNote(null)}
                  >
                    Huỷ
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void onSaveNote()}
                    disabled={saveNote.isPending}
                  >
                    Lưu ghi chú
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isMobile && actions && (
        <div className="sticky bottom-18 z-10 -mx-4 flex gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur">
          {actions}
        </div>
      )}

      {next && (
        <ConfirmDialog
          open={confirmNext}
          onOpenChange={setConfirmNext}
          loading={update.isPending}
          destructive={false}
          title={`${NEXT_STEP_LABEL[next]} ${order.code}?`}
          confirmLabel={NEXT_STEP_LABEL[next]}
          description={
            <>
              {ORDER_STATUS[order.status].label} →{" "}
              <span className="font-medium text-foreground">
                {ORDER_STATUS[next].label}
              </span>
              {next === "completed" && (
                <p className="font-medium text-destructive">
                  Không thể hoàn tác sau khi xác nhận.
                </p>
              )}
            </>
          }
          onConfirm={() => void changeStatus(next)}
        />
      )}
      <CancelOrderDialog
        open={cancelling}
        onOpenChange={setCancelling}
        code={order.code}
        loading={update.isPending}
        onConfirm={(reason) => void changeStatus("cancelled", reason)}
      />
    </div>
  );
}
