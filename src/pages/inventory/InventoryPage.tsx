import { useState } from "react";
import { useLocation } from "wouter";
import {
  AlertTriangle,
  ArrowDownUp,
  Boxes,
  ClipboardCheck,
  ExternalLink,
  PackageX,
} from "lucide-react";
import {
  type Column,
  type RowAction,
  DataTable,
  StatsCard,
  type TableFilterDef,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { StatusPill } from "@/components/common/ui-bits";
import { PRODUCT_SOURCE } from "@/features/product";
import { ROUTES } from "@/config/routes";
import {
  type InventoryItem,
  type InventoryListParams,
  STOCK_STATUS,
  type StockStatus,
  useInventory,
  useInventoryStats,
} from "@/features/inventory";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { InventoryMobileCard } from "./components/InventoryMobileCard";
import { StockAdjustDialog } from "./components/StockAdjustDialog";
import { PendingMovementsTable } from "./components/PendingMovementsTable";
import { StockMovementTable } from "./components/StockMovementTable";

const nf = new Intl.NumberFormat("vi-VN");

const stockFilter: TableFilterDef = {
  key: "stockStatus",
  label: "Tồn kho",
  options: (Object.keys(STOCK_STATUS) as StockStatus[]).map((s) => ({
    label: STOCK_STATUS[s].label,
    value: s,
  })),
};

function StockTable({ onAdjust }: { onAdjust: (item: InventoryItem) => void }) {
  const [, navigate] = useLocation();
  const shopFilter = useShopFilter();
  const isMobile = useIsMobile();
  const table = useTableParams<
    Pick<InventoryListParams, "stockStatus"> & { shopId: string }
  >({
    stockStatus: "all",
    shopId: shopFilter.initialShopId,
  });
  const { data: page, isFetching } = useInventory(table.params);

  const columns: Column<InventoryItem>[] = [
    {
      key: "name",
      label: "Sản phẩm",
      mobilePriority: "primary",
      render: (_, p) => (
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={p.images[0] || placeholder}
            alt=""
            className="h-10 w-10 shrink-0 rounded-md border object-cover"
          />
          <div className="min-w-0">
            <div className="truncate font-medium">{p.name}</div>
            <div className="font-mono text-xs text-muted-foreground">
              {p.sku}
            </div>
          </div>
        </div>
      ),
    },
    ...shopFilter.column<InventoryItem>(),
    { key: "category", label: "Nhóm sản phẩm" },
    {
      key: "source",
      label: "Nguồn",
      render: (_, p) => (
        <div className="flex flex-col items-start gap-1">
          <StatusPill {...PRODUCT_SOURCE[p.source ?? "self"]} />
          {!!p.pendingCount && (
            <span className="text-xs text-amber-700">
              {p.pendingCount} chờ duyệt
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Tồn kho",
      mobilePriority: "secondary",
      render: (_, p) => (
        <div className="whitespace-nowrap">
          <span className="text-base font-semibold">{nf.format(p.stock)}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">
            / cảnh báo ≤ {p.lowStockThreshold}
          </span>
        </div>
      ),
    },
    {
      key: "stockStatus",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (v) => <StatusPill {...STOCK_STATUS[v as StockStatus]} />,
    },
  ];

  const actions: RowAction<InventoryItem>[] = [
    {
      key: "adjust",
      label: "Nhập / Xuất kho",
      icon: ArrowDownUp,
      onClick: onAdjust,
    },
    {
      key: "product",
      label: "Xem sản phẩm",
      icon: ExternalLink,
      onClick: (p) => navigate(ROUTES.productDetail(p.id)),
    },
  ];

  return (
    <DataTable
      {...table.bind(page, isFetching)}
      columns={columns}
      filters={
        shopFilter.filter ? [shopFilter.filter, stockFilter] : [stockFilter]
      }
      searchPlaceholder="Tìm theo tên, mã sản phẩm..."
      enableMobileCard
      renderMobileCard={(p, helpers) => (
        <InventoryMobileCard
          item={p}
          showShop={shopFilter.isRoot}
          onAdjust={() => onAdjust(p)}
          onProduct={() => navigate(ROUTES.productDetail(p.id))}
          helpers={helpers}
        />
      )}
      columnToggleable={!isMobile}
      downloadable={!isMobile}
      // "Xem chi tiết" = the product's stock history
      onView={(p) => navigate(ROUTES.inventoryHistory(p.id))}
      rowActions={actions}
    />
  );
}

export default function InventoryPage() {
  const { data: stats } = useInventoryStats();
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);

  const statItems = [
    { title: "Chờ duyệt nhập/xuất", short: "Chờ duyệt", value: stats?.pending ?? "—", icon: ClipboardCheck, tone: "text-sky-600" },
    { title: "Tổng tồn kho", short: "Tổng tồn", value: stats ? nf.format(stats.units) : "—", icon: Boxes, tone: "text-primary" },
    { title: "Sắp hết hàng", short: "Sắp hết", value: stats?.low ?? "—", icon: AlertTriangle, tone: "text-amber-600" },
    { title: "Hết hàng", short: "Hết hàng", value: stats?.out ?? "—", icon: PackageX, tone: "text-destructive" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Mobile: one compact row instead of four stacked cards */}
      <div className="grid grid-cols-4 divide-x rounded-xl border bg-card md:hidden">
        {statItems.map((it) => (
          <div key={it.title} className="flex flex-col items-center gap-1 px-1 py-3">
            <it.icon className={`h-4 w-4 ${it.tone}`} />
            <span className="text-lg font-bold leading-none tabular-nums">{it.value}</span>
            <span className="text-center text-[11px] leading-tight text-muted-foreground">{it.short}</span>
          </div>
        ))}
      </div>
      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {statItems.map((it) => (
          <StatsCard key={it.title} title={it.title} value={it.value} icon={it.icon} />
        ))}
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:inline-flex md:w-auto">
          <TabsTrigger value="stock">Tồn kho</TabsTrigger>
          <TabsTrigger value="pending" className="gap-1.5">
            Chờ duyệt
            {!!stats?.pending && (
              <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white">
                {stats.pending}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            Lịch sử<span className="max-md:hidden">&nbsp;nhập xuất</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-0">
          <StockTable onAdjust={setAdjusting} />
        </TabsContent>
        <TabsContent value="pending" className="mt-0">
          <PendingMovementsTable />
        </TabsContent>
        <TabsContent value="history" className="mt-0">
          <StockMovementTable />
        </TabsContent>
      </Tabs>

      <StockAdjustDialog
        item={adjusting}
        onOpenChange={(o) => !o && setAdjusting(null)}
      />
    </div>
  );
}
