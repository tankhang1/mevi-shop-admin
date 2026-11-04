import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label?: string;
  confirmLabel?: string;
  loading?: boolean;
  /** Allows confirming with an empty reason */
  optional?: boolean;
  maxLength?: number;
  onConfirm: (reason: string) => void;
}

/** Reject / cancel style actions that must record why; stays open while `loading` */
export function ReasonDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={(o) => !props.loading && props.onOpenChange(o)}>
      <DialogContent className="max-w-md">
        {props.open && <Body {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({
  onOpenChange,
  title,
  label = "Lý do",
  confirmLabel = "Từ chối",
  loading,
  optional,
  maxLength,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-1.5">
        <Label htmlFor="reason">
          {label}
          {!optional && <span className="text-destructive"> *</span>}
        </Label>
        <Textarea
          id="reason"
          rows={3}
          maxLength={maxLength}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          autoFocus
        />
      </div>
      <DialogFooter>
        <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
          Quay lại
        </Button>
        <Button
          variant="destructive"
          disabled={(!optional && !reason.trim()) || loading}
          onClick={() => onConfirm(reason.trim())}
        >
          {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {loading ? "Đang xử lý..." : confirmLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
