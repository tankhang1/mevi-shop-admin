import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  CUSTOMER_TAG_SUGGESTIONS,
  type Customer,
  type CustomerFormValues,
  customerSchema,
  useCreateCustomer,
  useUpdateCustomer,
} from "@/features/customer";
import { getErrorMessage } from "@/lib/api-error";
import { TagInput } from "./TagInput";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a customer to edit; omit to add a new one */
  customer?: Customer;
  onCreated?: (c: Customer) => void;
}

const toFormValues = (c?: Customer): CustomerFormValues => ({
  name: c?.name ?? "",
  phone: c?.phone ?? "",
  email: c?.email ?? "",
  address: c?.address ?? "",
  tags: c?.tags ?? [],
  note: c?.note ?? "",
});

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onCreated,
}: Props) {
  const { toast } = useToast();
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const isEdit = !!customer;
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: toFormValues(customer),
  });

  // Re-seed on open (keyed on id so a background refetch doesn't wipe in-progress edits)
  useEffect(() => {
    if (open) reset(toFormValues(customer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customer?.id, reset]);

  const phone = useWatch({ control, name: "phone" });
  const phoneChanged = isEdit && phone !== customer.phone;

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: customer.id, data });
        toast({ title: "Đã lưu thông tin khách hàng", description: data.name });
      } else {
        const c = await create.mutateAsync(data);
        toast({ title: "Đã thêm khách hàng", description: data.name });
        onCreated?.(c);
      }
      onOpenChange(false);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: getErrorMessage(e),
      });
    }
  };

  const err = (k: keyof CustomerFormValues) =>
    errors[k] && (
      <p className="text-xs text-destructive">{errors[k]?.message}</p>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa thông tin khách hàng" : "Thêm khách hàng"}
          </DialogTitle>
        </DialogHeader>
        <form
          id="customer-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">
              Họ tên<span className="text-destructive"> *</span>
            </Label>
            <Input id="name" {...register("name")} />
            {err("name")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Số điện thoại<span className="text-destructive"> *</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="09xxxxxxxx"
              {...register("phone")}
            />
            {err("phone")}
            {phoneChanged && (
              <p className="text-xs text-amber-700">
                Các đơn cũ sẽ được chuyển sang số mới.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {err("email")}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nhãn</Label>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  suggestions={CUSTOMER_TAG_SUGGESTIONS}
                />
              )}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="note">Ghi chú nội bộ</Label>
            <Textarea
              id="note"
              rows={3}
              placeholder="Sở thích, lưu ý khi giao hàng…"
              {...register("note")}
            />
            {err("note")}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="submit" form="customer-form" disabled={isSubmitting}>
            {isEdit ? "Lưu thay đổi" : "Thêm khách hàng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
