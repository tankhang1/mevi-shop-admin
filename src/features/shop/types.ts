import type { ListParams } from "@/types/api";

/** A seller's storefront (mevi-shop `/shops/:slug`) — not to be confused with an Agency (referral partner) */
export interface Shop {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  /** "Đà Lạt, Lâm Đồng" */
  location: string;
  logoUrl: string;
  coverUrl: string;
  brandColor: string;
  contactName: string;
  phone: string;
  email: string;
  /** Pickup / return address shown to Mevi ops */
  address: string;
  /** Mevi-verified badge — set by root only */
  verified: boolean;
  /** Hidden from the storefront when false — set by root only */
  active: boolean;
  // Read-only stats, computed by the backend
  followers: number;
  /** % of messages answered */
  responseRate: number;
  productCount: number;
  rating: number;
  reviewCount: number;
  joinedAt: string;
}

/** Fields a shop admin may edit on their own shop */
export type ShopProfileInput = Pick<
  Shop,
  "slug" | "name" | "tagline" | "description" | "location" | "logoUrl" | "coverUrl" | "brandColor" | "contactName" | "phone" | "email" | "address"
>;

/** Root can additionally toggle these */
export type ShopAdminInput = Partial<ShopProfileInput & Pick<Shop, "verified" | "active">>;

export interface ShopListParams extends ListParams {
  verified?: "all" | "true" | "false";
}
