import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { LoadingBlock } from "@/components/common/ui-bits";
import { RatingSummary } from "@/features/review/components/review-bits";
import { useReviewStats, useReviews } from "@/features/review";
import { fromSpringPage } from "@/lib/pagination";
import { ReviewCard } from "@/pages/review/components/ReviewCard";

const PAGE = 5;

/** Reviews for one product, with reply/hide, on the product detail page */
export function ProductReviews({ productId }: { productId: number }) {
  const [size, setSize] = useState(PAGE);
  const { data: stats } = useReviewStats(productId);
  const { data, isLoading, isFetching } = useReviews({ productId, size });
  const page = fromSpringPage(data);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Đánh giá của khách hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {stats && stats.total + stats.hidden > 0 && <RatingSummary stats={stats} />}
        {isLoading ? (
          <LoadingBlock />
        ) : !page?.items.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Chưa có đánh giá.</p>
        ) : (
          <div className="space-y-3">
            {page.items.map((r) => (
              <ReviewCard key={r.id} review={r} showProduct={false} />
            ))}
          </div>
        )}
        {page && page.total > page.items.length && (
          <Button variant="outline" className="w-full" disabled={isFetching} onClick={() => setSize((s) => s + PAGE)}>
            Xem thêm ({page.total - page.items.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
