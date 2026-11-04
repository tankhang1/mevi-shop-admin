import { API_ENDPOINTS } from "@/config/api-endpoints";
import { realApiClient } from "@/lib/axios";
import { cleanFilters, toSpringPageParams } from "@/lib/pagination";
import type { SpringPage } from "@/types/api";
import type { Review, ReviewListParams, ReviewStats, SetReviewVisibilityInput } from "../types";

const EP = API_ENDPOINTS.admin.reviews;

const list = async (params: ReviewListParams = {}) =>
  (await realApiClient.get<SpringPage<Review>>(EP.base, { params: cleanFilters(toSpringPageParams(params)) })).data;

const count = async (params: ReviewListParams) => (await list({ ...params, page: 1, size: 1 })).totalElements;

export const reviewApi = {
  /** Newest first; includes hidden reviews and reviews of deleted products */
  list,

  /** One count request per figure, until the backend offers a stats endpoint */
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
