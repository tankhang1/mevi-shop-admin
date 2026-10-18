import { useCurrentUser } from "./hooks/use-current-user";
import { SHOP_ADMIN_ROLE, isRootRole } from "./roles";

export { ROOT_ROLES, SHOP_ADMIN_ROLE, isRootRole } from "./roles";

/** UI-only role flags; the backend enforces the scope from the token */
export function useAccess() {
  const { roles, isLoading } = useCurrentUser();
  const isRoot = isRootRole(roles);
  return {
    isLoading,
    isRoot,
    /** Seller account scoped to a single shop (root wins if a user has both) */
    isShopAdmin: !isRoot && roles.includes(SHOP_ADMIN_ROLE),
    roles,
  };
}
