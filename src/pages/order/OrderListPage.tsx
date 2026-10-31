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
  type OrderStatus,
  ORDER_FLOW,
  EMPTY_ORDER_FILTERS,
  type OrderFilters,
  countActive,
  isFinalOrderStatus,
  useOrders,
  useUpdateOrderStatus,
} from "@/features/order";
import { BackLink } from "@/components/common/BackLink";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ROUTES } from "@/config/routes";
import { CancelOrderDialog } from "./components/CancelOrderDialog";
import { OrderFilterSheet } from "./components/OrderFilterSheet";
import { OrderMobileCard } from "./components/OrderMobileCard";
import { OrderStatusChips } from "./components/OrderStatusChips";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { orderColumns } from "@/features/order/components/order-columns";

export default function OrderListPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const shopFilter = useShopFilter();
  const search = useSearch();
  const table = useTableParams<OrderFilters & { shopId: string }>({
    ...EMPTY_ORDER_FILTERS,
    shopId: shopFilter.initialShopId,
    // ?teamId= comes from "Xem đơn của nhóm" on the dispatch team page
    teamId: new URLSearchParams(search).get("teamId") ?? "all",
  });
  const { data: page, isFetching } = useOrders(table.params);
  const [filterOpen, setFilterOpen] = useState(false);
  const applyFilters = (next: OrderFilters & { shopId?: string }) => {
    const { onFilterChange } = table.bind(page, isFetching);
    Object.entries(next).forEach(([k, v]) => onFilterChange(k, v ?? "all"));
  };
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

  // Opened from "Xem đơn của nhóm" on the dispatch team page
  const fromTeam = new URLSearchParams(search).has("teamId");

  return (
    <>
      {fromTeam && (
        <div className="mb-4">
          <BackLink to={ROUTES.dispatchTeams} label="Nhóm điều phối" />
        </div>
      )}
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
        // The toolbar's "Bộ lọc" opens our own sheet instead of the default dropdown
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          countActive(table.state.filters) +
          (shopFilter.filter && table.state.filters.shopId && table.state.filters.shopId !== "all" ? 1 : 0)
        }
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        searchPlaceholder="Tìm theo mã đơn, mã vận đơn, khách hàng, người nhận, SĐT..."
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
      <OrderFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        value={{ ...EMPTY_ORDER_FILTERS, ...table.state.filters }}
        shopOptions={shopFilter.filter?.options}
        onApply={applyFilters}
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
