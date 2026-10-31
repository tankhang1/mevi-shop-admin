import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { useDispatchTeams } from "@/features/dispatch-team";
import {
  STAFF_GENDER,
  type Staff,
  type StaffGender,
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
  dateOfBirth: s?.dateOfBirth?.slice(0, 10) ?? "",
  gender: s?.gender ?? "",
  idNumber: s?.idNumber ?? "",
  address: s?.address ?? "",
  teamId: s?.teamId ?? "",
});

/** Radix Select can't hold "" — this stands for "no team" */
const NO_TEAM = "__none__";

export function StaffFormDialog({ open, onOpenChange, staff }: Props) {
  const { toast } = useToast();
  const create = useCreateStaff();
  const update = useUpdateStaff();
  const isEdit = !!staff;
  const { data: teams } = useDispatchTeams({ size: 100 }, open);
  const teamOptions = (teams?.items ?? []).filter((t) => !staff || t.shopId === staff.shopId);
  const {
    register,
    control,
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
    const input = {
      ...data,
      password: data.password,
      dateOfBirth: data.dateOfBirth || null,
      gender: (data.gender || null) as StaffGender | null,
      idNumber: data.idNumber || null,
      address: data.address || null,
      teamId: data.teamId || null,
    };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: staff.id, data: input });
        toast({ title: "Đã lưu thông tin nhân viên", description: data.name });
      } else {
        await create.mutateAsync(input);
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
            <p className="text-sm text-muted-foreground">
              Tạo tài khoản đầy đủ trên nền tảng, mặc định vai trò điều phối của gian hàng. Nhân viên đăng nhập bằng
              email và mật khẩu bạn đặt bên dưới.
            </p>
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
            <div className="space-y-1.5">
              <Label htmlFor="staff-dob">Ngày sinh</Label>
              <Input id="staff-dob" type="date" {...register("dateOfBirth")} />
            </div>
            <div className="space-y-1.5">
              <Label>Giới tính</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STAFF_GENDER) as StaffGender[]).map((g) => (
                        <SelectItem key={g} value={g}>
                          {STAFF_GENDER[g]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="staff-id">Số CCCD</Label>
              <Input id="staff-id" inputMode="numeric" maxLength={12} {...register("idNumber")} />
              {err("idNumber")}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="staff-address">Địa chỉ</Label>
              <Textarea id="staff-address" rows={2} {...register("address")} />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-semibold">Tài khoản & phân công</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Vai trò</Label>
                <Input value="Nhân viên điều phối" disabled readOnly />
              </div>
              <div className="space-y-1.5">
                <Label>Nhóm điều phối</Label>
                <Controller
                  control={control}
                  name="teamId"
                  render={({ field }) => (
                    <Select value={field.value || NO_TEAM} onValueChange={(v) => field.onChange(v === NO_TEAM ? "" : v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_TEAM}>Chưa thuộc nhóm nào</SelectItem>
                        {teamOptions.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-xs text-muted-foreground">Chỉ thuộc 1 nhóm — dùng để phân bổ đơn hàng xử lý</p>
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
