import { useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Eye, Search, X } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
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

/** Card view of the moderation queue, with its own search/filter/paging toolbar */
export function ApprovalGrid({ page, loading, keyword, category, onSearch, onCategory, onPage, onView, onApprove, onReject, busy }: Props) {
  // Debounced search, like DataTable's
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
    <div className="space-y-4">
      <div className="flex gap-2 max-sm:flex-col">
        <div className="relative max-sm:w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tìm theo tên, SKU..." className="pl-9!" />
        </div>
        <div className="max-sm:w-full sm:w-52">
          <Select value={category} onValueChange={onCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {PRODUCT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>
      </div>

      {loading && !page ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <Card>
          <EmptyBlock>{keyword || category !== "all" ? "Không có sản phẩm phù hợp" : "Không có sản phẩm nào chờ duyệt 🎉"}</EmptyBlock>
        </Card>
      ) : (
        <div className={loading ? "grid gap-4 opacity-60 transition-opacity sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"}>
          {items.map((p) => (
            <Card key={p.id} className="flex flex-col overflow-hidden">
              <button
                type="button"
                onClick={() => onView(p)}
                className="group relative block overflow-hidden"
                aria-label={`Xem chi tiết ${p.name}`}
              >
                <img
                  src={p.images[0] || placeholder}
                  alt=""
                  className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Eye className="mr-1.5 h-4 w-4" /> Xem chi tiết
                </span>
                <span className="absolute left-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
                  {p.category}
                </span>
              </button>
              <CardContent className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <button type="button" onClick={() => onView(p)} className="min-w-0 text-left font-semibold leading-snug hover:underline">
                    {p.name}
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(p)}
                    className="-mr-2 -mt-1 h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-3.5 w-3.5" /> Chi tiết
                  </Button>
                </div>
                {p.shopName && <p className="text-xs font-medium text-primary">{p.shopName}</p>}
                <p className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                  <span className="font-mono">{p.sku}</span>
                  <span>Gửi {formatDate(p.createdAt)}</span>
                </p>
                <div className="flex items-baseline gap-2">
                  <span className={p.salePrice ? "font-semibold tabular-nums text-red-600" : "font-semibold tabular-nums"}>
                    {formatVnd(p.salePrice ?? p.price)}
                  </span>
                  {p.salePrice && <span className="text-xs text-muted-foreground line-through tabular-nums">{formatVnd(p.price)}</span>}
                </div>
                {p.origin && <p className="text-sm text-muted-foreground">Nguồn gốc: {p.origin}</p>}
                {/* minmax(0,1fr) lets both buttons shrink with the card instead of overflowing */}
                <div className="mt-auto grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 pt-2">
                  <Button variant="outline" onClick={() => onReject(p)} className="min-w-0 px-2">
                    <X className="mr-1 h-4 w-4 shrink-0" /> <span className="truncate">Từ chối</span>
                  </Button>
                  <Button onClick={() => onApprove(p)} disabled={busy} className="min-w-0 px-2">
                    <Check className="mr-1 h-4 w-4 shrink-0" /> <span className="truncate">Duyệt</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {page?.total} sản phẩm · Trang {current}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => onPage(current - 1)}>
              <ChevronLeft className="h-4 w-4" /> Trước
            </Button>
            <Button variant="outline" size="sm" disabled={current >= totalPages} onClick={() => onPage(current + 1)}>
              Sau <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
