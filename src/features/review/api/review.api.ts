import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import { cleanFilters, toSpringPageParams } from "@/lib/pagination";
import type { SpringPage } from "@/types/api";
import type { Review, ReviewListParams, ReviewStats, ReviewSummaryResponse, SetReviewVisibilityInput } from "../types";

const EP = API_ENDPOINTS.admin.reviews;

const list = async (params: ReviewListParams = {}) =>
  (await realApiClient.get<SpringPage<Review>>(EP.base, { params: cleanFilters(toSpringPageParams(params)) })).data;

const count = async (params: ReviewListParams) => (await list({ ...params, page: 1, size: 1 })).totalElements;

export const reviewApi = {
  /** Newest first; includes hidden reviews and reviews of deleted products */
  list,

  /** Whole-catalog figures. The summary has no hidden count, so that one still comes from the list */
  summary: async (): Promise<ReviewStats> => {
    const [{ data }, hidden] = await Promise.all([
      realApiClient.get<ReviewSummaryResponse>(EP.summary),
      count({ hidden: "true" }),
    ]);
    const stars = (n: number) => data.ratingDistribution.find((d) => d.stars === n)?.count ?? 0;
    return {
      total: data.ratingCount,
      average: data.ratingAverage ?? 0,
      distribution: [stars(1), stars(2), stars(3), stars(4), stars(5)],
      unreplied: data.unrepliedCount,
      hidden,
    };
  },

  /** One product: the summary endpoint can't filter by product, so count per figure */
  stats: async (productId?: number): Promise<ReviewStats> => {
    const [one, two, three, four, five, unreplied, hidden] = await Promise.all([
      count({ productId, hidden: "false", rating: "1" }),
      count({ productId, hidden: "false", rating: "2" }),
      count({ productId, hidden: "false", rating: "3" }),
      count({ productId, hidden: "false", rating: "4" }),
      count({ productId, hidden: "false", rating: "5" }),
      count({ productId, hidden: "false", replied: "false" }),
      count({ productId, hidden: "true" }),
    ]);
    const total = one + two + three + four + five;
    const points = one + two * 2 + three * 3 + four * 4 + five * 5;
    return {
      total,
      average: total ? points / total : 0,
      distribution: [one, two, three, four, five],
      unreplied,
      hidden,
    };
  },

  setVisibility: async (id: number, data: SetReviewVisibilityInput) => {
    await realApiClient.put(EP.visibility(id), data);
  },

  /** Sending again overwrites the existing reply */
  saveReply: async (id: number, content: string) => {
    await realApiClient.put(EP.reply(id), { content });
  },

  deleteReply: async (id: number) => {
    await realApiClient.delete(EP.reply(id));
  },
};
