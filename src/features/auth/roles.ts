/**
 * Root = Mevi staff / Platform admins: sees every shop, manages agencies (referral partners), moderates products.
 * MEVI_SHOP_ADMIN is the platform admin for the Mevi Shop subsystem according to backend specs.
 */
export const ROOT_ROLES = [
  "MEVI_SUPER_ADMIN",
  "MEVI_ADMIN",
  "MEVI_SHOP_ADMIN",
] as const;

/**
 * Shop Partner / Agent / Seller: assigned to shop owners / CTV / agencies scoped to their workspace.
 */
export const SHOP_AGENT_ROLES = ["MEVI_SHOP_AGENT"] as const;
export const SHOP_AGENT_ROLE = "MEVI_SHOP_AGENT";

/**
 * Backwards compatibility / any shop-related role
 */
export const SHOP_ADMIN_ROLE = "MEVI_SHOP_ADMIN";
export const SHOP_ROLES = [SHOP_ADMIN_ROLE, SHOP_AGENT_ROLE] as const;

/** Shop employee with an account: sees only the orders assigned to them */
export const SHOP_STAFF_ROLES = ["MEVI_SHOP_STAFF"] as const;
export const SHOP_STAFF_ROLE = "MEVI_SHOP_STAFF";

export const isRootRole = (roles: readonly string[]) =>
  roles.some((r) => (ROOT_ROLES as readonly string[]).includes(r));

export const isShopAgentRole = (roles: readonly string[]) =>
  roles.some((r) => (SHOP_AGENT_ROLES as readonly string[]).includes(r));

export const isShopRole = (roles: readonly string[]) =>
  roles.some((r) => (SHOP_ROLES as readonly string[]).includes(r));

export const isStaffRole = (roles: readonly string[]) =>
  roles.some((r) => (SHOP_STAFF_ROLES as readonly string[]).includes(r));
