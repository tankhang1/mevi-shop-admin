import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
  Switch,
  Textarea,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  HIGHLIGHT_ICON_MAP,
} from "@/features/storefront";
import {
  type HighlightCardFormValues,
  type HighlightCardInput,
  type HighlightCardItem,
  highlightCardSchema,
} from "@/features/content-block";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: HighlightCardItem | null;
  onSave: (card: HighlightCardInput) => Promise<void>;
}

export function StorefrontHighlightCardDialog({
  open,
  onOpenChange,
  card,
  onSave,
}: Props) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<HighlightCardFormValues>({
    resolver: zodResolver(highlightCardSchema),
    defaultValues: {
      enabled: true,
      icon: "ShieldCheck",
      title: "",
      description: "",
      link: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (card) {
        form.reset({
          enabled: card.enabled,
          icon: card.icon || "ShieldCheck",
          title: card.title,
          description: card.description ?? "",
          link: card.link ?? "",
        });
      } else {
        form.reset({
          enabled: true,
          icon: "ShieldCheck",
          title: "",
          description: "",
          link: "",
        });
      }
    }
  }, [open, card, form]);

  const selectedIcon = useWatch({
    control: form.control,
    name: "icon",
    defaultValue: "ShieldCheck",
  });

  const onSubmit = async (values: HighlightCardFormValues) => {
    setSubmitting(true);
    try {
      await onSave({
        enabled: values.enabled,
        icon: values.icon,
        title: values.title.trim(),
        description: values.description?.trim() || null,
        link: values.link?.trim() || null,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {card ? "Chỉnh sửa thẻ nổi bật" : "Thêm thẻ nổi bật mới"}
          </DialogTitle>
          <DialogDescription>
            Thiết lập biểu tượng, tiêu đề và nội dung cam kết của thẻ.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <fieldset disabled={submitting} className="space-y-4">
            {/* Trạng thái hiển thị */}
            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
              <div>
                <Label className="text-sm font-semibold">Trạng thái hiển thị</Label>
                <p className="text-xs text-muted-foreground">
                  Bật để thẻ xuất hiện trong khối nổi bật
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
                        aria-label="Kích hoạt thẻ"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Chọn biểu tượng Icon */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Chọn biểu tượng (Icon)</FormLabel>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 p-2 rounded-lg border bg-muted/20">
                    {Object.entries(HIGHLIGHT_ICON_MAP).map(([key, item]) => {
                      const IconComponent = item.icon;
                      const isSelected = selectedIcon === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={submitting}
                          onClick={() => field.onChange(key)}
                          title={item.label}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-lg transition-all border",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs ring-2 ring-primary/20"
                              : "bg-background hover:bg-muted text-foreground border-transparent",
                          )}
                        >
                          <IconComponent className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                  <FormDescription className="text-xs">
                    Đang chọn:{" "}
                    <span className="font-semibold text-foreground">
                      {HIGHLIGHT_ICON_MAP[selectedIcon]?.label || selectedIcon}
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tiêu đề thẻ */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tiêu đề thẻ</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: Nguồn gốc rõ ràng, Đặt hàng linh hoạt..."
                      className="font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nội dung mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      rows={3}
                      placeholder="VD: Thông tin vùng trồng được hiển thị cùng từng sản phẩm."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Đường dẫn tùy chọn */}
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liên kết khi click thẻ (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="VD: /about hoặc https://..."
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Nếu có, khách hàng bấm vào thẻ sẽ chuyển đến trang này (bắt đầu bằng / hoặc https://).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            </fieldset>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {card ? "Cập nhật thẻ" : "Thêm thẻ vào khối"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
