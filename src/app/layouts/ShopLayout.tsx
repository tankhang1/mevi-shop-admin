import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { LogOut, type LucideProps } from "lucide-react";
import {
  type AccountMenuGroupConfig,
  ShopAdminLayout,
  cn,
  ShopMobileLayout,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { menuFor, mobileNavFor, shopMenu } from "@/config/menu";
import { ROUTES } from "@/config/routes";
import { authApi, useAccess } from "@/features/auth";
import { usePageHeaderStore } from "./page-header.store";

const BRAND_TITLE = "Trạm xanh MEVI";

function titleFor(path: string) {
  if (path === ROUTES.productCreate) return "Thêm sản phẩm";
  if (path === ROUTES.productApproval) return "Duyệt sản phẩm";
  if (/^\/admin\/products\/[^/]+\/edit$/.test(path)) return "Sửa sản phẩm";
  if (/^\/admin\/products\/[^/]+$/.test(path)) return "Chi tiết sản phẩm";
  if (path.startsWith(ROUTES.products)) return "Danh mục sản phẩm";
  if (path === ROUTES.farmRegistrations) return "Đăng ký sản phẩm từ nông hộ";
  if (path === ROUTES.productGroups) return "Nhóm sản phẩm";
  if (path.startsWith(ROUTES.productGroups)) return "Chi tiết nhóm sản phẩm";
  if (path === ROUTES.inventory) return "Kho sản phẩm";
  if (path.startsWith(ROUTES.inventory)) return "Lịch sử nhập hàng";
  if (path === ROUTES.customers) return "Khách hàng";
  if (path.startsWith(ROUTES.customers)) return "Chi tiết khách hàng";
  if (path === ROUTES.orders) return "Đơn đặt hàng";
  if (path.startsWith(ROUTES.orders)) return "Chi tiết đơn hàng";
  if (path.startsWith(ROUTES.agencies)) return "Đại lý - Cộng tác viên";
  if (path === ROUTES.reviews) return "Đánh giá khách hàng";
  if (path === ROUTES.dispatchTeams) return "Nhóm điều phối";
  if (path === ROUTES.dispatchTeamCreate) return "Tạo nhóm điều phối";
  if (path.startsWith(ROUTES.dispatchTeams)) return "Sửa nhóm điều phối";
  if (path === ROUTES.report("sales")) return "Doanh thu của tôi";
  if (path === ROUTES.report("agency")) return "Doanh thu theo đại lý / CTV";
  if (path.startsWith(`${ROUTES.report("agency")}/`))
    return "Báo cáo đại lý / CTV";
  if (path === ROUTES.report("product")) return "Doanh thu theo sản phẩm";
  if (path === ROUTES.report("group")) return "Doanh thu theo nhóm sản phẩm";
  if (path === ROUTES.report("farm")) return "Doanh thu theo nông hộ";
  if (path === ROUTES.staff) return "Nhân viên điều phối";
  if (path === ROUTES.partnerContactRequests) return "Yêu cầu hợp tác";
  if (path === ROUTES.storefrontBanners) return "Banner trang chủ";
  if (path === ROUTES.storefrontHighlights) return "Khối nổi bật & Giá trị";
  if (path === ROUTES.storefrontFaq) return "Câu hỏi thường gặp";
  if (path === ROUTES.myShop) return "Hồ sơ gian hàng";
  if (path === ROUTES.shops) return "Gian hàng";
  if (path.startsWith(ROUTES.shops)) return "Chi tiết gian hàng";
  if (path === ROUTES.profile) return "Tài khoản";
  return "Tổng quan";
}

/** Library hardcodes `text-emerald-600` on menu icons — cn/twMerge swaps it for red */
const LogOutIcon = ({ className, ...props }: LucideProps) => (
  <LogOut className={cn(className, "text-destructive")} {...props} />
);

/** Appended after the library's workspace + Mevi Center items */
const ACCOUNT_MENU: AccountMenuGroupConfig[] = [
  {
    items: [
      {
        label: "Đăng xuất",
        icon: LogOutIcon,
        className: "text-destructive focus:text-destructive",
        onClick: ({ closeMenu }) => {
          closeMenu();
          void authApi.logout();
        },
      },
    ],
  },
];

/** Desktop: sidebar + header · Mobile: header + bottom nav (both from eco-shared-ui) */
export function ShopLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const actions = usePageHeaderStore((s) => s.actions);
  const { isRoot, isStaff, roles } = useAccess();
  const layout = isMobile ? (
    <ShopMobileLayout
      brandTitle={BRAND_TITLE}
      navItems={mobileNavFor(isRoot, isStaff)}
    >
      {/* Desktop shows the title in the layout header; mobile gets it here, next to the page actions */}
      <div className="mb-4 flex min-h-9 items-center gap-2">
        <h1 className="min-w-0 flex-1 truncate text-lg font-bold">
          {titleFor(location)}
        </h1>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      {children}
    </ShopMobileLayout>
  ) : (
    <ShopAdminLayout
      brandTitle={BRAND_TITLE}
      // While /auth/me loads, hand the full menu to the library (it filters by role itself)
      menu={roles.length ? menuFor(roles) : shopMenu}
      title={titleFor(location)}
      actions={actions}
      accountMenuItems={ACCOUNT_MENU}
    >
      {children}
    </ShopAdminLayout>
  );
  return (
    <>
      {layout}
      {/* DemoAccountSwitcher disabled: login is real SSO now, a demo token would break real APIs */}
    </>
  );
}
