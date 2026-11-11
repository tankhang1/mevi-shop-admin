import {
  Sprout,
  FolderTree,
  Handshake,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  Network,
  Package,
  ShoppingCart,
  Sparkles,
  Store,
  UserCog,
  UserPlus,
  Users,
  Warehouse,
} from "lucide-react";
import {
  type AdminMenuSection,
  type FarmRole,
  SHOP_MOBILE_NAV_ITEMS,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ROUTES } from "./routes";

const ONLY_SP_ADMIN = ["MEVI_SUPER_ADMIN"] as const;
const ROOT = ["MEVI_SUPER_ADMIN", "MEVI_ADMIN", "MEVI_SHOP_ADMIN"] as const;
// FarmRole (eco-shared-ui@0.0.31) chưa có MEVI_SHOP_AGENT — ép kiểu tạm tới khi lib bổ sung
const AGENT = ["MEVI_SHOP_AGENT" as FarmRole];
/** Order-processing staff: their own orders and the customers on them */
const STAFF = ["MEVI_SHOP_STAFF"] as const;
const ALL = [...ROOT, ...AGENT];

/**
 * Sidebar for ShopAdminLayout. eco-shared-ui filters it by the user's roles and also
 * blocks routes listed here for roles that don't have them (isRouteAuthorized).
 */
export const shopMenu: AdminMenuSection[] = [
  // {
  //   title: "Tổng quan",
  //   items: [
  //     {
  //       id: "dashboard",
  //       label: "Dashboard",
  //       icon: LayoutDashboard,
  //       href: ROUTES.dashboard,
  //       roles: [...ALL],
  //     },
  //   ],
  // },
  {
    title: "Sản phẩm",
    items: [
      {
        id: "products",
        label: "Danh mục sản phẩm",
        icon: Package,
        href: ROUTES.products,
        roles: [...ALL],
      },
      {
        id: "product-groups",
        label: "Nhóm sản phẩm",
        icon: FolderTree,
        href: ROUTES.productGroups,
        roles: [...ROOT],
      },
      {
        id: "inventory",
        label: "Kho sản phẩm",
        icon: Warehouse,
        href: ROUTES.inventory,
        roles: [...ROOT],
      },
    ],
  },
  {
    title: "Bán hàng",
    roles: [...ALL, ...STAFF],
    items: [
      {
        id: "orders",
        label: "Đơn đặt hàng",
        icon: ShoppingCart,
        href: ROUTES.orders,
        roles: [...ALL, ...STAFF],
      },
      {
        id: "dispatch-teams",
        label: "Nhóm điều phối",
        icon: Network,
        href: ROUTES.dispatchTeams,
        roles: [...ROOT],
      },
      {
        id: "customers",
        label: "Khách hàng",
        icon: Users,
        href: ROUTES.customers,
        roles: [...ALL],
      },
      {
        id: "staff",
        label: "Nhân viên điều phối",
        icon: UserCog,
        href: ROUTES.staff,
        roles: [...ROOT],
      },
    ],
  },
  {
    title: "Báo cáo doanh thu",
    items: [
      {
        id: "report-sales",
        label: "Doanh thu của tôi",
        icon: LayoutDashboard,
        href: ROUTES.report("sales"),
        roles: [...AGENT],
      },
      // A shop is itself a đại lý / CTV — it gets "Doanh thu của tôi" instead of this breakdown
      {
        id: "report-agency",
        label: "Theo đại lý / CTV",
        icon: Handshake,
        href: ROUTES.report("agency"),
        roles: [...ROOT],
      },
      {
        id: "report-product",
        label: "Theo sản phẩm",
        icon: Package,
        href: ROUTES.report("product"),
        roles: [...ALL],
      },
      {
        id: "report-group",
        label: "Theo nhóm sản phẩm",
        icon: FolderTree,
        href: ROUTES.report("group"),
        roles: [...ALL],
      },
      {
        id: "report-farm",
        label: "Theo nông hộ",
        icon: Sprout,
        href: ROUTES.report("farm"),
        roles: [...ROOT],
      },
    ],
  },
  {
    title: "Gian hàng",
    roles: [...ONLY_SP_ADMIN],
    items: [
      {
        id: "my-shop",
        label: "Hồ sơ gian hàng",
        icon: Store,
        href: ROUTES.myShop,
        roles: [...ONLY_SP_ADMIN],
      },
      {
        id: "storefront-banners",
        label: "Banner trang chủ",
        icon: ImageIcon,
        href: ROUTES.storefrontBanners,
        roles: [...ONLY_SP_ADMIN],
      },
      {
        id: "storefront-highlights",
        label: "Khối nổi bật & Giá trị",
        icon: Sparkles,
        href: ROUTES.storefrontHighlights,
        roles: [...ONLY_SP_ADMIN],
      },
      {
        id: "storefront-faq",
        label: "Câu hỏi thường gặp",
        icon: HelpCircle,
        href: ROUTES.storefrontFaq,
        roles: [...ONLY_SP_ADMIN],
      },
    ],
  },
  {
    title: "Đối tác",
    roles: [...ROOT],
    items: [
      {
        id: "partner-contact-requests",
        label: "Yêu cầu hợp tác",
        icon: UserPlus,
        href: ROUTES.partnerContactRequests,
        roles: [...ROOT],
      },
      // {
      //   id: "shops",
      //   label: "Gian hàng",
      //   icon: Building2,
      //   href: ROUTES.shops,
      //   roles: [...ROOT],
      // },
      {
        id: "agencies",
        label: "Đại lý - Cộng tác viên",
        icon: Handshake,
        href: ROUTES.agencies,
        roles: [...ROOT],
      },
    ],
  },
];

