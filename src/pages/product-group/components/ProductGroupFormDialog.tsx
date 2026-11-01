import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ImageUploadField, TextField, TextareaField } from "@/components/form";
import {
  type CategoryFormValues,
  type ProductCategory,
  PRODUCT_PHOTO_MAX_BYTES,
  categorySchema,
  getFieldErrors,
  isStorefrontSyncError,
  productPhotoApi,
  toCategoryFormValues,
  toCategoryInput,
  useCreateCategory,
  useUpdateCategory,
} from "@/features/shop-catalog";
import { getErrorMessage } from "@/lib/api-error";

type F = CategoryFormValues;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a category to edit it; omit to create a new one */
  group?: ProductCategory;
}

const FIELD_ERROR: Record<string, string> = {
  "api.message.validation.duplicate": "Đã được dùng bởi nhóm khác",
  "api.message.validation.invalidFormat": "Sai định dạng",
};

const uploadImage = async (file: File) => (await productPhotoApi.upload({ file })).fileUrl;

export function ProductGroupFormDialog({ open, onOpenChange, group }: Props) {
  const { toast } = useToast();
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const isEdit = !!group;
  const saving = create.isPending || update.isPending;
  const form = useForm<F>({ resolver: zodResolver(categorySchema), defaultValues: toCategoryFormValues(group) });

  // Re-seed on open (keyed on id so a background refetch doesn't wipe in-progress edits)
  useEffect(() => {
    if (open) form.reset(toCategoryFormValues(group));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group?.id]);

  const onSubmit = async (values: F) => {
    const data = toCategoryInput(values, group?.sortOrder);
    try {
      if (isEdit) {
        await update.mutateAsync({ id: group.id, data });
        toast({ title: "Đã lưu nhóm sản phẩm", description: data.name });
      } else {
        await create.mutateAsync(data);
        toast({ title: "Đã thêm nhóm sản phẩm", description: data.name });
      }
      onOpenChange(false);
    } catch (e) {
      const fieldErrors = Object.entries(getFieldErrors(e)).filter(([k]) => k in values);
      fieldErrors.forEach(([k, reason]) => form.setError(k as keyof F, { message: FIELD_ERROR[reason] ?? reason }));
      if (fieldErrors.length) return;
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Lỗi",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa nhóm sản phẩm" : "Thêm nhóm sản phẩm"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form id="product-group-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ImageUploadField<F>
              name="imageUrl"
              label="Hình ảnh"
              hint="Ảnh vuông, JPEG/PNG/WebP ≤ 20 MB."
              upload={uploadImage}
              maxBytes={PRODUCT_PHOTO_MAX_BYTES}
            />
            <TextField<F> name="name" label="Tên nhóm" required placeholder="VD: Trái cây sấy, Gạo đặc sản" />
            <TextField<F>
              name="handle"
              label="Đường dẫn (handle)"
              placeholder="trai-cay-say"
              description={isEdit ? "Để trống để giữ nguyên." : "Để trống để tự sinh từ tên."}
            />
            <TextareaField<F> name="description" label="Mô tả" rows={3} placeholder="Giới thiệu ngắn về nhóm sản phẩm" />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="submit" form="product-group-form" disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Thêm nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
