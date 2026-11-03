import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowDownToLine,
  BellRing,
  CalendarCheck,
  ClipboardCheck,
  Clock,
  ExternalLink,
  History,
  PackageX,
} from "lucide-react";
import {
  type Column,
  type RowAction,
  Button,
  DataTable,
  StatsCard,
  type TableFilterDef,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { MockBadge } from "@/components/common/MockBadge";
import { StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useAccess } from "@/features/auth";
import {
  type InventoryRow,
  STOCK_STATUS_STYLE,
  type StockStatus,
  useCatalogInventory,
  useInventorySummary,
  SELL_UNIT_SHORT,
  useCategories,
  useStockMovementCounts,
  stockItemLabel,
} from "@/features/shop-catalog";
import { useTableParams } from "@/hooks/useTableParams";
import { cleanFilters, fromSpringPage, toSpringPageParams } from "@/lib/pagination";
import { usePageActions } from "@/app/layouts/page-header.store";
import { LowStockThresholdDialog } from "@/pages/product/components/LowStockThresholdDialog";
import { CatalogStockMovementTable } from "./components/CatalogStockMovementTable";
import { ImportPickDialog } from "./components/ImportPickDialog";
import { InventoryMobileCard } from "./components/InventoryMobileCard";
import { StockReceiptDialog } from "./components/StockReceiptDialog";
import { SupplyRequestsTable } from "./components/SupplyRequestsTable";

const nf = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 });

/** Row target for the per-row dialogs */
/** variantId null = đơn vị tính row */
type RowRef = { productId: number; variantId: number | null };

const rowKey = (r: InventoryRow) => `${r.product.id}:${r.variant?.id ?? "unit"}`;

