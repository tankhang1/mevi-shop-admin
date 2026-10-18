import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { Review, ReviewStats } from "@/features/review/types";
import { db } from "../db";
import { actor, assertOwns, scoped } from "../scope";
import { HttpError, type MockHandler, paginate } from "../utils";

const EP = API_ENDPOINTS.admin.reviews;

const withShop = (r: Review): Review => ({ ...r, shopName: db.shops.find((s) => s.id === r.shopId)?.name });
const findOwned = (id: string) => assertOwns(db.reviews.find((r) => r.id === id), "Không tìm thấy đánh giá");

export const reviewHandlers: MockHandler[] = [
  {
    method: "GET",
    path: EP.base,
    handle: ({ query }) => {
      const rows = scoped(db.reviews, query.shopId).filter(
        (r) =>
          (!query.rating || query.rating === "all" || String(r.rating) === query.rating) &&
          (!query.replied || query.replied === "all" || (query.replied === "yes") === !!r.reply) &&
          (!query.productId || r.productId === query.productId),
      );
      return { data: paginate(rows.map(withShop), query, (r) => `${r.author} ${r.content} ${r.productName}`) };
    },
  },
  {
    method: "GET",
    path: EP.stats,
    handle: ({ query }) => {
      const rows = scoped(db.reviews, query.shopId).filter((r) => !query.productId || r.productId === query.productId);
      const visible = rows.filter((r) => !r.hidden);
      const distribution = [1, 2, 3, 4, 5].map((n) => visible.filter((r) => r.rating === n).length) as ReviewStats["distribution"];
      const stats: ReviewStats = {
        total: visible.length,
        average: visible.length ? visible.reduce((t, r) => t + r.rating, 0) / visible.length : 0,
        distribution,
        unreplied: visible.filter((r) => !r.reply).length,
        hidden: rows.length - visible.length,
      };
      return { data: stats };
    },
  },
  {
    method: "PUT",
    path: `${EP.base}/:id/reply`,
    handle: ({ params, body }: { params: Record<string, string>; body: { content: string } }) => {
      const r = findOwned(params.id);
      const content = body.content?.trim() ?? "";
      if (content.length > 1000) throw new HttpError(400, "Phản hồi tối đa 1000 ký tự");
      r.reply = content ? { content, repliedAt: new Date().toISOString(), by: actor().isRoot ? "mevi" : "shop" } : null;
      return { data: withShop(r) };
    },
  },
  {
    method: "PATCH",
    path: `${EP.base}/:id/visibility`,
    handle: ({ params, body }: { params: Record<string, string>; body: { hidden: boolean } }) => {
      const r = findOwned(params.id);
      r.hidden = !!body.hidden;
      return { data: withShop(r) };
    },
  },
];
