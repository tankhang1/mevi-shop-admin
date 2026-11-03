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
}

function PartnerSuspensionForm({
  partner,
  onClose,
}: {
  partner: PartnerProfile;
  onClose: () => void;
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
        title: willSuspend ? "Đã tạm khóa đối tác" : "Đã mở lại đối tác",
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
          {willSuspend
            ? "Tạm khóa đối tác & gian hàng"
            : "Mở lại hoạt động đối tác"}
        </DialogTitle>
        <DialogDescription>
          {willSuspend
            ? `Khi tạm khóa, gian hàng của "${partner.name}" sẽ bị ẩn khỏi trang public (trả về 404) và đối tác không thể chỉnh sửa hồ sơ hay sản phẩm.`
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
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {partner && (
          <PartnerSuspensionForm
            key={partner.id}
            partner={partner}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
