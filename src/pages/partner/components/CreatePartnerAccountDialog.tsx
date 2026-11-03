import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
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
  RadioGroup,
  RadioGroupItem,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  type CreatePartnerAccountFormValues,
  type PartnerContactRequest,
  createPartnerAccountSchema,
  useCreateShopPartnerUser,
} from "@/features/partner";
import { applyFieldErrors, getErrorMessage } from "@/lib/api-error";
import type { ApiErrorResponse } from "@/types/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactRequest?: PartnerContactRequest;
  onSuccess?: () => void;
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
  const createAccount = useCreateShopPartnerUser();

  const form = useForm<CreatePartnerAccountFormValues>({
    resolver: zodResolver(createPartnerAccountSchema),
    defaultValues: {
      fullName: contactRequest?.fullName || "",
      phoneNumber: contactRequest?.phoneNumber || "",
      email: contactRequest?.email || "",
      audienceType: "individual",
      province: contactRequest?.province || "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: CreatePartnerAccountFormValues) => {
    try {
      await createAccount.mutateAsync({
        fullName: values.fullName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email?.trim() || undefined,
        audienceType: values.audienceType,
        province: values.province?.trim() || undefined,
        password: values.password?.trim() || undefined,
      });

      toast({
        title: "Cấp tài khoản thành công",
        description: `Đã tạo tài khoản cho đối tác ${values.fullName}. Hệ thống đang khởi tạo workspace riêng.`,
      });

      onClose();
      onSuccess?.();
    } catch (err) {
      if (isAxiosError<ApiErrorResponse>(err)) {
        // Bắt lỗi trùng số điện thoại (409)
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

        // Tự động map toàn bộ fieldErrors chuẩn từ backend qua helper chung
        if (applyFieldErrors(err, form.setError) > 0) {
          return;
        }
      }

      toast({
        title: "Không thể cấp tài khoản",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Cấp tài khoản Đối tác Mevi Shop</DialogTitle>
          <DialogDescription>
            Tài khoản sẽ được tự động cấp quyền đối tác (MEVI_SHOP_AGENT) và
            khởi tạo workspace riêng tương ứng với số điện thoại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold">
                  Họ và tên <span className="text-destructive">*</span>
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
                  Số điện thoại (Tên đăng nhập){" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="0912345678 hoặc 0343954858" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="audienceType"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold">
                  Loại đối tượng <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-4 pt-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="aud-individual" />
                      <Label
                        htmlFor="aud-individual"
                        className="text-xs cursor-pointer"
                      >
                        Cá nhân
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business" id="aud-business" />
                      <Label
                        htmlFor="aud-business"
                        className="text-xs cursor-pointer"
                      >
                        Doanh nghiệp / Hộ KD
                      </Label>
                    </div>
                  </RadioGroup>
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

          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold">
                  Tỉnh / Thành phố
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Lâm Đồng, TP. Hồ Chí Minh..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    placeholder="Bỏ trống để dùng mật khẩu mặc định"
                    {...field}
                  />
                </FormControl>
                <p className="text-[11px] text-muted-foreground">
                  Nếu bỏ trống, đối tác sẽ dùng mật khẩu mặc định và bắt buộc
                  đổi mật khẩu ở lần đăng nhập đầu tiên.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={createAccount.isPending}>
            {createAccount.isPending ? "Đang xử lý..." : "Xác nhận cấp"}
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
      <DialogContent className="max-w-md">
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
