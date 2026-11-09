import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Textarea,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  HIGHLIGHT_ICON_MAP,
  type HighlightCardFormValues,
  type StorefrontHighlightCard,
  createStorefrontId,
  highlightCardFormSchema,
} from "@/features/storefront";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: StorefrontHighlightCard | null;
  onSave: (card: StorefrontHighlightCard) => void;
}

export function StorefrontHighlightCardDialog({
  open,
  onOpenChange,
  card,
  onSave,
}: Props) {
  const form = useForm<HighlightCardFormValues>({
    resolver: zodResolver(highlightCardFormSchema),
    defaultValues: {
      icon: "ShieldCheck",
      title: "",
      description: "",
      linkUrl: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (card) {
        form.reset({
          id: card.id,
          icon: card.icon || "ShieldCheck",
          title: card.title,
          description: card.description,
          linkUrl: card.linkUrl ?? "",
        });
      } else {
        form.reset({
          icon: "ShieldCheck",
          title: "",
          description: "",
          linkUrl: "",
        });
      }
    }
  }, [open, card, form]);

  const selectedIcon = useWatch({
    control: form.control,
    name: "icon",
    defaultValue: "ShieldCheck",
  });

  const onSubmit = (values: HighlightCardFormValues) => {
    const result: StorefrontHighlightCard = {
      id: card?.id || createStorefrontId("card"),
      icon: values.icon,
      orderText: card?.orderText,
      title: values.title.trim(),
      description: values.description.trim(),
      linkUrl: values.linkUrl?.trim() || undefined,
    };
    onSave(result);
    onOpenChange(false);
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
                  <FormLabel required>Nội dung mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
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
              name="linkUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liên kết khi click thẻ (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: /about hoặc https://..."
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Nếu có, khách hàng bấm vào thẻ sẽ chuyển đến trang này.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                {card ? "Cập nhật thẻ" : "Thêm thẻ vào khối"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
