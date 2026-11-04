import type { ListParams } from "@/types/api";

/**
 * Trạng thái đơn đặt hàng (BE notice 2026-11-03)
 * PENDING: Chờ xác nhận
 * CONFIRMED: Đã lên đơn
 * SHIPPING: Đang giao
 * DELIVERED: Đã giao hàng
 * CANCELLED: Đã hủy
 * (Hỗ trợ alias chữ thường new / completed / cancelled để tương thích ngược)
 */
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "new"
  | "completed"
  | "cancelled";

/** Đơn vị vận chuyển hỗ trợ */
export type ShippingCarrier =
  | "SELF_DELIVERY"
  | "GHN"
  | "GHTK"
  | "VIETTEL_POST"
  | "VNPOST"
  | "JT_EXPRESS"
  | "NINJA_VAN"
  | "OTHER";

export interface OrderRecipient {
  name: string;
  phone: string;
  province?: string;
  district?: string;
  addressLine?: string;
}

export interface OrderCustomer {
  id: number | string;
  code?: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string | null;
}

export interface OrderItemProduct {
  id: number | string;
  code?: string;
  title?: string;
  imageUrl?: string;
}

export interface OrderItemVariant {
  id: number | string | null;
  title?: string;
}

export interface OrderItemAllocation {
  variantQuantity?: number;
  unitQuantity?: number;
}

export interface OrderItem {
  id?: number | string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  product?: OrderItemProduct;
  variant?: OrderItemVariant | null;
  sku?: string;
  image?: string;
  baseUnit?: string | null;
  unitQuantity?: number | null;
  unitPrice?: number;
  lineTotal?: number;
  allocation?: OrderItemAllocation | null;
}

export interface OrderStorefront {
  id: number | string;
  name: string;
}

export interface OrderCommission {
  rate: number;
  amount: number;
  status?: "PENDING" | "PAYABLE" | "PAID" | "CANCELLED";
  earned?: boolean;
}

export interface OrderDispatchGroup {
  id: number | string;
  name: string;
}

export interface OrderAssignee {
  id: number | string;
  fullName: string;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  by: string;
  note?: string;
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  shopId: string;
  total: number;
  createdAt: string;

  // Recipient info
  recipientName: string;
  recipientPhone: string;
  address: string;
  recipient?: OrderRecipient;
  street?: string;
  ward?: string;
  province?: string;
  deliveryNote?: string | null;

  // Items
  items?: OrderItem[];

  // Customer
  customer?: OrderCustomer | null;
  customerId?: string;
  customerCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string | null;

  // Dispatch & Shipping
  dispatchGroup?: OrderDispatchGroup | null;
  assignee?: OrderAssignee | null;
  teamId?: string | null;
  assigneeId?: string | null;
  teamName?: string;
  assigneeName?: string;
  shippingCarrier?: ShippingCarrier | string | null;
  carrier?: string | null;
  trackingCode?: string | null;

  // Agency & Storefront
  storefront?: OrderStorefront | null;
  commission?: OrderCommission | null;
  agencyId?: string;
  agencyName?: string;
  shopName?: string;
  commissionRate?: number;
  commissionPaidAt?: string | null;

  // Timestamps & notes
  note?: string | null;
  internalNote?: string | null;
  confirmedAt?: string | null;
  shippingAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  cancelledBy?: { id: number | string; fullName: string } | null;
  statusHistory?: OrderStatusEvent[];
  subtotal?: number;
}

/** Detail view joins extra joined fields */
export interface OrderDetail extends Order {
  customerId?: string;
}

export interface OrderStatusCounts {
  pending: number;
  confirmed: number;
  shipping: number;
  delivered: number;
  cancelled: number;
  total: number;
}

export interface OrderProcessingInput {
  dispatchGroupId?: number | string | null;
  assigneeUserId?: number | string | null;
  shippingCarrier?: ShippingCarrier | string | null;
  trackingCode?: string | null;
  internalNote?: string | null;
}

export interface OrderStatusUpdateInput {
  status: OrderStatus;
  reason?: string;
  note?: string;
}

export interface OrderListParams extends ListParams {
  status?: "all" | OrderStatus;
  keyword?: string;
  code?: string;
  dispatchGroupId?: string | number;
  unassigned?: boolean;
  assigneeUserId?: string | number;
  storefrontId?: string | number;
  commissionStatus?: "PENDING" | "PAYABLE" | "PAID" | "CANCELLED";
  assigneeId?: string;
  productGroupId?: string;
  productId?: string;
  dateField?: "createdAt" | "deliveredAt";
  from?: string;
  to?: string;
  province?: string;
  ward?: string;
  customerCode?: string;
  customerPhone?: string;
  agencyId?: string;
  teamId?: string;
  customerId?: string;
  shopId?: string;
}
