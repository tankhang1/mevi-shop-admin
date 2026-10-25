import { Pencil, Phone } from "lucide-react";
import type { MobileCardHelpers } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import type { CustomerWithStats } from "@/features/customer";
import { formatDate, formatVnd } from "@/lib/format";
import { Initials } from "../CustomerListPage";

const iconBtn = "flex h-9 w-9 items-center justify-center rounded-lg border bg-background";

/** Contact-first card: tap opens the profile, call/edit sit on the right */
export function CustomerMobileCard({
  customer: c,
  helpers,
}: {
  customer: CustomerWithStats;
  helpers: MobileCardHelpers<CustomerWithStats>;
}) {
  return (
    <div className="flex items-center rounded-2xl border bg-card shadow-sm">
      <button
        type="button"
        onClick={helpers.onView}
        className="flex min-w-0 flex-1 gap-3 rounded-l-2xl p-3 text-left active:bg-muted/50"
      >
        <Initials name={c.name} size="h-11 w-11 text-sm" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{c.name}</h3>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{c.phone}</span>
          </div>
          <p className="mt-1 text-xs">
            <span className="font-semibold tabular-nums">{formatVnd(c.totalSpent)}</span>
            <span className="text-muted-foreground">
              {" "}
              · {c.orderCount} đơn{c.lastOrderAt && ` · ${formatDate(c.lastOrderAt).split(" ").pop()}`}
            </span>
          </p>
          {!!c.tags.length && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {c.tags.map((t) => (
                <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-1.5 pr-3">
        <a href={`tel:${c.phone}`} className={`${iconBtn} text-primary`} aria-label={`Gọi ${c.phone}`}>
          <Phone className="h-4 w-4" />
        </a>
        {helpers.onEdit && (
          <button type="button" onClick={helpers.onEdit} className={`${iconBtn} text-sky-700`} aria-label="Sửa">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
