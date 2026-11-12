import { useCurrentUser } from "./hooks/use-current-user";
import {
  isRootRole,
  isShopAgentRole,
  isShopRole,
  isStaffRole,
  isSuperAdminRole,
} from "./roles";

export {
  ROOT_ROLES,
  SHOP_ADMIN_ROLE,
  SHOP_AGENT_ROLE,
  SHOP_ROLES,
  SHOP_STAFF_ROLE,
  SHOP_STAFF_ROLES,
  isRootRole,
  isShopAgentRole,
  isShopRole,
  isStaffRole,
  isSuperAdminRole,
} from "./roles";

/** UI-only role flags; the backend enforces the scope from the token */
export function useAccess() {
  const { roles, isLoading } = useCurrentUser();
  const isSuperAdmin = isSuperAdminRole(roles);
  const isRoot = isRootRole(roles);
  const isShopAgent = isShopAgentRole(roles);
  const isStaff = !isRoot && !isShopAgent && isStaffRole(roles);

  return {
    isLoading,
    /** Platform super admin (MEVI_SUPER_ADMIN) */
    isSuperAdmin,
    /** Platform admin (MEVI_SUPER_ADMIN, MEVI_ADMIN, MEVI_SHOP_ADMIN) */
    isRoot,
    /** Shop Partner / Agent (MEVI_SHOP_AGENT) */
    isShopAgent,
    /** Seller / Partner account scoped to their own shop (alias for isShopAgent or non-root shop) */
    isShopAdmin: isShopAgent || (!isRoot && isShopRole(roles)),
    /** Order-processing employee — only their assigned orders, can't reassign */
    isStaff,
    roles,
  };
}
