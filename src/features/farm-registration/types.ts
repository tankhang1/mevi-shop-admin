import type { ListParams } from "@/types/api";

export type RegistrationStatus = "pending" | "approved" | "rejected";

/** A farmer household's request to sell a product through the shop (submitted from the farm app) */
export interface FarmRegistration {
  id: string;
  shopId: string;
  farmId: string;
  /** Joined by the backend */
  farmName?: string;
  farmLocation?: string;
  name: string;
  category: string;
  description?: string;
  packaging?: string;
  /** Farmer's proposed selling price */
  proposedPrice: number;
  /** Quantity the farmer can supply now — becomes the opening stock on approval */
  quantity: number;
  images: string[];
  certifications: string[];
  status: RegistrationStatus;
  rejectionReason?: string | null;
  /** Set on approval */
  productId?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface ApproveRegistrationInput {
  sku: string;
  price: number;
  salePrice?: number | null;
  productGroupIds: string[];
}

export interface RegistrationListParams extends ListParams {
  status?: "all" | RegistrationStatus;
  farmId?: string;
  shopId?: string;
}

export type RegistrationStats = Record<"total" | RegistrationStatus, number>;
