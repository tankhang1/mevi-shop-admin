import { ArrowDownToLine, BellRing, ExternalLink, History } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { StatusPill } from "@/components/common/ui-bits";
import { type InventoryRow, STOCK_STATUS_STYLE, stockItemLabel } from "@/features/shop-catalog";

const nf = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 });

const STOCK_TONE = {
  IN_STOCK: "text-foreground",
  LOW_STOCK: "text-amber-700",
  OUT_OF_STOCK: "text-red-600",
} as const;

/** Stock-first card (one quy cách): the count is the headline, Nhập hàng is one tap away */
export function InventoryMobileCard({
  item: r,
  onAdjust,
  onAlert,
  onHistory,
  onProduct,
}: {
  item: InventoryRow;
  onAdjust: () => void;
  onAlert: () => void;
  onHistory: () => void;
  onProduct: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <button type="button" onClick={onProduct} className="flex w-full items-center gap-3 p-3 text-left active:bg-muted/50">
        <img src={r.product.thumbnailUrl || placeholder} alt="" className="h-14 w-14 shrink-0 rounded-xl border object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{r.product.title}</h3>
          <p className="truncate text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">{stockItemLabel(r)}</span> · <span className="font-mono">{r.variant?.sku ?? r.unit?.sku}</span>
          </p>
          {r.category && <p className="mt-1 truncate text-[11px] text-muted-foreground">{r.category.name}</p>}
        </div>
        <div className="shrink-0 text-right">
          <div className={cn("text-xl font-bold leading-none tabular-nums", STOCK_TONE[r.stockStatus])}>{nf.format(r.inventoryQuantity)}</div>
          {r.lowStockThreshold != null && (
            <div className="mt-1 text-[10px] text-muted-foreground">cảnh báo ≤ {nf.format(r.lowStockThreshold)}</div>
          )}
          {r.variant && r.variant.availableQuantity !== r.inventoryQuantity && (
            <div className="mt-0.5 text-[10px] text-emerald-700">khả dụng {nf.format(r.variant.availableQuantity)}</div>
          )}
          <div className="mt-1.5">
            <StatusPill {...STOCK_STATUS_STYLE[r.stockStatus]} />
          </div>
        </div>
      </button>
      <div className="grid grid-cols-4 divide-x border-t bg-muted/30 text-[11px] font-medium text-muted-foreground">
        {[
          { label: "Nhập hàng", icon: ArrowDownToLine, onClick: onAdjust, primary: true },
          { label: "Cảnh báo", icon: BellRing, onClick: onAlert },
          { label: "Lịch sử", icon: History, onClick: onHistory },
          { label: "Sản phẩm", icon: ExternalLink, onClick: onProduct },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className={cn("flex flex-col items-center gap-0.5 py-2 active:bg-muted", a.primary && "text-primary")}
          >
            <a.icon className="h-4 w-4" />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
