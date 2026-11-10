import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  type FaqQuestionFormValues,
  type FaqQuestionInput,
  type FaqQuestionItem,
  faqQuestionSchema,
} from "@/features/content-block";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FaqQuestionItem | null;
  onSave: (faq: FaqQuestionInput) => Promise<void>;
}

export function StorefrontFaqDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: Props) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FaqQuestionFormValues>({
    resolver: zodResolver(faqQuestionSchema),
    defaultValues: {
      question: "",
      answer: "",
      enabled: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          question: item.question,
          answer: item.answer,
          enabled: item.enabled,
        });
      } else {
        form.reset({
          question: "",
          answer: "",
          enabled: true,
        });
      }
    }
  }, [open, item, form]);

  const onSubmit = async (values: FaqQuestionFormValues) => {
    setSubmitting(true);
    try {
      await onSave({
        question: values.question.trim(),
        answer: values.answer.trim(),
        enabled: values.enabled,
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
            {item ? "Chỉnh sửa câu hỏi FAQ" : "Thêm câu hỏi FAQ mới"}
          </DialogTitle>
          <DialogDescription>
            Cung cấp các câu hỏi thường gặp và câu trả lời chi tiết để hỗ trợ
            khách mua hàng và đối tác.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <fieldset disabled={submitting} className="space-y-4">
            {/* Câu hỏi */}
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Câu hỏi thường gặp</FormLabel>
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

            {/* Câu trả lời chi tiết */}
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
                      placeholder="Nhập câu trả lời giải đáp thắc mắc..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trạng thái hiển thị */}
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <Label className="font-medium text-sm">
                  Trạng thái hiển thị
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bật để câu hỏi này xuất hiện trong danh sách FAQ trên trang
                  chủ
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
                        aria-label="Kích hoạt câu hỏi"
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
                {item ? "Cập nhật câu hỏi" : "Thêm câu hỏi"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
