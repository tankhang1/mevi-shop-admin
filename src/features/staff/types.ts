import type { ListParams } from "@/types/api";

export type StaffRole = "manager" | "sales" | "warehouse";
export type StaffStatus = "invited" | "active" | "disabled";

/** Areas of the shop admin a staff member can be given access to */
export type StaffPermission = "products" | "inventory" | "orders" | "customers" | "reviews" | "shop";

export interface Staff {
  id: string;
  shopId: string;
  /** Joined by the backend for root's list */
  shopName?: string;
  name: string;
  phone: string;
  email: string;
  role: StaffRole;
  /** Starts from the role's preset; the owner can add or remove individual areas */
  permissions: StaffPermission[];
  status: StaffStatus;
  invitedAt: string;
  lastActiveAt?: string | null;
  createdAt: string;
}

export type StaffInput = Pick<Staff, "name" | "phone" | "email" | "role" | "permissions"> & { shopId?: string };

export interface StaffListParams extends ListParams {
  role?: "all" | StaffRole;
  status?: "all" | StaffStatus;
  shopId?: string;
}
