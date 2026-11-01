import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type StockMovement,
  isConflictError,
  isStorefrontSyncError,
  useApproveStockMovement,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";
import { movementSourceLabel } from "./movement-format";

/** Duyệt phiếu nhập từ nông hộ (§2.5.3) — optionally lock in a different unit cost */
export function ApproveMovementDialog({
  movement,
  onOpenChange,
}: {
  movement: StockMovement | null;
  onOpenChange: (open: boolean) => void;
}) {
  // Shared with Body so the dialog can't be dismissed mid-request
  const approve = useApproveStockMovement();
  return (
    <Dialog open={!!movement} onOpenChange={(o) => !approve.isPending && onOpenChange(o)}>
      <DialogContent className="max-w-md">
        {movement && <Body key={movement.id} m={movement} approve={approve} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({
  m,
  approve,
  onDone,
}: {
  m: StockMovement;
  approve: ReturnType<typeof useApproveStockMovement>;
  onDone: () => void;
}) {
  const { toast } = useToast();
  const [unitCost, setUnitCost] = useState(m.unitCost != null ? String(m.unitCost) : "");
  const cost = Number(unitCost);
  const costValid = unitCost === "" || (Number.isInteger(cost) && cost >= 0);

  const onConfirm = async () => {
    try {
      const changed = unitCost !== "" && cost !== m.unitCost;
      await approve.mutateAsync({ id: m.id, data: changed ? { unitCost: cost } : {} });
      toast({ title: "Đã duyệt phiếu nhập", description: `${m.product.title} · ${m.variant.title}: +${m.quantity}` });
      onDone();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể duyệt",
        description: isConflictError(e)
          ? "Phiếu không còn chờ duyệt, hoặc quy cách / nguồn cung đã bị xoá. Chỉ có thể từ chối."
          : isStorefrontSyncError(e)
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
        {row("Sản phẩm", `${m.product.title} · ${m.variant.title}`)}
        {row("Vườn & Nông hộ", movementSourceLabel(m))}
        {row("Cây trồng", m.productionSubject?.name ?? "—")}
        {row("Số lượng", <span className="font-bold text-emerald-700">+{m.quantity}</span>)}
        {row("Giá đề xuất", m.unitCost != null ? `${formatVnd(m.unitCost)} / ${m.variant.title}` : "—")}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="approve-cost">Giá nhập chốt / {m.variant.title}</Label>
        <Input
          id="approve-cost"
          type="number"
          min={0}
          inputMode="numeric"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
          disabled={approve.isPending}
          placeholder="Để trống = giữ giá đề xuất"
        />
        {!costValid && <p className="text-xs text-destructive">Giá phải là số nguyên ≥ 0</p>}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
        Sau khi duyệt, số lượng được cộng vào tồn kho của quy cách.
      </p>
      <DialogFooter>
        <Button variant="outline" disabled={approve.isPending} onClick={onDone}>
          Huỷ
        </Button>
        <Button disabled={!costValid || approve.isPending} onClick={() => void onConfirm()}>
          {approve.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {approve.isPending ? "Đang duyệt..." : "Xác nhận duyệt"}
        </Button>
      </DialogFooter>
    </>
  );
}
