import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  Button,
  Combobox,
  Dialog,
  DialogContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  Building2,
  CheckCircle2,
  Info,
  MapPin,
  Store,
  UserCheck,
  Users,
} from "lucide-react";
import {
  type PartnerContactDetailFormValues,
  type PartnerContactRequest,
  partnerContactDetailSchema,
  useCreateUnifiedPartner,
  useGeoProvinces,
  useGeoWards,
  useUpdateContactRequestStatus,
} from "@/features/partner";
import { applyFieldErrors, getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import type { ApiErrorResponse } from "@/types/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: PartnerContactRequest;
  onOpenCreateAccount?: (request: PartnerContactRequest) => void;
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

function PartnerContactDetailForm({
  request,
  onClose,
}: {
  request: PartnerContactRequest;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const updateStatus = useUpdateContactRequestStatus();
  const createPartner = useCreateUnifiedPartner();

  const isAlreadyPartner = request.status === "ACCOUNT_CREATED";
  const isRejected = request.status === "REJECTED";
  const isStatusLocked = isAlreadyPartner || isRejected;

  const form = useForm<PartnerContactDetailFormValues>({
    resolver: zodResolver(partnerContactDetailSchema),
    defaultValues: {
      status: request.status,
      adminNote: request.adminNote || "",
      needsCreateAccount: !isAlreadyPartner,
      fullName: request.fullName || "",
      phoneNumber: request.phoneNumber || "",
      audienceType: "individual",
      email: request.email || "",
      password: "",
      shopName: request.fullName ? `Gian hàng ${request.fullName}` : "",
      province: request.province || "",
      ward: "",
      detailAddress: "",
    },
    mode: "onTouched",
  });

  const selectedStatus = useWatch({
    control: form.control,
    name: "status",
  });

  const audienceType = useWatch({
    control: form.control,
    name: "audienceType",
  });

  const selectedProvince = useWatch({
    control: form.control,
    name: "province",
  });

  // Hiển thị form tạo tài khoản khi chọn "Đã trở thành đối tác" và ban đầu chưa phải là đối tác
  const shouldShowAccountFields =
    selectedStatus === "ACCOUNT_CREATED" && !isAlreadyPartner;

  // Dữ liệu Tỉnh/Thành và Phường/Xã công khai
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

  const onSubmit = async (values: PartnerContactDetailFormValues) => {
    // Trường hợp 1: Chuyển sang "Đã trở thành đối tác" -> Thực hiện quy trình 2 bước tuần tự
    if (shouldShowAccountFields) {
      try {
        const baseSlug = toSlug(values.shopName || values.fullName || "");
        const generatedHandle =
          baseSlug || `gian-hang-${values.phoneNumber?.slice(-4) || "shop"}`;

        // Bước 1: Cấp tài khoản đối tác & tạo gian hàng
        await createPartner.mutateAsync({
          fullName: (values.fullName || "").trim(),
          phoneNumber: (values.phoneNumber || "").trim(),
          email: values.email?.trim() || undefined,
          audienceType: values.audienceType || "individual",
          password: values.password?.trim() || undefined,
          shopName: (values.shopName || "").trim(),
          handle: generatedHandle,
          province: (values.province || "").trim(),
          ward: values.ward?.trim() || undefined,
          detailAddress: values.detailAddress?.trim() || undefined,
        });
      } catch (err) {
        // Nếu bước 1 thất bại, xử lý lỗi cụ thể trên form và dừng lại, KHÔNG gọi bước 2
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
          title: "Không thể tạo tài khoản đối tác",
          description: getErrorMessage(err),
          variant: "destructive",
        });
        return;
      }

      // Bước 2: Chỉ khi bước 1 thành công 100%, cập nhật trạng thái yêu cầu sang ACCOUNT_CREATED
      try {
        await updateStatus.mutateAsync({
          id: request.id,
          input: {
            status: "ACCOUNT_CREATED",
            adminNote: values.adminNote?.trim() || undefined,
          },
        });

        toast({
          title: "Cấp tài khoản & hoàn tất xử lý thành công",
          description: `Đã cấp tài khoản cho ${request.fullName} và cập nhật trạng thái "Đã trở thành đối tác".`,
        });
        onClose();
      } catch (err) {
        toast({
          title: "Đã tạo tài khoản nhưng lỗi cập nhật trạng thái yêu cầu",
          description: getErrorMessage(err),
          variant: "destructive",
        });
      }
      return;
    }

    // Trường hợp 2: Cập nhật trạng thái thông thường (hoặc lưu ghi chú khi đã khóa trạng thái)
    try {
      await updateStatus.mutateAsync({
        id: request.id,
        input: {
          status: values.status,
          adminNote: values.adminNote?.trim() || undefined,
        },
      });
      toast({
        title: "Cập nhật thành công",
        description: isStatusLocked
          ? `Đã lưu ghi chú cho yêu cầu của ${request.fullName}.`
          : `Yêu cầu của ${request.fullName} đã được cập nhật.`,
      });
      onClose();
    } catch (err) {
      toast({
        title: "Lỗi cập nhật",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createPartner.isPending || updateStatus.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            Chi tiết yêu cầu hợp tác #{request.id}
          </DialogTitle>
        </DialogHeader>

        {/* Contact info summary */}
        <div className="rounded-lg bg-muted/50 p-3.5 space-y-2 text-sm border">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Người gửi:</span>
            <span className="font-semibold">{request.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số điện thoại:</span>
            <a
              href={`tel:${request.phoneNumber}`}
              className="font-medium text-primary hover:underline"
            >
              {request.phoneNumber}
            </a>
          </div>
          {request.email && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{request.email}</span>
            </div>
          )}
          {request.province && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tỉnh / Thành phố:</span>
              <span>{request.province}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ngày gửi:</span>
            <span>{formatDate(request.createdAt)}</span>
          </div>
          {request.note && (
            <div className="pt-2 border-t text-xs">
              <span className="font-medium text-muted-foreground block mb-0.5">
                Nội dung ghi chú của đối tác:
              </span>
              <p className="italic text-foreground">{request.note}</p>
            </div>
          )}
        </div>

        {/* Status picker */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium">
                Trạng thái xử lý
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                }}
                disabled={isStatusLocked}
              >
                <FormControl>
                  <SelectTrigger disabled={isStatusLocked}>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NEW">Chờ liên hệ</SelectItem>
                  <SelectItem value="CONTACTED">Đã liên hệ</SelectItem>
                  <SelectItem value="ACCOUNT_CREATED">
                    Đã trở thành đối tác
                  </SelectItem>
                  <SelectItem value="REJECTED">Không hợp tác</SelectItem>
                </SelectContent>
              </Select>
              {isAlreadyPartner && (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium pt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Yêu cầu đã được cấp tài khoản đối tác thành công và liên kết
                    vào hệ thống.
                  </span>
                </div>
              )}
              {isRejected && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pt-0.5">
                  <Info className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>
                    Yêu cầu đã ở trạng thái Không hợp tác, không thể thay đổi
                    trạng thái.
                  </span>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Thông báo hướng dẫn khi chuyển sang Đã trở thành đối tác */}
        {shouldShowAccountFields && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary leading-relaxed">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Cấp tài khoản & Khởi tạo gian hàng
              </p>
              <p className="text-muted-foreground mt-0.5">
                Khi lưu với trạng thái này, hệ thống sẽ tự động tạo tài khoản
                đối tác và khởi tạo gian hàng mới cho người liên hệ.
              </p>
            </div>
          </div>
        )}

        {/* Khối nhập thông tin đối tác & gian hàng nếu chuyển sang Đã trở thành đối tác */}
        {shouldShowAccountFields && (
          <div className="space-y-4 pt-1">
            {/* Phân loại Cộng tác viên / Đại lý */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  form.setValue("audienceType", "individual", {
                    shouldValidate: true,
                  })
                }
                className={cn(
                  "flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer text-left",
                  audienceType === "individual"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border/80 bg-background hover:border-primary/40 hover:bg-muted/10",
                )}
              >
                <div className="flex items-center gap-2">
                  <Users
                    className={cn(
                      "h-4 w-4 shrink-0",
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
                <span className="text-xs text-muted-foreground pl-6">
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
                  "flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer text-left",
                  audienceType === "business"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border/80 bg-background hover:border-primary/40 hover:bg-muted/10",
                )}
              >
                <div className="flex items-center gap-2">
                  <Building2
                    className={cn(
                      "h-4 w-4 shrink-0",
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
                <span className="text-xs text-muted-foreground pl-6">
                  Doanh nghiệp / Hộ kinh doanh
                </span>
              </button>
            </div>

            {/* Nhóm 1: Thông tin đối tác & Gian hàng */}
            <div className="rounded-lg border bg-card p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
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
                        Tên gian hàng{" "}
                        <span className="text-destructive">*</span>
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
                        placeholder="Để trống nếu để đối tác tự thiết lập"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nhóm 2: Khu vực kinh doanh */}
            <div className="rounded-lg border bg-card p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <MapPin className="h-4 w-4" />
                <span>2. Khu vực kinh doanh</span>
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
                          options={provinces.map((p) => ({
                            value: p.name,
                            label: p.fullName || p.name,
                          }))}
                          value={field.value || ""}
                          onChange={(val) => {
                            field.onChange(val);
                            form.setValue("ward", "");
                          }}
                          placeholder={
                            isLoadingProvinces
                              ? "Đang tải tỉnh/thành..."
                              : "Chọn Tỉnh / Thành"
                          }
                          searchPlaceholder="Tìm tỉnh / thành..."
                          emptyText="Không tìm thấy tỉnh/thành"
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
                          value={field.value || ""}
                          onChange={field.onChange}
                          disabled={!provinceCode || isLoadingWards}
                          placeholder={
                            isLoadingWards
                              ? "Đang tải phường/xã..."
                              : !provinceCode
                                ? "Chọn Tỉnh/Thành trước"
                                : "Chọn Phường / Xã"
                          }
                          searchPlaceholder="Tìm phường / xã..."
                          emptyText="Không tìm thấy phường/xã"
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
                        placeholder="Số nhà, tên đường, thôn, xóm..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Admin note */}
        <FormField
          control={form.control}
          name="adminNote"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-medium">
                Ghi chú nội bộ của Ban quản trị
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập ghi chú liên hệ, trao đổi với đối tác (tối đa 1000 ký tự)..."
                  maxLength={1000}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Đóng
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              createPartner.isPending ? (
                "Đang cấp tài khoản..."
              ) : (
                "Đang cập nhật..."
              )
            ) : shouldShowAccountFields ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Cấp tài khoản & Lưu
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function PartnerContactDetailDialog({
  open,
  onOpenChange,
  request,
}: Props) {
  const isStatusLocked =
    request?.status === "ACCOUNT_CREATED" || request?.status === "REJECTED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto",
          isStatusLocked ? "max-w-md sm:max-w-lg" : "max-w-xl sm:max-w-2xl",
        )}
      >
        {request && (
          <PartnerContactDetailForm
            key={request.id}
            request={request}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
