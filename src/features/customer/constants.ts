import type { CustomerSegment, ShopCustomerAudienceType, ShopCustomerStatus } from "./types";

/** Completed-order spend that makes a customer VIP */
export const VIP_SPEND = 3_000_000;

export const CUSTOMER_SEGMENT: Record<CustomerSegment, { label: string; className: string }> = {
  new: { label: "Khách mới", className: "bg-sky-100 text-sky-800" },
  returning: { label: "Khách quen", className: "bg-emerald-100 text-emerald-800" },
  vip: { label: "VIP", className: "bg-amber-100 text-amber-800" },
};

export const CUSTOMER_TAG_SUGGESTIONS = ["Khách sỉ", "Quà tặng", "Doanh nghiệp", "Cần chăm sóc", "Hay đổi trả"];

export const CUSTOMER_AUDIENCE_TYPES: { value: ShopCustomerAudienceType; label: string }[] = [
  { value: "individual", label: "Cá nhân" },
  { value: "cooperative", label: "Hợp tác xã" },
  { value: "business", label: "Doanh nghiệp" },
  { value: "other", label: "Khác" },
];

export const CUSTOMER_STATUS: Record<ShopCustomerStatus, { label: string; className: string }> = {
  active: { label: "Hoạt động", className: "bg-emerald-100 text-emerald-800" },
  inactive: { label: "Tạm khóa", className: "bg-muted text-muted-foreground" },
};

/** `84912345678` → `0912345678` for display / tel: links */
export const toLocalPhone = (p: string) => (p.startsWith("84") ? `0${p.slice(2)}` : p);
