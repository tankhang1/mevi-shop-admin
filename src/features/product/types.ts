import type { ListParams } from "@/types/api";

export type ProductStatus = "pending" | "approved" | "rejected";

/** One quy cách (size / pack) the storefront sells */
export interface ProductVariant {
  name: string;
  price: number;
  /** Giá gốc — shown struck through when higher than `price` */
  originalPrice?: number | null;
}

/** A farmer household / cooperative supplying this product, with what Mevi pays them */
export interface ProductSupplier {
  farmId: string;
  importPrice: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  /** Mirrors the first variant (list price) — kept for list views and reports */
  price: number;
  salePrice?: number | null;
  variants?: ProductVariant[];
  description?: string;
  origin?: string;
  packaging?: string;
  shelfLife?: string;
  storage?: string;
  images: string[];
  /** VietGAP, OCOP 4 sao, Hữu cơ… — shown on the storefront trace card */
  certifications: string[];
  /** farm = came from an approved farmer registration, self = created by the admin */
  source?: "farm" | "self";
  /** First supplier — kept for reports; the full list is `suppliers` */
  farmId?: string | null;
  suppliers?: ProductSupplier[];
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

export type ProductInput = Omit<Product, "id" | "status" | "rejectionReason" | "listed" | "stock" | "lowStockThreshold" | "source" | "createdAt" | "shopName">;

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
