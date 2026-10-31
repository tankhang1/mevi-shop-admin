import { Link } from "wouter";
import { History, Layers, Package, Sprout } from "lucide-react";
import { Button, Card } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { STOCK_STATUS, stockStatusOf } from "@/features/inventory";
import { BASE_UNIT, type Product } from "@/features/product";

const nf = new Intl.NumberFormat("vi-VN");

/** "Tồn kho hiện tại" tab: total stock, then per quy cách and per vườn (nông sản) */
export function ProductStockCard({ product: p }: { product: Product }) {
  const variantStock = Object.entries(p.variantStock ?? {});
  const unit = p.baseUnit ? BASE_UNIT[p.baseUnit] : "";
  const gardens = (p.sources ?? []).filter((s) => p.gardenStock?.[s.regionId] !== undefined);
  const threshold = (name: string) => p.variantThresholds?.[name] ?? p.lowStockThreshold;

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">Tổng hàng tồn</div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">{nf.format(p.stock)}</span>
            <StatusPill {...STOCK_STATUS[stockStatusOf(p)]} />
          </div>
          <div className="text-xs text-muted-foreground">Cảnh báo khi ≤ {p.lowStockThreshold}</div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.inventoryHistory(p.id)}>
            <History className="mr-1.5 h-4 w-4" /> Quản lý kho
          </Link>
        </Button>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {variantStock.length > 0 && (
          <Card className="p-4 sm:p-5">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Layers className="h-4 w-4 text-muted-foreground" /> Theo quy cách
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {variantStock.map(([name, qty]) => {
                const low = qty <= threshold(name);
                return (
                  <div key={name} className="rounded-lg border bg-muted/30 p-3">
                    <div className="truncate text-xs text-muted-foreground">{name}</div>
                    <div className={`text-lg font-semibold tabular-nums ${qty === 0 ? "text-red-600" : low ? "text-amber-700" : ""}`}>
                      {nf.format(qty)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {gardens.length > 0 && (
          <Card className="p-4 sm:p-5">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Sprout className="h-4 w-4 text-muted-foreground" /> Theo vườn canh tác
            </h4>
            <ul className="space-y-2">
              {gardens.map((s) => (
                <li key={s.regionId} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{s.regionName ?? `Vườn #${s.regionId}`}</div>
                    {s.farmName && <div className="truncate text-xs text-muted-foreground">{s.farmName}</div>}
                  </div>
                  <span className="shrink-0 text-lg font-semibold tabular-nums">
                    {nf.format(p.gardenStock?.[s.regionId] ?? 0)}{" "}
                    <span className="text-xs font-normal text-muted-foreground">{unit}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
