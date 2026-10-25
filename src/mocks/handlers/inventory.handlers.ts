import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  AdjustStockInput,
  InventoryItem,
  StockMovement,
} from "@/features/inventory/types";
import { stockStatusOf } from "@/features/inventory/constants";
import type { Order } from "@/features/order/types";
import type { Product } from "@/features/product/types";
import { db } from "../db";
import { actor, assertOwns, requireShopAdmin, scoped } from "../scope";
import { HttpError, type MockHandler, paginate, uid } from "../utils";

const EP = API_ENDPOINTS.admin.inventory;

const shopName = (id: string) => db.shops.find((s) => s.id === id)?.name;


const toItem = (p: Product): InventoryItem => ({
  id: p.id,
  name: p.name,
  sku: p.sku,
  category: p.category,
  images: p.images,
  shopId: p.shopId,
  shopName: shopName(p.shopId),
  status: p.status,
  stock: p.stock,
  lowStockThreshold: p.lowStockThreshold,
  source: p.source,
  farmId: p.farmId,
  stockStatus: stockStatusOf(p),
  pendingCount: db.stockMovements.filter((m) => m.productId === p.id && m.status === "pending").length,
});

const findOwned = (id: string) =>
  assertOwns(db.products.find((p) => p.id === id), "Không tìm thấy sản phẩm");

function findPendingMovement(id: string) {
  const m = assertOwns(db.stockMovements.find((x) => x.id === id), "Không tìm thấy phiếu kho");
  if (m.status !== "pending") throw new HttpError(400, "Phiếu kho này đã được xử lý");
  return m;
}

/** Delivered order → one approved "out" movement per line (order stock never waits for approval) */
export function deductOrderStock(o: Order, by: string) {
  for (const it of o.items ?? []) {
    const p = db.products.find((x) => x.id === it.productId);
    if (!p) continue;
    if (p.stock < it.quantity) throw new HttpError(400, `Không đủ tồn kho "${p.name}" (còn ${p.stock}, cần ${it.quantity})`);
  }
  const now = new Date().toISOString();
  for (const it of o.items ?? []) {
    const p = db.products.find((x) => x.id === it.productId);
    if (!p) continue;
    db.stockMovements.unshift({
      id: uid("m"),
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      shopId: p.shopId,
      type: "out",
      source: "order",
      status: "approved",
      orderId: o.id,
      orderCode: o.code,
      delta: -it.quantity,
      before: p.stock,
      after: p.stock - it.quantity,
      note: `Xuất bán theo đơn ${o.code}`,
      createdBy: by,
      createdAt: now,
    });
    p.stock -= it.quantity;
  }
}

const is = (actual: string, wanted: unknown) => !wanted || wanted === "all" || wanted === actual;

