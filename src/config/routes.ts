import { SHOP_ROUTES } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { env } from "./env";

export const ROUTES = {
  ...SHOP_ROUTES,
  productDetail: (id: string) => `${SHOP_ROUTES.products}/${id}`,
  productEdit: (id: string) => `${SHOP_ROUTES.products}/${id}/edit`,
  /** Same value as SHOP_ROUTES.productGroups (eco-shared-ui ≥ next release) */
  productGroups: "/admin/product-groups",
  productGroupDetail: (id: string) => `/admin/product-groups/${id}`,
  /** Same value as SHOP_ROUTES.inventory (eco-shared-ui ≥ next release) */
  inventory: "/admin/inventory",
  inventoryHistory: (productId: string) => `/admin/inventory/${productId}`,
  /** Same value as SHOP_ROUTES.customers (eco-shared-ui ≥ next release) */
  customers: "/admin/customers",
  customerDetail: (id: string | number) => `/admin/customers/${id}`,
  orderDetail: (id: string) => `${SHOP_ROUTES.orders}/${id}`,
  /** Same value as SHOP_ROUTES.staff (eco-shared-ui ≥ next release) */
  staff: "/admin/staff",
  /** Same value as SHOP_ROUTES.dispatchTeams (eco-shared-ui ≥ next release) */
  dispatchTeams: "/admin/dispatch-teams",
  dispatchTeamCreate: "/admin/dispatch-teams/new",
  dispatchTeamEdit: (id: string) => `/admin/dispatch-teams/${id}/edit`,
  /** Same value as SHOP_ROUTES.reports (eco-shared-ui ≥ next release) */
  reports: "/admin/reports",
  /** One page per report — /admin/reports/agency | product | group | farm, plus sales (shop admin's own) */
  report: (kind: "sales" | "agency" | "product" | "group" | "farm") => `/admin/reports/${kind}`,
  /** One đại lý / CTV's sales report */
  agencyReport: (id: string) => `/admin/reports/agency/${id}`,
  /** Same value as SHOP_ROUTES.farmRegistrations (eco-shared-ui ≥ next release) */
  farmRegistrations: "/admin/farm-registrations",
  agencyDetail: (id: string) => `${SHOP_ROUTES.agencies}/${id}`,
  reviews: "/admin/reviews",
  /** Shop admin: their own storefront settings */
  myShop: "/admin/my-shop",
  storefrontBanners: "/admin/my-shop/banners",
  storefrontHighlights: "/admin/my-shop/highlights",
  storefrontFaq: "/admin/my-shop/faq",
  /** Root: partner contact requests from public landing form */
  partnerContactRequests: "/admin/partner-contact-requests",
  /** Root: every seller shop */
  shops: "/admin/shops",
  shopDetail: (id: string) => `/admin/shops/${id}`,
  /** Mobile "Tài khoản" tab — eco-shared-ui links it to /profile */
  profile: "/profile",
  login: "/login",
  authCallback: env.auth.callbackPath,
} as const;
