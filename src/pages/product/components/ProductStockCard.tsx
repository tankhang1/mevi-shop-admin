import { useState } from "react";
import { BellRing, Layers, Package } from "lucide-react";
import { Button, Card } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import type { CatalogProduct } from "@/features/shop-catalog";
import { LowStockThresholdDialog } from "./LowStockThresholdDialog";

const nf = new Intl.NumberFormat("vi-VN");

const STOCK_PILL = {
  out: { label: "Hết hàng", className: "bg-red-100 text-red-700" },
  low: { label: "Sắp hết", className: "bg-amber-100 text-amber-800" },
  in: { label: "Còn hàng", className: "bg-emerald-100 text-emerald-800" },
};
const stockOf = (qty: number, low: boolean) => (qty === 0 ? "out" : low ? "low" : "in");

/** "Tồn kho hiện tại" tab: total, per quy cách with its warning threshold */
export function ProductStockCard({ product: p }: { product: CatalogProduct }) {
  const [editing, setEditing] = useState(false);
  const total = p.variants.reduce((s, v) => s + v.inventoryQuantity, 0);
  const anyLow = p.variants.some((v) => v.lowStock);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">Tổng hàng tồn</div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">{nf.format(total)}</span>
            <StatusPill {...STOCK_PILL[stockOf(total, anyLow)]} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <BellRing className="mr-1.5 h-4 w-4" /> Cảnh báo hàng tồn
        </Button>
      </Card>

      <Card className="p-4 sm:p-5">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Layers className="h-4 w-4 text-muted-foreground" /> Theo quy cách
        </h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {p.variants.map((v) => (
            <div key={v.id} className="rounded-lg border bg-muted/30 p-3">
              <div className="truncate text-xs text-muted-foreground">{v.title}</div>
              <div
                className={`text-lg font-semibold tabular-nums ${v.inventoryQuantity === 0 ? "text-red-600" : v.lowStock ? "text-amber-700" : ""}`}
              >
                {nf.format(v.inventoryQuantity)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {v.lowStockThreshold != null ? `Cảnh báo ≤ ${nf.format(v.lowStockThreshold)}` : "Chưa đặt cảnh báo"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <LowStockThresholdDialog productId={editing ? p.id : null} onOpenChange={setEditing} />
    </div>
  );
}
