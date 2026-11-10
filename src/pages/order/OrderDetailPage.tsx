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
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  isFinalOrderStatus,
  isOrderCompleted,
  nextOrderStatus,
  type OrderPaymentStatus,
  useOrder,
  useUpdateOrderNote,
  useUpdateOrderPayment,
  useUpdateOrderStatus,
} from "@/features/order";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate, formatVnd } from "@/lib/format";
import { CancelOrderDialog } from "./components/CancelOrderDialog";
import { OrderDispatchCard } from "./components/OrderDispatchCard";
import { OrderTrackingCard } from "./components/OrderTrackingCard";
import { OrderTimeline } from "./components/OrderTimeline";

/** Card with a small title row — keeps every block on the page the same shape */
function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-5 sm:pt-5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {aside && (
          <span className="text-xs text-muted-foreground">{aside}</span>
        )}
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
  const updatePayment = useUpdateOrderPayment();
  const saveNote = useUpdateOrderNote();
  const [confirmNext, setConfirmNext] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmPaymentTarget, setConfirmPaymentTarget] =
    useState<OrderPaymentStatus | null>(null);
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
        <Button
          className="flex-[2] md:flex-none"
          onClick={() => setConfirmNext(true)}
        >
          {NEXT_STEP_LABEL[next]} <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      )}
    </>
  );

  // Mobile: actions go to a sticky bar above the bottom nav so the title keeps its room
  usePageActions(
    () => !isMobile && actions,
    [order?.id, order?.status, isMobile],
  );

  if (isLoading) return <LoadingBlock />;
  if (isError || !order)
    return <EmptyBlock>Không tìm thấy đơn hàng.</EmptyBlock>;

  const changeStatus = async (status: typeof order.status, reason?: string) => {
    try {
      await update.mutateAsync({ id: order.id, status, reason, note: reason });
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

  const onUpdatePayment = async (status: OrderPaymentStatus) => {
    try {
      await updatePayment.mutateAsync({ id: order.id, paymentStatus: status });
      toast({
        title:
          status === "PAID"
            ? "Đã ghi nhận thanh toán"
            : "Đã hủy ghi nhận thanh toán",
        description: `Đơn hàng ${order.code}`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi cập nhật thanh toán",
        description: getErrorMessage(e),
      });
    } finally {
      setConfirmPaymentTarget(null);
    }
  };

  const subtotal = (order.items ?? []).reduce(
    (s, it) => s + it.quantity * (it.unitPrice ?? it.price ?? 0),
    0,
  );
  const units = (order.items ?? []).reduce((s, it) => s + it.quantity, 0);
  const noteValue = note ?? order.internalNote ?? "";

  const buyerPhone = order.customerPhone ?? order.recipientPhone;
  const isGift = order.recipientPhone !== buyerPhone;
  const completed = isOrderCompleted(order);
  const isPaid = order.paymentStatus === "PAID";
  const isCancelled =
    order.status === "CANCELLED" || order.status === "cancelled";
  const paymentCfg =
    ORDER_PAYMENT_STATUS[order.paymentStatus ?? "UNPAID"] ??
    ORDER_PAYMENT_STATUS.UNPAID;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <BackLink to={ROUTES.orders} label="Đơn đặt hàng" />
        <span className="font-mono text-sm font-semibold">{order.code}</span>
        {completed ? (
          <StatusPill label="Hoàn thành" className="bg-emerald-100 text-emerald-800" />
        ) : (
          <StatusPill {...ORDER_STATUS[order.status]} />
        )}
        <StatusPill label={paymentCfg.label} className={paymentCfg.className} />
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
              {(order.items ?? []).map((it, idx) => {
                const pId = it.product?.id
                  ? String(it.product.id)
                  : it.productId;
                const title = it.product?.title ?? it.name ?? "Sản phẩm";
                const img = it.product?.imageUrl ?? it.image ?? placeholder;
                const sku = it.sku ?? it.product?.code;
                const price = it.unitPrice ?? it.price ?? 0;
                const lineTotal = it.lineTotal ?? price * it.quantity;
                const variantTitle = it.variant?.title;
                const unitText = it.baseUnit?.toUpperCase();

                return (
                  <li
                    key={it.id ?? `${pId}-${idx}`}
                    className="flex items-center gap-3 py-3"
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-lg border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      {pId ? (
                        <Link
                          href={ROUTES.productDetail(pId)}
                          className="line-clamp-1 text-sm font-medium hover:underline"
                        >
                          {title}
                        </Link>
                      ) : (
                        <span className="line-clamp-1 text-sm font-medium">
                          {title}
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                        {sku && <span className="font-mono">{sku}</span>}
                        {variantTitle && (
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[11px] font-medium text-foreground">
                            {variantTitle}
                          </span>
                        )}
                        {!variantTitle && unitText && (
                          <span className="rounded bg-emerald-50 text-emerald-800 px-1.5 py-0.2 text-[11px] font-medium border border-emerald-200">
                            ĐVT: {unitText}
                          </span>
                        )}
                        <span className="whitespace-nowrap">
                          {formatVnd(price)} × {it.quantity}
                        </span>
                      </div>
                      {it.allocation && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Trừ tồn: {it.allocation.variantQuantity ?? 0} quy cách
                          + {it.allocation.unitQuantity ?? 0}{" "}
                          {unitText || "đơn vị"}
                        </div>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-sm font-semibold tabular-nums">
                      {formatVnd(lineTotal)}
                    </div>
                  </li>
                );
              })}
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
                      {order.customer?.fullName ??
                        order.customerName ??
                        order.recipient?.name ??
                        order.recipientName}
                    </Link>
                  ) : (
                    <span className="font-medium">
                      {order.customer?.fullName ??
                        order.customerName ??
                        order.recipient?.name ??
                        order.recipientName}
                    </span>
                  )}
                </Field>
                {(order.customer?.code || order.customerCode) && (
                  <Field label="Mã khách hàng">
                    <span className="font-mono">
                      {order.customer?.code ?? order.customerCode}
                    </span>
                  </Field>
                )}
                <Field label="Số điện thoại">
                  <a
                    href={`tel:${buyerPhone}`}
                    className="text-primary hover:underline"
                  >
                    {buyerPhone}
                  </a>
                </Field>
                {(order.customer?.email || order.customerEmail) && (
                  <Field label="Email">
                    {order.customer?.email ?? order.customerEmail}
                  </Field>
                )}
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
                  <span className="font-medium">
                    {order.recipient?.name ?? order.recipientName}
                  </span>
                  {" · "}
                  <a
                    href={`tel:${order.recipient?.phone ?? order.recipientPhone}`}
                    className="text-primary hover:underline"
                  >
                    {order.recipient?.phone ?? order.recipientPhone}
                  </a>
                </Field>
                <Field label="Địa chỉ">
                  {order.recipient?.addressLine ??
                    order.street ??
                    order.address}
                  {(order.recipient?.district || order.ward) &&
                    (order.recipient?.province || order.province) && (
                      <span className="block text-muted-foreground">
                        {order.recipient?.district ?? order.ward},{" "}
                        {order.recipient?.province ?? order.province}
                      </span>
                    )}
                </Field>
                {(order.note || order.deliveryNote) && (
                  <Field label="Lời nhắn">
                    {order.note ?? order.deliveryNote}
                  </Field>
                )}
                {order.deliveredAt && (
                  <Field label="Đã giao lúc">
                    {formatDate(order.deliveredAt)}
                  </Field>
                )}
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
                  <dt className="text-muted-foreground">
                    Phí vận chuyển / giảm giá
                  </dt>
                  <dd className="tabular-nums">
                    {formatVnd(order.total - subtotal)}
                  </dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t pt-2">
                <dt className="font-semibold">Tổng cộng</dt>
                <dd className="text-lg font-bold tabular-nums text-primary">
                  {formatVnd(order.total)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 space-y-2 border-t pt-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  Trạng thái thanh toán
                </span>
                <StatusPill
                  label={paymentCfg.label}
                  className={paymentCfg.className}
                />
              </div>
              {order.paidAt && (
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Thời gian</span>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.paidBy?.fullName && (
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Người ghi nhận</span>
                  <span>{order.paidBy.fullName}</span>
                </div>
              )}
              {!isCancelled && (
                <div className="pt-2">
                  {isPaid ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-destructive hover:border-destructive"
                      onClick={() => setConfirmPaymentTarget("UNPAID")}
                      disabled={updatePayment.isPending}
                    >
                      Hủy ghi nhận thanh toán
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => setConfirmPaymentTarget("PAID")}
                      disabled={updatePayment.isPending}
                    >
                      Ghi nhận thanh toán
                    </Button>
                  )}
                </div>
              )}
            </div>

            {(isRoot || order.storefront || order.agencyName) && (
              <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
                {isRoot && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Gian hàng Mevi</dt>
                    <dd className="text-right font-medium">
                      {order.shopName ?? "—"}
                    </dd>
                  </div>
                )}
                {(order.storefront || order.agencyName) && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Đại lý / CTV</dt>
                    <dd className="text-right">
                      {isRoot && (order.storefront?.id || order.agencyId) ? (
                        <Link
                          href={ROUTES.agencyDetail(
                            String(order.storefront?.id ?? order.agencyId),
                          )}
                          className="font-medium text-primary hover:underline"
                        >
                          {order.storefront?.name ?? order.agencyName}
                        </Link>
                      ) : (
                        <span className="font-medium">
                          {order.storefront?.name ?? order.agencyName}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                {order.commission && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">
                      Hoa hồng ({order.commission.rate}%)
                    </dt>
                    <dd className="text-right font-medium text-emerald-800 tabular-nums">
                      {formatVnd(order.commission.amount)}
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
      <ConfirmDialog
        open={!!confirmPaymentTarget}
        onOpenChange={(o) => !o && setConfirmPaymentTarget(null)}
        loading={updatePayment.isPending}
        destructive={confirmPaymentTarget === "UNPAID"}
        title={
          confirmPaymentTarget === "PAID"
            ? `Xác nhận đã thanh toán đơn ${order.code}?`
            : `Hủy ghi nhận thanh toán đơn ${order.code}?`
        }
        confirmLabel={
          confirmPaymentTarget === "PAID"
            ? "Xác nhận thanh toán"
            : "Hủy thanh toán"
        }
        description={
          confirmPaymentTarget === "PAID" ? (
            <p>
              Hệ thống sẽ cập nhật trạng thái đơn thành{" "}
              <strong>Đã thanh toán</strong> và tự động tính hoa hồng đủ điều
              kiện chi trả (khi đơn đã giao).
            </p>
          ) : (
            <p>
              Đơn hàng sẽ chuyển về trạng thái <strong>Chưa thanh toán</strong>.
              <br />
              <span className="text-destructive font-medium">
                Lưu ý: Không thể hủy nếu hoa hồng của đơn này đã được chi trả
                cho đối tác.
              </span>
            </p>
          )
        }
        onConfirm={() =>
          confirmPaymentTarget && void onUpdatePayment(confirmPaymentTarget)
        }
      />
    </div>
  );
}
