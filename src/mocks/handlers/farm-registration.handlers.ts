import { API_ENDPOINTS } from "@/config/api-endpoints";
import type { ApproveRegistrationInput, FarmRegistration } from "@/features/farm-registration/types";
import type { Product } from "@/features/product/types";
import { db } from "../db";
import { assertOwns, requireShopAdmin, scoped } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const EP = API_ENDPOINTS.admin.farmRegistrations;

const withFarm = (r: FarmRegistration): FarmRegistration => {
  const f = db.farms.find((x) => x.id === r.farmId);
  return { ...r, farmName: f?.name, farmLocation: f?.location };
};

function findPending(id: string) {
  const r = assertOwns(db.farmRegistrations.find((x) => x.id === id), "Không tìm thấy đăng ký");
  if (r.status !== "pending") throw new HttpError(400, "Đăng ký này đã được xử lý");
  return r;
}

export const farmRegistrationHandlers: MockHandler[] = [
  {
    method: "GET",
    path: EP.base,
    handle: ({ query }) => {
      const is = (actual: string, wanted: unknown) => !wanted || wanted === "all" || wanted === actual;
      const rows = scoped(db.farmRegistrations, query.shopId)
        .filter((r) => is(r.status, query.status) && is(r.farmId, query.farmId))
        .map(withFarm);
      return { data: paginate(rows, query, (r) => `${r.name} ${r.farmName ?? ""}`) };
    },
  },
  {
    method: "GET",
    path: EP.stats,
    handle: () => {
      const rows = scoped(db.farmRegistrations);
      const n = (s: string) => rows.filter((r) => r.status === s).length;
      return { data: { total: rows.length, pending: n("pending"), approved: n("approved"), rejected: n("rejected") } };
    },
  },
  {
    method: "POST",
    path: `${EP.base}/:id/approve`,
    handle: ({ params, body }: { params: Record<string, string>; body: ApproveRegistrationInput }) => {
      const a = requireShopAdmin();
      const r = findPending(params.id);
      const sku = body.sku?.trim();
      if (!sku) throw new HttpError(400, "Vui lòng nhập SKU");
      if (db.products.some((p) => p.shopId === r.shopId && p.sku === sku)) throw new HttpError(409, "SKU đã tồn tại trong gian hàng");
      if (!(body.price > 0)) throw new HttpError(400, "Giá bán không hợp lệ");
      const now = new Date().toISOString();
      const product: Product = {
        id: uid("p"),
        shopId: r.shopId,
        farmId: r.farmId,
        source: "farm",
        name: r.name,
        sku,
        category: r.category,
        description: r.description,
        packaging: r.packaging,
        origin: db.farms.find((f) => f.id === r.farmId)?.location,
        price: body.price,
        salePrice: body.salePrice ?? null,
        images: r.images,
        certifications: r.certifications,
        status: "approved",
        listed: false,
        stock: r.quantity,
        lowStockThreshold: 10,
        createdAt: now,
      };
      db.products.unshift(product);
      // Approving the registration is the admin's approval of the opening stock from the farm
      if (r.quantity > 0) {
        db.stockMovements.unshift({
          id: uid("m"),
          productId: product.id,
          productName: product.name,
          sku,
          shopId: r.shopId,
          type: "in",
          source: "farm",
          status: "approved",
          delta: r.quantity,
          before: 0,
          after: r.quantity,
          note: "Tồn kho ban đầu từ đăng ký nông hộ",
          createdBy: a.user.name ?? "—",
          createdAt: now,
        });
      }
      for (const gid of body.productGroupIds ?? []) {
        const g = db.productGroups.find((x) => x.id === gid && x.shopId === r.shopId);
        if (g && !g.productIds.includes(product.id)) g.productIds.push(product.id);
      }
      Object.assign(r, { status: "approved", productId: product.id, reviewedBy: a.user.name, reviewedAt: now });
      return { data: withFarm(r) };
    },
  },
  {
    method: "POST",
    path: `${EP.base}/:id/reject`,
    handle: ({ params, body }: { params: Record<string, string>; body: { reason: string } }) => {
      const a = requireShopAdmin();
      const r = findPending(params.id);
      if (!body.reason?.trim()) throw new HttpError(400, "Vui lòng nhập lý do từ chối");
      Object.assign(r, {
        status: "rejected",
        rejectionReason: body.reason.trim(),
        reviewedBy: a.user.name,
        reviewedAt: new Date().toISOString(),
      });
      return { data: withFarm(r) };
    },
  },
];
