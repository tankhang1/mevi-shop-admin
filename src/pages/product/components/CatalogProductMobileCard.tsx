import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { type MobileCardHelpers, cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { StatusPill } from "@/components/common/ui-bits";
import type { CatalogProductListItem } from "@/features/shop-catalog";
import { formatVnd } from "@/lib/format";
import { CATALOG_STATUS, agriculturalPill, priceRange } from "./catalog-product-columns";
import { CatalogStatusToggle } from "./CatalogStatusToggle";

/** Image-first product card for the mobile list */
export function CatalogProductMobileCard({
  product: p,
  helpers,
}: {
  product: CatalogProductListItem;
  helpers: MobileCardHelpers<CatalogProductListItem>;
}) {
  const discount = p.compareAtPrice ? Math.round((1 - p.minPrice / p.compareAtPrice) * 100) : 0;
  const out = p.totalInventory === 0;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <button type="button" onClick={helpers.onView} className="flex w-full gap-3 p-3 text-left active:bg-muted/50">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
          <img src={p.thumbnailUrl || placeholder} alt="" className="h-full w-full object-cover" />
          {discount > 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{discount}%
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{p.title}</h3>
            <StatusPill {...CATALOG_STATUS[p.status]} />
          </div>
          <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
            {p.code} · {p.category?.name ?? "—"}
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className={cn("text-base font-bold", p.compareAtPrice ? "text-red-600" : "text-primary")}>{priceRange(p)}</span>
            {p.compareAtPrice && <span className="text-xs text-muted-foreground line-through">{formatVnd(p.compareAtPrice)}</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <StatusPill {...agriculturalPill(p.agricultural)} />
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                out ? "bg-red-50 text-red-700" : p.lowStock ? "bg-amber-50 text-amber-800" : "bg-muted text-muted-foreground",
              )}
            >
              {(out || p.lowStock) && <AlertTriangle className="h-3 w-3" />}
              Kho: {p.totalInventory}
            </span>
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2 border-t bg-muted/30 px-3 py-2">
        <label className="flex flex-1 items-center gap-2 text-xs font-medium text-muted-foreground">
          <CatalogStatusToggle product={p} /> Tạm ngưng kinh doanh
        </label>
        {helpers.onEdit && (
          <button
            type="button"
            onClick={helpers.onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-sky-700"
            aria-label="Sửa"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {helpers.onDelete && (
          <button
            type="button"
            onClick={helpers.onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background text-destructive"
            aria-label="Xoá"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
