import { useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, ArrowDownUp, Boxes, History, Package, PackageX } from "lucide-react";
import {
  type Column,
  Button,
  DataTable,
  StatsCard,
  type TableFilterDef,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { StatusPill } from "@/components/common/ui-bits";
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
import { StockAdjustDialog } from "./components/StockAdjustDialog";
import { StockMovementTable } from "./components/StockMovementTable";

const nf = new Intl.NumberFormat("vi-VN");

const stockFilter: TableFilterDef = {
  key: "stockStatus",
  label: "Tồn kho",
  options: (Object.keys(STOCK_STATUS) as StockStatus[]).map((s) => ({ label: STOCK_STATUS[s].label, value: s })),
};

function StockTable({ onAdjust }: { onAdjust: (item: InventoryItem) => void }) {
  const [, navigate] = useLocation();
  const shopFilter = useShopFilter();
  const table = useTableParams<Pick<InventoryListParams, "stockStatus"> & { shopId: string }>({
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
          <img src={p.images[0] || placeholder} alt="" className="h-10 w-10 shrink-0 rounded-md border object-cover" />
          <div className="min-w-0">
            <div className="truncate font-medium">{p.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{p.sku}</div>
          </div>
        </div>
      ),
    },
    ...shopFilter.column<InventoryItem>(),
    { key: "category", label: "Danh mục" },
    {
      key: "stock",
      label: "Tồn kho",
      mobilePriority: "secondary",
      render: (_, p) => (
        <div className="whitespace-nowrap">
          <span className="text-base font-semibold">{nf.format(p.stock)}</span>
          <span className="ml-1.5 text-xs text-muted-foreground">/ cảnh báo ≤ {p.lowStockThreshold}</span>
        </div>
      ),
    },
    {
      key: "stockStatus",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (v) => <StatusPill {...STOCK_STATUS[v as StockStatus]} />,
    },
    {
      key: "id",
      label: "",
      width: "200px",
      render: (_, p) => (
        // Stop clicks reaching the table row, which would otherwise open the history page
        <span className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={() => onAdjust(p)}>
            <ArrowDownUp className="mr-1.5 h-3.5 w-3.5" /> Nhập / Xuất
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.inventoryHistory(p.id))}>
            <History className="mr-1.5 h-3.5 w-3.5" /> Lịch sử
          </Button>
        </span>
      ),
    },
  ];

  return (
    <DataTable
      {...table.bind(page, isFetching)}
      columns={columns}
      filters={shopFilter.filter ? [shopFilter.filter, stockFilter] : [stockFilter]}
      searchPlaceholder="Tìm theo tên, SKU..."
      enableMobileCard
      onView={(p) => navigate(ROUTES.inventoryHistory(p.id))}
    />
  );
}

export default function InventoryPage() {
  const { data: stats } = useInventoryStats();
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Sản phẩm" value={stats ? nf.format(stats.products) : "—"} icon={Package} />
        <StatsCard title="Tổng tồn kho" value={stats ? nf.format(stats.units) : "—"} icon={Boxes} />
        <StatsCard title="Sắp hết hàng" value={stats?.low ?? "—"} icon={AlertTriangle} />
        <StatsCard title="Hết hàng" value={stats?.out ?? "—"} icon={PackageX} />
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Tồn kho</TabsTrigger>
          <TabsTrigger value="history">Lịch sử nhập xuất</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="mt-0">
          <StockTable onAdjust={setAdjusting} />
        </TabsContent>
        <TabsContent value="history" className="mt-0">
          <StockMovementTable />
        </TabsContent>
      </Tabs>

      <StockAdjustDialog item={adjusting} onOpenChange={(o) => !o && setAdjusting(null)} />
    </div>
  );
}
