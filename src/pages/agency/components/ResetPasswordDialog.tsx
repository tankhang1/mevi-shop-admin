import { useState } from "react";
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
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import {
  type PartnerProfile,
  type ResetPasswordFormValues,
  resetPasswordSchema,
  usePartnerProfileDetail,
  useResetUserPassword,
} from "@/features/partner";
import { getErrorMessage } from "@/lib/api-error";
import { LoadingBlock } from "@/components/common/ui-bits";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner?: PartnerProfile;
}

function ResetPasswordForm({
  partner,
  onClose,
}: {
  partner: PartnerProfile;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const { data: detailData, isLoading } = usePartnerProfileDetail(partner.id);
  const resetPasswordMutation = useResetUserPassword();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    const account = detailData?.ownerAccount;
    const userId = account?.id ?? partner.workspaceId;
    if (!userId) {
      toast({
        title: "Không tìm thấy tài khoản",
        description:
          "Không thể xác định mã tài khoản liên kết với đối tác này.",
        variant: "destructive",
      });
      return;
    }

    const fullName = account?.fullName || partner.contactName || partner.name;
    const username =
      account?.username || account?.phoneNumber || partner.contactPhone;

    try {
      await resetPasswordMutation.mutateAsync({
        userId,
        password: values.password.trim(),
        fullName,
        username,
      });

      toast({
        title: "Đặt lại mật khẩu thành công",
        description: `Mật khẩu của tài khoản "${fullName}" (${username}) đã được cập nhật. Các phiên đăng nhập cũ đã được thu hồi.`,
      });

      onClose();
    } catch (err) {
      toast({
        title: "Không thể đặt lại mật khẩu",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingBlock />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Đặt lại mật khẩu
          </DialogTitle>
          <DialogDescription>
            Nhập mật khẩu mới cho tài khoản đối tác{" "}
            <strong>{partner.contactName || partner.name}</strong> (SĐT:{" "}
            <span className="font-mono">{partner.contactPhone}</span>).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold">
                  Mật khẩu mới <span className="text-destructive">*</span>
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Tối thiểu 6 ký tự"
                      autoComplete="new-password"
                      className="pr-10"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold">
                  Xác nhận mật khẩu mới{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      autoComplete="new-password"
                      className="pr-10"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-[11px] text-muted-foreground bg-muted/50 p-2.5 rounded border">
            Lưu ý: Mọi phiên đăng nhập hiện tại của đối tác sẽ bị vô hiệu hoá.
            Đối tác cần sử dụng mật khẩu mới này cho lần đăng nhập tiếp theo.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending
              ? "Đang cập nhật..."
              : "Xác nhận đặt lại"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export function ResetPasswordDialog({ open, onOpenChange, partner }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open && partner && (
          <ResetPasswordForm
            partner={partner}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
