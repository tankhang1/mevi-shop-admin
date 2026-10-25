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
  /** VietGAP, OCOP 4 sao, Hữu cơ… — shown on the storefront trace card */
  certifications: string[];
  /** Supplying farmer household / cooperative (eco-farm workspace) */
  farmId?: string | null;
  /** Owning seller; set from the token for shop admins, chosen in the form by root */
  shopId: string;
  /** Joined by the backend for list/detail views */
  shopName?: string;
  status: ProductStatus;
  rejectionReason?: string | null;
  /** Shown on the storefront (on the shelf). Only approved products can be listed */
  listed: boolean;
  /** Units on hand — changed only through stock movements (Quản lý kho) */
  stock: number;
  /** At or below this the product counts as "sắp hết" */
  lowStockThreshold: number;
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "status" | "rejectionReason" | "listed" | "stock" | "lowStockThreshold" | "createdAt" | "shopName">;

export interface ProductListParams extends ListParams {
  status?: "all" | ProductStatus;
  category?: string;
  /** Root only — shop admins are always scoped to their own shop */
  shopId?: string;
}

export type ProductStats = Record<"total" | ProductStatus | "listed", number>;

export interface ModerateProductInput {
  status: "approved" | "rejected";
  rejectionReason?: string;
}
