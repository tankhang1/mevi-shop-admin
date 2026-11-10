import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  AutoCompleteSelect,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  CUSTOMER_AUDIENCE_TYPES,
  CUSTOMER_TAG_SUGGESTIONS,
  type CustomerFormValues,
  type ShopCustomer,
  customerSchema,
  toLocalPhone,
  useCreateCustomer,
  useUpdateCustomerProfile,
} from "@/features/customer";
import { useGeoProvinces, useGeoWards } from "@/features/partner";
import { getErrorMessage } from "@/lib/api-error";
import { TagInput } from "./TagInput";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a customer to edit its profile; omit to add a new one */
  customer?: ShopCustomer;
  onCreated?: (c: ShopCustomer) => void;
}

const toFormValues = (c?: ShopCustomer): CustomerFormValues => ({
  fullName: c?.fullName ?? "",
  phoneNumber: c ? toLocalPhone(c.phoneNumber) : "",
  email: c?.email ?? "",
  audienceType: "individual",
  audienceTypeOther: "",
  operatingArea: c?.operatingArea ?? "",
  province: c?.province ?? "",
  commune: c?.commune ?? "",
  tags: c?.tags ?? [],
  internalNote: c?.internalNote ?? "",
});

const orNull = (v: string) => v.trim() || null;

export function CustomerFormDialog({ open, onOpenChange, customer, onCreated }: Props) {
  const { toast } = useToast();
  const create = useCreateCustomer();
  const update = useUpdateCustomerProfile();
  const isEdit = !!customer;
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
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

  const audienceType = useWatch({ control, name: "audienceType" });
  const province = useWatch({ control, name: "province" });
  const { data: provinces = [], isLoading: loadingProvinces } = useGeoProvinces();
  const provinceCode = provinces.find((p) => p.fullName === province || p.name === province)?.code;
  const { data: wards = [], isLoading: loadingWards } = useGeoWards(provinceCode);

  const onSubmit = async (v: CustomerFormValues) => {
    // PUT replaces every profile field, so always send them all
    const profile = {
      operatingArea: orNull(v.operatingArea),
      province: orNull(v.province),
      commune: orNull(v.commune),
      tags: v.tags,
      internalNote: orNull(v.internalNote),
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: customer.id, data: profile });
        toast({ title: "Đã lưu thông tin khách hàng", description: customer.fullName });
      } else {
        const c = await create.mutateAsync({
          ...profile,
          fullName: v.fullName.trim(),
          phoneNumber: v.phoneNumber.trim(),
          email: orNull(v.email),
          audienceType: v.audienceType,
          audienceTypeOther: v.audienceType === "other" ? orNull(v.audienceTypeOther) : null,
        });
        toast({ title: "Đã thêm khách hàng", description: c.fullName });
        onCreated?.(c);
      }
      onOpenChange(false);
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError("phoneNumber", { message: "Số điện thoại đã có tài khoản" });
        return;
      }
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const err = (k: keyof CustomerFormValues) =>
    errors[k] && <p className="text-xs text-destructive">{errors[k]?.message}</p>;
  const req = <span className="text-destructive"> *</span>;

  return (
    <Dialog open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa hồ sơ khách hàng" : "Thêm khách hàng"}</DialogTitle>
        </DialogHeader>
        <form id="customer-form" onSubmit={handleSubmit(onSubmit)}>
          <fieldset disabled={isSubmitting} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fullName">Họ tên{!isEdit && req}</Label>
            <Input id="fullName" disabled={isEdit} {...register("fullName")} />
            {err("fullName")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Số điện thoại{!isEdit && req}</Label>
            <Input
              id="phoneNumber"
              type="tel"
              inputMode="tel"
              placeholder="09xxxxxxxx"
              disabled={isEdit}
              {...register("phoneNumber")}
            />
            {err("phoneNumber")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" disabled={isEdit} {...register("email")} />
            {err("email")}
          </div>

          {!isEdit && (
            <>
              <div className="space-y-1.5">
                <Label>Đối tượng{req}</Label>
                <Controller
                  control={control}
                  name="audienceType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CUSTOMER_AUDIENCE_TYPES.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {audienceType === "other" && (
                <div className="space-y-1.5">
                  <Label htmlFor="audienceTypeOther">Mô tả đối tượng{req}</Label>
                  <Input id="audienceTypeOther" {...register("audienceTypeOther")} />
                  {err("audienceTypeOther")}
                </div>
              )}
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Khách đăng nhập bằng SĐT với mật khẩu mặc định và phải đổi mật khẩu ở lần đăng nhập đầu tiên.
              </p>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Tỉnh / Thành phố</Label>
            <Controller
              control={control}
              name="province"
              render={({ field }) => (
                <AutoCompleteSelect
                  options={provinces.map((p) => ({ value: p.fullName || p.name, label: p.fullName || p.name }))}
                  value={field.value}
                  disabled={isSubmitting}
                  onChange={(v: string) => {
                    field.onChange(v ?? "");
                    setValue("commune", "");
                  }}
                  placeholder={loadingProvinces ? "Đang tải..." : "Chọn Tỉnh / Thành phố"}
                  searchPlaceholder="Tìm tỉnh, thành phố..."
                  emptyText="Không tìm thấy"
                  clearable
                  className="w-full"
                />
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phường / Xã</Label>
            <Controller
              control={control}
              name="commune"
              render={({ field }) => (
                <AutoCompleteSelect
                  options={wards.map((w) => ({ value: w.fullName || w.name, label: w.fullName || w.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!province || isSubmitting}
                  placeholder={!province ? "Chọn Tỉnh/Thành trước" : loadingWards ? "Đang tải..." : "Chọn Phường / Xã"}
                  searchPlaceholder="Tìm phường, xã..."
                  emptyText="Không tìm thấy"
                  clearable
                  className="w-full"
                />
              )}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="operatingArea">Địa chỉ</Label>
            <Input id="operatingArea" placeholder="Số nhà, đường..." {...register("operatingArea")} />
            {err("operatingArea")}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Nhãn</Label>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput value={field.value} onChange={field.onChange} suggestions={CUSTOMER_TAG_SUGGESTIONS} />
              )}
            />
            {err("tags")}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="internalNote">Ghi chú nội bộ</Label>
            <Textarea
              id="internalNote"
              rows={3}
              placeholder="Sở thích, lưu ý khi giao hàng… (khách không thấy)"
              {...register("internalNote")}
            />
            {err("internalNote")}
          </div>
          </fieldset>
        </form>
        <DialogFooter>
          <Button variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="submit" form="customer-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Thêm khách hàng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
