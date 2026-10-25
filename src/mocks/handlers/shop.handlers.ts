import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { Shop, ShopAdminInput, ShopProfileInput } from "@/features/shop/types";
import { db } from "../db";
import { actor, requireRoot } from "../scope";
import { HttpError, type MockHandler, paginate } from "../utils";

const EP = API_ENDPOINTS.admin.shops;

/** Live stats the backend would aggregate */
function withStats(s: Shop): Shop {
  const reviews = db.reviews.filter((r) => r.shopId === s.id && !r.hidden);
  return {
    ...s,
    productCount: db.products.filter((p) => p.shopId === s.id && p.status === "approved" && p.listed).length,
    reviewCount: reviews.length,
    rating: reviews.length ? Math.round((reviews.reduce((t, r) => t + r.rating, 0) / reviews.length) * 10) / 10 : 0,
  };
}

function find(id: string) {
  const s = db.shops.find((x) => x.id === id);
  if (!s) throw new HttpError(404, "Không tìm thấy gian hàng");
  return s;
}

function assertSlugFree(slug: string | undefined, exceptId: string) {
  if (slug && db.shops.some((s) => s.slug === slug && s.id !== exceptId)) {
    throw new HttpError(409, "Đường dẫn gian hàng đã được sử dụng");
  }
}

const PROFILE_KEYS: (keyof ShopProfileInput)[] = [
  "slug", "name", "tagline", "description", "location", "logoUrl", "coverUrl", "brandColor", "contactName", "phone", "email", "address",
];
const pickProfile = (body: Partial<ShopProfileInput>) =>
  Object.fromEntries(PROFILE_KEYS.filter((k) => k in body).map((k) => [k, body[k]])) as Partial<ShopProfileInput>;

export const shopHandlers: MockHandler[] = [
  // ── Shop admin: own shop ──
  {
    method: "GET",
    path: EP.me,
    handle: () => {
      const { shopId } = actor();
      if (!shopId) throw new HttpError(404, "Tài khoản quản trị Mevi không gắn với gian hàng nào");
      return { data: withStats(find(shopId)) };
    },
  },
  {
    method: "PUT",
    path: EP.me,
    handle: ({ body }: { body: ShopProfileInput }) => {
      const { shopId } = actor();
      if (!shopId) throw new HttpError(404, "Tài khoản quản trị Mevi không gắn với gian hàng nào");
      const s = find(shopId);
      assertSlugFree(body.slug, s.id);
      // verified / active / stats are ignored even if sent
      Object.assign(s, pickProfile(body));
      return { data: withStats(s) };
    },
  },
  // ── Root: every shop ──
  {
    method: "GET",
    path: EP.base,
    handle: ({ query }) => {
      requireRoot();
      const rows = db.shops
        .filter((s) => !query.verified || query.verified === "all" || String(s.verified) === query.verified)
        .map(withStats);
      return { data: paginate(rows, query, (s) => `${s.name} ${s.slug} ${s.location} ${s.contactName}`) };
    },
  },
  {
    method: "GET",
    path: `${EP.base}/:id`,
    handle: ({ params }) => (requireRoot(), { data: withStats(find(params.id)) }),
  },
  {
    method: "PATCH",
    path: `${EP.base}/:id`,
    handle: ({ params, body }: { params: Record<string, string>; body: ShopAdminInput }) => {
      requireRoot();
      const s = find(params.id);
      assertSlugFree(body.slug, s.id);
      Object.assign(s, pickProfile(body), "verified" in body ? { verified: !!body.verified } : {}, "active" in body ? { active: !!body.active } : {});
      return { data: withStats(s) };
    },
  },
];
