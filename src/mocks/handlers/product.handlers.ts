import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  ModerateProductInput,
  Product,
  ProductInput,
} from "@/features/product/types";
import { db } from "../db";
import { actor, assertOwns, requireRoot, scoped } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const BASE = API_ENDPOINTS.admin.products.base;

const withShop = (p: Product): Product => ({
  ...p,
  shopName: db.shops.find((s) => s.id === p.shopId)?.name,
});
const findOwned = (id: string) =>
  assertOwns(db.products.find((x) => x.id === id), "Không tìm thấy sản phẩm");

/** SKU is unique per shop */
function assertSkuFree(shopId: string, sku: string, exceptId?: string) {
  if (
    db.products.some(
      (p) => p.shopId === shopId && p.sku === sku && p.id !== exceptId,
    )
  ) {
    throw new HttpError(409, "SKU đã tồn tại trong gian hàng");
  }
}

/** Shop admins always write into their own shop; root falls back to the first shop */
function resolveShopId(requested: string | undefined) {
  const a = actor();
  if (a.shopId) return a.shopId;
  if (requested && db.shops.some((s) => s.id === requested)) return requested;
  if (!db.shops[0]) throw new HttpError(400, "Chưa có gian hàng nào");
  return db.shops[0].id;
}

export const productHandlers: MockHandler[] = [
  {
    method: "GET",
    path: BASE,
    handle: ({ query }) => {
      const is = (actual: string, wanted: unknown) =>
        !wanted || wanted === "all" || wanted === actual;
      const rows = scoped(db.products, query.shopId).filter(
        (p) => is(p.status, query.status) && is(p.category, query.category),
      );
      return {
        data: paginate(
          rows.map(withShop),
          query,
          (p) => `${p.name} ${p.sku} ${p.shopName ?? ""}`,
        ),
      };
    },
  },
  {
    method: "GET",
    path: `${BASE}/stats`,
    handle: () => {
      const rows = scoped(db.products);
      const count = (s: string) => rows.filter((p) => p.status === s).length;
      return {
        data: {
          total: rows.length,
          approved: count("approved"),
          pending: count("pending"),
          rejected: count("rejected"),
          listed: rows.filter((p) => p.listed).length,
        },
      };
    },
  },
  {
    method: "GET",
    path: `${BASE}/:id`,
    handle: ({ params }) => ({ data: withShop(findOwned(params.id)) }),
  },
  {
    method: "POST",
    path: BASE,
    handle: ({ body }: { body: ProductInput }) => {
      const shopId = resolveShopId(body.shopId);
      assertSkuFree(shopId, body.sku);
      const product: Product = {
        ...body,
        shopId,
        id: uid("p"),
        status: "pending",
        listed: false,
        source: "self",
        stock: 0,
        lowStockThreshold: 10,
        createdAt: new Date().toISOString(),
      };
      db.products.unshift(product);
      return { data: withShop(product), message: "Đã tạo sản phẩm" };
    },
  },
  {
    method: "PUT",
    path: `${BASE}/:id`,
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: ProductInput;
    }) => {
      const p = findOwned(params.id);
      // Moving a product to another shop is a root-only operation
      const shopId =
        actor().isRoot && body.shopId ? resolveShopId(body.shopId) : p.shopId;
      assertSkuFree(shopId, body.sku, p.id);
      // Any edit sends the product back for moderation (and off the shelf until re-approved)
      Object.assign(p, body, {
        shopId,
        status: "pending",
        rejectionReason: null,
        listed: false,
      });
      return { data: withShop(p) };
    },
  },
  {
    method: "DELETE",
    path: `${BASE}/:id`,
    handle: ({ params }) => {
      findOwned(params.id);
      db.products = db.products.filter((p) => p.id !== params.id);
      db.productGroups.forEach((g) => {
        g.productIds = g.productIds.filter((id) => id !== params.id);
      });
      return { data: null };
    },
  },
  {
    method: "PATCH",
    path: `${BASE}/:id/moderate`,
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: ModerateProductInput;
    }) => {
      requireRoot();
      const p = findOwned(params.id);
      if (body.status === "rejected" && !body.rejectionReason?.trim()) {
        throw new HttpError(400, "Vui lòng nhập lý do từ chối");
      }
      p.status = body.status;
      p.rejectionReason =
        body.status === "rejected" ? body.rejectionReason : null;
      // Approved products go on the shelf by default; the shop can take them off later
      p.listed = body.status === "approved";
      return { data: withShop(p) };
    },
  },
  {
    method: "PATCH",
    path: `${BASE}/:id/listing`,
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: { listed: boolean };
    }) => {
      const p = findOwned(params.id);
      if (body.listed && p.status !== "approved") {
        throw new HttpError(400, "Chỉ sản phẩm đã duyệt mới được lên kệ");
      }
      p.listed = !!body.listed;
      return { data: withShop(p) };
    },
  },
];
