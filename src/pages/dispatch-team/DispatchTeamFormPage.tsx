import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation, useParams } from "wouter";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Crown, Plus, Tags, Users, X } from "lucide-react";
import { Button, Input, Label, Textarea, cn, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import {
  type DispatchTeam,
  type DispatchTeamFormValues,
  dispatchTeamSchema,
  useCreateDispatchTeam,
  useDispatchTeams,
  useUpdateDispatchTeam,
} from "@/features/dispatch-team";
import { PRODUCT_CATEGORIES, useProducts } from "@/features/product";
import { useStaffList } from "@/features/staff";
import { getErrorMessage } from "@/lib/api-error";
import { Initials } from "@/pages/customer/CustomerListPage";
import { CardPickerDialog, type PickerItem } from "./components/CardPickerDialog";

const toFormValues = (t?: DispatchTeam): DispatchTeamFormValues => ({
  name: t?.name ?? "",
  description: t?.description ?? "",
  memberIds: t?.memberIds ?? [],
  leaderId: t?.leaderId ?? null,
  categories: t?.categories ?? [],
});

function Section({
  icon,
  title,
  hint,
  action,
  error,
  children,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 text-muted-foreground">{icon}</span>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </section>
  );
}

/** Tạo / sửa nhóm điều phối — members and danh mục are picked from a searchable card dialog */
export default function DispatchTeamFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: teamPage, isLoading } = useDispatchTeams({ size: 200 });
  const team = id ? teamPage?.items.find((t) => t.id === id) : undefined;
  const { data: staffPage } = useStaffList({ size: 200 });
  const { data: productPage } = useProducts({ size: 200 });
  const create = useCreateDispatchTeam();
  const update = useUpdateDispatchTeam();
  const [picker, setPicker] = useState<"members" | "categories" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DispatchTeamFormValues>({ resolver: zodResolver(dispatchTeamSchema), defaultValues: toFormValues() });

  useEffect(() => {
    if (team) reset(toFormValues(team));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.id, reset]);

  const memberIds = useWatch({ control, name: "memberIds" });
  const leaderId = useWatch({ control, name: "leaderId" });
  const categories = useWatch({ control, name: "categories" });

  // Locked accounts can't work orders
  const staff = (staffPage?.items ?? []).filter((s) => s.status !== "disabled" || memberIds.includes(s.id));
  const otherTeams = (teamPage?.items ?? []).filter((t) => t.id !== id);
  const products = productPage?.items ?? [];

  const memberItems: PickerItem[] = staff.map((s) => {
    const current = otherTeams.find((t) => t.memberIds.includes(s.id));
    return {
      id: s.id,
      title: s.name,
      subtitle: `${s.phone} · ${s.email}`,
      media: <Initials name={s.name} size="h-10 w-10 text-sm" />,
      // One team per person: picking moves them here
      note: current ? `Đang ở ${current.name} — sẽ chuyển sang nhóm này` : undefined,
    };
  });

  const categoryItems: PickerItem[] = PRODUCT_CATEGORIES.map((c) => {
    const inCat = products.filter((p) => p.category === c);
    const owner = otherTeams.find((t) => t.categories.includes(c));
    return {
      id: c,
      title: c,
      subtitle: `${inCat.length} sản phẩm`,
      media: (
        <img
          src={inCat.find((p) => p.images[0])?.images[0] || placeholder}
          alt=""
          className="h-10 w-10 shrink-0 rounded-lg border object-cover"
        />
      ),
      note: owner ? `Đã thuộc ${owner.name}` : undefined,
      disabled: !!owner,
    };
  });

  const setMembers = (ids: string[]) => {
    setValue("memberIds", ids, { shouldValidate: true, shouldDirty: true });
    if (leaderId && !ids.includes(leaderId)) setValue("leaderId", null);
  };

  const onSubmit = async (data: DispatchTeamFormValues) => {
    try {
      if (team) {
        await update.mutateAsync({ id: team.id, data });
        toast({ title: "Đã lưu nhóm điều phối", description: data.name });
      } else {
        await create.mutateAsync(data);
        toast({ title: "Đã tạo nhóm điều phối", description: data.name });
      }
      navigate(ROUTES.dispatchTeams);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  if (id && isLoading) return <LoadingBlock />;
  if (id && !team) return <EmptyBlock>Không tìm thấy nhóm điều phối.</EmptyBlock>;

  const pickedMembers = memberIds.flatMap((mid) => memberItems.find((m) => m.id === mid) ?? []);
  const pickedCategories = categories.flatMap((c) => categoryItems.find((x) => x.id === c) ?? []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <BackLink to={ROUTES.dispatchTeams} label="Nhóm điều phối" />

      <section className="grid gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="team-name">
            Tên nhóm<span className="text-destructive"> *</span>
          </Label>
          <Input id="team-name" placeholder="VD: Nhóm gạo & ngũ cốc" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="team-desc">Mô tả</Label>
          <Textarea id="team-desc" rows={3} {...register("description")} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
      </section>

      <Section
        icon={<Tags className="h-4 w-4" />}
        title="Danh mục sản phẩm phụ trách"
        hint="Áp dụng cho mọi gian hàng. Đơn có sản phẩm thuộc các danh mục này được tự động giao lần lượt cho từng thành viên."
        action={
          <Button type="button" variant="outline" size="sm" onClick={() => setPicker("categories")}>
            <Plus className="mr-1 h-4 w-4" /> Chọn danh mục
          </Button>
        }
      >
        {pickedCategories.length ? (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {pickedCategories.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border p-3">
                {c.media}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.subtitle}</div>
                </div>
                <RemoveBtn
                  onClick={() => setValue("categories", categories.filter((x) => x !== c.id), { shouldDirty: true })}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyPick onClick={() => setPicker("categories")}>Chưa chọn danh mục nào</EmptyPick>
        )}
      </Section>

      <Section
        icon={<Users className="h-4 w-4" />}
        title={`Thành viên${memberIds.length ? ` (${memberIds.length})` : ""}`}
        hint="Mỗi nhân viên chỉ thuộc một nhóm. Bấm vương miện để đặt trưởng nhóm."
        error={errors.memberIds?.message ?? errors.leaderId?.message}
        action={
          <Button type="button" variant="outline" size="sm" onClick={() => setPicker("members")}>
            <Plus className="mr-1 h-4 w-4" /> Chọn thành viên
          </Button>
        }
      >
        {pickedMembers.length ? (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {pickedMembers.map((m) => {
              const lead = m.id === leaderId;
              return (
                <div
                  key={m.id}
                  className={cn("flex items-center gap-3 rounded-xl border p-3", lead && "border-amber-300 bg-amber-50/50")}
                >
                  {m.media}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{m.title}</span>
                      {lead && (
                        <span className="shrink-0 rounded bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-800">
                          Trưởng nhóm
                        </span>
                      )}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{m.subtitle}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue("leaderId", lead ? null : m.id, { shouldDirty: true })}
                    className={cn(
                      "rounded-md p-1.5 transition hover:bg-muted",
                      lead ? "text-amber-500" : "text-muted-foreground/50 hover:text-amber-500",
                    )}
                    aria-label={lead ? "Bỏ trưởng nhóm" : "Đặt làm trưởng nhóm"}
                    title={lead ? "Bỏ trưởng nhóm" : "Đặt làm trưởng nhóm"}
                  >
                    <Crown className="h-4 w-4" />
                  </button>
                  <RemoveBtn onClick={() => setMembers(memberIds.filter((x) => x !== m.id))} />
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyPick onClick={() => setPicker("members")}>Chưa chọn thành viên nào</EmptyPick>
        )}
      </Section>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(ROUTES.dispatchTeams)}>
          Huỷ
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {team ? "Lưu thay đổi" : "Tạo nhóm"}
        </Button>
      </div>

      <CardPickerDialog
        open={picker === "categories"}
        onOpenChange={(o) => !o && setPicker(null)}
        title="Chọn danh mục sản phẩm"
        searchPlaceholder="Tìm danh mục..."
        items={categoryItems}
        value={categories}
        onChange={(ids) => setValue("categories", ids, { shouldDirty: true })}
      />
      <CardPickerDialog
        open={picker === "members"}
        onOpenChange={(o) => !o && setPicker(null)}
        title="Chọn thành viên"
        searchPlaceholder="Tìm theo tên, SĐT, email..."
        items={memberItems}
        value={memberIds}
        onChange={setMembers}
      />
    </form>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-destructive"
      aria-label="Bỏ chọn"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

function EmptyPick({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-center gap-1 rounded-xl border-2 border-dashed py-8 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-primary"
    >
      <Plus className="h-5 w-5" />
      {children}
    </button>
  );
}
