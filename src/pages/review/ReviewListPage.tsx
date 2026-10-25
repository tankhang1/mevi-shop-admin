import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquareWarning, Search } from "lucide-react";
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
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { useAccess } from "@/features/auth";
import { RatingSummary } from "@/features/review/components/review-bits";
import { type ReviewListParams, useReviewStats, useReviews } from "@/features/review";
import { useShops } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { formatPercent } from "@/lib/format";
import { ReviewCard } from "./components/ReviewCard";
import { ReviewMobileHeader } from "./components/ReviewMobileHeader";

type Filters = Required<Pick<ReviewListParams, "rating" | "replied">> & { shopId: string };

function FilterSelect({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: [string, string][]; className?: string }) {
  return (
    <div className={className}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function ReviewListPage() {
  const { isRoot } = useAccess();
  const isMobile = useIsMobile();
  const table = useTableParams<Filters>({ rating: "all", replied: "all", shopId: "all" }, 10);
  const { data: page, isFetching } = useReviews(table.params);
  const { data: stats } = useReviewStats();
  const { data: shops } = useShops({ size: 100 }, isRoot);
  const bound = table.bind(page, isFetching);

  // Debounced search
  const [text, setText] = useState("");
  const keyword = table.state.keyword;
  const onSearch = bound.onSearch;
  useEffect(() => {
    if (text === keyword) return;
    const t = setTimeout(() => onSearch(text), 350);
    return () => clearTimeout(t);
  }, [text, keyword, onSearch]);

  const items = page?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((page?.total ?? 0) / (page?.size || 1)));
  const current = page?.page ?? 1;
  const f = table.state.filters;

  return (
    <div className="space-y-5">
      {isMobile ? (
        <ReviewMobileHeader
          stats={stats}
          replied={f.replied}
          rating={f.rating}
          onReplied={(v) => bound.onFilterChange("replied", v)}
          onRating={(v) => bound.onFilterChange("rating", v)}
        />
      ) : (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardContent className="p-5">{stats ? <RatingSummary stats={stats} /> : <LoadingBlock />}</CardContent>
        </Card>
        <Card>
          <CardContent className="flex h-full flex-col justify-center gap-3 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <MessageSquareWarning className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats?.unreplied ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Đánh giá chưa trả lời</p>
              </div>
            </div>
            {stats && stats.total > 0 && (
              <p className="text-xs text-muted-foreground">
                Tỷ lệ phản hồi {formatPercent(1 - stats.unreplied / stats.total, 0)} · {stats.hidden} đánh giá đang ẩn
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => bound.onFilterChange("replied", "no")}
              disabled={!stats?.unreplied}
            >
              Xem đánh giá chưa trả lời
            </Button>
          </CardContent>
        </Card>
      </div>
      )}

      <div className="flex flex-wrap gap-2">
        <div className="relative max-sm:w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tìm theo khách, nội dung, sản phẩm..." className="pl-9!" />
        </div>
        {!isMobile && (
        <>
        <FilterSelect
          className="max-sm:w-full sm:w-40"
          value={f.rating}
          onChange={(v) => bound.onFilterChange("rating", v)}
          options={[["all", "Tất cả số sao"], ["5", "5 sao"], ["4", "4 sao"], ["3", "3 sao"], ["2", "2 sao"], ["1", "1 sao"]]}
        />
        <FilterSelect
          className="max-sm:w-full sm:w-44"
          value={f.replied}
          onChange={(v) => bound.onFilterChange("replied", v)}
          options={[["all", "Tất cả trạng thái"], ["no", "Chưa trả lời"], ["yes", "Đã trả lời"]]}
        />
        </>
        )}
        {isRoot && (
          <FilterSelect
            className="max-sm:w-full sm:w-52"
            value={f.shopId}
            onChange={(v) => bound.onFilterChange("shopId", v)}
            options={[["all", "Tất cả gian hàng"], ...(shops?.items ?? []).map((s) => [s.id, s.name] as [string, string])]}
          />
        )}
      </div>

      {isFetching && !page ? (
        <LoadingBlock />
      ) : items.length === 0 ? (
        <Card>
          <EmptyBlock>Không có đánh giá phù hợp</EmptyBlock>
        </Card>
      ) : (
        <div className={isFetching ? "grid gap-3 opacity-60 transition-opacity xl:grid-cols-2" : "grid gap-3 transition-opacity xl:grid-cols-2"}>
          {items.map((r) => (
            <ReviewCard key={r.id} review={r} showShop={isRoot} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {page?.total} đánh giá · Trang {current}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => bound.onIndexChange(current - 1)}>
              <ChevronLeft className="h-4 w-4" /> Trước
            </Button>
            <Button variant="outline" size="sm" disabled={current >= totalPages} onClick={() => bound.onIndexChange(current + 1)}>
              Sau <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
