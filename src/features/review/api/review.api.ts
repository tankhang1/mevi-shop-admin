import axios from "axios";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { apiClient, realApiClient } from "@/lib/axios";
import { cleanFilters } from "@/lib/pagination";
import type { ApiResponse, Paginated } from "@/types/api";
import type {
  Review,
  ReviewListParams,
  ReviewStats,
  ReviewSummary,
} from "../types";

const EP = API_ENDPOINTS.admin.reviews;

const unwrap = <T>(data: unknown): T => {
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    (data as { data: unknown }).data !== undefined
  ) {
    return (data as { data: T }).data;
  }
  return data as T;
};

export const mapReview = (r: Record<string, unknown>): Review => {
  const prod = r.product as
    | { id?: number | string; code?: string; title?: string }
    | undefined;
  const reviewer = r.reviewer as
    | { id?: number | string; fullName?: string | null }
    | undefined;
  const media = Array.isArray(r.media)
    ? (r.media as Array<{ url?: string; thumbnailUrl?: string }>)
    : [];
  const replyRaw = r.reply as
    | {
        content?: string;
        repliedAt?: string;
        repliedBy?: { fullName?: string };
        by?: string;
      }
    | null
    | undefined;

  const author = reviewer?.fullName || (r.author as string) || "Khách hàng";
  const images = media
    .map((m) => m.url || m.thumbnailUrl || "")
    .filter(Boolean);
  if (Array.isArray(r.images) && images.length === 0) {
    images.push(...(r.images as string[]));
  }

  let reply: Review["reply"] = null;
  if (replyRaw && replyRaw.content) {
    reply = {
      content: replyRaw.content,
      repliedAt: replyRaw.repliedAt || new Date().toISOString(),
      by: replyRaw.repliedBy?.fullName || replyRaw.by || "Shop",
    };
  }

  return {
    id: String(r.id ?? ""),
    productId: String(prod?.id ?? r.productId ?? ""),
    productName: prod?.title || (r.productName as string) || "",
    productImage: (r.productImage as string) || undefined,
    shopId: String(r.shopId ?? ""),
    shopName: (r.shopName as string) || undefined,
    author,
    rating: (Number(r.rating) || 5) as 1 | 2 | 3 | 4 | 5,
    content: String(r.content || ""),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    images,
    helpful:
      typeof r.helpfulCount === "number"
        ? r.helpfulCount
        : typeof r.helpful === "number"
          ? r.helpful
          : 0,
    createdAt: String(r.createdAt || new Date().toISOString()),
    hidden: Boolean(r.hidden),
    reply,
  };
};

const toBackendParams = (params: ReviewListParams) => {
  const p: Record<string, unknown> = {
    page: Math.max(0, (params.page ?? 1) - 1),
    size: Math.min(Math.max(1, params.size || 20), 100),
  };

  if (params.productId && params.productId !== "all") {
    p.productId = params.productId;
  }
  if (params.rating && params.rating !== "all") {
    p.rating = Number(params.rating) || params.rating;
  }

  if (params.replied === "no") {
    p.replied = false;
    // Spec 7.5: nút "Xem đánh giá chưa trả lời" gửi replied=false&hidden=false
    if (params.hidden === undefined) p.hidden = false;
  } else if (params.replied === "yes") {
    p.replied = true;
  }

  if (params.hidden !== undefined) {
    p.hidden = params.hidden;
  }

  const keyword = params.keyword || (params as Record<string, unknown>).search;
  if (keyword) {
    p.keyword = keyword;
  }

  return cleanFilters(p);
};

export const summaryToStats = (s: ReviewSummary): ReviewStats => {
  const dist: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  (s.ratingDistribution || []).forEach((item) => {
    if (item.stars >= 1 && item.stars <= 5) {
      dist[item.stars - 1] = item.count;
    }
  });
  return {
    total: s.ratingCount,
    average: s.ratingAverage ?? 0,
    distribution: dist,
    unreplied: s.unrepliedCount,
    hidden: 0,
  };
};

export const parseReviewSummary = (raw: unknown): ReviewSummary => {
  const data = unwrap<Record<string, unknown>>(raw);
  const ratingAverage =
    typeof data.ratingAverage === "number"
      ? data.ratingAverage
      : typeof data.average === "number"
        ? data.average
        : null;

  const ratingCount =
    typeof data.ratingCount === "number"
      ? data.ratingCount
      : typeof data.total === "number"
        ? data.total
        : 0;

  const unrepliedCount =
    typeof data.unrepliedCount === "number"
      ? data.unrepliedCount
      : typeof data.unreplied === "number"
        ? data.unreplied
        : 0;

  let ratingDistribution: ReviewSummary["ratingDistribution"] = [];
  if (Array.isArray(data.ratingDistribution)) {
    ratingDistribution =
      data.ratingDistribution as ReviewSummary["ratingDistribution"];
  } else if (
    Array.isArray(data.distribution) &&
    data.distribution.length === 5
  ) {
    const arr = data.distribution as number[];
    ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: arr[stars - 1] ?? 0,
    }));
  } else {
    ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 }));
  }

  return {
    ratingAverage,
    ratingCount,
    ratingDistribution,
    unrepliedCount,
  };
};

