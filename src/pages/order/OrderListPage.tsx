import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import {
  type Column,
  DataTable,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useIsMobile,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  ORDER_STATUS,
  ORDER_STATUSES,
  type Order,
  type OrderListParams,
  type OrderStatus,
  ORDER_FLOW,
  isFinalOrderStatus,
  useOrders,
  useUpdateOrderStatus,
} from "@/features/order";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ROUTES } from "@/config/routes";
import { useDispatchTeams } from "@/features/dispatch-team";
import { CancelOrderDialog } from "./components/CancelOrderDialog";
import { OrderMobileCard } from "./components/OrderMobileCard";
import { OrderStatusChips } from "./components/OrderStatusChips";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import {
  orderColumns,
  orderFilters,
} from "@/features/order/components/order-columns";

export default function OrderListPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const shopFilter = useShopFilter();
  const search = useSearch();
  const { data: teams } = useDispatchTeams({ size: 100 });
  const table = useTableParams<
    Pick<OrderListParams, "status"> & { shopId: string; teamId: string }
  >({
    status: "all",
    shopId: shopFilter.initialShopId,
    // ?teamId= comes from "Xem đơn của nhóm" on the dispatch team page
    teamId: new URLSearchParams(search).get("teamId") ?? "all",
  });
  const teamFilter = {
    key: "teamId",
    label: "Nhóm điều phối",
    options: [
      { label: "Chưa phân nhóm", value: "none" },
      ...(teams?.items ?? []).map((t) => ({ label: t.name, value: t.id })),
    ],
  };
  const { data: page, isFetching } = useOrders(table.params);
  const update = useUpdateOrderStatus();
  // Status picks are staged here and only applied after the admin confirms
  const [pending, setPending] = useState<{
    order: Order;
    next: OrderStatus;
  } | null>(null);

  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const cancelOrder = async (reason: string) => {
    if (!cancelTarget) return;
    try {
      await update.mutateAsync({
        id: cancelTarget.id,
        status: "cancelled",
        note: reason,
      });
      toast({ title: "Đã huỷ đơn hàng", description: cancelTarget.code });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: getErrorMessage(e),
      });
    } finally {
      setCancelTarget(null);
    }
  };

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
      key: "trackingCode",
      label: "Mã vận đơn",
      render: (_, o) =>
        o.trackingCode ? (
          <div className="text-sm">
            <div className="whitespace-nowrap font-mono font-medium">{o.trackingCode}</div>
            {o.carrier && <div className="whitespace-nowrap text-xs text-muted-foreground">{o.carrier}</div>}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      key: "teamName",
      label: "Điều phối",
      render: (_, o) =>
        o.teamName ? (
          <div className="text-sm">
            <div className="whitespace-nowrap">{o.teamName}</div>
            {o.assigneeName && <div className="text-xs text-muted-foreground">{o.assigneeName}</div>}
          </div>
        ) : (
          <span className="whitespace-nowrap text-xs text-amber-700">Chưa phân</span>
        ),
    },
    {
      key: "changeStatus",
      label: "Đổi trạng thái",
      width: "180px",
      render: (_, o) => (
        // Stop clicks reaching the table row, which would otherwise open the order
        <span onClick={(e) => e.stopPropagation()}>
          <Select
            value={o.status}
            onValueChange={(v) => {
              if (v === o.status) return;
              if (v === "cancelled") setCancelTarget(o);
              else setPending({ order: o, next: v as OrderStatus });
            }}
            disabled={isFinalOrderStatus(o.status) || update.isPending}
          >
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((s) => (
                <SelectItem
                  key={s}
                  value={s}
                  // Orders only move forward (cancel is always allowed until final)
                  disabled={
                    s !== "cancelled" &&
                    s !== o.status &&
                    ORDER_FLOW.indexOf(s) < ORDER_FLOW.indexOf(o.status)
                  }
                >
                  {ORDER_STATUS[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      ),
    },
  ];

  const finalStep = pending && isFinalOrderStatus(pending.next);

  return (
    <>
      {isMobile && (
        <OrderStatusChips
          value={table.state.filters.status ?? "all"}
          onChange={(v) =>
            table.bind(page, isFetching).onFilterChange("status", v)
          }
        />
      )}
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={
          [
            ...(shopFilter.filter ? [shopFilter.filter] : []),
            // Status is in the chips on mobile
            ...(isMobile ? [] : orderFilters),
            teamFilter,
          ]
        }
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        searchPlaceholder="Tìm theo mã đơn, mã vận đơn, người nhận, SĐT..."
        enableMobileCard
        renderMobileCard={(o, helpers) => (
          <OrderMobileCard
            order={o}
            helpers={helpers}
            onDeliver={(order) => setPending({ order, next: "completed" })}
            onCancel={setCancelTarget}
          />
        )}
        onView={(o) => navigate(ROUTES.orderDetail(o.id))}
      />
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        loading={update.isPending}
        destructive={!!finalStep}
        title={`Đổi trạng thái đơn ${pending?.order.code ?? ""}?`}
        confirmLabel="Xác nhận"
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
      <CancelOrderDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        code={cancelTarget?.code ?? ""}
        loading={update.isPending}
        onConfirm={(reason) => void cancelOrder(reason)}
      />
    </>
  );
}
