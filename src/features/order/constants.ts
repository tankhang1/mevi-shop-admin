import type { OrderPaymentStatus, OrderStatus, ShippingCarrier } from "./types";

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING: { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-800" },
  CONFIRMED: { label: "Đã lên đơn", className: "bg-sky-100 text-sky-800" },
  SHIPPING: { label: "Đang giao", className: "bg-indigo-100 text-indigo-800" },
  DELIVERED: {
    label: "Đã giao hàng",
    className: "bg-emerald-100 text-emerald-800",
  },
  CANCELLED: { label: "Đã huỷ", className: "bg-slate-200 text-slate-700" },
  // Backward compatibility aliases
  new: { label: "Đã lên đơn", className: "bg-sky-100 text-sky-800" },
  completed: {
    label: "Đã giao hàng",
    className: "bg-emerald-100 text-emerald-800",
  },
  cancelled: { label: "Đã huỷ", className: "bg-slate-200 text-slate-700" },
};

export const ORDER_PAYMENT_STATUS: Record<
  OrderPaymentStatus,
  { label: string; className: string }
> = {
  UNPAID: {
    label: "Chưa thanh toán",
    className: "bg-amber-100 text-amber-800",
  },
  PAID: {
    label: "Đã thanh toán",
    className: "bg-emerald-100 text-emerald-800",
  },
};

/** Các trạng thái chính hiển thị trên giao diện và bộ lọc */
export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

/** Tiến trình xử lý đơn hàng theo luồng tuần tự */
export const ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
];

export const isFinalOrderStatus = (s: OrderStatus) =>
  s === "DELIVERED" ||
  s === "CANCELLED" ||
  s === "completed" ||
  s === "cancelled";

/** Đơn hoàn thành: status = DELIVERED và paymentStatus = PAID (BE notice 2026-11-10) */
export const isOrderCompleted = (order: {
  status: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
}) =>
  (order.status === "DELIVERED" || order.status === "completed") &&
  order.paymentStatus === "PAID";

/** Nhãn của nút hành động khi đẩy đơn lên trạng thái kế tiếp */
export const NEXT_STEP_LABEL: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Xác nhận lên đơn",
  SHIPPING: "Giao cho vận chuyển",
  DELIVERED: "Xác nhận đã giao",
  completed: "Xác nhận đã giao",
};

export const nextOrderStatus = (s: OrderStatus): OrderStatus | undefined => {
  if (isFinalOrderStatus(s)) return undefined;
  const currentKey = s === "new" ? "CONFIRMED" : s;
  const currentIndex = ORDER_FLOW.indexOf(currentKey as OrderStatus);
  if (currentIndex === -1 || currentIndex >= ORDER_FLOW.length - 1)
    return undefined;
  return ORDER_FLOW[currentIndex + 1];
};

export const CANCEL_REASONS = [
  "Khách yêu cầu huỷ",
  "Hết hàng tồn kho",
  "Không liên lạc được khách",
  "Sai địa chỉ giao hàng",
  "Khách đổi ý",
  "Khác",
];

/** Đơn vị vận chuyển chuẩn theo spec backend */
export const SHIPPING_CARRIERS_MAP: Record<ShippingCarrier, string> = {
  SELF_DELIVERY: "Mevi tự giao",
  GHN: "Giao Hàng Nhanh (GHN)",
  GHTK: "Giao Hàng Tiết Kiệm (GHTK)",
  VIETTEL_POST: "Viettel Post",
  VNPOST: "VNPost",
  JT_EXPRESS: "J&T Express",
  NINJA_VAN: "Ninja Van",
  OTHER: "Đơn vị khác",
};

export const SHIPPING_CARRIER_OPTIONS = Object.entries(
  SHIPPING_CARRIERS_MAP,
).map(([value, label]) => ({ value, label }));

/** Danh sách tên đơn vị vận chuyển (tương thích cũ) */
export const SHIPPING_CARRIERS = Object.values(SHIPPING_CARRIERS_MAP);

/** Tỉnh / thành phố mẫu */
export const VN_LOCATIONS: Record<string, string[]> = {
  "TP. Hồ Chí Minh": [
    "Phường Sài Gòn",
    "Phường Bến Thành",
    "Phường Thủ Đức",
    "Phường Bình Thạnh",
    "Phường Tân Định",
  ],
  "TP. Hà Nội": [
    "Phường Ba Đình",
    "Phường Cầu Giấy",
    "Phường Hoàn Kiếm",
    "Phường Đống Đa",
    "Xã Sóc Sơn",
  ],
  "TP. Đà Nẵng": [
    "Phường Hải Châu",
    "Phường Sơn Trà",
    "Phường Ngũ Hành Sơn",
    "Xã Hoà Vang",
  ],
  "TP. Cần Thơ": [
    "Phường Ninh Kiều",
    "Phường Cái Răng",
    "Phường Bình Thuỷ",
    "Phường Sóc Trăng",
  ],
  "TP. Huế": ["Phường Thuận Hoá", "Phường Phú Xuân", "Xã Phú Vang"],
  "Lâm Đồng": [
    "Phường Xuân Hương - Đà Lạt",
    "Phường Lâm Viên - Đà Lạt",
    "Xã Đơn Dương",
  ],
  "Đắk Lắk": ["Phường Buôn Ma Thuột", "Phường Tân Lập", "Xã Cư M'gar"],
  "Nghệ An": ["Phường Thành Vinh", "Phường Trường Vinh", "Xã Nghi Lộc"],
};
export const VN_PROVINCES = Object.keys(VN_LOCATIONS);
