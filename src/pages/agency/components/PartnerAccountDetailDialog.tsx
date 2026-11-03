import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Badge,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePartnerProfileDetail } from "@/features/partner";
import { formatDate } from "@/lib/format";
import { LoadingBlock } from "@/components/common/ui-bits";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId?: number;
}

export function PartnerAccountDetailDialog({
  open,
  onOpenChange,
  partnerId,
}: Props) {
  const { data, isLoading } = usePartnerProfileDetail(partnerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thông tin tài khoản đối tác</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingBlock />
        ) : !data ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Không tìm thấy thông tin tài khoản.
          </p>
        ) : (
          <div className="space-y-4 py-1 text-sm">
            <div className="rounded-lg bg-muted/50 p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Đối tác:</span>
                <span className="font-semibold text-foreground">
                  {data.profile.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Loại đối tác:</span>
                <Badge
                  variant={
                    data.profile.partnerType === "AGENCY"
                      ? "default"
                      : "secondary"
                  }
                >
                  {data.profile.partnerType === "AGENCY"
                    ? "Đại lý"
                    : "Cộng tác viên"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mã gian hàng (ID):</span>
                <span className="font-mono text-xs font-medium">
                  {data.profile.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Workspace ID:</span>
                <span className="font-mono text-xs font-medium">
                  {data.profile.workspaceId}
                </span>
              </div>
            </div>

            {data.ownerAccount ? (
              <div className="rounded-lg border p-3.5 space-y-2">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Tài khoản đăng nhập (Chủ sở hữu)
                </h4>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Họ tên:</span>
                  <span className="font-medium">
                    {data.ownerAccount.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tên đăng nhập (SĐT):</span>
                  <span className="font-mono font-medium text-primary">
                    {data.ownerAccount.username}
                  </span>
                </div>
                {data.ownerAccount.email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{data.ownerAccount.email}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Đổi mật khẩu:</span>
                  <Badge
                    variant={
                      data.ownerAccount.mustChangePassword
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {data.ownerAccount.mustChangePassword
                      ? "Chưa đổi mật khẩu mặc định"
                      : "Đã thiết lập"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đăng nhập lần cuối:</span>
                  <span>
                    {data.ownerAccount.lastLoginAt
                      ? formatDate(data.ownerAccount.lastLoginAt)
                      : "Chưa từng đăng nhập"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày cấp tài khoản:</span>
                  <span>{formatDate(data.ownerAccount.createdAt)}</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                Chưa có tài khoản chủ sở hữu được liên kết với workspace này.
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

