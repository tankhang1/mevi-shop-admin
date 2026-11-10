import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Loader2, PhoneCall, Sparkles } from "lucide-react";
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
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ImageUploadField } from "@/components/form/ImageUploadField";
import {
  type BannerSlideInput,
  type BannerSlideItem,
  bannerSlideSchema,
} from "@/features/content-block";
import { adminStorageApi } from "@/features/storage";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: BannerSlideItem | null;
  onSave: (data: BannerSlideInput) => Promise<void>;
}

const DEFAULT_BANNER: BannerSlideInput = {
  enabled: true,
  imageUrl: "",
  badge: {
    enabled: false,
    text: "",
  },
  title: "",
  description: "",
  cta: {
    enabled: false,
    label: "",
    linkType: "INTERNAL_LINK",
    target: "",
  },
};

const QUICK_PATHS = [
  { label: "Tất cả sản phẩm (/products)", value: "/products" },
  { label: "Trang chủ (/)", value: "/" },
  { label: "Chương trình khuyến mãi (/promotions)", value: "/promotions" },
  { label: "Giới thiệu (/about)", value: "/about" },
];

export function StorefrontBannerDialog({
  open,
  onOpenChange,
  banner,
  onSave,
}: Props) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const form = useForm<BannerSlideInput>({
    resolver: zodResolver(bannerSlideSchema),
    defaultValues: DEFAULT_BANNER,
  });

  useEffect(() => {
    if (open) {
      if (banner) {
        form.reset({
          enabled: banner.enabled,
          imageUrl: banner.imageUrl,
          badge: {
            enabled: banner.badge?.enabled ?? false,
            text: banner.badge?.text ?? "",
          },
          title: banner.title,
          description: banner.description ?? "",
          cta: {
            enabled: banner.cta?.enabled ?? false,
            label: banner.cta?.label ?? "",
            linkType: banner.cta?.linkType ?? "INTERNAL_LINK",
            target: banner.cta?.target ?? "",
          },
        });
      } else {
        form.reset(DEFAULT_BANNER);
      }
    }
  }, [open, banner, form]);

  const handleModalOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPendingFile(null);
    }
    onOpenChange(nextOpen);
  };

  const badgeEnabled = useWatch({
    control: form.control,
    name: "badge.enabled",
  });
  const ctaEnabled = useWatch({ control: form.control, name: "cta.enabled" });
  const linkType = useWatch({ control: form.control, name: "cta.linkType" });

  const onSubmit = async (values: BannerSlideInput) => {
    setSubmitting(true);
    try {
      let finalImageUrl = values.imageUrl;
      // Chỉ upload khi Submit nếu người dùng đã chọn file mới
      if (pendingFile) {
        const uploadRes = await adminStorageApi.uploadFile(
          pendingFile,
          "banners",
        );
        finalImageUrl = uploadRes.fileUrl;
      }

      await onSave({
        ...values,
        imageUrl: finalImageUrl,
        description: values.description?.trim() || null,
      });
      onOpenChange(false);
    } catch {
      toast({
        title: "Lỗi lưu banner",
        description:
          "Không thể upload ảnh hoặc lưu slide banner, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleModalOpenChange}>
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
            <fieldset disabled={submitting} className="space-y-5">
              {/* Ảnh nền Banner - sử dụng deferred upload */}
              <div>
                <ImageUploadField<BannerSlideInput>
                  name="imageUrl"
                  label="Ảnh nền banner (bắt buộc)"
                  hint="Khuyến nghị tỷ lệ 16:9 hoặc 21:9, độ phân giải tối thiểu 1600x600px. Ảnh sẽ chỉ được upload khi bạn bấm Lưu."
                  aspect="cover"
                  disabled={submitting}
                  onFileChange={(file) => setPendingFile(file)}
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
                    name="badge.enabled"
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

                {badgeEnabled && (
                  <FormField
                    control={form.control}
                    name="badge.text"
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
                        value={field.value ?? ""}
                        rows={3}
                        placeholder="VD: Đại lý chính thức tại Đà Lạt – đặt hàng qua gian hàng để được tư vấn và giao nhanh trong khu vực."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cấu hình Nút bấm hành động CTA */}
              <div className="rounded-lg border p-4 space-y-4 bg-muted/10">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      Nút bấm hành động (CTA)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cho phép khách hàng tương tác bấm chuyển trang hoặc liên
                      hệ
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="cta.enabled"
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

                {ctaEnabled && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="cta.label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel required>
                              Nhãn hiển thị trên nút
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="VD: Ghé gian hàng"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cta.linkType"
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
                    {linkType === "INTERNAL_LINK" && (
                      <div className="space-y-2 rounded-md bg-background p-3 border">
                        <FormField
                          control={form.control}
                          name="cta.target"
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
                    {linkType === "EXTERNAL_LINK" && (
                      <div className="space-y-3 rounded-md bg-background p-3 border">
                        <FormField
                          control={form.control}
                          name="cta.target"
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
                      </div>
                    )}

                    {/* Hành động: Contact */}
                    {linkType === "CONTACT" && (
                      <div className="rounded-md bg-background p-3 border">
                        <FormField
                          control={form.control}
                          name="cta.target"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs flex items-center gap-1">
                                <PhoneCall className="h-3.5 w-3.5 text-primary" />
                                Số điện thoại hoặc đích liên hệ
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="VD: tel:0901234567 hoặc HOTLINE"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Nhập số hotline (vd: tel:0901234567) hoặc mã
                                liên hệ.
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
                    Bật để slide banner này xuất hiện trên trang chủ
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="enabled"
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
            </fieldset>

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
