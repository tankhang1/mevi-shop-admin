export type PartnerType = "COLLABORATOR" | "AGENCY";

export type ContactRequestStatus =
  | "NEW"
  | "CONTACTED"
  | "ACCOUNT_CREATED"
  | "REJECTED";

export interface PartnerContactRequest {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  province: string | null;
  note: string | null;
  status: ContactRequestStatus;
  adminNote: string | null;
  resolvedAt: string | null;
  resolvedByUserId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerProfile {
  id: number;
  workspaceId: number;
  name: string;
  handle: string;
  slogan: string | null;
  brandColor: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  description: string | null;
  province: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  partnerType: PartnerType;
  suspended: boolean;
  suspendedAt: string | null;
  suspendedByUserId: number | null;
  suspensionNote: string | null;
  verified: boolean;
  verifiedAt: string | null;
  verifiedByUserId: number | null;
  publiclyVisible: boolean;
  commissionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerAccount {
  id: number;
  code: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  status: string;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface PartnerProfileDetail {
  profile: PartnerProfile;
  ownerAccount: OwnerAccount | null;
}

export interface ListPartnerProfilesParams {
  partnerType?: "all" | PartnerType;
  province?: string;
  suspended?: "all" | "true" | "false";
  verified?: "all" | "true" | "false";
  keyword?: string;
  page?: number;
  size?: number;
}

export interface ListPartnerContactRequestsParams {
  status?: "all" | ContactRequestStatus;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface UpdateContactRequestStatusInput {
  status: ContactRequestStatus;
  adminNote?: string;
}

export interface CreateShopPartnerUserInput {
  fullName: string;
  phoneNumber: string;
  email?: string;
  audienceType: "individual" | "business";
  province?: string;
  password?: string;
}

export interface UpdatePartnerTypeInput {
  partnerType: PartnerType;
}

export interface UpdatePartnerSuspensionInput {
  suspended: boolean;
  note?: string;
}

export interface UpdatePartnerVerificationInput {
  verified: boolean;
}

export interface UpdateCommissionRateInput {
  commissionRate: number;
}

export interface PartnerOrderStats {
  orders: {
    pending: number;
    confirmed: number;
    shipping: number;
    delivered: number;
    cancelled: number;
    total: number;
  };
  deliveredRevenue: number;
  averageOrderValue: number;
}

export interface PartnerCommissionSummary {
  commissionRate: number;
  pendingAmount: number;
  payableAmount: number;
  payableOrderCount: number;
  paidAmount: number;
}

export interface PartnerCommissionPayout {
  id: number;
  storefrontId: number;
  amount: number;
  orderCount: number;
  note?: string | null;
  paidBy?: { id: number; fullName: string } | null;
  paidAt: string;
}

export interface CreatePayoutInput {
  note?: string;
}

export interface PartnerReportProductItem {
  product: {
    id: number;
    code: string;
    title: string;
    imageUrl?: string;
  };
  orderCount: number;
  quantity: number;
  revenue: number;
  share: number;
}

export interface PartnerReport {
  totalRevenue: number;
  totalDeliveredOrders: number;
  monthRevenue: number;
  monthDeliveredOrders: number;
  monthQuantity: number;
  dataThrough: string;
  series: { period: string; revenue: number; orderCount: number }[];
  products: PartnerReportProductItem[];
  topProducts: {
    product: { id: number; code: string; title: string; imageUrl?: string };
    revenue: number[];
  }[];
}

export interface GetPartnerReportParams {
  from?: string;
  to?: string;
  granularity?: "DAY" | "WEEK" | "MONTH";
  categoryId?: number | string;
}
