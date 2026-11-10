import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Filter } from "lucide-react";
import {
  type Column,
  Button,
  DataTable,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useIsMobile,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import {
  ORDER_STATUS,
  ORDER_STATUSES,
  type Order,
  type OrderStatus,
  ORDER_FLOW,
  EMPTY_ORDER_FILTERS,
  type OrderFilters,
  type OrderListParams,
  countActive,
  isFinalOrderStatus,
  useOrders,
  useOrderStatusCounts,
  useUpdateOrderStatus,
  SHIPPING_CARRIERS_MAP,
  type ShippingCarrier,
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
  // Pre-set filters from the URL, e.g. ?teamId= from "Xem đơn của nhóm",
  // ?productId=&status=completed&from=&to=&agencyId= from a report's product row
  const urlParams = new URLSearchParams(search);
  const rawStatus = urlParams.get("status");
  const rawPaymentStatus = urlParams.get("paymentStatus");

  let initialStatus: string | undefined = rawStatus ?? undefined;
  let initialPaymentStatus: string | undefined = rawPaymentStatus ?? undefined;

  // Chuẩn hóa trạng thái hoàn thành: backend không có status completed, map sang DELIVERED + PAID
  if (rawStatus === "completed" || rawStatus === "COMPLETED") {
    initialStatus = "DELIVERED";
    initialPaymentStatus = "PAID";
  } else if (rawStatus) {
    const upper = rawStatus.toUpperCase();
    if (["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"].includes(upper)) {
      initialStatus = upper;
    }
  }

  const fromUrl = Object.fromEntries(
    (Object.keys(EMPTY_ORDER_FILTERS) as (keyof OrderFilters)[]).flatMap(
      (k) => {
        if (k === "status" && initialStatus) return [[k, initialStatus]];
        if (k === "paymentStatus" && initialPaymentStatus) return [[k, initialPaymentStatus]];
        const v = urlParams.get(k);
        return v ? [[k, v]] : [];
      },
    ),
  ) as Partial<OrderFilters>;
  const table = useTableParams<
    OrderFilters & { shopId: string; agencyId: string }
  >({
    ...EMPTY_ORDER_FILTERS,
    ...fromUrl,
    shopId: urlParams.get("shopId") ?? shopFilter.initialShopId,
    agencyId: urlParams.get("agencyId") ?? "",
  });
  const { data: page, isFetching } = useOrders({
    ...table.params,
    // Filters are kept as plain strings; status/dateField always hold one of the option values
    status: table.params.status as OrderListParams["status"],
    paymentStatus: table.params
      .paymentStatus as OrderListParams["paymentStatus"],
    dateField: table.params.dateField as OrderListParams["dateField"],
  });
  const { data: statusCounts } = useOrderStatusCounts({
    shopId: table.params.shopId,
    agencyId: table.params.agencyId,
  });
  const { data: unpaidCounts } = useOrderStatusCounts({
    shopId: table.params.shopId,
    agencyId: table.params.agencyId,
    paymentStatus: "UNPAID",
  });
  const { data: paidCounts } = useOrderStatusCounts({
    shopId: table.params.shopId,
    agencyId: table.params.agencyId,
    paymentStatus: "PAID",
  });
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
        status: "CANCELLED",
        reason,
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
      render: (_, o) => {
        const carrierName =
          (o.shippingCarrier &&
            SHIPPING_CARRIERS_MAP[o.shippingCarrier as ShippingCarrier]) ||
          o.shippingCarrier ||
          o.carrier;
        return o.trackingCode ? (
          <div className="text-sm">
            <div className="whitespace-nowrap font-mono font-medium">
              {o.trackingCode}
            </div>
            {carrierName && (
              <div className="whitespace-nowrap text-xs text-muted-foreground">
                {carrierName}
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },
    {
      key: "teamName",
      label: "Điều phối",
      render: (_, o) => {
        const tName = o.dispatchGroup?.name ?? o.teamName;
        const aName = o.assignee?.fullName ?? o.assigneeName;
        return tName ? (
          <div className="text-sm">
            <div className="whitespace-nowrap font-medium">{tName}</div>
            {aName && (
              <div className="text-xs text-muted-foreground">{aName}</div>
            )}
          </div>
        ) : (
          <span className="whitespace-nowrap text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Chưa phân nhóm
          </span>
        );
      },
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
              if (v === "CANCELLED" || v === "cancelled") setCancelTarget(o);
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
                    s !== "CANCELLED" &&
                    s !== "cancelled" &&
                    s !== o.status &&
                    ORDER_FLOW.indexOf(s) < ORDER_FLOW.indexOf(o.status)
                  }
                >
                  {ORDER_STATUS[s]?.label ?? s}
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

  const activeFilterCount =
    countActive(table.state.filters) +
    (shopFilter.filter &&
    table.state.filters.shopId &&
    table.state.filters.shopId !== "all"
      ? 1
      : 0);

  usePageActions(
    () => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setFilterOpen(true)}
        className="gap-1.5"
      >
        <Filter className="h-4 w-4" />
        <span>Bộ lọc</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </Button>
    ),
    [activeFilterCount],
  );

  const currentStatus = table.state.filters.status ?? "all";
  const currentPayment = table.state.filters.paymentStatus ?? "all";
  const activeTab = (() => {
    if (currentStatus === "DELIVERED" && currentPayment === "UNPAID") {
      return "DELIVERED_UNPAID";
    }
    if (currentStatus === "DELIVERED" && currentPayment === "PAID") {
      return "COMPLETED";
    }
    return currentStatus;
  })();

  const handleTabChange = (val: string) => {
    const { onFilterChange } = table.bind(page, isFetching);
    if (val === "DELIVERED_UNPAID") {
      onFilterChange("status", "DELIVERED");
      onFilterChange("paymentStatus", "UNPAID");
    } else if (val === "COMPLETED") {
      onFilterChange("status", "DELIVERED");
      onFilterChange("paymentStatus", "PAID");
    } else {
      onFilterChange("status", val);
      onFilterChange("paymentStatus", "all");
    }
  };

  return (
    <>
      {fromTeam && (
        <div className="mb-4">
          <BackLink to={ROUTES.dispatchTeams} label="Nhóm điều phối" />
        </div>
      )}
      <OrderStatusChips
        value={activeTab}
        onChange={handleTabChange}
        counts={statusCounts}
        unpaidDeliveredCount={unpaidCounts?.delivered}
        completedCount={paidCounts?.delivered}
      />
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        searchPlaceholder="Tìm theo mã đơn, mã vận đơn, khách hàng, người nhận, SĐT..."
        enableMobileCard
        renderMobileCard={(o, helpers) => (
          <OrderMobileCard
            order={o}
            helpers={helpers}
            onDeliver={(order) => setPending({ order, next: "DELIVERED" })}
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
