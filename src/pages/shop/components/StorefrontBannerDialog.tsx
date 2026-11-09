import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Link2, Loader2, PhoneCall, Sparkles } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ImageUploadField } from "@/components/form/ImageUploadField";
import {
  type BannerItemFormValues,
  type StorefrontBannerItem,
  bannerItemFormSchema,
  createStorefrontId,
  useUploadStorefrontPhoto,
} from "@/features/storefront";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: StorefrontBannerItem | null;
  workspaceId?: string | number | null;
  onSave: (banner: StorefrontBannerItem) => void;
}

const DEFAULT_BANNER: BannerItemFormValues = {
  badge: "ĐẠI LÝ MEVI",
  showBadge: true,
  title: "",
  description: "",
  imageUrl: "",
  button: {
    enabled: true,
    text: "Ghé gian hàng",
    actionType: "INTERNAL_LINK",
    targetUrl: "/products",
    openInNewTab: false,
    contactType: "HOTLINE",
  },
  active: true,
  sortOrder: 1,
};

const QUICK_PATHS = [
  { label: "Tất cả sản phẩm (/products)", value: "/products" },
  { label: "Trang chủ gian hàng (/)", value: "/" },
  { label: "Chương trình khuyến mãi (/promotions)", value: "/promotions" },
  { label: "Giới thiệu gian hàng (/about)", value: "/about" },
];

