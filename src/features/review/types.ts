import type { PageParams, UserRef } from "@/types/api";

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface ReviewMedia {
  url: string;
  thumbnailUrl: string;
}

export interface ReviewReply {
  content: string;
  /** ISO UTC */
  repliedAt: string;
  repliedBy: UserRef;
}

/** Admin view of a product review (BE doc §9.1) */
export interface Review {
  id: number;
  product: { id: number; code: string; title: string };
  /** `fullName` null → show "Khách hàng" */
  reviewer: UserRef;
  rating: ReviewRating;
  content: string;
  tags: string[];
  media: ReviewMedia[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  reply: ReviewReply | null;
  /** Hidden reviews leave the public page and the product's score */
  hidden: boolean;
  hiddenReason: string | null;
  hiddenAt: string | null;
  createdAt: string;
}

type BoolFilter = "all" | "true" | "false";

/** "all" filters are dropped before the request */
export interface ReviewListParams extends PageParams {
  productId?: number;
  rating?: "all" | "1" | "2" | "3" | "4" | "5";
  hidden?: BoolFilter;
  replied?: BoolFilter;
}

export interface SetReviewVisibilityInput {
  hidden: boolean;
  /** ≤ 500 chars, admin only, ignored when `hidden` is false */
  reason?: string;
}

/** GET /reviews/summary: visible reviews only, including those of deleted / discontinued products */
export interface ReviewSummaryResponse {
  /** null when there are no reviews yet */
  ratingAverage: number | null;
  ratingCount: number;
  /** Always all 5 levels, from 5 down to 1 */
  ratingDistribution: { stars: number; count: number }[];
  unrepliedCount: number;
}

/** From the summary API for the whole catalog; counted from the list API for one product */
export interface ReviewStats {
  /** Visible reviews only, like the public score */
  total: number;
  average: number;
  /** Index 0 = 1 star … index 4 = 5 stars */
  distribution: [number, number, number, number, number];
  unreplied: number;
  hidden: number;
}

export interface ReviewStarDistribution {
  stars: number;
  count: number;
}

/** Số liệu màn Đánh giá khách hàng (BE notice 2026-11-03 mục 7.5) */
export interface ReviewSummary {
  ratingAverage: number | null;
  ratingCount: number;
  ratingDistribution: ReviewStarDistribution[];
  unrepliedCount: number;
}
