import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type PartnerProfile,
  useUpdatePartnerCommissionRate,
} from "@/features/partner";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: PartnerProfile | { id: string | number; name: string; commissionRate?: number };
}

function PartnerCommissionForm({
  partner,
  onClose,
}: {
  partner: PartnerProfile | { id: string | number; name: string; commissionRate?: number };
  onClose: () => void;
}) {
  const { toast } = useToast();
  const updateCommission = useUpdatePartnerCommissionRate();
  const [rate, setRate] = useState<string>(
    partner.commissionRate != null ? String(partner.commissionRate) : "10",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(rate);
    if (isNaN(val) || val < 0 || val > 100) {
      setError("Tỷ lệ hoa hồng phải là số từ 0% đến 100%");
      return;
    }

    try {
      await updateCommission.mutateAsync({
        id: partner.id,
        input: { commissionRate: val },
      });

      toast({
        title: "Đã cập nhật tỷ lệ hoa hồng",
        description: `Tỷ lệ hoa hồng cho "${partner.name}" đã được đặt thành ${val}%.`,
      });
      onClose();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Cập nhật hoa hồng thất bại",
        description: getErrorMessage(err),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Chia sẻ hoa hồng</DialogTitle>
        <DialogDescription>
          Điều chỉnh tỷ lệ hoa hồng chi trả cho đối tác{" "}
          <strong className="text-foreground">{partner.name}</strong> khi có đơn
          hàng hoàn tất qua link giới thiệu.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2 py-2">
        <Label htmlFor="commission-rate-input">
          Tỷ lệ hoa hồng (%)<span className="text-destructive"> *</span>
        </Label>
        <div className="relative">
          <Input
            id="commission-rate-input"
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={rate}
            onChange={(e) => {
              setRate(e.target.value);
              if (error) setError(null);
            }}
            className="pr-8"
            placeholder="VD: 8"
            disabled={updateCommission.isPending}
            required
            autoFocus
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
            %
          </span>
        </div>
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Áp dụng cho các đơn hàng hoàn tất phát sinh sau thời điểm cập nhật.
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={updateCommission.isPending}
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={updateCommission.isPending}>
          {updateCommission.isPending && (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          )}
          {updateCommission.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function PartnerCommissionDialog({ open, onOpenChange, partner }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {partner && (
          <PartnerCommissionForm
            key={partner.id}
            partner={partner}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
