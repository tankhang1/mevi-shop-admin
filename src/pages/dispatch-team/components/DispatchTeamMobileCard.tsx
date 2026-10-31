import { ChevronRight, Crown, Pause, Pencil, Play, Trash2 } from "lucide-react";
import type { MobileCardHelpers } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import type { DispatchTeamRow } from "@/features/dispatch-team";
import { Initials } from "@/pages/customer/CustomerListPage";

const iconBtn = "flex h-8 w-8 items-center justify-center rounded-lg border bg-background";

/** Team card: who's in it, what it handles, and its open orders as the main tap target */
export function DispatchTeamMobileCard({
  team: t,
  onOrders,
  onToggle,
  helpers,
}: {
  team: DispatchTeamRow;
  onOrders: () => void;
  onToggle: () => void;
  helpers: MobileCardHelpers<DispatchTeamRow>;
}) {
  const leader = t.members.find((m) => m.id === t.leaderId);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="space-y-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{t.name}</h3>
            {t.description && <p className="truncate text-xs text-muted-foreground">{t.description}</p>}
          </div>
          <StatusPill
            label={t.active ? "Hoạt động" : "Tạm dừng"}
            className={t.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {t.members.slice(0, 5).map((m) => (
              // Solid backing so overlapped (translucent) avatars don't bleed into each other
              <span key={m.id} className="rounded-full border-2 border-background bg-background" title={m.name}>
                <Initials name={m.name} size="h-7 w-7 text-[10px]" />
              </span>
            ))}
          </div>
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {t.members.length} thành viên
            {leader && (
              <>
                {" · "}
                <Crown className="inline h-3 w-3 -translate-y-px text-amber-500" /> {leader.name.split(" ").slice(-1)[0]}
              </>
            )}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {t.categories.length ? (
            t.categories.map((c) => (
              <span key={c} className="rounded-full bg-muted px-2 py-0.5 text-[11px]">
                {c}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-muted-foreground">Chưa gán danh mục</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t bg-muted/30 px-3 py-2">
        <button
          type="button"
          onClick={onOrders}
          className="flex h-8 flex-1 items-center gap-1.5 rounded-lg border bg-background px-3 text-left text-xs"
        >
          <span className="text-sm font-semibold tabular-nums">{t.openOrders}</span>
          <span className="text-muted-foreground">đơn đang xử lý</span>
          <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={`${iconBtn} ${t.active ? "text-amber-700" : "text-emerald-700"}`}
          aria-label={t.active ? "Tạm dừng" : "Kích hoạt"}
        >
          {t.active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        {helpers.onEdit && (
          <button type="button" onClick={helpers.onEdit} className={`${iconBtn} text-sky-700`} aria-label="Sửa">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {helpers.onDelete && (
          <button type="button" onClick={helpers.onDelete} className={`${iconBtn} text-destructive`} aria-label="Xoá">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
