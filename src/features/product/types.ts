import type { ListParams } from "@/types/api";

export type ProductStatus = "pending" | "approved" | "rejected";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  salePrice?: number | null;
  description?: string;
  origin?: string;
  packaging?: string;
  shelfLife?: string;
  storage?: string;
  images: string[];
  status: ProductStatus;
  rejectionReason?: string | null;
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "status" | "rejectionReason" | "createdAt">;

export interface ProductListParams extends ListParams {
  status?: "all" | ProductStatus;
}

export interface ModerateProductInput {
  status: "approved" | "rejected";
  rejectionReason?: string;
}
