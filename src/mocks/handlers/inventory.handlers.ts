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


const variantNames = (p: Product) => (p.variants?.length ? p.variants.map((v) => v.name) : [p.packaging || "Mặc định"]);

/** Per-variant stock kept on the product; older/untracked products put everything on the first variant */
function variantStockOf(p: Product) {
  const names = variantNames(p);
  if (!p.variantStock) p.variantStock = { [names[0]]: p.stock };
  for (const n of names) p.variantStock[n] ??= 0;
  return p.variantStock;
}

/** Apply a signed change to one quy cách (unknown → first); negative changes spill over to the others */
export function moveVariantStock(p: Product, delta: number, variant?: string) {
  const stock = variantStockOf(p);
  const names = variantNames(p);
  const first = variant && variant in stock ? variant : names[0];
  if (delta >= 0) {
    stock[first] += delta;
    return;
  }
  let need = -delta;
  for (const n of [first, ...names.filter((x) => x !== first)]) {
    const take = Math.min(stock[n], need);
    stock[n] -= take;
    need -= take;
  }
}

/** Out when nothing is left; low when any quy cách is at or below its own threshold */
function itemStatus(p: Product, variantStock: Record<string, number>) {
  if (p.stock <= 0) return "out" as const;
  const low = Object.entries(variantStock).some(([n, qty]) => qty <= (p.variantThresholds?.[n] ?? p.lowStockThreshold));
  return low || p.stock <= p.lowStockThreshold ? ("low" as const) : stockStatusOf(p);
}

const toItem = (p: Product): InventoryItem => {
  const variantStock = { ...variantStockOf(p) };
  return {
  id: p.id,
  productId: p.id,
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
  packaging: p.packaging,
  variants: p.variants,
  suppliers: p.suppliers,
  variantThresholds: p.variantThresholds,
  variantStock,
  stockStatus: itemStatus(p, variantStock),
  pendingCount: db.stockMovements.filter((m) => m.productId === p.id && m.status === "pending").length,
  };
};

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
    moveVariantStock(p, -it.quantity, (it as { variant?: string }).variant);
    p.stock -= it.quantity;
  }
}

const is = (actual: string, wanted: unknown) => !wanted || wanted === "all" || wanted === actual;

export const inventoryHandlers: MockHandler[] = [
  {
    method: "GET",
    path: EP.base,
    handle: ({ query }) => {
      // One row per quy cách
      const rows = scoped(db.products, query.shopId)
        .map(toItem)
        .flatMap((it): InventoryItem[] =>
          Object.entries(it.variantStock ?? { [it.packaging || "Mặc định"]: it.stock }).map(([variant, qty]) => {
            const limit = it.variantThresholds?.[variant] ?? it.lowStockThreshold;
            return {
              ...it,
              id: `${it.productId}::${variant}`,
              variant,
              stock: qty,
              lowStockThreshold: limit,
              stockStatus: qty <= 0 ? "out" : qty <= limit ? "low" : "in_stock",
            };
          }),
        )
        .filter((p) => is(p.stockStatus, query.stockStatus));
      // Most urgent product first (by its tightest quy cách); a product's quy cách stay together, in order
      const urgency = new Map<string, number>();
      for (const r of rows) urgency.set(r.productId, Math.min(urgency.get(r.productId) ?? Infinity, r.stock - r.lowStockThreshold));
      const order = new Map(rows.map((r, i) => [r.id, i]));
      rows.sort(
        (a, b) =>
          urgency.get(a.productId)! - urgency.get(b.productId)! ||
          a.productId.localeCompare(b.productId) ||
          order.get(a.id)! - order.get(b.id)!,
      );
      return { data: paginate(rows, query, (p) => `${p.name} ${p.sku} ${p.variant ?? ""} ${p.shopName ?? ""}`) };
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
          low: rows.filter((p) => toItem(p).stockStatus === "low").length,
          out: rows.filter((p) => p.stock <= 0).length,
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
        .filter((m) => is(m.type, query.type) && (query.status === "closed" ? m.status !== "pending" : is(m.status, query.status)) && is(m.source ?? "", query.source))
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
      // Nhập từ nông hộ waits for approval; nhập từ Mevi applies at once
      const fromFarm = body.type === "in" ? body.source === "farm" : p.source === "farm";
      const farm = fromFarm && body.type === "in" ? db.farms.find((f) => f.id === body.farmId) : undefined;
      if (fromFarm && body.type === "in" && !farm) throw new HttpError(400, "Vui lòng chọn nông hộ");
      // Farm stock only ever moves by adding/subtracting — never overwritten with a counted total
      if (fromFarm && body.type === "adjust")
        throw new HttpError(400, "Sản phẩm từ nông hộ chỉ được nhập / xuất cộng dồn, không kiểm kê ghi đè");
      const before = p.stock;
      const after = body.type === "in" ? before + qty : body.type === "out" ? before - qty : qty;
      if (after < 0) throw new HttpError(400, `Không đủ hàng để xuất (tồn hàng: ${before})`);
      if (after === before) throw new HttpError(400, "Số lượng tồn hàng không thay đổi");
      const movement: StockMovement = {
        id: uid("m"),
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        shopId: p.shopId,
        type: body.type,
        source: body.type === "in" ? (fromFarm ? "farm" : body.source ?? "mevi") : undefined,
        variant: body.variant || undefined,
        farmId: farm?.id,
        farmName: farm?.name,
        importPrice: body.type === "in" ? Number(body.importPrice) || undefined : undefined,
        // Farm products: the change waits for admin approval and leaves stock untouched until then
        status: fromFarm ? "pending" : "approved",
        delta: after - before,
        before,
        after,
        note: body.note?.trim() || undefined,
        createdBy: actor().user.name ?? "—",
        createdAt: new Date().toISOString(),
      };
      if (!fromFarm) {
        moveVariantStock(p, after - before, body.variant);
        p.stock = after;
      }
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
      moveVariantStock(p, m.delta, m.variant);
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
    handle: ({
      params,
      body,
    }: {
      params: Record<string, string>;
      body: { lowStockThreshold?: number; variantThresholds?: Record<string, number> };
    }) => {
      const p = findOwned(params.id);
      const valid = (v: unknown) => Number.isInteger(Number(v)) && Number(v) >= 0;
      if (body.variantThresholds) {
        if (!Object.values(body.variantThresholds).every(valid)) throw new HttpError(400, "Ngưỡng cảnh báo không hợp lệ");
        p.variantThresholds = Object.fromEntries(Object.entries(body.variantThresholds).map(([k, v]) => [k, Number(v)]));
      } else {
        if (!valid(body.lowStockThreshold)) throw new HttpError(400, "Ngưỡng cảnh báo không hợp lệ");
        p.lowStockThreshold = Number(body.lowStockThreshold);
      }
      return { data: toItem(p) };
    },
  },
];
