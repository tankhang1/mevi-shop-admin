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
  RadioGroup,
  RadioGroupItem,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type PartnerProfile,
  type PartnerType,
  useUpdatePartnerType,
} from "@/features/partner";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: PartnerProfile;
}

function PartnerTypeForm({
  partner,
  onClose,
}: {
  partner: PartnerProfile;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const updateType = useUpdatePartnerType();
  const [type, setType] = useState<PartnerType>(partner.partnerType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateType.mutateAsync({
        id: partner.id,
        input: { partnerType: type },
      });
      toast({
        title: "Đổi loại đối tác thành công",
        description: `Đối tác "${partner.name}" đã được chuyển sang ${
          type === "AGENCY" ? "Đại lý" : "Cộng tác viên"
        }.`,
      });
      onClose();
    } catch (err) {
      toast({
        title: "Lỗi chuyển đổi",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Thay đổi loại đối tác</DialogTitle>
        <DialogDescription>
          Cộng tác viên (CTV) và Đại lý có cùng quyền quản trị gian hàng và
          quảng bá sản phẩm, khác nhau ở chính sách chiết khấu và quy mô.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-2">
        <RadioGroup
          value={type}
          onValueChange={(val) => setType(val as PartnerType)}
          className="space-y-2.5"
        >
          <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/30">
            <RadioGroupItem value="COLLABORATOR" id="type-collab" />
            <Label htmlFor="type-collab" className="cursor-pointer flex-1">
              <div className="font-semibold text-sm">Cộng tác viên (CTV)</div>
              <div className="text-xs text-muted-foreground">
                Cá nhân bán hàng và hưởng hoa hồng theo đơn
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/30">
            <RadioGroupItem value="AGENCY" id="type-agency" />
            <Label htmlFor="type-agency" className="cursor-pointer flex-1">
              <div className="font-semibold text-sm">Đại lý chính thức</div>
              <div className="text-xs text-muted-foreground">
                Cửa hàng, doanh nghiệp có quy mô phân phối lớn
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={updateType.isPending}>
          {updateType.isPending ? "Đang lưu..." : "Xác nhận đổi"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PartnerTypeDialog({ open, onOpenChange, partner }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {partner && (
          <PartnerTypeForm
            key={partner.id}
            partner={partner}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