export const reviewApi = {
  list: async (params: ReviewListParams = {}): Promise<Paginated<Review>> => {
    const q = toBackendParams(params);
    let resData: unknown;
    try {
      const res = await realApiClient.get<unknown>(EP.base, { params: q });
      resData = res.data;
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 404 || !err.response)
      ) {
        // Fallback to apiClient mock
        const res = await apiClient.get<ApiResponse<Paginated<Review>>>(
          EP.base,
          { params },
        );
        return res.data.data;
      }
      throw err;
    }

    const raw = unwrap<unknown>(resData);
    let list: Array<Record<string, unknown>> = [];
    let total = 0;
    let page = 1;
    let size = 20;

    if (Array.isArray(raw)) {
      list = raw as Array<Record<string, unknown>>;
      total = list.length;
      size = list.length || 20;
    } else if (raw && typeof raw === "object") {
      if (
        "content" in raw &&
        Array.isArray((raw as { content: unknown[] }).content)
      ) {
        list = (raw as { content: Array<Record<string, unknown>> }).content;
        total =
          (raw as { totalElements?: number }).totalElements ?? list.length;
        page = ((raw as { page?: number }).page ?? 0) + 1;
        size = (raw as { size?: number }).size ?? list.length;
      } else if (
        "items" in raw &&
        Array.isArray((raw as { items: unknown[] }).items)
      ) {
        list = (raw as { items: Array<Record<string, unknown>> }).items;
        total = (raw as { total?: number }).total ?? list.length;
        page = (raw as { page?: number }).page ?? 1;
        size = (raw as { size?: number }).size ?? list.length;
      }
    }

    return {
      items: list.map(mapReview),
      total,
      page,
      size,
    };
  },

  /** GET /api/admin/shop/reviews/summary (BE notice 2026-11-03 mục 7.5) */
  summary: async (): Promise<ReviewSummary> => {
    try {
      const res = await realApiClient.get<unknown>(EP.summary);
      return parseReviewSummary(res.data);
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 404 || !err.response)
      ) {
        // Fallback to mock summary or stats
        try {
          const res = await apiClient.get<unknown>(EP.summary);
          return parseReviewSummary(res.data);
        } catch {
          const res = await apiClient.get<ApiResponse<ReviewStats>>(EP.stats);
          const s = res.data.data;
          return {
            ratingAverage: s.average,
            ratingCount: s.total,
            ratingDistribution: [5, 4, 3, 2, 1].map((stars) => ({
              stars,
              count: s.distribution[stars - 1] ?? 0,
            })),
            unrepliedCount: s.unreplied,
          };
        }
      }
      throw err;
    }
  },

  /** Tương thích cũ */
  stats: async (
    params: Pick<ReviewListParams, "productId"> = {},
  ): Promise<ReviewStats> => {
    try {
      const summary = await reviewApi.summary();
      return summaryToStats(summary);
    } catch {
      const res = await apiClient.get<ApiResponse<ReviewStats>>(EP.stats, {
        params,
      });
      return res.data.data;
    }
  },

  /** PUT /api/admin/shop/reviews/{id}/reply (hoặc DELETE khi content rỗng) */
  reply: async (id: string, content: string): Promise<Review> => {
    const trimmed = content.trim();
    if (!trimmed) {
      try {
        await realApiClient.delete(EP.reply(id));
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          await apiClient.put(EP.reply(id), { content: "" });
        } else {
          throw err;
        }
      }
      return mapReview({ id, reply: null });
    }

    try {
      const res = await realApiClient.put<unknown>(EP.reply(id), {
        content: trimmed,
      });
      return mapReview(unwrap<Record<string, unknown>>(res.data));
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        const res = await apiClient.put<ApiResponse<Review>>(EP.reply(id), {
          content: trimmed,
        });
        return res.data.data;
      }
      throw err;
    }
  },

  /** PUT /api/admin/shop/reviews/{id}/visibility (BE notice 2026-11-03 mục 7.4) */
  setHidden: async (id: string, hidden: boolean): Promise<Review> => {
    try {
      const res = await realApiClient.put<unknown>(EP.visibility(id), {
        hidden,
      });
      return mapReview(unwrap<Record<string, unknown>>(res.data));
    } catch (err: unknown) {
      if (
        axios.isAxiosError(err) &&
        (err.response?.status === 404 || err.response?.status === 405)
      ) {
        // Fallback to apiClient patch
        const res = await apiClient.patch<ApiResponse<Review>>(
          EP.visibility(id),
          { hidden },
        );
        return res.data.data;
      }
      throw err;
    }
  },
};
