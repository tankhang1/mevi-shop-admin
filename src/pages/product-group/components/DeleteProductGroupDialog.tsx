import { DeleteDialog, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { type ProductGroup, useDeleteProductGroup } from "@/features/product-group";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  group: ProductGroup | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteProductGroupDialog({ group, onOpenChange, onDeleted }: Props) {
  const { toast } = useToast();
  const del = useDeleteProductGroup();

  const onConfirm = async () => {
    if (!group) return;
    try {
      await del.mutateAsync(group.id);
      toast({ title: "Đã xoá nhóm sản phẩm", description: group.name });
      onOpenChange(false);
      onDeleted?.();
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể xoá", description: getErrorMessage(e) });
    }
  };

  return (
    <DeleteDialog
      open={!!group}
      onOpenChange={onOpenChange}
      title="Xoá nhóm sản phẩm?"
      description={`Nhóm "${group?.name ?? ""}" sẽ bị xoá. Các sản phẩm trong nhóm vẫn được giữ nguyên.`}
      onConfirm={() => void onConfirm()}
      loading={del.isPending}
    />
  );
}
