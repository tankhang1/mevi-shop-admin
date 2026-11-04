import type { ListParams } from "@/types/api";

export type StaffRole = "manager" | "sales" | "warehouse";
export type StaffStatus = "invited" | "active" | "disabled" | "inactive";
export type StaffGender = "male" | "female" | "other";

/** Areas of the shop admin a staff member can be given access to */
export type StaffPermission =
  | "products"
  | "inventory"
  | "orders"
  | "customers"
  | "reviews"
  | "shop";

/** Nhân viên điều phối — Tài khoản role MEVI_SHOP_STAFF (BE notice 2026-11-03) */
export interface Staff {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: StaffStatus;
  createdAt: string;

  // New spec fields
  code?: string;
  fullName?: string;
  phoneNumber?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;

  // Compatibility fields
  dateOfBirth?: string | null;
  gender?: StaffGender | null;
  idNumber?: string | null;
  address?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  role: StaffRole;
  permissions: StaffPermission[];
  invitedAt: string;
  lastActiveAt?: string | null;
}

export type StaffAudienceType =
  | "individual"
  | "cooperative"
  | "business"
  | "other";
export type StaffRegistrationTarget =
  | "factory"
  | "shop"
  | "customer"
  | "shop_staff";

/** Dispatch staff: their profile + team */
export interface StaffInput {
  name: string;
  phone: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  password?: string;
  dateOfBirth?: string | null;
  gender?: StaffGender | null;
  idNumber?: string | null;
  address?: string | null;
  teamId?: string | null;
  audienceType?: StaffAudienceType;
  registrationTarget?: StaffRegistrationTarget;
}

export interface StaffListParams extends ListParams {
  keyword?: string;
  role?: "all" | StaffRole;
  status?: "all" | StaffStatus;
}
