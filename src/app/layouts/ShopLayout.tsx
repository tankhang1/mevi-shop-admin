import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { ShopAdminLayout, ShopMobileLayout, useIsMobile } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ROUTES } from "@/config/routes";

const BRAND_TITLE = "Trạm xanh MEVI";

function titleFor(path: string) {
  if (path === ROUTES.productCreate) return "Thêm sản phẩm";
  if (/^\/admin\/products\/[^/]+\/edit$/.test(path)) return "Sửa sản phẩm";
  if (path === ROUTES.productApproval) return "Duyệt sản phẩm";
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
  return isMobile ? (
    <ShopMobileLayout brandTitle={BRAND_TITLE}>{children}</ShopMobileLayout>
  ) : (
    <ShopAdminLayout brandTitle={BRAND_TITLE} title={titleFor(location)}>{children}</ShopAdminLayout>
  );
}
