import { DeleteDialog, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { type ProductCategory, isConflictError, isStorefrontSyncError, useDeleteCategory } from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  group: ProductCategory | null;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteProductGroupDialog({ group, onOpenChange, onDeleted }: Props) {
  const { toast } = useToast();
  const del = useDeleteCategory();

  const onConfirm = async () => {
    if (!group) return;
    try {
      await del.mutateAsync(group.id);
      toast({ title: "Đã xoá nhóm sản phẩm", description: group.name });
      onOpenChange(false);
      onDeleted?.();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể xoá",
        description: isConflictError(e)
          ? "Nhóm vẫn còn sản phẩm. Chuyển các sản phẩm sang nhóm khác trước khi xoá."
          : isStorefrontSyncError(e)
            ? "Chưa cập nhật được trang shop, vui lòng thử lại"
            : getErrorMessage(e),
      });
    }
  };

  return (
    <DeleteDialog
      open={!!group}
      onOpenChange={onOpenChange}
      title="Xoá nhóm sản phẩm?"
      description={`Nhóm "${group?.name ?? ""}" sẽ bị xoá. Chỉ xoá được khi nhóm không còn sản phẩm.`}
      onConfirm={() => void onConfirm()}
      loading={del.isPending}
    />
  );
}
