import type { ReactNode } from "react";
import { useLocation } from "wouter";
import {
  ShopAdminLayout,
  ShopMobileLayout,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { DemoAccountSwitcher } from "@/components/common/DemoAccountSwitcher";
import { env } from "@/config/env";
import { menuFor, mobileNavFor, shopMenu } from "@/config/menu";
import { ROUTES } from "@/config/routes";
import { useAccess } from "@/features/auth";
import { usePageHeaderStore } from "./page-header.store";

const BRAND_TITLE = "Trạm xanh MEVI";

function titleFor(path: string) {
  if (path === ROUTES.productCreate) return "Thêm sản phẩm";
  if (path === ROUTES.productApproval) return "Duyệt sản phẩm";
  if (/^\/admin\/products\/[^/]+\/edit$/.test(path)) return "Sửa sản phẩm";
  if (/^\/admin\/products\/[^/]+$/.test(path)) return "Chi tiết sản phẩm";
  if (path.startsWith(ROUTES.products)) return "Quản lý sản phẩm";
  if (path === ROUTES.farmRegistrations) return "Đăng ký sản phẩm từ nông hộ";
  if (path === ROUTES.productGroups) return "Nhóm sản phẩm";
  if (path.startsWith(ROUTES.productGroups)) return "Chi tiết nhóm sản phẩm";
  if (path === ROUTES.inventory) return "Quản lý kho";
  if (path.startsWith(ROUTES.inventory)) return "Lịch sử kho";
  if (path === ROUTES.customers) return "Khách hàng";
  if (path.startsWith(ROUTES.customers)) return "Chi tiết khách hàng";
  if (path === ROUTES.orders) return "Đơn đặt hàng";
  if (path.startsWith(ROUTES.orders)) return "Chi tiết đơn hàng";
  if (path.startsWith(ROUTES.agencies)) return "Đại lý";
  if (path === ROUTES.reviews) return "Đánh giá khách hàng";
  if (path === ROUTES.dispatchTeams) return "Nhóm điều phối";
  if (path === ROUTES.report("agency")) return "Doanh thu theo đại lý / CTV";
  if (path === ROUTES.report("product")) return "Doanh thu theo sản phẩm";
  if (path === ROUTES.report("group")) return "Doanh thu theo nhóm sản phẩm";
  if (path === ROUTES.report("farm")) return "Doanh thu theo nông hộ";
  if (path === ROUTES.staff) return "Nhân viên";
  if (path === ROUTES.myShop) return "Thông tin gian hàng";
  if (path === ROUTES.shops) return "Gian hàng";
  if (path.startsWith(ROUTES.shops)) return "Chi tiết gian hàng";
  if (path === ROUTES.profile) return "Tài khoản";
  return "Tổng quan";
}

/** Desktop: sidebar + header · Mobile: header + bottom nav (both from eco-shared-ui) */
export function ShopLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const actions = usePageHeaderStore((s) => s.actions);
  const { isRoot, isStaff, roles } = useAccess();
  const layout = isMobile ? (
    <ShopMobileLayout brandTitle={BRAND_TITLE} navItems={mobileNavFor(isRoot, isStaff)}>
      {/* Desktop shows the title in the layout header; mobile gets it here, next to the page actions */}
      <div className="mb-4 flex min-h-9 items-center gap-2">
        <h1 className="min-w-0 flex-1 truncate text-lg font-bold">{titleFor(location)}</h1>
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
    >
      {children}
    </ShopAdminLayout>
  );
  return (
    <>
      {layout}
      {env.useMock && <DemoAccountSwitcher />}
    </>
  );
}
