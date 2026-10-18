import { DeleteDialog, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { type Agency, useDeleteAgency } from "@/features/agency";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  agency: Agency | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteAgencyDialog({ agency, onOpenChange, onDeleted }: Props) {
  const { toast } = useToast();
  const del = useDeleteAgency();

  const onConfirm = async () => {
    if (!agency) return;
    try {
      await del.mutateAsync(agency.id);
      toast({ title: "Đã xoá đại lý", description: agency.name });
      onOpenChange(false);
      onDeleted?.();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể xoá",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <DeleteDialog
      open={!!agency}
      onOpenChange={onOpenChange}
      title="Xoá đại lý?"
      description={`Đại lý "${agency?.name ?? ""}" sẽ bị xoá vĩnh viễn, link giới thiệu ?ref=${agency?.slug ?? ""} ngừng hoạt động. Đơn hàng cũ vẫn được giữ lại.`}
      onConfirm={() => void onConfirm()}
      loading={del.isPending}
    />
  );
}
