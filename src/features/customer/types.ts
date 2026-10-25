import type { ListParams } from "@/types/api";

export interface Customer {
  id: string;
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
  newThisMonth: number;
  returning: number;
  vip: number;
}
