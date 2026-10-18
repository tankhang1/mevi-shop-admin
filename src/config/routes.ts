import { SHOP_ROUTES } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { env } from "./env";

export const ROUTES = {
  ...SHOP_ROUTES,
  productEdit: (id: string) => `${SHOP_ROUTES.products}/${id}/edit`,
  /** Mobile "Tài khoản" tab — eco-shared-ui links it to /profile */
  profile: "/profile",
  login: "/login",
  authCallback: env.auth.callbackPath,
} as const;
