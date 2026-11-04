import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type StockMovement,
  isConflictError,
  isStorefrontSyncError,
  useApproveStockMovement,
  stockItemLabel,
  stockPerLabel,
  SELL_UNIT_SHORT,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";
import { CurrencyInput } from "@/components/common/CurrencyInput";
import { movementSourceLabel } from "./movement-format";

/** Duyệt phiếu nhập từ nông hộ (§2.5.3) — optionally lock in a different unit cost */
export function ApproveMovementDialog({
  movement,
  onOpenChange,
  onReject,
}: {
  movement: StockMovement | null;
  onOpenChange: (open: boolean) => void;
  /** Offered when BE refuses approval (409) — the phiếu can then only be rejected */
  onReject?: (m: StockMovement) => void;
}) {
  // Shared with Body so the dialog can't be dismissed mid-request
  const approve = useApproveStockMovement();
  return (
    <Dialog open={!!movement} onOpenChange={(o) => !approve.isPending && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        {movement && <Body key={movement.id} m={movement} approve={approve} onDone={() => onOpenChange(false)} onReject={onReject} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({
  m,
  approve,
  onDone,
  onReject,
}: {
  m: StockMovement;
  approve: ReturnType<typeof useApproveStockMovement>;
  onDone: () => void;
  onReject?: (m: StockMovement) => void;
}) {
  const { toast } = useToast();
  /** 409: product changed Cây trồng / đơn vị tính, or vườn left the supply sources */
  const [blocked, setBlocked] = useState(false);
  const [unitCost, setUnitCost] = useState<number | undefined>(
    m.unitCost != null ? m.unitCost : undefined,
  );
  const cost = unitCost ?? 0;
  const costValid = unitCost === undefined || cost >= 0;

  const onConfirm = async () => {
    try {
      const changed = unitCost !== undefined && cost !== m.unitCost;
      await approve.mutateAsync({ id: m.id, data: changed ? { unitCost: cost } : {} });
      toast({ title: "Đã duyệt phiếu nhập", description: `${m.product.title} · ${stockItemLabel(m)}: +${m.quantity}` });
      onDone();
    } catch (e) {
      if (isConflictError(e)) {
        setBlocked(true);
        return;
      }
      toast({
        variant: "destructive",
        title: "Không thể duyệt",
        description: isStorefrontSyncError(e)
            ? "Chưa cập nhật được trang shop, vui lòng thử lại"
            : getErrorMessage(e),
      });
    }
  };

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>Duyệt yêu cầu cung ứng</DialogTitle>
      </DialogHeader>
      <div className="space-y-1.5 rounded-xl border bg-muted/40 p-3 text-xs">
        {row("Mã yêu cầu", <span className="font-mono">{m.code}</span>)}
        {row("Sản phẩm", `${m.product.title} · ${stockItemLabel(m)}`)}
        {row("Vườn & Nông hộ", movementSourceLabel(m))}
        {row("Cây trồng", m.productionSubject?.name ?? "—")}
        {row(
          "Số lượng",
          <span className="font-bold text-emerald-700">
            +{m.quantity}
            {m.baseUnit && ` ${SELL_UNIT_SHORT[m.baseUnit]}`}
          </span>,
        )}
        {row("Giá đề xuất", m.unitCost != null ? `${formatVnd(m.unitCost)} / ${stockPerLabel(m)}` : "—")}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="approve-cost">Giá nhập chốt / {stockPerLabel(m)}</Label>
        <CurrencyInput
          id="approve-cost"
          value={unitCost}
          onChange={setUnitCost}
          disabled={approve.isPending}
          placeholder="Để trống = giữ giá đề xuất"
          suffix="₫"
        />
        {!costValid && <p className="text-xs text-destructive">Giá phải là số nguyên ≥ 0</p>}
      </div>
      {blocked ? (
        <p className="flex items-start gap-1.5 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          Không thể duyệt: phiếu không còn chờ duyệt, sản phẩm đã đổi Cây trồng / Đơn vị tính, hoặc vườn không còn trong
          nguồn cung. Chỉ có thể từ chối phiếu này.
        </p>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
          Sau khi duyệt, số lượng được cộng vào tồn kho của {m.variant ? "quy cách" : "đơn vị tính"}.
        </p>
      )}
      <DialogFooter>
        <Button variant="outline" disabled={approve.isPending} onClick={onDone}>
          Huỷ
        </Button>
        {blocked ? (
          onReject && (
            <Button
              variant="destructive"
              onClick={() => {
                onDone();
                onReject(m);
              }}
            >
              Từ chối phiếu
            </Button>
          )
        ) : (
          <Button disabled={!costValid || approve.isPending} onClick={() => void onConfirm()}>
            {approve.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {approve.isPending ? "Đang duyệt..." : "Xác nhận duyệt"}
          </Button>
        )}
      </DialogFooter>
    </>
  );
}
