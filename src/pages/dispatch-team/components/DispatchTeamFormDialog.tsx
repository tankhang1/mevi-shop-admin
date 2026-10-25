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
  Textarea,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock } from "@/components/common/ui-bits";
import {
  type DispatchTeam,
  type DispatchTeamFormValues,
  REGION_SUGGESTIONS,
  dispatchTeamSchema,
  useCreateDispatchTeam,
  useUpdateDispatchTeam,
} from "@/features/dispatch-team";
import { useShopFilter } from "@/features/shop";
import { STAFF_ROLE, useStaffList } from "@/features/staff";
import { getErrorMessage } from "@/lib/api-error";
import { TagInput } from "@/pages/customer/components/TagInput";
import { Initials } from "@/pages/customer/CustomerListPage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: DispatchTeam;
}

const NO_LEADER = "none";

const toFormValues = (t?: DispatchTeam): DispatchTeamFormValues => ({
  name: t?.name ?? "",
  description: t?.description ?? "",
  memberIds: t?.memberIds ?? [],
  leaderId: t?.leaderId ?? null,
  regions: t?.regions ?? [],
  shopId: t?.shopId ?? "",
});

export function DispatchTeamFormDialog({ open, onOpenChange, team }: Props) {
  const { toast } = useToast();
  const { isRoot, filter: shopOptions } = useShopFilter();
  const create = useCreateDispatchTeam();
  const update = useUpdateDispatchTeam();
  const isEdit = !!team;
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DispatchTeamFormValues>({
    resolver: zodResolver(dispatchTeamSchema),
    defaultValues: toFormValues(team),
  });

  useEffect(() => {
    if (open) reset(toFormValues(team));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, team?.id, reset]);

  const shopId = useWatch({ control, name: "shopId" }) || team?.shopId;
  const memberIds = useWatch({ control, name: "memberIds" });
  // Locked staff can't work orders, so only offer active / invited people
  const { data: staffPage } = useStaffList({
    size: 200,
    shopId: isRoot ? shopId || "none" : undefined,
  });
  const staff = (staffPage?.items ?? []).filter((s) => s.status !== "disabled");

  const onSubmit = async (data: DispatchTeamFormValues) => {
    if (isRoot && !isEdit && !data.shopId) {
      setError("shopId", { message: "Vui lòng chọn gian hàng" });
      return;
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: team.id, data });
        toast({ title: "Đã lưu nhóm điều phối", description: data.name });
      } else {
        await create.mutateAsync(data);
        toast({ title: "Đã tạo nhóm điều phối", description: data.name });
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

  const err = (k: keyof DispatchTeamFormValues) =>
    errors[k] && (
      <p className="text-xs text-destructive">{errors[k]?.message}</p>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa nhóm điều phối" : "Tạo nhóm điều phối"}
          </DialogTitle>
        </DialogHeader>
        <form
          id="team-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {isRoot && !isEdit && shopOptions && (
            <div className="space-y-1.5">
              <Label>
                Gian hàng<span className="text-destructive"> *</span>
              </Label>
              <Controller
                control={control}
                name="shopId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      // Members belong to one shop
                      setValue("memberIds", []);
                      setValue("leaderId", null);
                    }}
                  >
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

          <div className="space-y-1.5">
            <Label htmlFor="team-name">
              Tên nhóm<span className="text-destructive"> *</span>
            </Label>
            <Input
              id="team-name"
              placeholder="VD: Nhóm giao nội thành HCM"
              {...register("name")}
            />
            {err("name")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team-desc">Mô tả</Label>
            <Textarea id="team-desc" rows={2} {...register("description")} />
            {err("description")}
          </div>

          <div className="space-y-1.5">
            <Label>Khu vực phụ trách</Label>
            <Controller
              control={control}
              name="regions"
              render={({ field }) => (
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  suggestions={REGION_SUGGESTIONS}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              “Tự động phân đơn” giao đơn cho nhóm khi địa chỉ nhận hàng chứa
              một trong các khu vực này.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>
              Thành viên<span className="text-destructive"> *</span>
            </Label>
            {staff.length === 0 ? (
              <EmptyBlock>
                {isRoot && !shopId
                  ? "Chọn gian hàng trước."
                  : "Gian hàng chưa có nhân viên nào."}
              </EmptyBlock>
            ) : (
              <Controller
                control={control}
                name="memberIds"
                render={({ field }) => (
                  <ul className="max-h-56 divide-y overflow-y-auto rounded-lg border">
                    {staff.map((s) => {
                      const on = field.value.includes(s.id);
                      return (
                        <li key={s.id}>
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-3 px-3 py-2",
                              on && "bg-muted/40",
                            )}
                          >
                            <Checkbox
                              checked={on}
                              onCheckedChange={(v) =>
                                field.onChange(
                                  v
                                    ? [...field.value, s.id]
                                    : field.value.filter((x) => x !== s.id),
                                )
                              }
                            />
                            <Initials name={s.name} size="h-7 w-7 text-xs" />
                            <span className="min-w-0 flex-1 truncate text-sm">
                              {s.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {STAFF_ROLE[s.role].label}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              />
            )}
            {err("memberIds")}
          </div>

          <div className="space-y-1.5">
            <Label>Trưởng nhóm</Label>
            <Controller
              control={control}
              name="leaderId"
              render={({ field }) => (
                <Select
                  value={field.value ?? NO_LEADER}
                  onValueChange={(v) =>
                    field.onChange(v === NO_LEADER ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_LEADER}>Chưa chọn</SelectItem>
                    {staff
                      .filter((s) => memberIds.includes(s.id))
                      .map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {err("leaderId")}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="submit" form="team-form" disabled={isSubmitting}>
            {isEdit ? "Lưu thay đổi" : "Tạo nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
