import { useState } from "react";
import { useParams } from "wouter";
import { BadgeCheck, Eye, EyeOff, Loader2, User } from "lucide-react";
import {
  Badge,
  Card,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { BackLink } from "@/components/common/BackLink";
import { RequireRole } from "@/components/common/RequireRole";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import {
  usePartnerProfileDetail,
  useUpdatePartnerSuspension,
} from "@/features/partner";
import { formatDate } from "@/lib/format";
import { PartnerSuspensionDialog } from "@/pages/agency/components/PartnerSuspensionDialog";

function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePartnerProfileDetail(id);
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false);

  const updateSuspension = useUpdatePartnerSuspension();

  if (isLoading) return <LoadingBlock />;
  if (isError || !data?.profile)
    return <EmptyBlock>Không tìm thấy thông tin gian hàng.</EmptyBlock>;

  const { profile: shop, ownerAccount } = data;

  return (
    <div className="space-y-4">
      <BackLink to={ROUTES.shops} label="Danh sách gian hàng" />

      {/* Header card with cover image, logo & active toggle */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-2xs">
        <div
          className="relative h-32 sm:h-48 w-full bg-slate-100 bg-cover bg-center"
          style={{
            backgroundImage: shop.coverImageUrl
              ? `url(${shop.coverImageUrl})`
              : undefined,
          }}
        >
          {/* Lớp gradient nhẹ bảo vệ nền banner */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Khối Thông tin & Logo gian hàng (Backdrop blur ôm trọn logo và nội dung theo độ rộng thực tế) */}
            <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4 -mt-12 sm:-mt-16 p-2.5 sm:p-3.5 rounded-2xl border border-border/60 bg-background/80 backdrop-blur-md shadow-xs dark:border-border/40 dark:bg-card/80 w-fit max-w-full">
              {shop.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt=""
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover bg-card shadow-xs ring-1 ring-border/20 shrink-0"
                />
              ) : (
                <div
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-xs ring-1 ring-border/20 shrink-0 uppercase"
                  style={{ background: shop.brandColor || "#2E7D32" }}
                >
                  {shop.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 space-y-1 pr-1 sm:pr-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    {shop.name}
                  </h1>
                  {shop.verified && (
                    <span title="Đã xác minh">
                      <BadgeCheck className="h-4.5 w-4.5 text-sky-600 shrink-0" />
                    </span>
                  )}
                  <Badge
                    variant={
                      shop.partnerType === "AGENCY" ? "default" : "secondary"
                    }
                  >
                    {shop.partnerType === "AGENCY" ? "Đại lý" : "Cộng tác viên"}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  @{shop.handle} · {shop.province}
                </p>
                {shop.slogan && (
                  <p className="text-xs sm:text-sm italic text-foreground/80">
                    "{shop.slogan}"
                  </p>
                )}
              </div>
            </div>

            {/* Active / Suspension Toggle Card ở góc trên bên phải */}
            <button
              type="button"
              onClick={() => setSuspensionDialogOpen(true)}
              disabled={updateSuspension.isPending}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border p-2.5 sm:p-3 text-left transition-all w-full md:w-auto shrink-0 shadow-xs cursor-pointer select-none backdrop-blur-md",
                !shop.suspended
                  ? "border-primary/30 bg-card/85 hover:bg-primary/[0.08] hover:border-primary/50"
                  : "border-destructive/30 bg-card/85 hover:bg-destructive/[0.08] hover:border-destructive/50",
              )}
              title={
                !shop.suspended
                  ? "Nhấn để tạm khóa gian hàng"
                  : "Nhấn để mở khóa gian hàng"
              }
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors",
                  !shop.suspended
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive",
                )}
              >
                {updateSuspension.isPending ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : !shop.suspended ? (
                  <Eye className="h-4.5 w-4.5" />
                ) : (
                  <EyeOff className="h-4.5 w-4.5" />
                )}
              </span>
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      !shop.suspended ? "text-primary" : "text-destructive",
                    )}
                  >
                    {!shop.suspended ? "Đang hoạt động" : "Đang tạm khóa"}
                  </span>
                  <span
                    className={cn(
                      "inline-block h-2 w-2 rounded-full shrink-0",
                      !shop.suspended ? "bg-primary" : "bg-destructive",
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground group-hover:underline">
                  {!shop.suspended
                    ? "Nhấn để tạm khóa gian hàng"
                    : "Nhấn để mở khóa gian hàng"}
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Dialog xác nhận thay đổi trạng thái (Tạm khóa / Mở lại gian hàng) */}
      <PartnerSuspensionDialog
        open={suspensionDialogOpen}
        onOpenChange={setSuspensionDialogOpen}
        partner={shop}
      />

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
