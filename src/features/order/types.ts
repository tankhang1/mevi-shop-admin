import type { ListParams } from "@/types/api";

/** new = Đã lên đơn, completed = Đã giao hàng, cancelled = Huỷ đơn */
export type OrderStatus = "new" | "completed" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  /** Who made the change — "Khách hàng" for the order being placed */
  by: string;
  note?: string;
}

export interface Order {
  id: string;
  code: string;
  /** Khách hàng — the account that placed the order */
  customerCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string | null;
  /** Giao hàng — who receives it and where; differs from the buyer for gifts */
  recipientName: string;
  recipientPhone: string;
  /** Full one-line address (street, xã/phường, tỉnh/thành phố) */
  address: string;
  street?: string;
  /** Xã / phường */
  ward?: string;
  /** Tỉnh / thành phố */
  province?: string;
  /** Lời nhắn cho người giao hàng */
  deliveryNote?: string | null;
  /** Set when the order reaches "completed" */
  deliveredAt?: string | null;
  total: number;
  items?: OrderItem[];
  status: OrderStatus;
  /** Seller that fulfils the order */
  shopId: string;
  shopName?: string;
  /** Agency whose referral link the order came through */
  agencyId?: string;
  /** Agency commission % at the time the order was placed */
  commissionRate?: number;
  /** Set when the agency's commission for this order has been paid out */
  commissionPaidAt?: string | null;
  /** Oldest first; the first entry is the order being placed */
  statusHistory?: OrderStatusEvent[];
  cancelReason?: string | null;
  /** Mã vận đơn from the shipping carrier */
  trackingCode?: string | null;
  /** Shipping carrier — one of SHIPPING_CARRIERS or free text */
  carrier?: string | null;
  /** Seller-side note, never shown to the customer */
  internalNote?: string | null;
  /** Dispatch team handling the order */
  teamId?: string | null;
  /** Staff member in that team handling the order */
  assigneeId?: string | null;
  /** Joined by the backend */
  teamName?: string;
  assigneeName?: string;
  createdAt: string;
}

/** Detail view joins names/links the list doesn't need */
export interface OrderDetail extends Order {
  items: (OrderItem & { image?: string; sku?: string })[];
  agencyName?: string;
  /** Customer record matched by recipient phone, when one exists */
  customerId?: string;
}

export interface OrderListParams extends ListParams {
  status?: "all" | OrderStatus;
  /** Exact / partial mã đơn */
  code?: string;
  assigneeId?: string;
  productGroupId?: string;
  productId?: string;
  /** Which date `from` / `to` apply to */
  dateField?: "createdAt" | "deliveredAt";
  /** yyyy-mm-dd, inclusive */
  from?: string;
  to?: string;
  province?: string;
  ward?: string;
  customerCode?: string;
  customerPhone?: string;
  agencyId?: string;
  /** "none" = not assigned to any team yet */
  teamId?: string;
  /** Orders placed by this customer (matched by phone) */
  customerId?: string;
  /** Root only */
  shopId?: string;
}
