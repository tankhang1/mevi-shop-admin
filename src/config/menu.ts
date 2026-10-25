import {
  ClipboardCheck,
  LayoutDashboard,
  MessageSquareText,
  Package,
  ShoppingCart,
  Building2,
  FolderTree,
  Handshake,
  Store,
  Warehouse,
} from "lucide-react";
import { type AdminMenuSection, SHOP_MOBILE_NAV_ITEMS } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ROUTES } from "./routes";

const ROOT = ["MEVI_SUPER_ADMIN", "MEVI_ADMIN"] as const;
const SHOP = ["MEVI_SHOP_ADMIN"] as const;
const ALL = [...ROOT, ...SHOP];

/**
 * Sidebar for ShopAdminLayout. eco-shared-ui filters it by the user's roles and also
 * blocks routes listed here for roles that don't have them (isRouteAuthorized).
 */
export const shopMenu: AdminMenuSection[] = [
  {
    title: "Tổng quan",
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: ROUTES.dashboard, roles: [...ALL] }],
  },
  {
    title: "Sản phẩm",
    items: [
      {
        id: "products",
        label: "Quản lý sản phẩm",
        icon: Package,
        roles: [...ALL],
        children: [
          { id: "product-list", label: "Danh sách sản phẩm", href: ROUTES.products, roles: [...ALL] },
          { id: "product-create", label: "Thêm sản phẩm", href: ROUTES.productCreate, roles: [...ALL] },
        ],
      },
      { id: "product-groups", label: "Nhóm sản phẩm", icon: FolderTree, href: ROUTES.productGroups, roles: [...ALL] },
      { id: "inventory", label: "Quản lý kho", icon: Warehouse, href: ROUTES.inventory, roles: [...ALL] },
      { id: "product-approval", label: "Duyệt sản phẩm", icon: ClipboardCheck, href: ROUTES.productApproval, roles: [...ROOT] },
      { id: "reviews", label: "Đánh giá khách hàng", icon: MessageSquareText, href: ROUTES.reviews, roles: [...ALL] },
    ],
  },
  {
    title: "Bán hàng",
    items: [{ id: "orders", label: "Đơn đặt hàng", icon: ShoppingCart, href: ROUTES.orders, roles: [...ALL] }],
  },
  {
    title: "Gian hàng",
    items: [{ id: "my-shop", label: "Thông tin gian hàng", icon: Store, href: ROUTES.myShop, roles: [...SHOP] }],
  },
  {
    title: "Đối tác",
    roles: [...ROOT],
    items: [
      { id: "shops", label: "Gian hàng", icon: Building2, href: ROUTES.shops, roles: [...ROOT] },
      { id: "agencies", label: "Đại lý", icon: Handshake, href: ROUTES.agencies, roles: [...ROOT] },
    ],
  },
];

type MenuGroup = Extract<AdminMenuSection, { items: unknown }>;
const allowed = (need: readonly string[] | undefined, roles: readonly string[]) =>
  !need?.length || need.some((r) => roles.includes(r));

/**
 * Menu for the signed-in roles. eco-shared-ui skips role filtering entirely for MEVI_SUPER_ADMIN,
 * which would show them shop-admin-only entries (e.g. "Thông tin gian hàng"), so we filter first.
 */
export function menuFor(roles: readonly string[]): AdminMenuSection[] {
  return shopMenu
    .filter((s): s is MenuGroup => "items" in s && allowed(s.roles, roles))
    .map((s) => ({
      ...s,
      items: s.items
        .filter((i) => allowed(i.roles, roles))
        .map((i) => (i.children ? { ...i, children: i.children.filter((c) => allowed(c.roles, roles)) } : i)),
    }))
    .filter((s) => s.items.length > 0);
}

type MobileNavItem = (typeof SHOP_MOBILE_NAV_ITEMS)[number];
const navByHref = (href: string) => SHOP_MOBILE_NAV_ITEMS.find((i) => i.href === href);

/** Bottom nav: root keeps the library default (with "Duyệt SP"); shop admins get Reviews + their shop instead */
export function mobileNavFor(isRoot: boolean): MobileNavItem[] {
  if (isRoot) return SHOP_MOBILE_NAV_ITEMS;
  const dashboard = navByHref(ROUTES.dashboard);
  return [
    navByHref(ROUTES.products) ?? { label: "Sản phẩm", href: ROUTES.products, icon: Package, matchPrefixes: [ROUTES.products] },
    { label: "Đánh giá", href: ROUTES.reviews, icon: MessageSquareText, matchPrefixes: [ROUTES.reviews] },
    dashboard ?? { label: "Tổng quan", href: ROUTES.dashboard, icon: LayoutDashboard, matchPrefixes: [ROUTES.dashboard], isPrimary: true },
    navByHref(ROUTES.orders) ?? { label: "Đơn hàng", href: ROUTES.orders, icon: ShoppingCart, matchPrefixes: [ROUTES.orders] },
    { label: "Gian hàng", href: ROUTES.myShop, icon: Store, matchPrefixes: [ROUTES.myShop, ROUTES.profile] },
  ];
}

