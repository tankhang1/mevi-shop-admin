import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { ModerateProductInput, Product, ProductInput } from "@/features/product/types";
import { db } from "../db";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const BASE = API_ENDPOINTS.admin.products.base;

const findProduct = (id: string) => {
  const p = db.products.find((x) => x.id === id);
  if (!p) throw new HttpError(404, "Không tìm thấy sản phẩm");
  return p;
};

export const productHandlers: MockHandler[] = [
  {
    method: "GET",
    path: BASE,
    handle: ({ query }) => {
      const is = (actual: string, wanted: unknown) => !wanted || wanted === "all" || wanted === actual;
      const rows = db.products.filter((p) => is(p.status, query.status) && is(p.category, query.category));
      return { data: paginate(rows, query, (p) => `${p.name} ${p.sku}`) };
    },
  },
  {
    method: "GET",
    path: `${BASE}/:id`,
    handle: ({ params }) => ({ data: findProduct(params.id) }),
  },
  {
    method: "POST",
    path: BASE,
    handle: ({ body }: { body: ProductInput }) => {
      if (db.products.some((p) => p.sku === body.sku)) throw new HttpError(409, "SKU đã tồn tại");
      const product: Product = { ...body, id: uid("p"), status: "pending", createdAt: new Date().toISOString() };
      db.products.unshift(product);
      return { data: product, message: "Đã tạo sản phẩm" };
    },
  },
  {
    method: "PUT",
    path: `${BASE}/:id`,
    handle: ({ params, body }: { params: Record<string, string>; body: ProductInput }) => {
      const p = findProduct(params.id);
      if (db.products.some((x) => x.sku === body.sku && x.id !== p.id)) throw new HttpError(409, "SKU đã tồn tại");
      Object.assign(p, body);
      return { data: p };
    },
  },
  {
    method: "DELETE",
    path: `${BASE}/:id`,
    handle: ({ params }) => {
      findProduct(params.id);
      db.products = db.products.filter((p) => p.id !== params.id);
      return { data: null };
    },
  },
  {
    method: "PATCH",
    path: `${BASE}/:id/moderate`,
    handle: ({ params, body }: { params: Record<string, string>; body: ModerateProductInput }) => {
      const p = findProduct(params.id);
      if (body.status === "rejected" && !body.rejectionReason?.trim()) {
        throw new HttpError(400, "Vui lòng nhập lý do từ chối");
      }
      p.status = body.status;
      p.rejectionReason = body.status === "rejected" ? body.rejectionReason : null;
      return { data: p };
    },
  },
];