export const inventoryHandlers: MockHandler[] = [
  {
    method: "GET",
    path: EP.base,
    handle: ({ query }) => {
      const rows = scoped(db.products, query.shopId)
        .map(toItem)
        .filter((p) => is(p.stockStatus, query.stockStatus))
        // Most urgent first: out → low → in stock
        .sort((a, b) => a.stock - a.lowStockThreshold - (b.stock - b.lowStockThreshold));
      return { data: paginate(rows, query, (p) => `${p.name} ${p.sku} ${p.shopName ?? ""}`) };
    },
  },
  {
    method: "GET",
    path: EP.stats,
    handle: () => {
      const rows = scoped(db.products);
      return {
        data: {
          products: rows.length,
          units: rows.reduce((s, p) => s + p.stock, 0),
          low: rows.filter((p) => stockStatusOf(p) === "low").length,
          out: rows.filter((p) => stockStatusOf(p) === "out").length,
          pending: scoped(db.stockMovements).filter((m) => m.status === "pending").length,
        },
      };
    },
  },
  {
    method: "GET",
    path: EP.movements,
    handle: ({ query }) => {
      const all = scoped(db.stockMovements, query.shopId).filter((m) => is(m.productId, query.productId));
      // Totals only count changes that actually hit the stock
      const applied = all.filter((m) => m.status === "approved");
      const summary = {
        count: applied.length,
        totalIn: applied.reduce((s, m) => s + Math.max(0, m.delta), 0),
        totalOut: applied.reduce((s, m) => s + Math.max(0, -m.delta), 0),
      };
      const rows = all
        .filter((m) => is(m.type, query.type) && is(m.status, query.status))
        .map((m) => ({ ...m, shopName: shopName(m.shopId) }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return { data: { ...paginate(rows, query, (m) => `${m.productName} ${m.sku} ${m.note ?? ""}`), summary } };
    },
  },
  {
    method: "POST",
    path: `${EP.base}/:id/adjust`,
    handle: ({ params, body }: { params: Record<string, string>; body: AdjustStockInput }) => {
      const p = findOwned(params.id);
      const qty = Number(body.quantity);
      if (!Number.isInteger(qty) || qty < 0 || (body.type !== "adjust" && qty === 0)) {
        throw new HttpError(400, "Số lượng không hợp lệ");
      }
      const fromFarm = p.source === "farm";
      // Farm stock only ever moves by adding/subtracting — never overwritten with a counted total
      if (fromFarm && body.type === "adjust")
        throw new HttpError(400, "Sản phẩm từ nông hộ chỉ được nhập / xuất cộng dồn, không kiểm kê ghi đè");
      const before = p.stock;
      const after = body.type === "in" ? before + qty : body.type === "out" ? before - qty : qty;
      if (after < 0) throw new HttpError(400, `Không đủ hàng để xuất (tồn kho: ${before})`);
      if (after === before) throw new HttpError(400, "Số lượng tồn kho không thay đổi");
      const movement: StockMovement = {
        id: uid("m"),
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        shopId: p.shopId,
        type: body.type,
        source: body.type === "in" ? (fromFarm ? "farm" : body.source ?? "external") : undefined,
        // Farm products: the change waits for admin approval and leaves stock untouched until then
        status: fromFarm ? "pending" : "approved",
        delta: after - before,
        before,
        after,
        note: body.note?.trim() || undefined,
        createdBy: actor().user.name ?? "—",
        createdAt: new Date().toISOString(),
      };
      if (!fromFarm) p.stock = after;
      db.stockMovements.unshift(movement);
      return { data: movement };
    },
  },
  {
    method: "POST",
    path: `${EP.base}/movements/:id/approve`,
    handle: ({ params }) => {
      const a = requireShopAdmin();
      const m = findPendingMovement(params.id);
      const p = findOwned(m.productId);
      // Applied on top of the stock as it is *now* — additive, not the snapshot from request time
      const after = p.stock + m.delta;
      if (after < 0) throw new HttpError(400, `Không đủ hàng để xuất (tồn kho hiện tại: ${p.stock})`);
      Object.assign(m, { status: "approved", before: p.stock, after, reviewedBy: a.user.name, reviewedAt: new Date().toISOString() });
      p.stock = after;
      return { data: m };
    },
  },
  {
    method: "POST",
    path: `${EP.base}/movements/:id/reject`,
    handle: ({ params, body }: { params: Record<string, string>; body: { reason: string } }) => {
      const a = requireShopAdmin();
      const m = findPendingMovement(params.id);
      if (!body.reason?.trim()) throw new HttpError(400, "Vui lòng nhập lý do từ chối");
      Object.assign(m, {
        status: "rejected",
        rejectionReason: body.reason.trim(),
        reviewedBy: a.user.name,
        reviewedAt: new Date().toISOString(),
      });
      return { data: m };
    },
  },
  {
    method: "PATCH",
    path: `${EP.base}/:id/threshold`,
    handle: ({ params, body }: { params: Record<string, string>; body: { lowStockThreshold: number } }) => {
      const p = findOwned(params.id);
      const v = Number(body.lowStockThreshold);
      if (!Number.isInteger(v) || v < 0) throw new HttpError(400, "Ngưỡng cảnh báo không hợp lệ");
      p.lowStockThreshold = v;
      return { data: toItem(p) };
    },
  },
];
