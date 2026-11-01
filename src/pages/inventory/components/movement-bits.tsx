import { StatusPill } from "@/components/common/ui-bits";
import { MOVEMENT_STATUS_STYLE, type StockMovement } from "@/features/shop-catalog";
import { formatVnDateTime, userName } from "./movement-format";

/** Status pill + the line under it: reviewer/time, reject reason, or who cancelled */
export function MovementStatusCell({ m }: { m: StockMovement }) {
  return (
    <div className="space-y-0.5">
      <StatusPill {...MOVEMENT_STATUS_STYLE[m.status]} />
      {(m.status === "APPROVED" || m.status === "REJECTED") && m.reviewedBy && (
        <p className="whitespace-nowrap text-[11px] text-muted-foreground">
          {userName(m.reviewedBy)} · {formatVnDateTime(m.reviewedAt)}
        </p>
      )}
      {m.status === "REJECTED" && m.rejectReason && (
        <p className="max-w-48 truncate text-xs text-destructive" title={m.rejectReason}>
          {m.rejectReason}
        </p>
      )}
      {m.status === "CANCELLED" && (
        <p className="whitespace-nowrap text-[11px] text-muted-foreground">
          {userName(m.cancelledBy)} · {formatVnDateTime(m.cancelledAt)}
        </p>
      )}
    </div>
  );
}
