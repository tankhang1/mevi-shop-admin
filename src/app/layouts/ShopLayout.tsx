import type { ReactNode } from "react";
import { useLocation } from "wouter";
import {
  ShopAdminLayout,
  ShopMobileLayout,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { DemoAccountSwitcher } from "@/components/common/DemoAccountSwitcher";
import { env } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { usePageHeaderStore } from "./page-header.store";

const BRAND_TITLE = "Trạm xanh MEVI";

function titleFor(path: string) {
  if (path === ROUTES.productCreate) return "Thêm sản phẩm";
  if (path === ROUTES.productApproval) return "Duyệt sản phẩm";
  if (/^\/admin\/products\/[^/]+\/edit$/.test(path)) return "Sửa sản phẩm";
  if (/^\/admin\/products\/[^/]+$/.test(path)) return "Chi tiết sản phẩm";
  if (path.startsWith(ROUTES.products)) return "Quản lý sản phẩm";
  if (path.startsWith(ROUTES.orders)) return "Đơn đặt hàng";
  if (path.startsWith(ROUTES.agencies)) return "Đại lý";
  if (path === ROUTES.profile) return "Tài khoản";
  return "Tổng quan";
}

/** Desktop: sidebar + header · Mobile: header + bottom nav (both from eco-shared-ui) */
export function ShopLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [location] = useLocation();
  const actions = usePageHeaderStore((s) => s.actions);
  const layout = isMobile ? (
    <ShopMobileLayout brandTitle={BRAND_TITLE}>
      {actions && <div className="mb-4 flex justify-end gap-2">{actions}</div>}
      {children}
    </ShopMobileLayout>
  ) : (
    <ShopAdminLayout
      brandTitle={BRAND_TITLE}
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
