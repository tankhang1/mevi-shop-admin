import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ClipboardCheck, Search, X } from "lucide-react";
import { Button, Input, cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { PRODUCT_CATEGORIES, type Product } from "@/features/product";
import { formatDate, formatVnd } from "@/lib/format";
import type { Paginated } from "@/types/api";

interface Props {
  page: Paginated<Product> | undefined;
  loading: boolean;
  keyword: string;
  category: string;
  onSearch: (v: string) => void;
  onCategory: (v: string) => void;
  onPage: (page: number) => void;
  onView: (p: Product) => void;
  onApprove: (p: Product) => void;
  onReject: (p: Product) => void;
  busy?: boolean;
}

/** Mobile moderation queue: count, search, category chips, compact image-left cards */
export function ApprovalMobileList({ page, loading, keyword, category, onSearch, onCategory, onPage, onView, onApprove, onReject, busy }: Props) {
  const [text, setText] = useState(keyword);
  useEffect(() => {
    if (text === keyword) return;
    const t = setTimeout(() => onSearch(text), 350);
    return () => clearTimeout(t);
  }, [text, keyword, onSearch]);

  const items = page?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((page?.total ?? 0) / (page?.size || 1)));
  const current = page?.page ?? 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <ClipboardCheck className="h-4 w-4 shrink-0" />
        <span>
          <b className="tabular-nums">{page?.total ?? "–"}</b> sản phẩm đang chờ duyệt
        </span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tìm theo tên, SKU..." className="pl-9!" />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
        {["all", ...PRODUCT_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategory(c)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              category === c ? "border-primary bg-primary text-primary-foreground shadow-sm" : "bg-background",
            )}
          >
            {c === "all" ? "Tất cả" : c}
          </button>
        ))}
      </div>

      {loading && !page ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyBlock>{keyword || category !== "all" ? "Không có sản phẩm phù hợp" : "Không có sản phẩm nào chờ duyệt 🎉"}</EmptyBlock>
        </div>
      ) : (
        <div className={cn("space-y-3 transition-opacity", loading && "opacity-60")}>
          {items.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <button type="button" onClick={() => onView(p)} className="flex w-full gap-3 p-3 text-left active:bg-muted/50">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img src={p.images[0] || placeholder} alt="" className="h-full w-full object-cover" />
                  <span className="absolute left-1.5 top-1.5 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-medium">{p.category}</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug">{p.name}</p>
                  {p.shopName && <p className="truncate text-xs font-medium text-primary">{p.shopName}</p>}
                  <p className="truncate text-[11px] text-muted-foreground">
                    <span className="font-mono">{p.sku}</span> · Gửi {formatDate(p.createdAt)}
                  </p>
                  <p className="flex items-baseline gap-1.5">
                    <span className={cn("font-bold tabular-nums", p.salePrice ? "text-red-600" : "text-primary")}>
                      {formatVnd(p.salePrice ?? p.price)}
                    </span>
                    {p.salePrice && <span className="text-xs text-muted-foreground line-through">{formatVnd(p.price)}</span>}
                  </p>
                  {p.origin && <p className="truncate text-[11px] text-muted-foreground">Nguồn gốc: {p.origin}</p>}
                </div>
              </button>
              <div className="grid grid-cols-2 gap-2 border-t bg-muted/30 px-3 py-2">
                <button
                  type="button"
                  onClick={() => onReject(p)}
                  className="flex h-9 items-center justify-center gap-1 rounded-full border bg-background text-sm font-medium text-destructive"
                >
                  <X className="h-4 w-4" /> Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => onApprove(p)}
                  disabled={busy}
                  className="flex h-9 items-center justify-center gap-1 rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  <Check className="h-4 w-4" /> Duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Trang {current}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => onPage(current - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={current >= totalPages} onClick={() => onPage(current + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
