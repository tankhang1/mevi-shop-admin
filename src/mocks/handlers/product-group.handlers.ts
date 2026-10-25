import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { ProductGroup, ProductGroupInput } from "@/features/product-group/types";
import { db } from "../db";
import { actor, assertOwns, scoped } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const BASE = API_ENDPOINTS.admin.productGroups.base;

const withShop = (g: ProductGroup): ProductGroup => ({
  ...g,
  shopName: db.shops.find((s) => s.id === g.shopId)?.name,
});
const findOwned = (id: string) =>
  assertOwns(db.productGroups.find((x) => x.id === id), "Không tìm thấy nhóm sản phẩm");

/** Group names are unique per shop */
function assertNameFree(shopId: string, name: string, exceptId?: string) {
  const n = name.trim().toLowerCase();
  if (db.productGroups.some((g) => g.shopId === shopId && g.name.trim().toLowerCase() === n && g.id !== exceptId)) {
    throw new HttpError(409, "Tên nhóm đã tồn tại trong gian hàng");
  }
}

/** Shop admins always write into their own shop; root must name an existing shop */
function resolveShopId(requested: string | undefined) {
  const a = actor();
  if (a.shopId) return a.shopId;
  if (!requested || !db.shops.some((s) => s.id === requested)) throw new HttpError(400, "Vui lòng chọn gian hàng");
  return requested;
}

export const productGroupHandlers: MockHandler[] = [
  {
    method: "GET",
    path: BASE,
    handle: ({ query }) => {
      const rows = scoped(db.productGroups, query.shopId).map(withShop);
      return { data: paginate(rows, query, (g) => `${g.name} ${g.shopName ?? ""}`) };
    },
  },
  {
    method: "GET",
    path: `${BASE}/:id`,
    handle: ({ params }) => {
      const g = findOwned(params.id);
      const products = g.productIds
        .map((id) => db.products.find((p) => p.id === id))
        .filter((p) => !!p);
      return { data: { ...withShop(g), products } };
    },
  },
  {
    method: "POST",
    path: BASE,
    handle: ({ body }: { body: ProductGroupInput }) => {
      const shopId = resolveShopId(body.shopId);
      assertNameFree(shopId, body.name);
      const group: ProductGroup = {
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        shopId,
        id: uid("g"),
        productIds: [],
        createdAt: new Date().toISOString(),
      };
      db.productGroups.unshift(group);
      return { data: withShop(group) };
    },
  },
  {
    method: "PUT",
    path: `${BASE}/:id`,
    handle: ({ params, body }: { params: Record<string, string>; body: ProductGroupInput }) => {
      const g = findOwned(params.id);
      assertNameFree(g.shopId, body.name, g.id);
      Object.assign(g, { name: body.name, description: body.description, imageUrl: body.imageUrl });
      return { data: withShop(g) };
    },
  },
  {
    method: "DELETE",
    path: `${BASE}/:id`,
    handle: ({ params }) => {
      findOwned(params.id);
      // Products themselves are kept — only the grouping goes away
      db.productGroups = db.productGroups.filter((g) => g.id !== params.id);
      return { data: null };
    },
  },
  {
    method: "PUT",
    path: `${BASE}/:id/products`,
    handle: ({ params, body }: { params: Record<string, string>; body: { productIds: string[] } }) => {
      const g = findOwned(params.id);
      const ids = [...new Set(body.productIds ?? [])];
      // A group may only hold its own shop's products
      if (ids.some((id) => db.products.find((p) => p.id === id)?.shopId !== g.shopId)) {
        throw new HttpError(400, "Chỉ được thêm sản phẩm của gian hàng này");
      }
      g.productIds = ids;
      return { data: withShop(g) };
    },
  },
];
