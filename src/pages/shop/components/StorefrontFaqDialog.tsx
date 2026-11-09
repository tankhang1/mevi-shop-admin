import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Switch,
  Textarea,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type FaqItemFormValues,
  type StorefrontFaqItem,
  createStorefrontId,
  faqItemFormSchema,
} from "@/features/storefront";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StorefrontFaqItem | null;
  defaultSortOrder: number;
  onSave: (faq: StorefrontFaqItem) => void;
}

export function StorefrontFaqDialog({
  open,
  onOpenChange,
  item,
  defaultSortOrder,
  onSave,
}: Props) {
  const form = useForm<FaqItemFormValues>({
    resolver: zodResolver(faqItemFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      active: true,
      sortOrder: defaultSortOrder,
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          id: item.id,
          question: item.question,
          answer: item.answer,
          active: item.active,
          sortOrder: item.sortOrder ?? defaultSortOrder,
        });
      } else {
        form.reset({
          question: "",
          answer: "",
          active: true,
          sortOrder: defaultSortOrder,
        });
      }
    }
  }, [open, item, defaultSortOrder, form]);

  const onSubmit = (values: FaqItemFormValues) => {
    const result: StorefrontFaqItem = {
      id: item?.id || createStorefrontId("faq"),
      question: values.question.trim(),
      answer: values.answer.trim(),
      active: values.active,
      sortOrder: values.sortOrder ?? defaultSortOrder,
    };
    onSave(result);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? "Chỉnh sửa câu hỏi FAQ" : "Thêm câu hỏi FAQ mới"}
          </DialogTitle>
          <DialogDescription>
            Cung cấp các câu hỏi thường gặp và câu trả lời chi tiết để hỗ trợ
            khách mua hàng và đối tác.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Câu hỏi</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: Đơn hàng sỉ tối thiểu là bao nhiêu?"
                      className="font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Câu trả lời chi tiết</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={5}
                      placeholder="VD: Đơn sỉ tối thiểu là 3 triệu đ mỗi lần đặt. Chiết khấu được tính theo tổng giá trị mua trong tháng..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between border-t pt-3">
              <div>
                <Label className="text-sm font-medium">
                  Trạng thái hiển thị
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bật để câu hỏi này xuất hiện trong mục FAQ trên trang
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
              >
                Hủy
              </Button>
              <Button type="submit">
                {item ? "Lưu thay đổi" : "Thêm câu hỏi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
