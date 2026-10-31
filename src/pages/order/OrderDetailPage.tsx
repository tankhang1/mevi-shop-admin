import { type ReactNode, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowRight, XCircle } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
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
import { OrderTrackingCard } from "./components/OrderTrackingCard";
import { OrderTimeline } from "./components/OrderTimeline";

/** Card with a small title row — keeps every block on the page the same shape */
function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-5 sm:pt-5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {aside && <span className="text-xs text-muted-foreground">{aside}</span>}
      </div>
      <CardContent className="p-4 pt-3 sm:p-5 sm:pt-3">{children}</CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="text-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-words">{children}</div>
    </div>
  );
}

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

  const buyerPhone = order.customerPhone ?? order.recipientPhone;
  const isGift = order.recipientPhone !== buyerPhone;

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

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main: progress, items, who & where */}
        <div className="min-w-0 space-y-4 sm:space-y-5">
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

          <Section title="Sản phẩm" aside={`${units} món`}>
            <ul className="-my-3 divide-y">
              {order.items.map((it) => (
                <li key={it.productId} className="flex items-center gap-3 py-3">
                  <img
                    src={it.image || placeholder}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-lg border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={ROUTES.productDetail(it.productId)}
                      className="line-clamp-1 text-sm font-medium hover:underline"
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
                  <div className="whitespace-nowrap text-sm font-semibold tabular-nums">
                    {formatVnd(it.price * it.quantity)}
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Card>
            <CardContent className="grid p-0 sm:grid-cols-2 sm:divide-x max-sm:divide-y">
              <div className="space-y-3 p-4 sm:p-5">
                <h3 className="text-sm font-semibold">Khách hàng</h3>
                <Field label="Họ tên">
                  {order.customerId ? (
                    <Link
                      href={ROUTES.customerDetail(order.customerId)}
                      className="font-medium text-primary hover:underline"
                    >
                      {order.customerName ?? order.recipientName}
                    </Link>
                  ) : (
                    <span className="font-medium">{order.customerName ?? order.recipientName}</span>
                  )}
                </Field>
                {order.customerCode && (
                  <Field label="Mã khách hàng">
                    <span className="font-mono">{order.customerCode}</span>
                  </Field>
                )}
                <Field label="Số điện thoại">
                  <a href={`tel:${buyerPhone}`} className="text-primary hover:underline">
                    {buyerPhone}
                  </a>
                </Field>
                {order.customerEmail && <Field label="Email">{order.customerEmail}</Field>}
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  Giao hàng
                  {isGift && (
                    <span className="rounded bg-amber-50 px-1.5 text-[11px] font-medium text-amber-700">
                      Khác người đặt
                    </span>
                  )}
                </h3>
                <Field label="Người nhận">
                  <span className="font-medium">{order.recipientName}</span>
                  {" · "}
                  <a href={`tel:${order.recipientPhone}`} className="text-primary hover:underline">
                    {order.recipientPhone}
                  </a>
                </Field>
                <Field label="Địa chỉ">
                  {order.street ?? order.address}
                  {order.ward && order.province && (
                    <span className="block text-muted-foreground">
                      {order.ward}, {order.province}
                    </span>
                  )}
                </Field>
                {order.deliveryNote && <Field label="Lời nhắn">{order.deliveryNote}</Field>}
                {order.deliveredAt && <Field label="Đã giao lúc">{formatDate(order.deliveredAt)}</Field>}
              </div>
            </CardContent>
          </Card>

          <Section title="Ghi chú nội bộ" aside="Chỉ người bán thấy">
            <div className="space-y-2">
              <Textarea
                rows={3}
                value={noteValue}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: khách hẹn giao sau 17h"
              />
              {note !== null && note !== (order.internalNote ?? "") && (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setNote(null)}>
                    Huỷ
                  </Button>
                  <Button size="sm" onClick={() => void onSaveNote()} disabled={saveNote.isPending}>
                    Lưu ghi chú
                  </Button>
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Sidebar: money, where it came from, who handles it */}
        <div className="space-y-4 sm:space-y-5 lg:sticky lg:top-4 lg:self-start">
          <Section title="Thanh toán">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tạm tính</dt>
                <dd className="tabular-nums">{formatVnd(subtotal)}</dd>
              </div>
              {order.total !== subtotal && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Phí vận chuyển / giảm giá</dt>
                  <dd className="tabular-nums">{formatVnd(order.total - subtotal)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t pt-2">
                <dt className="font-semibold">Tổng cộng</dt>
                <dd className="text-lg font-bold tabular-nums text-primary">{formatVnd(order.total)}</dd>
              </div>
            </dl>
            {(isRoot || order.agencyName) && (
              <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
                {isRoot && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Gian hàng</dt>
                    <dd className="text-right font-medium">{order.shopName ?? "—"}</dd>
                  </div>
                )}
                {order.agencyName && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Đại lý</dt>
                    <dd className="text-right">
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
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </Section>

          <OrderDispatchCard
            key={`${order.id}-${order.teamId}-${order.assigneeId}`}
            order={order}
          />

          <OrderTrackingCard
            key={`${order.id}-${order.carrier}-${order.trackingCode}`}
            order={order}
          />
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
