import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { CANCEL_REASONS } from "@/features/order";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  loading?: boolean;
  onConfirm: (reason: string) => void;
}

/** Cancelling needs a reason — pick a common one or type your own */
export function CancelOrderDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-md">
        {props.open && <Body {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ onOpenChange, code, loading, onConfirm }: Props) {
  const [reason, setReason] = useState("");
  return (
    <>
      <DialogHeader>
        <DialogTitle>Huỷ đơn {code}?</DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {CANCEL_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                reason === r
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cancel-reason">
            Lý do huỷ<span className="text-destructive"> *</span>
          </Label>
          <Textarea
            id="cancel-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <p className="text-sm font-medium text-destructive">
          Không thể hoàn tác sau khi huỷ.
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Quay lại
        </Button>
        <Button
          variant="destructive"
          disabled={!reason.trim() || loading}
          onClick={() => onConfirm(reason.trim())}
        >
          Huỷ đơn
        </Button>
      </DialogFooter>
    </>
  );
}
