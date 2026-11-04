import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { Review, ReviewSummaryResponse } from "@/features/review/types";
import type { SpringPage } from "@/types/api";
import { db } from "../db";
import { assertOwns, scoped } from "../scope";
import { HttpError, type MockHandler } from "../utils";

const EP = API_ENDPOINTS.admin.reviews;

type DbReview = (typeof db.reviews)[number];

const toReview = (r: DbReview, idx: number): Review => ({
  id: Number(r.id.replace(/\D/g, "")) || idx + 1,
  product: {
    id: Number(r.productId.replace(/\D/g, "")) || 1,
    code: `SP-${r.productId}`,
    title: r.productName,
  },
  reviewer: {
    id: 100 + (Number(r.id.replace(/\D/g, "")) || idx + 1),
    fullName: r.author,
  },
  rating: r.rating,
  content: r.content,
  tags: r.tags,
  media: r.images.map((url) => ({ url, thumbnailUrl: url })),
  verifiedPurchase: true,
  helpfulCount: r.helpful,
  reply: r.reply
    ? {
        content: r.reply.content,
        repliedAt: r.reply.repliedAt,
        repliedBy: { id: 1, fullName: "Lê Chủ Shop" },
      }
    : null,
  hidden: r.hidden,
  hiddenReason: r.hidden ? "Nội dung không phù hợp" : null,
  hiddenAt: r.hidden ? r.createdAt : null,
  createdAt: r.createdAt,
});

const findOwned = (id: string | number) => {
  const strId = String(id);
  const r = db.reviews.find(
    (x, idx) =>
      x.id === strId ||
      String(Number(x.id.replace(/\D/g, "")) || idx + 1) === strId,
  );
  return assertOwns(r, "Không tìm thấy đánh giá");
};

export const reviewHandlers: MockHandler[] = [
  {
    method: "GET",
    path: EP.base,
    handle: ({ query }) => {
      const rows = scoped(db.reviews, query.shopId).filter((r, idx) => {
        const review = toReview(r, idx);
        if (
          query.rating &&
          query.rating !== "all" &&
          String(review.rating) !== String(query.rating)
        ) {
          return false;
        }
        if (query.replied !== undefined && query.replied !== "all") {
          const wantReplied =
            query.replied === true ||
            query.replied === "true" ||
            query.replied === "yes";
          if (wantReplied !== !!review.reply) return false;
        }
        if (query.hidden !== undefined && query.hidden !== "all") {
          const wantHidden = query.hidden === true || query.hidden === "true";
          if (wantHidden !== !!review.hidden) return false;
        }
        if (
          query.productId &&
          query.productId !== "all" &&
          String(review.product.id) !== String(query.productId) &&
          r.productId !== String(query.productId)
        ) {
          return false;
        }
        if (query.keyword) {
          const kw = String(query.keyword).trim().toLowerCase();
          const text = `${review.reviewer.fullName ?? ""} ${review.content} ${review.product.title} ${review.product.code}`.toLowerCase();
          if (!text.includes(kw)) return false;
        }
        return true;
      });

      const items = rows.map(toReview);
      const page = Number(query.page ?? 0);
      const size = Number(query.size ?? 20);
      const totalElements = items.length;
      const totalPages = Math.max(1, Math.ceil(totalElements / size));
      const content = items.slice(page * size, (page + 1) * size);

      const springPage: SpringPage<Review> = {
        content,
        page,
        size,
        totalElements,
        totalPages,
        first: page === 0,
        last: page >= totalPages - 1,
      };

      return springPage;
    },
  },
  {
    method: "GET",
    path: EP.summary,
    handle: ({ query }) => {
      const rows = scoped(db.reviews, query.shopId).filter((r, idx) => {
        const review = toReview(r, idx);
        if (
          query.productId &&
          query.productId !== "all" &&
          String(review.product.id) !== String(query.productId) &&
          r.productId !== String(query.productId)
        ) {
          return false;
        }
        return true;
      });
      const visible = rows.filter((r) => !r.hidden);
      const ratingCount = visible.length;
      const ratingAverage = ratingCount
        ? Number(
            (visible.reduce((t, r) => t + r.rating, 0) / ratingCount).toFixed(
              2,
            ),
          )
        : null;
      const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: visible.filter((r) => r.rating === stars).length,
      }));
      const unrepliedCount = visible.filter((r) => !r.reply).length;
      const summary: ReviewSummaryResponse = {
        ratingAverage,
        ratingCount,
        ratingDistribution,
        unrepliedCount,
      };
      return summary;
    },
  },
  {
    method: "PUT",
    path: `${EP.base}/:id/reply`,
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: { content: string };
    }) => {
      const r = findOwned(params.id);
      const content = body.content?.trim() ?? "";
      if (content.length > 1000)
        throw new HttpError(400, "Phản hồi tối đa 1000 ký tự");
      r.reply = content
        ? {
            content,
            repliedAt: new Date().toISOString(),
            by: "shop",
          }
        : null;
      return toReview(r, 0);
    },
  },
  {
    method: "DELETE",
    path: `${EP.base}/:id/reply`,
    handle: ({ params }: { params: Record<string, string> }) => {
      const r = findOwned(params.id);
      r.reply = null;
      return toReview(r, 0);
    },
  },
  {
    method: "PUT",
    path: `${EP.base}/:id/visibility`,
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: { hidden: boolean; reason?: string };
    }) => {
      const r = findOwned(params.id);
      r.hidden = !!body.hidden;
      return toReview(r, 0);
    },
  },
];
