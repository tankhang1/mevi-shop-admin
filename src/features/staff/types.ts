import type { ListParams } from "@/types/api";

export type StaffRole = "manager" | "sales" | "warehouse";
export type StaffStatus = "invited" | "active" | "disabled";
export type StaffGender = "male" | "female" | "other";

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
  /** Same profile fields as any platform account */
  dateOfBirth?: string | null;
  gender?: StaffGender | null;
  /** Số CCCD */
  idNumber?: string | null;
  address?: string | null;
  /** Dispatch team — at most one, since orders are routed per team */
  teamId?: string | null;
  /** Joined by the backend */
  teamName?: string | null;
  role: StaffRole;
  /** Starts from the role's preset; the owner can add or remove individual areas */
  permissions: StaffPermission[];
  status: StaffStatus;
  invitedAt: string;
  lastActiveAt?: string | null;
  createdAt: string;
}

/** Dispatch staff: their profile + team — role (điều phối) / permissions / shop are set by the backend */
export type StaffInput = Pick<Staff, "name" | "phone" | "email" | "dateOfBirth" | "gender" | "idNumber" | "address" | "teamId"> & {
  password?: string;
};

export interface StaffListParams extends ListParams {
  role?: "all" | StaffRole;
  status?: "all" | StaffStatus;
  shopId?: string;
}
