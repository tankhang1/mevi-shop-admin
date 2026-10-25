import { useEffect } from "react";
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
import { ImageUploadField, SelectField, TextField, TextareaField } from "@/components/form";
import {
  type ProductGroup,
  type ProductGroupFormValues,
  productGroupSchema,
  useCreateProductGroup,
  useUpdateProductGroup,
} from "@/features/product-group";
import { useShopFilter } from "@/features/shop";
import { getErrorMessage } from "@/lib/api-error";

type F = ProductGroupFormValues;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a group to edit it; omit to create a new one */
  group?: ProductGroup;
}

const toFormValues = (g?: ProductGroup): F => ({
  name: g?.name ?? "",
  description: g?.description ?? "",
  imageUrl: g?.imageUrl ?? "",
  shopId: g?.shopId ?? "",
});

export function ProductGroupFormDialog({ open, onOpenChange, group }: Props) {
  const { toast } = useToast();
  const { isRoot, filter: shopOptions } = useShopFilter();
  const create = useCreateProductGroup();
  const update = useUpdateProductGroup();
  const isEdit = !!group;
  const form = useForm<F>({ resolver: zodResolver(productGroupSchema), defaultValues: toFormValues(group) });

  // Re-seed on open (keyed on id so a background refetch doesn't wipe in-progress edits)
  useEffect(() => {
    if (open) form.reset(toFormValues(group));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, group?.id]);

  const onSubmit = async (data: F) => {
    if (isRoot && !isEdit && !data.shopId) {
      form.setError("shopId", { message: "Vui lòng chọn gian hàng" });
      return;
    }
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
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
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
            {isRoot && !isEdit && shopOptions && (
              <SelectField<F> name="shopId" label="Gian hàng" required options={shopOptions.options} />
            )}
            <ImageUploadField<F> name="imageUrl" label="Hình ảnh" hint="Ảnh vuông, JPEG/PNG/WebP ≤ 8 MB." />
            <TextField<F> name="name" label="Tên nhóm" required placeholder="VD: Quà Tết, Gạo đặc sản" />
            <TextareaField<F> name="description" label="Mô tả" rows={3} placeholder="Giới thiệu ngắn về nhóm sản phẩm" />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="submit" form="product-group-form" disabled={form.formState.isSubmitting}>
            {isEdit ? "Lưu thay đổi" : "Thêm nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
