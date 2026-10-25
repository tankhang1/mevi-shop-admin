import { API_ENDPOINTS } from "@/config/api-endpoints";
import type {
  AdjustStockInput,
  InventoryItem,
  StockMovement,
} from "@/features/inventory/types";
import { stockStatusOf } from "@/features/inventory/constants";
import type { Product } from "@/features/product/types";
import { db } from "../db";
import { actor, assertOwns, scoped } from "../scope";
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
  stockStatus: stockStatusOf(p),
});

const findOwned = (id: string) =>
  assertOwns(db.products.find((p) => p.id === id), "Không tìm thấy sản phẩm");

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
        },
      };
    },
  },
  {
    method: "GET",
    path: EP.movements,
    handle: ({ query }) => {
      const all = scoped(db.stockMovements, query.shopId).filter((m) => is(m.productId, query.productId));
      const summary = {
        count: all.length,
        totalIn: all.reduce((s, m) => s + Math.max(0, m.delta), 0),
        totalOut: all.reduce((s, m) => s + Math.max(0, -m.delta), 0),
      };
      const rows = all
        .filter((m) => is(m.type, query.type))
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
      const before = p.stock;
      const after = body.type === "in" ? before + qty : body.type === "out" ? before - qty : qty;
      if (after < 0) throw new HttpError(400, `Không đủ hàng để xuất (tồn kho: ${before})`);
      if (after === before) throw new HttpError(400, "Số lượng tồn kho không thay đổi");
      p.stock = after;
      const movement: StockMovement = {
        id: uid("m"),
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        shopId: p.shopId,
        type: body.type,
        delta: after - before,
        before,
        after,
        note: body.note?.trim() || undefined,
        createdBy: actor().user.name ?? "—",
        createdAt: new Date().toISOString(),
      };
      db.stockMovements.unshift(movement);
      return { data: movement };
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
