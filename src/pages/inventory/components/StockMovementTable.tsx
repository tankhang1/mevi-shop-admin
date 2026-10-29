import {
  type Column,
  DataTable,
  type TableFilterDef,
  cn,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  MOVEMENT_SOURCE,
  MOVEMENT_TYPE,
  type MovementListParams,
  type MovementType,
  type StockMovement,
  useStockMovements,
} from "@/features/inventory";
import { useShopFilter } from "@/features/shop";
import { StatusPill } from "@/components/common/ui-bits";
import { useTableParams } from "@/hooks/useTableParams";
import { formatVnd } from "@/lib/format";

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

const statusFilter: TableFilterDef = {
  key: "status",
  label: "Trạng thái",
  options: [
    { label: "Đã duyệt", value: "approved" },
    { label: "Từ chối", value: "rejected" },
  ],
};

/** Reviewed nhập hàng / bán history (đã duyệt + từ chối), newest first. With `productId` it shows one product's movements. */
export function StockMovementTable({ productId }: { productId?: string }) {
  const isMobile = useIsMobile();
  const shopFilter = useShopFilter();
  const table = useTableParams<
    Pick<MovementListParams, "type" | "status"> & { shopId: string }
  >({
    type: "all",
    status: "all",
    shopId: shopFilter.initialShopId,
  });
  const { data: page, isFetching } = useStockMovements({
    ...table.params,
    // Pending imports live in "Chờ duyệt nhập hàng"
    status:
      !table.params.status || table.params.status === "all"
        ? "closed"
        : table.params.status,
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
        ] satisfies Column<StockMovement>[])),
    {
      key: "variant",
      label: "Quy cách",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">{String(v ?? "—")}</span>
      ),
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
          <div className="text-sm">
            <div className="whitespace-nowrap font-medium">
              {m.regionName
                ? `${m.regionName}${m.farmName ? ` · ${m.farmName}` : ""}`
                : (m.farmName ?? (m.source ? MOVEMENT_SOURCE[m.source] : "—"))}
            </div>
            {!!m.importPrice && (
              <div className="whitespace-nowrap text-xs text-muted-foreground">
                Giá nhập {formatVnd(m.importPrice)}{" "}
                {m.unit ? `/ ${m.unit}` : ""}
              </div>
            )}
          </div>
        ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_, m) => (
        <div>
          <StatusPill
            label={m.status === "rejected" ? "Từ chối" : "Đã duyệt"}
            className={
              m.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-emerald-100 text-emerald-800"
            }
          />
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
            {m.delta > 0 ? `+${m.delta}` : m.delta} {m.unit ?? ""}
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
    {
      key: "reviewedBy",
      label: "Người duyệt",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">{v ? String(v) : "-"}</span>
      ),
    },
  ];

  return (
    <DataTable
      {...table.bind(page, isFetching)}
      columns={columns}
      filters={
        shopFilter.filter && !productId
          ? [shopFilter.filter, typeFilter, statusFilter]
          : [typeFilter, statusFilter]
      }
      searchPlaceholder={
        productId ? "Tìm theo ghi chú..." : "Tìm theo sản phẩm, mã, ghi chú..."
      }
      enableMobileCard
      columnToggleable={!isMobile}
      downloadable={!isMobile}
    />
  );
}
