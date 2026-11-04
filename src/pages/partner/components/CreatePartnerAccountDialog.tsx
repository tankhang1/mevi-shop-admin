import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  Button,
  Combobox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { Building2, MapPin, Store, UserCheck, Users } from "lucide-react";
import {
  type PartnerContactRequest,
  type UnifiedPartnerFormValues,
  unifiedPartnerSchema,
  useCreateUnifiedPartner,
  useGeoProvinces,
  useGeoWards,
} from "@/features/partner";
import { applyFieldErrors, getErrorMessage } from "@/lib/api-error";
import type { ApiErrorResponse } from "@/types/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactRequest?: PartnerContactRequest;
  onSuccess?: () => void;
}

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CreatePartnerAccountForm({
  contactRequest,
  onClose,
  onSuccess,
}: {
  contactRequest?: PartnerContactRequest;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { toast } = useToast();
  const createPartner = useCreateUnifiedPartner();

  const defaultShopName = contactRequest?.fullName
    ? `Gian hàng ${contactRequest.fullName}`
    : "";

  const form = useForm<UnifiedPartnerFormValues>({
    resolver: zodResolver(unifiedPartnerSchema),
    defaultValues: {
      fullName: contactRequest?.fullName || "",
      phoneNumber: contactRequest?.phoneNumber || "",
      email: contactRequest?.email || "",
      audienceType: "individual",
      password: "",
      shopName: defaultShopName,
      handle: "",
      slogan: "",
      province: contactRequest?.province || "",
      ward: "",
      detailAddress: "",
    },
    mode: "onTouched",
  });

  const audienceType = useWatch({
    control: form.control,
    name: "audienceType",
  });
  const selectedProvince = useWatch({
    control: form.control,
    name: "province",
  });

  // Dữ liệu Tỉnh/Thành và Phường/Xã công khai từ API Public hệ thống MEVI (api.json)
  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useGeoProvinces();
  const selectedProvinceObj = provinces.find(
    (p) =>
      p.name === selectedProvince ||
      p.fullName === selectedProvince ||
      p.code === selectedProvince,
  );
  const provinceCode = selectedProvinceObj?.code || selectedProvince;
  const { data: wards = [], isLoading: isLoadingWards } =
    useGeoWards(provinceCode);

  const onSubmit = async (values: UnifiedPartnerFormValues) => {
    try {
      const baseSlug = toSlug(values.shopName || values.fullName);
      const generatedHandle =
        baseSlug || `gian-hang-${values.phoneNumber.slice(-4) || "shop"}`;

      await createPartner.mutateAsync({
        fullName: values.fullName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email?.trim() || undefined,
        audienceType: values.audienceType,
        password: values.password?.trim() || undefined,
        shopName: values.shopName.trim(),
        handle: generatedHandle,
        province: values.province.trim(),
        ward: values.ward?.trim() || undefined,
        detailAddress: values.detailAddress?.trim() || undefined,
      });

      toast({
        title: "Tạo đối tác & gian hàng thành công",
        description: `Đã cấp tài khoản và khởi tạo gian hàng "${values.shopName}" (${values.audienceType === "individual" ? "Cộng tác viên" : "Đại lý"}).`,
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      if (isAxiosError<ApiErrorResponse>(err)) {
        if (
          err.response?.status === 409 ||
          err.response?.data?.message?.includes("Registration already exists")
        ) {
          form.setError("phoneNumber", {
            type: "server",
            message: "Số điện thoại này đã được đăng ký trên hệ thống Mevi",
          });
          return;
        }

        if (applyFieldErrors(err, form.setError) > 0) {
          return;
        }
      }

      toast({
        title: "Không thể tạo đối tác",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Thêm đối tác
          </DialogTitle>
          <DialogDescription>
            Tạo tài khoản đăng nhập và khởi tạo ngay gian hàng trong hệ sinh
            thái Mevi Shop.
          </DialogDescription>
        </DialogHeader>

        {/* 2 Card chọn phân loại: Cộng tác viên & Đại lý (theo phong cách UI design system) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() =>
              form.setValue("audienceType", "individual", {
                shouldValidate: true,
              })
            }
            className={cn(
              "flex flex-col items-start gap-1 p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left",
              audienceType === "individual"
                ? "border-primary bg-primary/5 shadow-xs"
                : "border-border/80 bg-background hover:border-primary/40 hover:bg-muted/10",
            )}
          >
            <div className="flex items-center gap-2">
              <Users
                className={cn(
                  "h-5 w-5 shrink-0",
                  audienceType === "individual"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold",
                  audienceType === "individual"
                    ? "text-primary"
                    : "text-foreground",
                )}
              >
                Cộng tác viên
              </span>
            </div>
            <span className="text-xs text-muted-foreground pl-7">
              Bán hàng theo hoa hồng
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              form.setValue("audienceType", "business", {
                shouldValidate: true,
              })
            }
            className={cn(
              "flex flex-col items-start gap-1 p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left",
              audienceType === "business"
                ? "border-primary bg-primary/5 shadow-xs"
                : "border-border/80 bg-background hover:border-primary/40 hover:bg-muted/10",
            )}
          >
            <div className="flex items-center gap-2">
              <Building2
                className={cn(
                  "h-5 w-5 shrink-0",
                  audienceType === "business"
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold",
                  audienceType === "business"
                    ? "text-primary"
                    : "text-foreground",
                )}
              >
                Đại lý
              </span>
            </div>
            <span className="text-xs text-muted-foreground pl-7">
              Doanh nghiệp / Hộ kinh doanh
            </span>
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pr-1.5">
          {/* Nhóm 1: Thông tin đối tác & Gian hàng */}
          <div className="rounded-lg border bg-card p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <UserCheck className="h-4 w-4" />
              <span>1. Thông tin đối tác & Gian hàng</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold">
                      Họ và tên người đại diện{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nguyễn Văn A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold">
                      Số điện thoại đăng nhập{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="0912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold">
                      Tên gian hàng <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: Nông sản Mevi Đà Lạt"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold">
                      Email liên hệ
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="doitac@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">
                    Mật khẩu ban đầu (Tùy chọn)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Bỏ trống để dùng mật khẩu mặc định của hệ thống"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-[11px] text-muted-foreground">
                    Nếu để trống, đối tác sẽ nhận mật khẩu mặc định và bắt buộc
                    đổi ở lần đăng nhập đầu tiên.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nhóm 2: Khu vực & Địa chỉ (Dùng Combobox searchable) */}
          <div className="rounded-lg border bg-card p-4 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <MapPin className="h-4 w-4" />
              <span>2. Khu vực & Địa chỉ</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold">
                      Tỉnh / Thành phố{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={provinces.map((prov) => ({
                          value: prov.name,
                          label: prov.fullName || prov.name,
                        }))}
                        value={field.value ?? ""}
                        onChange={(val: string) => {
                          field.onChange(val);
                          form.setValue("ward", ""); // reset ward khi đổi tỉnh
                        }}
                        placeholder={
                          isLoadingProvinces
                            ? "Đang tải tỉnh/thành..."
                            : "Chọn Tỉnh / Thành phố"
                        }
                        searchPlaceholder="Tìm kiếm tỉnh, thành phố..."
                        emptyText="Không tìm thấy tỉnh/thành"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ward"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-semibold">
                      Phường / Xã
                    </FormLabel>
                    <FormControl>
                      <Combobox
                        options={wards.map((w) => ({
                          value: w.name,
                          label: w.fullName || w.name,
                        }))}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={!selectedProvince}
                        placeholder={
                          !selectedProvince
                            ? "Vui lòng chọn Tỉnh/Thành trước"
                            : isLoadingWards
                              ? "Đang tải phường/xã..."
                              : "Chọn Phường / Xã"
                        }
                        searchPlaceholder="Tìm kiếm phường, xã..."
                        emptyText="Không tìm thấy phường/xã"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="detailAddress"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">
                    Địa chỉ chi tiết
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Số nhà, tên đường, thôn/xóm..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={createPartner.isPending}>
            {createPartner.isPending ? "Đang xử lý..." : "Xác nhận tạo đối tác"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function CreatePartnerAccountDialog({
  open,
  onOpenChange,
  contactRequest,
  onSuccess,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        {open && (
          <CreatePartnerAccountForm
            key={contactRequest?.id ?? "new"}
            contactRequest={contactRequest}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
