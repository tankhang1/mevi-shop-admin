import {
  type Column,
  DataTable,
  type TableFilterDef,
  cn,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import {
  MOVEMENT_SOURCE,
  MOVEMENT_STATUS,
  MOVEMENT_TYPE,
  type MovementListParams,
  type MovementType,
  type StockMovement,
  useStockMovements,
} from "@/features/inventory";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";

const dt = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

const typeFilter: TableFilterDef = {
  key: "type",
  label: "Loại",
  options: (Object.keys(MOVEMENT_TYPE) as MovementType[]).map((t) => ({
    label: MOVEMENT_TYPE[t].label,
    value: t,
  })),
};

/** Nhập / xuất / kiểm kê history, newest first. With `productId` it shows one product's movements. */
export function StockMovementTable({ productId }: { productId?: string }) {
  const isMobile = useIsMobile();
  const shopFilter = useShopFilter();
  const table = useTableParams<
    Pick<MovementListParams, "type"> & { shopId: string }
  >({
    type: "all",
    shopId: shopFilter.initialShopId,
  });
  const { data: page, isFetching } = useStockMovements({
    ...table.params,
    productId,
  });

  const columns: Column<StockMovement>[] = [
    {
      key: "createdAt",
      label: "Thời gian",
      mobilePriority: "secondary",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">
          {dt.format(new Date(String(v)))}
        </span>
      ),
    },
    ...(productId
      ? []
      : ([
          {
            key: "productName",
            label: "Sản phẩm",
            mobilePriority: "primary",
            render: (_, m) => (
              <div className="min-w-0">
                <div className="truncate font-medium">{m.productName}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {m.sku}
                </div>
              </div>
            ),
          },
          ...shopFilter.column<StockMovement>(),
        ] satisfies Column<StockMovement>[])),
    {
      key: "type",
      label: "Loại",
      mobilePriority: "badge",
      render: (v) => <StatusPill {...MOVEMENT_TYPE[v as MovementType]} />,
    },
    {
      key: "source",
      label: "Nguồn",
      render: (_, m) =>
        m.orderCode ? (
          <span className="whitespace-nowrap font-mono text-xs">
            {m.orderCode}
          </span>
        ) : (
          <span className="whitespace-nowrap text-sm">
            {m.source ? MOVEMENT_SOURCE[m.source] : "—"}
          </span>
        ),
    },
    {
      key: "status",
      label: "Duyệt",
      render: (_, m) => (
        <div>
          <StatusPill {...MOVEMENT_STATUS[m.status]} />
          {m.rejectionReason && (
            <div
              className="mt-0.5 max-w-40 truncate text-xs text-destructive"
              title={m.rejectionReason}
            >
              {m.rejectionReason}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "delta",
      label: "Thay đổi",
      render: (_, m) => (
        <div className="whitespace-nowrap">
          <span
            className={cn(
              "font-semibold",
              m.delta > 0 ? "text-emerald-700" : "text-red-600",
            )}
          >
            {m.delta > 0 ? `+${m.delta}` : m.delta}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            {m.before} → {m.after}
          </span>
        </div>
      ),
    },
    {
      key: "note",
      label: "Ghi chú",
      render: (v) => (
        <span className="text-sm text-muted-foreground">
          {String(v ?? "—")}
        </span>
      ),
    },
    {
      key: "createdBy",
      label: "Người thực hiện",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">{String(v)}</span>
      ),
    },
  ];

  return (
    <DataTable
      {...table.bind(page, isFetching)}
      columns={columns}
      filters={
        shopFilter.filter && !productId
          ? [shopFilter.filter, typeFilter]
          : [typeFilter]
      }
      searchPlaceholder={
        productId ? "Tìm theo ghi chú..." : "Tìm theo sản phẩm, SKU, ghi chú..."
      }
      enableMobileCard
      columnToggleable={!isMobile}
      downloadable={!isMobile}
    />
  );
}
