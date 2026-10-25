import { ArrowDownUp, ExternalLink, History } from "lucide-react";
import { type MobileCardHelpers, cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { StatusPill } from "@/components/common/ui-bits";
import { type InventoryItem, STOCK_STATUS } from "@/features/inventory";
import { PRODUCT_SOURCE } from "@/features/product";

const nf = new Intl.NumberFormat("vi-VN");

const STOCK_TONE = {
  in_stock: "text-foreground",
  low: "text-amber-700",
  out: "text-red-600",
} as const;

/** Stock-first card: the count is the headline, Nhập/Xuất is one tap away */
export function InventoryMobileCard({
  item: p,
  showShop,
  onAdjust,
  onProduct,
  helpers,
}: {
  item: InventoryItem;
  showShop: boolean;
  onAdjust: () => void;
  onProduct: () => void;
  helpers: MobileCardHelpers<InventoryItem>;
}) {
  const meta = [showShop && p.shopName, p.category].filter(Boolean).join(" · ");

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <button
        type="button"
        onClick={helpers.onView}
        className="flex w-full items-center gap-3 p-3 text-left active:bg-muted/50"
      >
        <img src={p.images[0] || placeholder} alt="" className="h-14 w-14 shrink-0 rounded-xl border object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{p.name}</h3>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{p.sku}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <StatusPill {...PRODUCT_SOURCE[p.source ?? "self"]} />
            {meta && <span className="truncate text-[11px] text-muted-foreground">{meta}</span>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className={cn("text-xl font-bold leading-none tabular-nums", STOCK_TONE[p.stockStatus])}>
            {nf.format(p.stock)}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">cảnh báo ≤ {p.lowStockThreshold}</div>
          <div className="mt-1.5">
            <StatusPill {...STOCK_STATUS[p.stockStatus]} />
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2 border-t bg-muted/30 px-3 py-2">
        {p.pendingCount ? (
          <span className="flex-1 text-xs font-medium text-amber-700">{p.pendingCount} phiếu chờ duyệt</span>
        ) : (
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={helpers.onView}
          className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground"
          aria-label="Lịch sử kho"
        >
          <History className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onProduct}
          className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-muted-foreground"
          aria-label="Xem sản phẩm"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onAdjust}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
        >
          <ArrowDownUp className="h-3.5 w-3.5" /> Nhập / Xuất
        </button>
      </div>
    </div>
  );
}
