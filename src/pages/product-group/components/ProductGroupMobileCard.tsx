import { ChevronRight, Package, Pencil, Store, Trash2 } from "lucide-react";
import type { MobileCardHelpers } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { ProductGroup } from "@/features/product-group";
import { GroupThumb } from "../ProductGroupListPage";

/** Compact one-row card — tap opens the group, edit/delete stay one tap away */
export function ProductGroupMobileCard({
  group: g,
  showShop,
  helpers,
}: {
  group: ProductGroup;
  showShop: boolean;
  helpers: MobileCardHelpers<ProductGroup>;
}) {
  return (
    <div className="flex items-center rounded-2xl border bg-card shadow-sm">
      <button
        type="button"
        onClick={helpers.onView}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-l-2xl p-3 text-left active:bg-muted/50"
      >
        <GroupThumb group={g} size="h-14 w-14" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{g.name}</h3>
          {g.description && <p className="truncate text-xs text-muted-foreground">{g.description}</p>}
          <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
              <Package className="h-3 w-3" /> {g.productIds.length} sản phẩm
            </span>
            {showShop && g.shopName && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <Store className="h-3 w-3 shrink-0" />
                <span className="truncate">{g.shopName}</span>
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      <div className="flex shrink-0 flex-col gap-1.5 border-l px-2 py-2">
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
