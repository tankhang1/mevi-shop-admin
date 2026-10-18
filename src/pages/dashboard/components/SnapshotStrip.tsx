import type { ElementType } from "react";
import { Link } from "wouter";
import { ChevronRight, ClipboardCheck, Inbox, Package, Store } from "lucide-react";
import { Card } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ROUTES } from "@/config/routes";
import type { DashboardSummary } from "@/features/dashboard";

/** "Needs attention now" counters — current state, not tied to the date range */
export function SnapshotStrip({ snapshot }: { snapshot: DashboardSummary["snapshot"] }) {
  const items: { label: string; value: string; icon: ElementType; href: string; highlight?: boolean }[] = [
    { label: "Đơn mới cần xử lý", value: String(snapshot.newOrders), icon: Inbox, href: ROUTES.orders, highlight: snapshot.newOrders > 0 },
    {
      label: "Sản phẩm chờ duyệt",
      value: String(snapshot.pendingProducts),
      icon: ClipboardCheck,
      href: ROUTES.productApproval,
      highlight: snapshot.pendingProducts > 0,
    },
    { label: "Tổng sản phẩm", value: String(snapshot.productCount), icon: Package, href: ROUTES.products },
    {
      label: "Đại lý hoạt động",
      value: `${snapshot.activeAgencies}/${snapshot.agencyCount}`,
      icon: Store,
      href: ROUTES.agencies,
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
