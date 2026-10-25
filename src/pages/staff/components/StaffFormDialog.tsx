import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Checkbox,
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
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { useShopFilter } from "@/features/shop";
import {
  STAFF_PERMISSION,
  STAFF_ROLE,
  type Staff,
  type StaffFormValues,
  type StaffPermission,
  type StaffRole,
  staffSchema,
  useCreateStaff,
  useUpdateStaff,
} from "@/features/staff";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a staff member to edit; omit to invite a new one */
  staff?: Staff;
}

const PERMISSIONS = Object.keys(STAFF_PERMISSION) as StaffPermission[];
const ROLES = Object.keys(STAFF_ROLE) as StaffRole[];

const toFormValues = (s?: Staff): StaffFormValues => ({
  name: s?.name ?? "",
  phone: s?.phone ?? "",
  email: s?.email ?? "",
  role: s?.role ?? "sales",
  permissions: s?.permissions ?? STAFF_ROLE.sales.permissions,
  shopId: s?.shopId ?? "",
});

export function StaffFormDialog({ open, onOpenChange, staff }: Props) {
  const { toast } = useToast();
  const { isRoot, filter: shopOptions } = useShopFilter();
  const create = useCreateStaff();
  const update = useUpdateStaff();
  const isEdit = !!staff;
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({ resolver: zodResolver(staffSchema), defaultValues: toFormValues(staff) });

  // Re-seed on open (keyed on id so a background refetch doesn't wipe in-progress edits)
  useEffect(() => {
    if (open) reset(toFormValues(staff));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff?.id, reset]);

  const role = useWatch({ control, name: "role" });
  const permissions = useWatch({ control, name: "permissions" });
  const customised = [...permissions].sort().join() !== [...STAFF_ROLE[role].permissions].sort().join();

  const onSubmit = async (data: StaffFormValues) => {
    if (isRoot && !isEdit && !data.shopId) {
      setError("shopId", { message: "Vui lòng chọn gian hàng" });
      return;
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: staff.id, data });
        toast({ title: "Đã lưu thông tin nhân viên", description: data.name });
      } else {
        await create.mutateAsync(data);
        toast({ title: "Đã gửi lời mời", description: `${data.name} sẽ nhận email kích hoạt tại ${data.email}` });
      }
      onOpenChange(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const err = (k: keyof StaffFormValues) => errors[k] && <p className="text-xs text-destructive">{errors[k]?.message}</p>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa nhân viên" : "Mời nhân viên"}</DialogTitle>
          {!isEdit && (
            <p className="text-sm text-muted-foreground">Nhân viên nhận email để tự đặt mật khẩu và kích hoạt tài khoản.</p>
          )}
        </DialogHeader>
        <form id="staff-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {isRoot && !isEdit && shopOptions && (
            <div className="space-y-1.5">
              <Label>
                Gian hàng<span className="text-destructive"> *</span>
              </Label>
              <Controller
                control={control}
                name="shopId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn gian hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {shopOptions.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {err("shopId")}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="staff-name">
                Họ tên<span className="text-destructive"> *</span>
              </Label>
              <Input id="staff-name" {...register("name")} />
              {err("name")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-phone">
                Số điện thoại<span className="text-destructive"> *</span>
              </Label>
              <Input id="staff-phone" type="tel" inputMode="tel" {...register("phone")} />
              {err("phone")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">
                Email đăng nhập<span className="text-destructive"> *</span>
              </Label>
              <Input id="staff-email" type="email" {...register("email")} />
              {err("email")}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vai trò</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setValue("role", r);
                    // Picking a role resets permissions to its preset
                    setValue("permissions", STAFF_ROLE[r].permissions, { shouldValidate: true });
                  }}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    role === r ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50",
                  )}
                >
                  <div className="text-sm font-medium">{STAFF_ROLE[r].label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{STAFF_ROLE[r].description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Quyền truy cập</Label>
              {customised && (
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setValue("permissions", STAFF_ROLE[role].permissions, { shouldValidate: true })}
                >
                  Khôi phục theo vai trò
                </button>
              )}
            </div>
            <Controller
              control={control}
              name="permissions"
              render={({ field }) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  {PERMISSIONS.map((p) => {
                    const on = field.value.includes(p);
                    return (
                      <label
                        key={p}
                        className={cn("flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5", on && "bg-muted/40")}
                      >
                        <Checkbox
                          checked={on}
                          onCheckedChange={(v) => field.onChange(v ? [...field.value, p] : field.value.filter((x) => x !== p))}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="block text-sm font-medium">{STAFF_PERMISSION[p].label}</span>
                          <span className="block text-xs text-muted-foreground">{STAFF_PERMISSION[p].description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            />
            {err("permissions")}
            <p className="text-xs text-muted-foreground">Chỉ chủ gian hàng mới quản lý được nhân viên.</p>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="submit" form="staff-form" disabled={isSubmitting}>
            {isEdit ? "Lưu thay đổi" : "Gửi lời mời"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
