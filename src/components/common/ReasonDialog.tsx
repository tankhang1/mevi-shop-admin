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
} from "@Team-Trung-Vu-Khang/eco-shared-ui";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: (reason: string) => void;
}

/** Reject / cancel style actions that must record why */
export function ReasonDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
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
          <span className="text-destructive"> *</span>
        </Label>
        <Textarea
          id="reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />
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
          {confirmLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
