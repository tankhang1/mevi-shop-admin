import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  Input,
  Label,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type Agency,
  type AgencyFormValues,
  type AgencyInput,
  agencyKeys,
  agencySchema,
  toSlug,
  useCreateAgency,
} from "@/features/agency";
import { partnerKeys } from "@/features/partner";
import {
  type UpdateStorefrontProfileInput,
  useUpdateStorefrontProfile,
  useUploadStorefrontPhoto,
} from "@/features/storefront";
import { useDeferredImageUpload } from "@/hooks/useDeferredImageUpload";
import { getErrorMessage } from "@/lib/api-error";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass an agency to edit it; omit to create a new one */
  agency?: Agency;
}

const toFormValues = (a?: Agency): AgencyFormValues => ({
  name: a?.name ?? "",
  kind: a?.kind,
  slug: a?.slug ?? "",
  slogan: a?.slogan ?? "",
  brandColor: a?.brandColor ?? "#214c3a",
  logoUrl: a?.logoUrl ?? "",
  contactName: a?.contactName ?? "",
  phone: a?.phone ?? "",
  email: a?.email ?? "",
  province: a?.province ?? "",
});

export function AgencyFormDialog({ open, onOpenChange, agency }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const create = useCreateAgency();
  const updateStorefrontProfile = useUpdateStorefrontProfile(
    agency?.workspaceId,
  );
  const isEdit = !!agency;
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AgencyFormValues>({
    resolver: zodResolver(agencySchema),
    defaultValues: toFormValues(agency),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const isBusy = isSubmitting || isUploadingPhoto;

  const uploadMutation = useUploadStorefrontPhoto(agency?.workspaceId);
  const { setPendingFile, uploadWithCache, resetPendingFiles } =
    useDeferredImageUpload<"LOGO">({
      uploadFn: async (type, file) => {
        const res = await uploadMutation.mutateAsync({ type, file });
        return res.fileUrl;
      },
    });

  // Re-seed whenever the dialog opens so edits start from the latest saved data
  useEffect(() => {
    if (open) {
      reset(toFormValues(agency));
      resetPendingFiles();
    } else {
      const currentLogo = getValues("logoUrl");
      if (currentLogo?.startsWith("blob:")) {
        URL.revokeObjectURL(currentLogo);
      }
      resetPendingFiles();
    }
  }, [open, agency, reset, resetPendingFiles, getValues]);

  // Clean up any blob preview URL on unmount
  useEffect(() => {
    return () => {
      const currentLogo = getValues("logoUrl");
      if (currentLogo?.startsWith("blob:")) {
        URL.revokeObjectURL(currentLogo);
      }
    };
  }, [getValues]);

  const slug = useWatch({ control, name: "slug" });
  const brandColor = useWatch({ control, name: "brandColor" });
  const logoUrl = useWatch({ control, name: "logoUrl" });
  const slugChanged = isEdit && slug !== agency.slug;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Định dạng không hỗ trợ",
        description: "Chỉ nhận JPEG, PNG, WebP",
      });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Ảnh quá lớn",
        description: "Tối đa 8MB",
      });
      return;
    }

    const current = getValues("logoUrl");
    if (current?.startsWith("blob:")) {
      URL.revokeObjectURL(current);
    }

    const previewUrl = URL.createObjectURL(file);
    setValue("logoUrl", previewUrl, { shouldValidate: true });
    setPendingFile("logoUrl", file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveLogo = () => {
    const current = getValues("logoUrl");
    if (current?.startsWith("blob:")) {
      URL.revokeObjectURL(current);
    }
    setValue("logoUrl", "", { shouldValidate: true });
    setPendingFile("logoUrl", null);
  };

  const onSubmit = async (data: AgencyFormValues) => {
    setIsUploadingPhoto(true);
    try {
      // 1. Chỉ upload ảnh khi submit
      const uploadedLogoUrl = await uploadWithCache(
        "logoUrl",
        "LOGO",
        data.logoUrl,
      );

      // 2. Chuẩn bị payload cập nhật hồ sơ gian hàng theo spec PUT /api/shop/profile
      const profileInput: UpdateStorefrontProfileInput = {
        name: data.name.trim(),
        handle: data.slug.trim(),
        slogan: data.slogan?.trim() || undefined,
        brandColor: data.brandColor || "#214c3a",
        logoUrl: uploadedLogoUrl || undefined,
        contactName:
          data.contactName?.trim() || agency?.contactName || "Chưa cập nhật",
        contactPhone: data.phone?.trim() || agency?.phone || "",
        contactEmail: data.email?.trim() || undefined,
        province: data.province?.trim() || agency?.province || "",
      };

      if (isEdit) {
        // Cập nhật profile shop qua API PUT /api/shop/profile (với workspaceId)
        await updateStorefrontProfile.mutateAsync(profileInput);

        // Invalidate để các trang chi tiết gian hàng, đại lý và danh sách tự động cập nhật
        if (agency?.id) {
          queryClient.invalidateQueries({
            queryKey: partnerKeys.profileDetail(agency.id),
          });
          queryClient.invalidateQueries({
            queryKey: agencyKeys.detail(agency.id),
          });
        }
        queryClient.invalidateQueries({ queryKey: partnerKeys.profiles() });
        queryClient.invalidateQueries({ queryKey: agencyKeys.all });

        toast({
          title: "Đã cập nhật thông tin gian hàng",
          description: profileInput.name,
        });
      } else {
        await create.mutateAsync({
          ...data,
          logoUrl: uploadedLogoUrl,
          kind: data.kind ?? "agency",
        } as AgencyInput);
        toast({ title: "Đã thêm đại lý", description: data.name });
      }

      resetPendingFiles();
      onOpenChange(false);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi cập nhật",
        description: getErrorMessage(e),
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const err = (k: keyof AgencyFormValues) =>
    errors[k] && (
      <p className="text-xs text-destructive">{errors[k]?.message}</p>
    );

  return (
    <Dialog open={open} onOpenChange={(val) => !isBusy && onOpenChange(val)}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa thông tin gian hàng" : "Thêm đại lý"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            id="agency-form"
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-4 sm:grid-cols-2"
          >
            {/* Logo gian hàng */}
            <div className="sm:col-span-2 rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4">
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isBusy}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card shadow-xs transition-all hover:border-primary cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                  title="Bấm để chọn logo mới"
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo gian hàng"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground group-hover:text-primary">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-[11px] font-medium">Tải ảnh</span>
                    </div>
                  )}
                  {logoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 text-white text-[11px] font-medium">
                      Đổi ảnh
                    </div>
                  )}
                </button>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Logo gian hàng
                    </Label>
                    {logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        onClick={handleRemoveLogo}
                        className="h-7 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Xóa logo
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Định dạng JPEG, PNG, WebP (tối đa 8MB). Tỉ lệ vuông 1:1.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs cursor-pointer"
                  >
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    {logoUrl ? "Thay đổi logo" : "Chọn ảnh logo"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tên gian hàng */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">
                Tên gian hàng<span className="text-destructive"> *</span>
              </Label>
              <Input
                id="name"
                disabled={isBusy}
                placeholder="VD: Nông sản Mevi Đà Lạt"
                {...register("name", {
                  onBlur: (e) =>
                    !getValues("slug") &&
                    setValue("slug", toSlug(e.target.value)),
                })}
              />
              {err("name")}
            </div>

            {/* Đường dẫn Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="slug">
                Đường dẫn (Slug)<span className="text-destructive"> *</span>
              </Label>
              <Input
                id="slug"
                disabled={isBusy}
                placeholder="nong-san-mevi"
                {...register("slug")}
              />
              {err("slug")}
              {slugChanged && (
                <p className="text-xs text-amber-700">
                  Đổi slug: link giới thiệu cũ (?ref={agency.slug}) sẽ không còn
                  hiệu lực.
                </p>
              )}
            </div>

            {/* Màu thương hiệu */}
            <div className="space-y-1.5">
              <Label htmlFor="brandColor">Màu thương hiệu</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="brandColorPicker"
                  disabled={isBusy}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-input bg-background p-1 disabled:opacity-50"
                  value={brandColor || "#214c3a"}
                  onChange={(e) => setValue("brandColor", e.target.value)}
                />
                <Input
                  id="brandColor"
                  disabled={isBusy}
                  placeholder="#214c3a"
                  className="font-mono"
                  {...register("brandColor")}
                />
              </div>
              {err("brandColor")}
            </div>

            {/* Người liên hệ */}
            <div className="space-y-1.5">
              <Label htmlFor="contactName">Người liên hệ</Label>
              <Input
                id="contactName"
                disabled={isBusy}
                placeholder="Họ và tên người đại diện"
                {...register("contactName")}
              />
              {err("contactName")}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                disabled={isBusy}
                placeholder="0912345678"
                {...register("phone")}
              />
              {err("phone")}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email liên hệ</Label>
              <Input
                id="email"
                type="email"
                disabled={isBusy}
                placeholder="doitac@example.com"
                {...register("email")}
              />
              {err("email")}
            </div>

            {/* Tỉnh / Thành phố */}
            <div className="space-y-1.5">
              <Label htmlFor="province">Tỉnh / Thành phố</Label>
              <Input
                id="province"
                disabled={isBusy}
                placeholder="VD: Hà Nội, Lâm Đồng..."
                {...register("province")}
              />
              {err("province")}
            </div>

            {/* Slogan */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="slogan">Khẩu hiệu (Slogan)</Label>
              <Input
                id="slogan"
                disabled={isBusy}
                maxLength={80}
                placeholder="VD: Rau củ sạch từ farm tới bàn ăn"
                {...register("slogan")}
              />
              {err("slogan")}
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button type="submit" form="agency-form" disabled={isBusy}>
            {isBusy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isUploadingPhoto
              ? "Đang tải ảnh..."
              : isSubmitting
                ? "Đang lưu..."
                : isEdit
                  ? "Lưu thay đổi"
                  : "Thêm đại lý"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
