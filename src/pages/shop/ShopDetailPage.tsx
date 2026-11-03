import { useParams } from "wouter";
import { BadgeCheck, Eye, EyeOff, ShieldCheck, User } from "lucide-react";
import {
  Badge,
  Card,
  Label,
  Switch,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { BackLink } from "@/components/common/BackLink";
import { RequireRole } from "@/components/common/RequireRole";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import {
  usePartnerProfileDetail,
  useUpdatePartnerSuspension,
  useUpdatePartnerVerification,
} from "@/features/partner";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";

function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data, isLoading, isError } = usePartnerProfileDetail(id);

  const updateVerification = useUpdatePartnerVerification();
  const updateSuspension = useUpdatePartnerSuspension();

  if (isLoading) return <LoadingBlock />;
  if (isError || !data?.profile)
    return <EmptyBlock>Không tìm thấy thông tin gian hàng.</EmptyBlock>;

  const { profile: shop, ownerAccount } = data;

  const handleToggleVerified = async (verified: boolean) => {
    try {
      await updateVerification.mutateAsync({
        id: shop.id,
        input: { verified },
      });
      toast({
        title: verified ? "Đã xác minh gian hàng" : "Đã gỡ xác minh",
        description: shop.name,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể lưu",
        description: getErrorMessage(e),
      });
    }
  };

  const handleToggleSuspension = async (active: boolean) => {
    try {
      await updateSuspension.mutateAsync({
        id: shop.id,
        input: { suspended: !active },
      });
      toast({
        title: active ? "Đã mở gian hàng" : "Đã tạm khóa gian hàng",
        description: shop.name,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể lưu",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <div className="space-y-4">
      <BackLink to={ROUTES.shops} label="Danh sách gian hàng" />

      {/* Header card with cover image & logo */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div
          className="h-32 sm:h-48 w-full bg-slate-100 bg-cover bg-center"
          style={{
            backgroundImage: shop.coverImageUrl
              ? `url(${shop.coverImageUrl})`
              : undefined,
          }}
        />
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 -mt-10 sm:-mt-12">
          {shop.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt=""
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-card object-cover bg-card shadow-sm shrink-0"
            />
          ) : (
            <div
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-4 border-card flex items-center justify-center text-2xl font-bold text-white shadow-sm shrink-0 uppercase"
              style={{ background: shop.brandColor || "#2E7D32" }}
            >
              {shop.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {shop.name}
              </h1>
              {shop.verified && (
                <BadgeCheck className="h-5 w-5 text-sky-600 shrink-0" />
              )}
              <Badge
                variant={
                  shop.partnerType === "AGENCY" ? "default" : "secondary"
                }
              >
                {shop.partnerType === "AGENCY" ? "Đại lý" : "Cộng tác viên"}
              </Badge>
              {shop.suspended && (
                <Badge variant="destructive">Đang tạm khóa</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground font-mono">
              @{shop.handle} · {shop.province}
            </p>
            {shop.slogan && (
              <p className="text-sm italic text-foreground/80">
                "{shop.slogan}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick toggles */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-sky-600" />
          <div className="min-w-0 flex-1">
            <Label className="font-medium text-sm">Xác minh gian hàng</Label>
            <p className="text-xs text-muted-foreground">
              {shop.verified
                ? "Gian hàng đang có huy hiệu xác minh uy tín"
                : "Chưa gắn huy hiệu xác minh"}
            </p>
          </div>
          <Switch
            checked={shop.verified}
            disabled={updateVerification.isPending}
            onCheckedChange={handleToggleVerified}
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
          {shop.suspended ? (
            <EyeOff className="h-5 w-5 text-destructive" />
          ) : (
            <Eye className="h-5 w-5 text-emerald-600" />
          )}
          <div className="min-w-0 flex-1">
            <Label className="font-medium text-sm">Hiển thị gian hàng</Label>
            <p className="text-xs text-muted-foreground">
              {shop.suspended
                ? `Đang tạm khóa${
                    shop.suspensionNote ? `: ${shop.suspensionNote}` : ""
                  }`
                : "Gian hàng và sản phẩm đang hiển thị công khai"}
            </p>
          </div>
          <Switch
            checked={!shop.suspended}
            disabled={updateSuspension.isPending}
            onCheckedChange={handleToggleSuspension}
          />
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm border-b pb-2">
            Thông tin giới thiệu & liên hệ
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">Mô tả:</span>
              <p className="text-foreground mt-0.5">
                {shop.description || "Chưa có mô tả"}
              </p>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Người đại diện:</span>
              <span className="font-medium">{shop.contactName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số điện thoại:</span>
              <span className="font-mono">{shop.contactPhone}</span>
            </div>
            {shop.contactEmail && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{shop.contactEmail}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tỉnh / Thành phố:</span>
              <span>{shop.province}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm border-b pb-2 flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" />
            Tài khoản quản trị (Chủ sở hữu)
          </h3>
          {ownerAccount ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Họ và tên:</span>
                <span className="font-medium">{ownerAccount.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tên đăng nhập:</span>
                <span className="font-mono text-primary font-medium">
                  {ownerAccount.username}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Đổi mật khẩu:</span>
                <Badge
                  variant={
                    ownerAccount.mustChangePassword ? "destructive" : "outline"
                  }
                >
                  {ownerAccount.mustChangePassword
                    ? "Chưa đổi mật khẩu mặc định"
                    : "Đã thiết lập"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo tài khoản:</span>
                <span>{formatDate(ownerAccount.createdAt)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">
              Chưa có tài khoản chủ sở hữu liên kết với gian hàng này.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ShopDetailPage() {
  return (
    <RequireRole root>
      <ShopDetail />
    </RequireRole>
  );
}
