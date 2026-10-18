import type { OrderStatus } from "./types";

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: "Mới", className: "bg-sky-100 text-sky-800" },
  confirmed: { label: "Đã xác nhận", className: "bg-indigo-100 text-indigo-800" },
  processing: { label: "Đang xử lý", className: "bg-amber-100 text-amber-800" },
  shipped: { label: "Đang giao", className: "bg-violet-100 text-violet-800" },
  completed: { label: "Hoàn tất", className: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Đã huỷ", className: "bg-slate-200 text-slate-700" },
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS) as OrderStatus[];

/** Normal flow; "cancelled" can happen from any non-final step */
export const ORDER_FLOW: OrderStatus[] = ["new", "confirmed", "processing", "shipped", "completed"];

export const isFinalOrderStatus = (s: OrderStatus) => s === "completed" || s === "cancelled";
