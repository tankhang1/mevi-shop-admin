import type { CustomerSegment } from "./types";

/** Completed-order spend that makes a customer VIP */
export const VIP_SPEND = 3_000_000;

export const CUSTOMER_SEGMENT: Record<CustomerSegment, { label: string; className: string }> = {
  new: { label: "Khách mới", className: "bg-sky-100 text-sky-800" },
  returning: { label: "Khách quen", className: "bg-emerald-100 text-emerald-800" },
  vip: { label: "VIP", className: "bg-amber-100 text-amber-800" },
};

export const CUSTOMER_TAG_SUGGESTIONS = ["Khách sỉ", "Quà tặng", "Doanh nghiệp", "Cần chăm sóc", "Hay đổi trả"];
