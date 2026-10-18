/**
 * Root = Mevi staff: sees every shop, manages agencies (referral partners), moderates products.
 * Shop admin = one seller: sees only their own shop's products, orders, reviews.
 * Dependency-free on purpose: the mock adapter imports it, and lib/axios imports the adapter.
 */
export const ROOT_ROLES = ["MEVI_SUPER_ADMIN", "MEVI_ADMIN"] as const;
export const SHOP_ADMIN_ROLE = "MEVI_SHOP_ADMIN";

export const isRootRole = (roles: readonly string[]) => roles.some((r) => (ROOT_ROLES as readonly string[]).includes(r));
