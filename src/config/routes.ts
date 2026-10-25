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
  customerDetail: (id: string) => `/admin/customers/${id}`,
  orderDetail: (id: string) => `${SHOP_ROUTES.orders}/${id}`,
  /** Same value as SHOP_ROUTES.staff (eco-shared-ui ≥ next release) */
  staff: "/admin/staff",
  /** Same value as SHOP_ROUTES.dispatchTeams (eco-shared-ui ≥ next release) */
  dispatchTeams: "/admin/dispatch-teams",
  /** Same value as SHOP_ROUTES.reports (eco-shared-ui ≥ next release) */
  reports: "/admin/reports",
  /** One page per report — /admin/reports/agency | product | group | farm */
  report: (kind: "agency" | "product" | "group" | "farm") => `/admin/reports/${kind}`,
  agencyDetail: (id: string) => `${SHOP_ROUTES.agencies}/${id}`,
  reviews: "/admin/reviews",
  /** Shop admin: their own storefront settings */
  myShop: "/admin/my-shop",
  /** Root: every seller shop */
  shops: "/admin/shops",
  shopDetail: (id: string) => `/admin/shops/${id}`,
  /** Mobile "Tài khoản" tab — eco-shared-ui links it to /profile */
  profile: "/profile",
  login: "/login",
  authCallback: env.auth.callbackPath,
} as const;