/** "Hàng tồn" — GET /inventory (§2.9), one row per quy cách + one đơn vị tính row per product with baseUnit */
function StockTable({ onAdjust, onAlert }: { onAdjust: (r: RowRef) => void; onAlert: (r: RowRef) => void }) {
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { data: categories } = useCategories();
  const table = useTableParams<{ stockStatus: string; categoryId: string }>({ stockStatus: "all", categoryId: "all" });
  const { page, size, keyword, ...f } = table.params;
  const c = cleanFilters(f);
  const { data, isFetching } = useCatalogInventory(
    toSpringPageParams({
      page,
      size,
      keyword,
      stockStatus: c.stockStatus as StockStatus | undefined,
      categoryId: c.categoryId ? Number(c.categoryId) : undefined,
    }),
  );
  // DataTable needs a unique `id` per row; a product has several quy cách
  const rows = data && { ...data, content: data.content.map((r) => ({ ...r, id: rowKey(r) })) };
  // Quy cách rows don't carry the unit; take it from the product's đơn vị tính row on this page
  const unitOf = (r: InventoryRow) => {
    const u = data?.content.find((x) => x.unit && x.product.id === r.product.id)?.unit?.unit;
    return u ? SELL_UNIT_SHORT[u] : "đv";
  };
  const ref = (r: InventoryRow): RowRef => ({ productId: r.product.id, variantId: r.variant?.id ?? null });

  const filters: TableFilterDef[] = [
    {
      key: "stockStatus",
      label: "Hàng tồn",
      options: (Object.keys(STOCK_STATUS_STYLE) as StockStatus[]).map((s) => ({ label: STOCK_STATUS_STYLE[s].label, value: s })),
    },
    { key: "categoryId", label: "Nhóm sản phẩm", options: (categories ?? []).map((x) => ({ label: x.name, value: String(x.id) })) },
  ];

  const columns: Column<InventoryRow>[] = [
    {
      key: "product",
      label: "Sản phẩm",
      mobilePriority: "primary",
      render: (_, r) => (
        <div className="flex min-w-0 items-center gap-3">
          <img src={r.product.thumbnailUrl || placeholder} alt="" className="h-10 w-10 shrink-0 rounded-md border object-cover" />
          <div className="min-w-0">
            <Link
              href={ROUTES.productDetail(String(r.product.id))}
              onClick={(e) => e.stopPropagation()}
              className="block truncate font-medium text-primary hover:underline"
            >
              {r.product.title}
            </Link>
            <div className="font-mono text-xs text-muted-foreground">{r.product.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: "variant",
      label: "Quy cách / ĐVT",
      render: (_, r) => (
        <div className="whitespace-nowrap">
          <div className="flex items-center gap-1.5 font-medium">
            {stockItemLabel(r)}
            {r.unit && <span className="rounded bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">ĐVT</span>}
            {r.variant?.unitQuantity != null && (
              <span className="text-xs font-normal text-muted-foreground">= {nf.format(r.variant.unitQuantity)} {unitOf(r)}</span>
            )}
          </div>
          <div className="font-mono text-xs text-muted-foreground">{r.variant?.sku ?? r.unit?.sku}</div>
        </div>
      ),
    },
    { key: "category", label: "Nhóm sản phẩm", render: (_, r) => r.category?.name ?? "—" },
    {
      key: "inventoryQuantity",
      label: "Số lượng",
      mobilePriority: "secondary",
      render: (_, r) => (
        <div className="whitespace-nowrap">
          <span className="text-base font-semibold tabular-nums">{nf.format(r.inventoryQuantity)}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">
            {r.lowStockThreshold != null ? `/ cảnh báo ≤ ${nf.format(r.lowStockThreshold)}` : "/ chưa đặt cảnh báo"}
          </span>
          {/* Quy cách có quy đổi: can still sell from the đơn vị tính stock */}
          {r.variant && r.variant.availableQuantity !== r.inventoryQuantity && (
            <div className="text-xs text-emerald-700">Khả dụng {nf.format(r.variant.availableQuantity)} (gồm quy đổi)</div>
          )}
        </div>
      ),
    },
    {
      key: "stockStatus",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (_, r) => <StatusPill {...STOCK_STATUS_STYLE[r.stockStatus]} />,
    },
  ];

  const actions: RowAction<InventoryRow>[] = [
    { key: "import", label: "Nhập hàng", icon: ArrowDownToLine, onClick: (r) => onAdjust(ref(r)) },
    { key: "alert", label: "Cảnh báo hàng tồn", icon: BellRing, onClick: (r) => onAlert(ref(r)) },
    { key: "history", label: "Lịch sử", icon: History, onClick: (r) => navigate(ROUTES.inventoryHistory(String(r.product.id))) },
    { key: "product", label: "Xem sản phẩm", icon: ExternalLink, onClick: (r) => navigate(ROUTES.productDetail(String(r.product.id))) },
  ];

  return (
    <DataTable
      {...table.bind(fromSpringPage(rows), isFetching)}
      columns={columns}
      filters={filters}
      searchPlaceholder="Tìm theo tên, mã sản phẩm, quy cách, SKU..."
      enableMobileCard
      renderMobileCard={(r) => (
        <InventoryMobileCard
          item={r}
          onAdjust={() => onAdjust(ref(r))}
          onAlert={() => onAlert(ref(r))}
          onHistory={() => navigate(ROUTES.inventoryHistory(String(r.product.id)))}
          onProduct={() => navigate(ROUTES.productDetail(String(r.product.id)))}
        />
      )}
      columnToggleable={!isMobile}
      downloadable={!isMobile}
      rowActions={actions}
    />
  );
}

export default function InventoryPage() {
  const { data: summary } = useInventorySummary();
  // Tab badge only — FARM phiếu chờ duyệt
  const { data: farmCounts } = useStockMovementCounts({ source: "FARM" });
  // Quy cách + đơn vị tính rows
  const sum = (k: "lowStock" | "outOfStock") => (summary ? nf.format(summary.variants[k] + summary.units[k]) : "—");
  const { isShopAdmin, isRoot } = useAccess();
  const canReviewSupply = isShopAdmin || isRoot;
  const [picking, setPicking] = useState(false);
  const [stocking, setStocking] = useState<Partial<RowRef> | null>(null);
  const [alerting, setAlerting] = useState<RowRef | null>(null);

  usePageActions(() => (
    <Button onClick={() => setPicking(true)}>
      <ArrowDownToLine className="mr-1.5 h-4 w-4" />
      {/* One flex child: Button's gap would otherwise add space between the parts */}
      <span>Nhập hàng</span>
    </Button>
  ));

  // Row 1: hàng tồn alerts; row 2: đề xuất cung ứng from nông hộ
  const statRows: { title: string; short: string; value: string | number; icon: typeof Clock; tone: string; mock?: boolean }[][] = [
    [
      { title: "Hàng sắp hết", short: "Sắp hết", value: sum("lowStock"), icon: AlertTriangle, tone: "text-amber-600" },
      { title: "Hàng đã hết", short: "Hết hàng", value: sum("outOfStock"), icon: PackageX, tone: "text-destructive" },
    ],
    [
      {
        title: "Phiếu đã duyệt",
        short: "Đã duyệt",
        value: summary ? nf.format(summary.movements.approved) : "—",
        icon: ClipboardCheck,
        tone: "text-primary",
      },
      {
        title: "Phiếu duyệt trong ngày",
        short: "Hôm nay",
        value: summary ? nf.format(summary.movements.approvedToday) : "—",
        icon: CalendarCheck,
        tone: "text-emerald-600",
      },
      { title: "Phiếu chờ duyệt", short: "Chờ duyệt", value: summary ? nf.format(summary.movements.pending) : "—", icon: Clock, tone: "text-sky-600" },
    ],
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {statRows.map((row, r) => (
        <div key={r} className="space-y-4">
          {/* Mobile: one compact strip per row instead of stacked cards */}
          <div className={cn("grid divide-x rounded-xl border bg-card md:hidden!", row.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
            {row.map((it) => (
              <div key={it.title} className="flex flex-col items-center gap-1 px-1 py-3">
                <span className="flex items-center gap-1">
                  <it.icon className={`h-4 w-4 ${it.tone}`} />
                  {it.mock && <MockBadge className="px-0.5 [&>svg]:hidden" />}
                </span>
                <span className="text-lg font-bold leading-none tabular-nums">{it.value}</span>
                <span className="text-center text-[11px] leading-tight text-muted-foreground">{it.short}</span>
              </div>
            ))}
          </div>
          <div className={cn("hidden gap-4 md:grid!", row.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
            {row.map((it) => (
              <div key={it.title} className="relative">
                <StatsCard title={it.title} value={it.value} icon={it.icon} />
                {it.mock && <MockBadge className="absolute right-3 top-3" />}
              </div>
            ))}
          </div>
        </div>
      ))}

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className={cn("grid w-full md:inline-flex md:w-auto", canReviewSupply ? "grid-cols-3" : "grid-cols-2")}>
          <TabsTrigger value="history">
            Lịch sử<span className="max-md:hidden">&nbsp;hàng</span>
          </TabsTrigger>
          {canReviewSupply && (
            <TabsTrigger value="supply-requests" className="gap-1.5">
              Yêu cầu cung ứng
              {!!farmCounts?.pending && (
                <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white">{farmCounts.pending}</span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="stock">Hàng tồn</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-0">
          <StockTable onAdjust={setStocking} onAlert={setAlerting} />
        </TabsContent>
        {canReviewSupply && (
          <TabsContent value="supply-requests" className="mt-0">
            <SupplyRequestsTable />
          </TabsContent>
        )}
        <TabsContent value="history" className="mt-0">
          <CatalogStockMovementTable />
        </TabsContent>
      </Tabs>

      <ImportPickDialog
        open={picking}
        onOpenChange={setPicking}
        onPick={(productId) => {
          setPicking(false);
          setStocking({ productId });
        }}
      />
      <StockReceiptDialog
        productId={stocking?.productId ?? null}
        variantId={stocking?.variantId}
        onOpenChange={(o) => !o && setStocking(null)}
      />
      <LowStockThresholdDialog
        productId={alerting?.productId ?? null}
        focusVariantId={alerting?.variantId}
        onOpenChange={(o) => !o && setAlerting(null)}
      />
    </div>
  );
}
