import type { ElementType } from "react";
import { Link } from "wouter";
import { Building2, ChevronRight, ClipboardCheck, Inbox, MessageSquareText, Star } from "lucide-react";
import { Card } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ROUTES } from "@/config/routes";
import type { DashboardSummary } from "@/features/dashboard";

/** "Needs attention now" counters — current state, not tied to the date range */
export function SnapshotStrip({ snapshot, isRoot }: { snapshot: DashboardSummary["snapshot"]; isRoot: boolean }) {
  const items: { label: string; value: string; icon: ElementType; href: string; highlight?: boolean }[] = [
    { label: "Đơn mới cần xử lý", value: String(snapshot.newOrders), icon: Inbox, href: ROUTES.orders, highlight: snapshot.newOrders > 0 },
    {
      label: "Sản phẩm chờ duyệt",
      value: String(snapshot.pendingProducts),
      icon: ClipboardCheck,
      // Shop admins can't moderate — send them to their own list filtered to pending instead
      href: isRoot ? ROUTES.productApproval : ROUTES.products,
      highlight: isRoot && snapshot.pendingProducts > 0,
    },
    {
      label: "Đánh giá chưa trả lời",
      value: String(snapshot.unrepliedReviews),
      icon: MessageSquareText,
      href: ROUTES.reviews,
      highlight: snapshot.unrepliedReviews > 0,
    },
    isRoot
      ? {
          label: "Gian hàng · Đại lý hoạt động",
          value: `${snapshot.shopCount ?? 0} · ${snapshot.activeAgencies ?? 0}/${snapshot.agencyCount ?? 0}`,
          icon: Building2,
          href: ROUTES.shops,
        }
      : {
          label: "Điểm đánh giá trung bình",
          value: snapshot.averageRating ? `${snapshot.averageRating.toFixed(1)} ★` : "—",
          icon: Star,
          href: ROUTES.reviews,
        },
  ];

  return (
    <Card className="grid gap-px overflow-hidden bg-border max-lg:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <Link
          key={i.label}
          href={i.href}
          className="group flex items-center gap-3 bg-card p-4 transition-colors hover:bg-muted/50"
        >
          <span
            className={
              i.highlight
                ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700"
                : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            }
          >
            <i.icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold leading-tight tabular-nums">{i.value}</p>
            <p className="truncate text-xs text-muted-foreground">{i.label}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      ))}
    </Card>
  );
}