export function StorefrontBannerDialog({
  open,
  onOpenChange,
  banner,
  workspaceId,
  onSave,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const uploadPhotoMutation = useUploadStorefrontPhoto(workspaceId);

  const form = useForm<BannerItemFormValues>({
    resolver: zodResolver(bannerItemFormSchema),
    defaultValues: DEFAULT_BANNER,
  });

  useEffect(() => {
    if (open) {
      if (banner) {
        form.reset({
          id: banner.id,
          badge: banner.badge ?? "",
          showBadge: banner.showBadge ?? true,
          title: banner.title,
          description: banner.description ?? "",
          imageUrl: banner.imageUrl,
          button: {
            enabled: banner.button?.enabled ?? true,
            text: banner.button?.text ?? "Ghé gian hàng",
            actionType: banner.button?.actionType ?? "INTERNAL_LINK",
            targetUrl: banner.button?.targetUrl ?? "/products",
            openInNewTab: banner.button?.openInNewTab ?? false,
            contactType: banner.button?.contactType ?? "HOTLINE",
          },
          active: banner.active ?? true,
          sortOrder: banner.sortOrder ?? 1,
        });
      } else {
        form.reset(DEFAULT_BANNER);
      }
    }
  }, [open, banner, form]);

  const buttonEnabled = useWatch({ control: form.control, name: "button.enabled" });
  const actionType = useWatch({ control: form.control, name: "button.actionType" });
  const showBadge = useWatch({ control: form.control, name: "showBadge" });

  const handleUpload = async (file: File) => {
    const res = await uploadPhotoMutation.mutateAsync({
      type: "COVER",
      file,
    });
    return res.fileUrl;
  };

  const onSubmit = (values: BannerItemFormValues) => {
    setSubmitting(true);
    try {
      const result: StorefrontBannerItem = {
        id: banner?.id || createStorefrontId("banner"),
        badge: values.badge?.trim() || undefined,
        showBadge: values.showBadge,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        imageUrl: values.imageUrl,
        button: {
          enabled: values.button.enabled,
          text: values.button.text.trim() || "Ghé gian hàng",
          actionType: values.button.actionType,
          targetUrl: values.button.targetUrl?.trim() || undefined,
          openInNewTab: values.button.openInNewTab,
          contactType: values.button.contactType,
        },
        active: values.active,
        sortOrder: values.sortOrder ?? 1,
      };
      onSave(result);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {banner ? "Chỉnh sửa slide banner" : "Thêm slide banner mới"}
          </DialogTitle>
          <DialogDescription>
            Tùy biến hình ảnh nền, tiêu đề, mô tả và thiết lập hành động cho nút
            bấm CTA trên banner.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Ảnh nền Banner */}
            <div>
              <ImageUploadField<BannerItemFormValues>
                name="imageUrl"
                label="Ảnh nền banner (bắt buộc)"
                hint="Khuyến nghị tỷ lệ 16:9 hoặc 21:9, độ phân giải tối thiểu 1600x600px"
                aspect="cover"
                upload={handleUpload}
              />
            </div>

            {/* Huy hiệu / Nhãn dán nhỏ */}
            <div className="grid gap-3 rounded-lg border p-3.5 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Huy hiệu / Nhãn dán nhỏ phía trên
                </Label>
                <FormField
                  control={form.control}
                  name="showBadge"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-label="Hiển thị huy hiệu"
                        />
                      </FormControl>
                      <span className="text-xs text-muted-foreground">
                        {field.value ? "Đang bật" : "Tắt"}
                      </span>
                    </FormItem>
                  )}
                />
              </div>

              {showBadge && (
                <FormField
                  control={form.control}
                  name="badge"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="VD: ĐẠI LÝ MEVI, ƯU ĐÃI THÁNG..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Tiêu đề chính */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tiêu đề chính của banner</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: Gian hàng Đà Lạt Xanh"
                      className="font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả phụ */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả ngắn</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="VD: Đại lý chính thức tại Đà Lạt – đặt hàng qua gian hàng để được tư vấn và giao nhanh trong khu vực."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cấu hình Nút bấm hành động */}
            <div className="rounded-lg border p-4 space-y-4 bg-muted/10">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    Nút bấm hành động (Chuyển trang / Liên hệ)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cho phép khách hàng tương tác bấm chuyển trang hoặc liên hệ
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="button.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-label="Bật nút bấm hành động"
                        />
                      </FormControl>
                      <span className="text-xs font-medium">
                        {field.value ? "Hiển thị" : "Ẩn nút"}
                      </span>
                    </FormItem>
                  )}
                />
              </div>

              {buttonEnabled && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="button.text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>Nhãn hiển thị trên nút</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="VD: Ghé gian hàng" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="button.actionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loại hành động khi bấm</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn hành động" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INTERNAL_LINK">
                                🔗 Chuyển trang nội bộ (Internal link)
                              </SelectItem>
                              <SelectItem value="EXTERNAL_LINK">
                                🌐 Mở liên kết ngoài (External link)
                              </SelectItem>
                              <SelectItem value="CONTACT">
                                📞 Kích hoạt liên hệ (Hotline/Zalo)
                              </SelectItem>
                              <SelectItem value="NONE">
                                ⚪ Chỉ hiển thị nút (Không action)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Hành động: Internal link */}
                  {actionType === "INTERNAL_LINK" && (
                    <div className="space-y-2 rounded-md bg-background p-3 border">
                      <FormField
                        control={form.control}
                        name="button.targetUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Đường dẫn trang nội bộ
                            </FormLabel>
                            <div className="flex flex-col gap-2">
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="VD: /products hoặc /promotions"
                                />
                              </FormControl>
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="text-[11px] text-muted-foreground mr-1">
                                  Gợi ý nhanh:
                                </span>
                                {QUICK_PATHS.map((item) => (
                                  <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => field.onChange(item.value)}
                                    className="text-[11px] rounded bg-muted hover:bg-primary/10 hover:text-primary px-2 py-0.5 transition-colors border"
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Hành động: External link */}
                  {actionType === "EXTERNAL_LINK" && (
                    <div className="space-y-3 rounded-md bg-background p-3 border">
                      <FormField
                        control={form.control}
                        name="button.targetUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">
                              Địa chỉ URL liên kết ngoài
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://example.com/khuyen-mai"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="button.openInNewTab"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs font-normal cursor-pointer flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              Mở liên kết trong thẻ (tab) mới
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Hành động: Contact */}
                  {actionType === "CONTACT" && (
                    <div className="rounded-md bg-background p-3 border">
                      <FormField
                        control={form.control}
                        name="button.contactType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs flex items-center gap-1">
                              <PhoneCall className="h-3.5 w-3.5 text-primary" />
                              Hình thức liên hệ
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="HOTLINE">
                                  📞 Gọi Hotline trực tiếp
                                </SelectItem>
                                <SelectItem value="ZALO">
                                  💬 Mở Chat Zalo của gian hàng
                                </SelectItem>
                                <SelectItem value="EMAIL">
                                  ✉️ Gửi Email tư vấn
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Số điện thoại hoặc email sẽ được lấy tự động từ
                              phần Thông tin liên hệ của gian hàng.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trạng thái kích hoạt */}
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <Label className="font-medium text-sm">
                  Trạng thái hiển thị
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bật để slide banner này xuất hiện trên trang chủ gian hàng
                </p>
              </div>
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Kích hoạt slide"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {banner ? "Lưu thay đổi" : "Thêm vào danh sách"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
