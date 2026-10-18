import { SHOP_ROUTES } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { env } from "./env";

export const ROUTES = {
  ...SHOP_ROUTES,
  productDetail: (id: string) => `${SHOP_ROUTES.products}/${id}`,
  productEdit: (id: string) => `${SHOP_ROUTES.products}/${id}/edit`,
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
