import { ExternalLink, Sparkles } from "lucide-react";
import {
  Badge,
  Button,
  useToast,
  useWorkspace,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { RequireRole } from "@/components/common/RequireRole";
import {
  EmptyBlock,
  LoadingBlock,
  StatusPill,
} from "@/components/common/ui-bits";
import { useCurrentUser } from "@/features/auth";
import type { PartnerProfile } from "@/features/partner";
import {
  type StorefrontProfileValues,
  useStorefrontProfile,
  useUpdateStorefrontProfile,
} from "@/features/storefront";
import { getErrorMessage } from "@/lib/api-error";
import { ShopProfileForm } from "./components/ShopProfileForm";
import { StorefrontProductsTab } from "./components/StorefrontProductsTab";

const SHOP_URL = import.meta.env.VITE_SHOP_URL ?? "https://mevi.vn";

function MyShop() {
  const { toast } = useToast();
  const { data: user } = useCurrentUser();
  const {
    currentWorkspaceId,
    workspaces,
    isLoading: isWorkspaceLoading,
  } = useWorkspace();
  const effectiveWorkspaceId = currentWorkspaceId || workspaces[0]?.id || null;

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useStorefrontProfile(effectiveWorkspaceId);
  const update = useUpdateStorefrontProfile(effectiveWorkspaceId);

  const isNewShop = profile === null;

  const effectiveProfile: PartnerProfile = profile ?? {
    id: 0,
    workspaceId: Number(effectiveWorkspaceId) || 0,
    name: user?.name ? `Gian hàng ${user.name}` : "",
    handle: "",
    slogan: "",
    brandColor: "#214c3a",
    logoUrl: "",
    coverImageUrl: "",
    description: "",
    province: "",
    contactName: user?.name || "",
    contactPhone: user?.phoneNumber || "",
    contactEmail: user?.email || "",
    partnerType: "COLLABORATOR",
    suspended: false,
    suspendedAt: null,
    suspendedByUserId: null,
    suspensionNote: null,
    verified: false,
    verifiedAt: null,
    verifiedByUserId: null,
    publiclyVisible: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const publicShopUrl = profile
    ? `${SHOP_URL}/shops/${profile.handle || "gian-hang"}-i.${profile.id}`
    : "#";

  const headerExtra = profile ? (
    <>
      {profile.suspended && (
        <StatusPill
          label="Đang tạm khóa"
          className="bg-destructive/10 text-destructive"
        />
      )}
      {profile.verified ? (
        <StatusPill label="Đã xác minh" className="bg-sky-100 text-sky-800" />
      ) : (
        <span title="Hoàn thiện đầy đủ thông tin và liên hệ Mevi để được gắn huy hiệu xác minh">
          <StatusPill
            label="Chưa xác minh"
            className="bg-muted text-muted-foreground"
          />
        </span>
      )}
      <Button variant="outline" asChild className="px-2.5 sm:px-4">
        <a
          href={publicShopUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Xem trang gian hàng"
        >
          <ExternalLink className="h-4 w-4 sm:mr-1.5" />
          <span className="max-sm:hidden">Xem trang gian hàng</span>
        </a>
      </Button>
    </>
  ) : null;

  if (isWorkspaceLoading) return <LoadingBlock />;
  if (!effectiveWorkspaceId && !isWorkspaceLoading) {
    return (
      <EmptyBlock>
        Tài khoản chưa được liên kết với đơn vị (workspace) gian hàng nào. Vui
        lòng liên hệ quản trị viên để hoàn tất cấu hình gian hàng.
      </EmptyBlock>
    );
  }

  if (isLoading) return <LoadingBlock />;
  if (isError) {
    return (
      <EmptyBlock>
        Không tải được thông tin gian hàng: {getErrorMessage(error)}
      </EmptyBlock>
    );
  }

  const onSubmit = async (values: StorefrontProfileValues) => {
    try {
      await update.mutateAsync(values);
      toast({
        title: isNewShop
          ? "Đã khởi tạo gian hàng thành công!"
          : "Đã lưu thông tin gian hàng",
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
      {isNewShop && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground shadow-xs dark:border-primary/30 dark:bg-primary/10">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-bold text-foreground">
                  Khởi tạo gian hàng mới
                </h4>
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold"
                >
                  Chưa kích hoạt
                </Badge>
              </div>
              <p className="mt-1 leading-relaxed text-muted-foreground font-normal">
                Workspace của bạn chưa có thông tin gian hàng. Vui lòng hoàn tất
                thông tin bên dưới và bấm nút{" "}
                <span className="font-semibold text-primary underline underline-offset-2">
                  Khởi tạo gian hàng
                </span>{" "}
                ở góc trên bên phải để bắt đầu hoạt động bán hàng.
              </p>
            </div>
          </div>
        </div>
      )}

      <ShopProfileForm
        profile={effectiveProfile}
        workspaceId={effectiveWorkspaceId}
        saving={update.isPending}
        isNew={isNewShop}
        submitLabel={isNewShop ? "Khởi tạo gian hàng" : "Lưu thay đổi"}
        headerExtra={headerExtra}
        onSubmit={(v) => void onSubmit(v)}
        extraTabs={[
          {
            value: "shelf",
            label: "Sản phẩm kinh doanh",
            content: isNewShop ? (
              <EmptyBlock>
                Vui lòng hoàn tất khởi tạo thông tin gian hàng trước khi chọn
                sản phẩm từ kho Mevi.
              </EmptyBlock>
            ) : (
              <StorefrontProductsTab workspaceId={effectiveWorkspaceId} />
            ),
          },
        ]}
      />
    </div>
  );
}

export default function MyShopPage() {
  return (
    <RequireRole shopAdmin root>
      <MyShop />
    </RequireRole>
  );
}
