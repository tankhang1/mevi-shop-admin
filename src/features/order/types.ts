import type { ListParams } from "@/types/api";

export type OrderStatus = "new" | "confirmed" | "processing" | "shipped" | "completed" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  code: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  total: number;
  items?: OrderItem[];
  status: OrderStatus;
  createdAt: string;
}

export interface OrderListParams extends ListParams {
  status?: "all" | OrderStatus;
}
