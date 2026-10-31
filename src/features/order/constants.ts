import type { OrderStatus } from "./types";

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: "Đã lên đơn", className: "bg-sky-100 text-sky-800" },
  completed: { label: "Đã giao hàng", className: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Đã huỷ", className: "bg-slate-200 text-slate-700" },
};

export const ORDER_STATUSES = Object.keys(ORDER_STATUS) as OrderStatus[];

/** Normal flow; "cancelled" can happen from any non-final step */
export const ORDER_FLOW: OrderStatus[] = ["new", "completed"];

export const isFinalOrderStatus = (s: OrderStatus) => s === "completed" || s === "cancelled";

/** Label of the button that moves an order to this step */
export const NEXT_STEP_LABEL: Partial<Record<OrderStatus, string>> = {
  completed: "Xác nhận đã giao",
};

export const nextOrderStatus = (s: OrderStatus): OrderStatus | undefined =>
  isFinalOrderStatus(s) ? undefined : ORDER_FLOW[ORDER_FLOW.indexOf(s) + 1];

export const CANCEL_REASONS = ["Khách yêu cầu huỷ", "Hết hàng", "Không liên lạc được khách", "Sai địa chỉ giao hàng"];

/** Tỉnh / thành phố → xã / phường (2-level administrative units since 07/2025) — sample list for filters */
export const VN_LOCATIONS: Record<string, string[]> = {
  "TP. Hồ Chí Minh": ["Phường Sài Gòn", "Phường Bến Thành", "Phường Thủ Đức", "Phường Bình Thạnh", "Phường Tân Định"],
  "TP. Hà Nội": ["Phường Ba Đình", "Phường Cầu Giấy", "Phường Hoàn Kiếm", "Phường Đống Đa", "Xã Sóc Sơn"],
  "TP. Đà Nẵng": ["Phường Hải Châu", "Phường Sơn Trà", "Phường Ngũ Hành Sơn", "Xã Hoà Vang"],
  "TP. Cần Thơ": ["Phường Ninh Kiều", "Phường Cái Răng", "Phường Bình Thuỷ", "Phường Sóc Trăng"],
  "TP. Huế": ["Phường Thuận Hoá", "Phường Phú Xuân", "Xã Phú Vang"],
  "Lâm Đồng": ["Phường Xuân Hương - Đà Lạt", "Phường Lâm Viên - Đà Lạt", "Xã Đơn Dương"],
  "Đắk Lắk": ["Phường Buôn Ma Thuột", "Phường Tân Lập", "Xã Cư M'gar"],
  "Nghệ An": ["Phường Thành Vinh", "Phường Trường Vinh", "Xã Nghi Lộc"],
};
export const VN_PROVINCES = Object.keys(VN_LOCATIONS);

export const SHIPPING_CARRIERS = ["Giao Hàng Nhanh", "Giao Hàng Tiết Kiệm", "Viettel Post", "J&T Express", "SPX Express", "VNPost", "Ahamove", "Khác"];
