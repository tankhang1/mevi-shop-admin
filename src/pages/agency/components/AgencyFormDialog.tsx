import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  type Agency,
  type AgencyFormValues,
  agencySchema,
  toSlug,
  useCreateAgency,
  useUpdateAgency,
} from "@/features/agency";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an agency to edit it; omit to create a new one */
  agency?: Agency;
}

const DEFAULTS: AgencyFormValues = {
  name: "",
  slug: "",
  brandColor: "#214c3a",
  logoUrl: "",
  contactName: "",
  phone: "",
  email: "",
};

const toFormValues = (a?: Agency): AgencyFormValues =>
  a
    ? {
        name: a.name,
        slug: a.slug,
        brandColor: a.brandColor ?? DEFAULTS.brandColor,
        logoUrl: a.logoUrl ?? "",
        contactName: a.contactName ?? "",
        phone: a.phone ?? "",
        email: a.email ?? "",
      }
    : DEFAULTS;

export function AgencyFormDialog({ open, onOpenChange, agency }: Props) {
  const { toast } = useToast();
  const create = useCreateAgency();
  const update = useUpdateAgency();
  const isEdit = !!agency;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AgencyFormValues>({
    resolver: zodResolver(agencySchema),
    defaultValues: toFormValues(agency),
  });

  // Re-seed whenever the dialog opens so edits start from the latest saved data
  // (keyed on id, not object identity, so a background refetch doesn't wipe in-progress edits)
  useEffect(() => {
    if (open) reset(toFormValues(agency));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agency?.id, reset]);

  const slug = useWatch({ control, name: "slug" });
  const slugChanged = isEdit && slug !== agency.slug;

  const onSubmit = async (data: AgencyFormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ id: agency.id, data });
        toast({ title: "Đã lưu thông tin đại lý", description: data.name });
      } else {
        await create.mutateAsync(data);
        toast({ title: "Đã thêm đại lý", description: data.name });
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

  const err = (k: keyof AgencyFormValues) =>
    errors[k] && (
      <p className="text-xs text-destructive">{errors[k]?.message}</p>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa thông tin đại lý" : "Thêm đại lý"}
          </DialogTitle>
        </DialogHeader>
        <form
          id="agency-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">
              Tên gian hàng<span className="text-destructive"> *</span>
            </Label>
            <Input
              id="name"
              {...register("name", {
                onBlur: (e) =>
                  !getValues("slug") &&
                  setValue("slug", toSlug(e.target.value)),
              })}
            />
            {err("name")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">
              Slug<span className="text-destructive"> *</span>
            </Label>
            <Input id="slug" placeholder="mevi-da-lat" {...register("slug")} />
            {err("slug")}
            {slugChanged && (
              <p className="text-xs text-amber-700">
                Đổi slug: link giới thiệu cũ (?ref={agency.slug}) sẽ không còn
                hiệu lực.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brandColor">Màu thương hiệu</Label>
            <div className="flex gap-2">
              <input
                type="color"
                className="h-9 w-12 cursor-pointer rounded border"
                {...register("brandColor")}
              />
              <Input id="brandColor" {...register("brandColor")} />
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              placeholder="https://..."
              {...register("logoUrl")}
            />
            {err("logoUrl")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactName">Người liên hệ</Label>
            <Input id="contactName" {...register("contactName")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Điện thoại</Label>
            <Input id="phone" type="tel" {...register("phone")} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {err("email")}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button type="submit" form="agency-form" disabled={isSubmitting}>
            {isEdit ? "Lưu thay đổi" : "Thêm đại lý"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
