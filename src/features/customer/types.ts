import type { ListParams } from "@/types/api";

export interface Customer {
  id: string;
  /** Mã khách hàng, e.g. KH0001 */
  code?: string;
  name: string;
  /** Unique — orders are matched to the customer by recipient phone */
  phone: string;
  email?: string;
  address?: string;
  /** Free-form labels, e.g. "Khách sỉ", "Quà tặng" */
  tags: string[];
  /** Internal note — never shown to the customer */
  note?: string;
  /** Set when a shop admin added the customer by hand, so they can see them before any order */
  createdByShopId?: string;
  createdAt: string;
}

/** new = 1 order, returning = 2+, vip = spent ≥ VIP_SPEND */
export type CustomerSegment = "new" | "returning" | "vip";

/** List/detail rows join purchase stats (scoped to the caller's shop for shop admins) */
export interface CustomerWithStats extends Customer {
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string | null;
  segment: CustomerSegment;
}

export type CustomerInput = Pick<Customer, "name" | "phone" | "email" | "address" | "tags" | "note">;

export interface CustomerListParams extends ListParams {
  segment?: "all" | CustomerSegment;
  tag?: string;
}

export interface CustomerStats {
  total: number;
  /** Created since the 1st of the current month */
  newThisMonth: number;
  returning: number;
  vip: number;
}

/* ------------------------------------------------------------------ */
/* Mevi shop customers — real BE (notice 2026-11-09)                   */
/* ------------------------------------------------------------------ */

export type ShopCustomerStatus = "active" | "inactive";

/** Same values as the registration form */
export type ShopCustomerAudienceType = "individual" | "cooperative" | "business" | "other";

export interface ShopCustomer {
  /** Account id — same as `customer.id` on orders */
  id: number;
  code: string;
  fullName: string;
  /** Format `84xxxxxxxxx` */
  phoneNumber: string;
  email: string | null;
  status: ShopCustomerStatus;
  /** Address */
  operatingArea: string | null;
  province: string | null;
  commune: string | null;
  tags: string[];
  internalNote: string | null;
  /** All orders, including cancelled */
  orderCount: number;
  /** Sum of DELIVERED orders, VND */
  totalSpent: number;
  /** ISO UTC; includes cancelled orders; null when no orders */
  lastOrderAt: string | null;
  /** ISO UTC */
  createdAt: string;
}

export interface ShopCustomerSummary {
  total: number;
  /** Created since start of current month (VN time) */
  newThisMonth: number;
}

export interface ShopCustomerListParams {
  /** Matches name, phone (`09…` or `+84 9…`), email, tag */
  keyword?: string;
  /** Exact tag, case-insensitive; AND with keyword */
  tag?: string;
  /** 0-based, default 0 */
  page?: number;
  /** 1–100, default 20 */
  size?: number;
}

/** PUT replaces every field — send current values for fields not edited */
export interface ShopCustomerProfileInput {
  /** ≤150 */
  operatingArea?: string | null;
  /** ≤150 */
  province?: string | null;
  /** ≤150 */
  commune?: string | null;
  /** ≤10 tags, each ≤50; case-insensitive duplicates dropped */
  tags?: string[];
  /** ≤2000, hidden from customer */
  internalNote?: string | null;
}

export interface ShopCustomerCreateInput extends ShopCustomerProfileInput {
  /** ≤255 */
  fullName: string;
  /** VN mobile number */
  phoneNumber: string;
  /** ≤255 */
  email?: string | null;
  /** Required — BE has no default */
  audienceType: ShopCustomerAudienceType;
  /** When audienceType = other, ≤255 */
  audienceTypeOther?: string | null;
}