type MenuGroup = Extract<AdminMenuSection, { items: unknown }>;
const allowed = (
  need: readonly string[] | undefined,
  roles: readonly string[],
) => !need?.length || need.some((r) => roles.includes(r));

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
        .map((i) =>
          i.children
            ? {
                ...i,
                children: i.children.filter((c) => allowed(c.roles, roles)),
              }
            : i,
        ),
    }))
    .filter((s) => s.items.length > 0);
}

type MobileNavItem = (typeof SHOP_MOBILE_NAV_ITEMS)[number];
const navByHref = (href: string) =>
  SHOP_MOBILE_NAV_ITEMS.find((i) => i.href === href);

/** Bottom nav: root keeps the library default (with "Duyệt SP"); shop admins get their shop instead */
export function mobileNavFor(
  isRoot: boolean,
  isStaff = false,
): MobileNavItem[] {
  if (isRoot) return SHOP_MOBILE_NAV_ITEMS;
  if (isStaff)
    return [
      navByHref(ROUTES.orders) ?? {
        label: "Đơn hàng",
        href: ROUTES.orders,
        icon: ShoppingCart,
        matchPrefixes: [ROUTES.orders],
      },
      {
        label: "Tài khoản",
        href: ROUTES.profile,
        icon: Users,
        matchPrefixes: [ROUTES.profile],
      },
    ];
  const dashboard = navByHref(ROUTES.dashboard);
  return [
    navByHref(ROUTES.products) ?? {
      label: "Sản phẩm",
      href: ROUTES.products,
      icon: Package,
      matchPrefixes: [ROUTES.products],
    },
    dashboard ?? {
      label: "Tổng quan",
      href: ROUTES.dashboard,
      icon: LayoutDashboard,
      matchPrefixes: [ROUTES.dashboard],
      isPrimary: true,
    },
    navByHref(ROUTES.orders) ?? {
      label: "Đơn hàng",
      href: ROUTES.orders,
      icon: ShoppingCart,
      matchPrefixes: [ROUTES.orders],
    },
    {
      label: "Gian hàng",
      href: ROUTES.myShop,
      icon: Store,
      matchPrefixes: [ROUTES.myShop, ROUTES.profile],
    },
  ];
}
