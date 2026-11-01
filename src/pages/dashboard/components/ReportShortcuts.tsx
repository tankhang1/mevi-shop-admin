import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { menuFor } from "@/config/menu";
import { useAccess } from "@/features/auth";

/**
 * Mobile has no sidebar and the bottom nav has no room for reports,
 * so the dashboard links to them — same entries (and role filtering) as the sidebar section.
 */
/** Short labels that fit a half-width tile; the shop (đại lý / CTV) reads them from its own side */
const SHOP_LABELS: Record<string, string> = {
  "report-sales": "Doanh thu của tôi",
  "report-product": "Theo sản phẩm",
  "report-group": "Nhóm sản phẩm",
  "report-farm": "Theo nông hộ",
};
const ROOT_LABELS: Record<string, string> = {
  "report-agency": "Đại lý / CTV",
  "report-product": "Sản phẩm",
  "report-group": "Nhóm sản phẩm",
  "report-farm": "Nông hộ",
};

export function ReportShortcuts() {
  const { roles, isRoot } = useAccess();
  const labels = isRoot ? ROOT_LABELS : SHOP_LABELS;
  const section = menuFor(roles).find((s) => "items" in s && s.title === "Báo cáo doanh thu");
  const items = section && "items" in section ? section.items : [];
  if (!items.length) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">Báo cáo</h2>
      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <Link
            key={it.id}
            href={it.href ?? "#"}
            className="flex items-center gap-2 rounded-xl border bg-card p-3 text-sm font-medium active:bg-muted/50"
          >
            {it.icon && <it.icon className="h-4 w-4 shrink-0 text-primary" />}
            <span className="min-w-0 flex-1 leading-tight">{labels[it.id] ?? it.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </section>
  );
}
