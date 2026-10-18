import { useState } from "react";
import { Switch, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { type Agency, useUpdateAgency } from "@/features/agency";
import { getErrorMessage } from "@/lib/api-error";

/** Active switch that asks before pausing/activating an agency */
export function AgencyActiveToggle({ agency }: { agency: Agency }) {
  const { toast } = useToast();
  const update = useUpdateAgency();
  const [open, setOpen] = useState(false);
  const pausing = agency.active;

  const confirm = async () => {
    try {
      await update.mutateAsync({
        id: agency.id,
        data: { active: !agency.active },
      });
      toast({
        title: pausing ? "Đã tạm dừng đại lý" : "Đã kích hoạt đại lý",
        description: agency.name,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: getErrorMessage(e),
      });
    } finally {
      setOpen(false);
    }
  };

  return (
    // Stop clicks reaching the table row, which would otherwise open the detail page
    <span onClick={(e) => e.stopPropagation()}>
      <Switch
        checked={agency.active}
        onCheckedChange={() => setOpen(true)}
        aria-label="Hoạt động"
      />
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        destructive={pausing}
        loading={update.isPending}
        title={
          pausing ? `Tạm dừng ${agency.name}?` : `Kích hoạt ${agency.name}?`
        }
        description={
          pausing
            ? "Gian hàng và link giới thiệu của đại lý sẽ ngừng hoạt động với khách hàng."
            : "Gian hàng sẽ hoạt động trở lại qua link giới thiệu."
        }
        confirmLabel={pausing ? "Tạm dừng" : "Kích hoạt"}
        onConfirm={() => void confirm()}
      />
    </span>
  );
}
