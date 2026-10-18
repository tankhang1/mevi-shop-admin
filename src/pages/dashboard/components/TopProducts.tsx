import { Card, CardContent, CardHeader, CardTitle } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import type { DashboardSummary } from "@/features/dashboard";
import { formatCompactVnd } from "@/lib/format";

export function TopProducts({ items }: { items: DashboardSummary["topProducts"] }) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sản phẩm bán chạy</CardTitle>
        <p className="text-sm text-muted-foreground">Theo doanh thu đơn hoàn tất</p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
        ) : (
          <ol className="divide-y">
            {items.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="w-4 text-center text-sm font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
                <img src={p.image || placeholder} alt="" className="h-10 w-10 shrink-0 rounded-md border object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">Đã bán {p.sold}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums">{formatCompactVnd(p.revenue)}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
