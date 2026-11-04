import type { ListParams } from "@/types/api";

/** Customer review on a product (mevi-shop product page "Đánh giá sản phẩm") */
export interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  shopId: string;
  shopName?: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  content: string;
  tags: string[];
  images: string[];
  helpful: number;
  createdAt: string;
  /** Hidden reviews stay in admin but disappear from the storefront */
  hidden: boolean;
  reply: { content: string; repliedAt: string; by: string } | null;
}

export interface ReviewListParams extends ListParams {
  rating?: "all" | "1" | "2" | "3" | "4" | "5";
  replied?: "all" | "yes" | "no";
  hidden?: boolean;
  productId?: string;
  keyword?: string;
}

export interface ReviewStats {
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
