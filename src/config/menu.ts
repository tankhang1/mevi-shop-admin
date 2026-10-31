import {
  Sprout,
  LayoutDashboard,
  Network,
  MessageSquareText,
  Package,
  ShoppingCart,
  Building2,
  FolderTree,
  Handshake,
  Store,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";
import { type AdminMenuSection, SHOP_MOBILE_NAV_ITEMS } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ROUTES } from "./routes";

const ROOT = ["MEVI_SUPER_ADMIN", "MEVI_ADMIN"] as const;
const SHOP = ["MEVI_SHOP_ADMIN"] as const;
/** Order-processing staff: their own orders and the customers on them */
const STAFF = ["MEVI_SHOP_STAFF"] as const;
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
      { id: "products", label: "Danh mục sản phẩm", icon: Package, href: ROUTES.products, roles: [...ALL] },
      { id: "product-groups", label: "Nhóm sản phẩm", icon: FolderTree, href: ROUTES.productGroups, roles: [...ALL] },
      { id: "inventory", label: "Kho sản phẩm", icon: Warehouse, href: ROUTES.inventory, roles: [...ALL] },
      { id: "reviews", label: "Đánh giá khách hàng", icon: MessageSquareText, href: ROUTES.reviews, roles: [...ALL] },
    ],
  },
  {
    title: "Bán hàng",
    roles: [...ALL, ...STAFF],
    items: [
      { id: "orders", label: "Đơn đặt hàng", icon: ShoppingCart, href: ROUTES.orders, roles: [...ALL, ...STAFF] },
      { id: "dispatch-teams", label: "Nhóm điều phối", icon: Network, href: ROUTES.dispatchTeams, roles: [...ROOT] },
      { id: "customers", label: "Khách hàng", icon: Users, href: ROUTES.customers, roles: [...ALL] },
      { id: "staff", label: "Nhân viên điều phối", icon: UserCog, href: ROUTES.staff, roles: [...ALL] },
    ],
  },
  {
    title: "Báo cáo doanh thu",
    items: [
      { id: "report-agency", label: "Theo đại lý / CTV", icon: Handshake, href: ROUTES.report("agency"), roles: [...ALL] },
      { id: "report-product", label: "Theo sản phẩm", icon: Package, href: ROUTES.report("product"), roles: [...ALL] },
      { id: "report-group", label: "Theo nhóm sản phẩm", icon: FolderTree, href: ROUTES.report("group"), roles: [...ALL] },
      { id: "report-farm", label: "Theo nông hộ", icon: Sprout, href: ROUTES.report("farm"), roles: [...ALL] },
    ],
  },
  {
    title: "Gian hàng",
    items: [
      { id: "my-shop", label: "Thông tin gian hàng", icon: Store, href: ROUTES.myShop, roles: [...SHOP] },
    ],
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
export function mobileNavFor(isRoot: boolean, isStaff = false): MobileNavItem[] {
  if (isRoot) return SHOP_MOBILE_NAV_ITEMS;
  if (isStaff)
    return [
      navByHref(ROUTES.orders) ?? { label: "Đơn hàng", href: ROUTES.orders, icon: ShoppingCart, matchPrefixes: [ROUTES.orders] },
      { label: "Tài khoản", href: ROUTES.profile, icon: Users, matchPrefixes: [ROUTES.profile] },
    ];
  const dashboard = navByHref(ROUTES.dashboard);
  return [
    navByHref(ROUTES.products) ?? { label: "Sản phẩm", href: ROUTES.products, icon: Package, matchPrefixes: [ROUTES.products] },
    { label: "Đánh giá", href: ROUTES.reviews, icon: MessageSquareText, matchPrefixes: [ROUTES.reviews] },
    dashboard ?? { label: "Tổng quan", href: ROUTES.dashboard, icon: LayoutDashboard, matchPrefixes: [ROUTES.dashboard], isPrimary: true },
    navByHref(ROUTES.orders) ?? { label: "Đơn hàng", href: ROUTES.orders, icon: ShoppingCart, matchPrefixes: [ROUTES.orders] },
    { label: "Gian hàng", href: ROUTES.myShop, icon: Store, matchPrefixes: [ROUTES.myShop, ROUTES.profile] },
  ];
}

