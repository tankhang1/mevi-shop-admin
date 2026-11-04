import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type PartnerProfile,
  useUpdatePartnerSuspension,
} from "@/features/partner";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: PartnerProfile;
  title?: string;
}

function PartnerSuspensionForm({
  partner,
  onClose,
  title,
}: {
  partner: PartnerProfile;
  onClose: () => void;
  title?: string;
}) {
  const { toast } = useToast();
  const updateSuspension = useUpdatePartnerSuspension();
  const [note, setNote] = useState(partner.suspensionNote || "");

  const willSuspend = !partner.suspended;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSuspension.mutateAsync({
        id: partner.id,
        input: {
          suspended: willSuspend,
          note: willSuspend ? note.trim() || undefined : undefined,
        },
      });

      toast({
        title: willSuspend ? "Đã tạm khóa gian hàng" : "Đã mở lại gian hàng",
        description: willSuspend
          ? `Gian hàng của "${partner.name}" đã bị tạm khóa và ẩn khỏi trang public.`
          : `Gian hàng của "${partner.name}" đã được mở lại hoạt động bình thường.`,
      });

      onClose();
    } catch (err) {
      toast({
        title: "Lỗi thao tác",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {title ||
            (willSuspend ? "Tạm khóa gian hàng" : "Mở lại hoạt động gian hàng")}
        </DialogTitle>
        <DialogDescription>
          {willSuspend
            ? `Khi tạm khóa, gian hàng của "${partner.name}"đối tác không thể chỉnh sửa hồ sơ hay sản phẩm.`
            : `Gian hàng "${partner.name}" sẽ hiển thị công khai trở lại và đối tác có thể tiếp tục thao tác.`}
        </DialogDescription>
      </DialogHeader>

      {willSuspend && (
        <div className="space-y-1.5 py-1">
          <Label className="text-xs font-semibold">Lý do tạm khóa</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập lý do tạm khóa đối tác (vi phạm chính sách, chờ đối soát...)..."
            maxLength={1000}
            rows={3}
          />
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button
          type="submit"
          variant={willSuspend ? "destructive" : "default"}
          disabled={updateSuspension.isPending}
        >
          {updateSuspension.isPending
            ? "Đang lưu..."
            : willSuspend
              ? "Xác nhận tạm khóa"
              : "Xác nhận mở lại"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PartnerSuspensionDialog({
  open,
  onOpenChange,
  partner,
  title,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {partner && (
          <PartnerSuspensionForm
            key={partner.id}
            partner={partner}
            title={title}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
