import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type ContactRequestStatus,
  type PartnerContactRequest,
  useUpdateContactRequestStatus,
} from "@/features/partner";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: PartnerContactRequest;
  onOpenCreateAccount?: (request: PartnerContactRequest) => void;
}

function PartnerContactDetailForm({
  request,
  onClose,
  onOpenCreateAccount,
}: {
  request: PartnerContactRequest;
  onClose: () => void;
  onOpenCreateAccount?: (request: PartnerContactRequest) => void;
}) {
  const { toast } = useToast();
  const updateStatus = useUpdateContactRequestStatus();

  const [status, setStatus] = useState<ContactRequestStatus>(request.status);
  const [adminNote, setAdminNote] = useState<string>(request.adminNote || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStatus.mutateAsync({
        id: request.id,
        input: {
          status,
          adminNote: adminNote.trim() || undefined,
        },
      });
      toast({
        title: "Cập nhật thành công",
        description: `Yêu cầu của ${request.fullName} đã được cập nhật.`,
      });
      onClose();
    } catch (err) {
      toast({
        title: "Lỗi cập nhật",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Chi tiết yêu cầu hợp tác #{request.id}</DialogTitle>
      </DialogHeader>

      {/* Contact info summary */}
      <div className="rounded-lg bg-muted/50 p-3.5 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Người gửi:</span>
          <span className="font-semibold">{request.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Số điện thoại:</span>
          <a
            href={`tel:${request.phoneNumber}`}
            className="font-medium text-primary hover:underline"
          >
            {request.phoneNumber}
          </a>
        </div>
        {request.email && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{request.email}</span>
          </div>
        )}
        {request.province && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tỉnh / Thành phố:</span>
            <span>{request.province}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ngày gửi:</span>
          <span>{formatDate(request.createdAt)}</span>
        </div>
        {request.note && (
          <div className="pt-2 border-t text-xs">
            <span className="font-medium text-muted-foreground block mb-0.5">
              Nội dung ghi chú của đối tác:
            </span>
            <p className="italic text-foreground">{request.note}</p>
          </div>
        )}
      </div>

      {/* Status picker */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Trạng thái xử lý</Label>
        <Select
          value={status}
          onValueChange={(val) => setStatus(val as ContactRequestStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEW">Chờ liên hệ</SelectItem>
            <SelectItem value="CONTACTED">Đã liên hệ</SelectItem>
            <SelectItem value="ACCOUNT_CREATED">Đã cấp tài khoản</SelectItem>
            <SelectItem value="REJECTED">Không hợp tác</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Admin note */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">
          Ghi chú nội bộ của Ban quản trị
        </Label>
        <Textarea
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Nhập ghi chú liên hệ, trao đổi với đối tác (tối đa 1000 ký tự)..."
          maxLength={1000}
          rows={3}
        />
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        {request.status !== "ACCOUNT_CREATED" && onOpenCreateAccount && (
          <Button
            type="button"
            variant="outline"
            className="mr-auto text-primary border-primary/30 hover:bg-primary/10"
            onClick={() => {
              onClose();
              onOpenCreateAccount(request);
            }}
          >
            Cấp tài khoản đối tác
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onClose}>
          Đóng
        </Button>
        <Button type="submit" disabled={updateStatus.isPending}>
          {updateStatus.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PartnerContactDetailDialog({
  open,
  onOpenChange,
  request,
  onOpenCreateAccount,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        {request && (
          <PartnerContactDetailForm
            key={request.id}
            request={request}
            onClose={() => onOpenChange(false)}
            onOpenCreateAccount={onOpenCreateAccount}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
