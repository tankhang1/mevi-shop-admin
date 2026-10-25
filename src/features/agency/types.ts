import type { OrderStatus } from "@/features/order/types";
import type { ListParams, Paginated } from "@/types/api";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  brandColor?: string;
  logoUrl?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  active: boolean;
  /** % of order total the agency / CTV earns on orders through its referral link */
  commissionRate: number;
  createdAt: string;
}

export type AgencyInput = Omit<Agency, "id" | "active" | "createdAt">;

export type CommissionStatus = "pending" | "payable" | "paid" | "void";

/** One referred order's commission — derived from the order, rate snapshotted when it was placed */
export interface Commission {
  /** Same as orderId — one commission per order */
  id: string;
  orderId: string;
  orderCode: string;
  orderTotal: number;
  orderStatus: OrderStatus;
  rate: number;
  amount: number;
  status: CommissionStatus;
  paidAt?: string | null;
  createdAt: string;
}

export type CommissionSummary = Record<CommissionStatus, number>;

export interface CommissionListParams extends ListParams {
  status?: "all" | CommissionStatus;
}

export type CommissionPage = Paginated<Commission> & { summary: CommissionSummary };
