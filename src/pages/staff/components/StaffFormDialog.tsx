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
  Input,
  Label,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type Staff,
  type StaffFormValues,
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

const toFormValues = (s?: Staff): StaffFormValues => ({
  name: s?.name ?? "",
  phone: s?.phone ?? "",
  email: s?.email ?? "",
  password: "",
});

export function StaffFormDialog({ open, onOpenChange, staff }: Props) {
  const { toast } = useToast();
  const create = useCreateStaff();
  const update = useUpdateStaff();
  const isEdit = !!staff;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({ resolver: zodResolver(staffSchema), defaultValues: toFormValues(staff) });

  // Re-seed on open (keyed on id so a background refetch doesn't wipe in-progress edits)
  useEffect(() => {
    if (open) reset(toFormValues(staff));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, staff?.id, reset]);

  const onSubmit = async (data: StaffFormValues) => {
    if (!isEdit && !data.password) {
      setError("password", { message: "Vui lòng đặt mật khẩu" });
      return;
    }
    // Blank on edit = keep the current password
    if (!data.password) delete data.password;
    try {
      if (isEdit) {
        await update.mutateAsync({ id: staff.id, data });
        toast({ title: "Đã lưu thông tin nhân viên", description: data.name });
      } else {
        await create.mutateAsync(data);
        toast({ title: "Đã tạo tài khoản", description: `${data.name} đăng nhập bằng ${data.email}` });
      }
      onOpenChange(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const err = (k: keyof StaffFormValues) => errors[k] && <p className="text-xs text-destructive">{errors[k]?.message}</p>;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa nhân viên điều phối" : "Thêm nhân viên điều phối"}</DialogTitle>
          {!isEdit && (
            <p className="text-sm text-muted-foreground">Nhân viên đăng nhập bằng email và mật khẩu bạn đặt bên dưới.</p>
          )}
        </DialogHeader>
        <form id="staff-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="staff-password">
                Mật khẩu{!isEdit && <span className="text-destructive"> *</span>}
              </Label>
              <Input
                id="staff-password"
                type="password"
                autoComplete="new-password"
                placeholder={isEdit ? "Để trống nếu không đổi" : "Tối thiểu 8 ký tự"}
                {...register("password")}
              />
              {err("password")}
            </div>
          </div>

        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="submit" form="staff-form" disabled={isSubmitting}>
            {isEdit ? "Lưu thay đổi" : "Tạo tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
