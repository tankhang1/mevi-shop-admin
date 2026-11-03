import { type Column, DataTable, type TableFilterDef, cn, useIsMobile } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import {
  MOVEMENT_STATUS_STYLE,
  MOVEMENT_TYPE_STYLE,
  type StockMovement,
  type StockMovementListParams,
  type StockMovementSource,
  type StockMovementStatus,
  type StockMovementType,
  useCatalogStockMovements,
  stockItemLabel,
  SELL_UNIT_SHORT,
} from "@/features/shop-catalog";
import { useTableParams } from "@/hooks/useTableParams";
import { cleanFilters, fromSpringPage, toSpringPageParams } from "@/lib/pagination";
import { formatVnd } from "@/lib/format";
import { MovementStatusCell } from "./movement-bits";
import { formatVnDateTime, movementSourceLabel, userName } from "./movement-format";

type Filters = { status: string; type: string; source: string };

const filterDefs = (lockType: boolean): TableFilterDef[] => [
  ...(lockType
    ? []
    : [
        {
          key: "type",
          label: "Loại",
          options: (Object.keys(MOVEMENT_TYPE_STYLE) as StockMovementType[]).map((t) => ({
            label: MOVEMENT_TYPE_STYLE[t].label,
            value: t,
          })),
        },
      ]),
  {
    key: "source",
    label: "Nguồn",
    options: [
      { label: "Mevi", value: "MEVI" },
      { label: "Nông hộ", value: "FARM" },
    ],
  },
  {
    key: "status",
    label: "Trạng thái",
    options: (Object.keys(MOVEMENT_STATUS_STYLE) as StockMovementStatus[]).map((s) => ({
      label: MOVEMENT_STATUS_STYLE[s].label,
      value: s,
    })),
  },
];

/**
 * "Lịch sử tồn kho" (GET /stock-movements, §2.5.4), newest first.
 * `productId` scopes it to one product (hides the product column); `type` locks the movement kind.
 */
export function CatalogStockMovementTable({ productId, type }: { productId?: number; type?: StockMovementType }) {
  const isMobile = useIsMobile();
  const table = useTableParams<Filters>({ status: "all", type: "all", source: "all" });
  const { page, size, keyword, ...f } = table.params;
  const c = cleanFilters(f);
  const params: StockMovementListParams = toSpringPageParams({
    page,
    size,
    keyword,
    productId,
    type: type ?? (c.type as StockMovementType | undefined),
    source: c.source as StockMovementSource | undefined,
    status: c.status as StockMovementStatus | undefined,
  });
  const { data, isFetching } = useCatalogStockMovements(params);

  const columns: Column<StockMovement>[] = [
    {
      key: "createdAt",
      label: "Thời gian",
      mobilePriority: "secondary",
      render: (_, m) => (
        <div className="whitespace-nowrap text-sm">
          <div>{formatVnDateTime(m.createdAt)}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{m.code}</div>
        </div>
      ),
    },
    ...(productId
      ? []
      : ([
          {
            key: "product",
            label: "Sản phẩm",
            mobilePriority: "primary",
            render: (_, m) => (
              <div className="min-w-0">
                <div className="truncate font-medium">{m.product.title}</div>
                <div className="font-mono text-xs text-muted-foreground">{m.product.code}</div>
              </div>
            ),
          },
        ] satisfies Column<StockMovement>[])),
    {
      key: "variant",
      label: "Quy cách",
      render: (_, m) => (
        <div className="whitespace-nowrap text-sm">
          {stockItemLabel(m)}
          {m.variant && m.variant.id == null && <span className="ml-1 text-xs text-muted-foreground">(đã xoá)</span>}
        </div>
      ),
    },
    {
      key: "source",
      label: "Nguồn",
      render: (_, m) => (
        <div className="text-sm">
          <div className="flex items-center gap-1.5 whitespace-nowrap font-medium">
            {m.type === "ADJUSTMENT" ? <StatusPill {...MOVEMENT_TYPE_STYLE.ADJUSTMENT} /> : movementSourceLabel(m)}
          </div>
          {m.unitCost != null && (
            <div className="whitespace-nowrap text-xs text-muted-foreground">Giá nhập {formatVnd(m.unitCost)}</div>
          )}
        </div>
      ),
    },
    { key: "status", label: "Trạng thái", mobilePriority: "badge", render: (_, m) => <MovementStatusCell m={m} /> },
    {
      key: "quantity",
      label: "Thay đổi",
      render: (_, m) => (
        <span
          className={cn(
            "whitespace-nowrap font-semibold tabular-nums",
            m.status !== "APPROVED" && "opacity-60",
            m.quantity > 0 ? "text-emerald-700" : "text-red-600",
          )}
        >
          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
          {m.baseUnit && <span className="ml-0.5 text-xs font-normal">{SELL_UNIT_SHORT[m.baseUnit]}</span>}
        </span>
      ),
    },
    {
      key: "note",
      label: "Ghi chú",
      render: (v) => <span className="text-sm text-muted-foreground">{v ? String(v) : "—"}</span>,
    },
    {
      key: "createdBy",
      label: "Người thực hiện",
      render: (_, m) => (
        <span className="whitespace-nowrap text-sm">
          {userName(m.createdBy)}
          {m.channel === "FARM" && <span className="ml-1 text-xs text-muted-foreground">(nông hộ)</span>}
        </span>
      ),
    },
    {
      key: "reviewedBy",
      label: "Người duyệt",
      render: (_, m) => <span className="whitespace-nowrap text-sm">{m.reviewedBy ? userName(m.reviewedBy) : "—"}</span>,
    },
  ];

  return (
    <DataTable
      {...table.bind(fromSpringPage(data), isFetching)}
      columns={columns}
      filters={filterDefs(!!type)}
      searchPlaceholder="Tìm theo mã phiếu, sản phẩm, SKU, vườn, nông hộ..."
      enableMobileCard
      columnToggleable={!isMobile}
      downloadable={!isMobile}
    />
  );
}
