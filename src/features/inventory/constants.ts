import type { Product } from "@/features/product/types";
import type { MovementType, StockStatus } from "./types";

export const STOCK_STATUS: Record<StockStatus, { label: string; className: string }> = {
  in_stock: { label: "Còn hàng", className: "bg-emerald-100 text-emerald-800" },
  low: { label: "Sắp hết", className: "bg-amber-100 text-amber-800" },
  out: { label: "Hết hàng", className: "bg-red-100 text-red-700" },
};

export const MOVEMENT_TYPE: Record<MovementType, { label: string; className: string }> = {
  in: { label: "Nhập kho", className: "bg-emerald-100 text-emerald-800" },
  out: { label: "Xuất kho", className: "bg-orange-100 text-orange-800" },
  adjust: { label: "Kiểm kê", className: "bg-sky-100 text-sky-800" },
};

export const stockStatusOf = (p: Pick<Product, "stock" | "lowStockThreshold">): StockStatus =>
  p.stock <= 0 ? "out" : p.stock <= p.lowStockThreshold ? "low" : "in_stock";
