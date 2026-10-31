import type { ListParams } from "@/types/api";

export type ProductStatus = "pending" | "approved" | "rejected";

/** Đơn vị cơ bản of a nông sản: stock and supply requests are counted in it */
export type BaseUnit = "kg" | "lit";

/** One quy cách (size / pack) the storefront sells */
export interface ProductVariant {
  name: string;
  price: number;
  /** Giá gốc — shown struck through when higher than `price` */
  originalPrice?: number | null;
  /** Nông sản: amount of the base unit in one pack (Túi 500g = 0.5 kg) */
  baseQuantity?: number | null;
}

/** A vườn linked to a nông sản product; names are joined by the backend */
export interface ProductSource {
  farmId: string;
  farmName?: string;
  regionId: number;
  regionName?: string;
  cropId?: number;
  cropName?: string;
  baseUnit?: BaseUnit;
  /** Mevi's import price per base unit */
  importPrice: number;
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
  /** Joined by the backend */
  farmName?: string | null;
  /** Primary garden for nông sản */
  regionId?: number | null;
  /** Joined by the backend */
  regionName?: string | null;
  suppliers?: ProductSupplier[];
  /** Nông sản: tied to a crop and ≥1 vườn, stock is kept per vườn (see `gardenStock`) */
  isAgricultural?: boolean;
  cropId?: number | null;
  /** Joined by the backend */
  cropName?: string | null;
  baseUnit?: BaseUnit | null;
  sources?: ProductSource[];
  /** regionId → stock in `baseUnit`; `stock` is their sum */
  gardenStock?: Record<number, number>;
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
  /** Per quy cách override of `lowStockThreshold`, keyed by variant name */
  variantThresholds?: Record<string, number>;
  /** Units on hand per quy cách (sums to `stock`) */
  variantStock?: Record<string, number>;
  createdAt: string;
}

export type ProductInput = Omit<Product, "id" | "status" | "rejectionReason" | "listed" | "stock" | "lowStockThreshold" | "source" | "createdAt" | "shopName" | "farmName" | "regionName" | "gardenStock" | "cropName" | "sources" | "shopId"> & {
  shopId?: string;
  /** Names are joined by the backend, so only ids are sent */
  sources?: (Pick<ProductSource, "farmId" | "regionId" | "importPrice"> & {
    cropId?: number;
    baseUnit?: BaseUnit;
  })[];
};

export interface ProductListParams extends ListParams {
  status?: "all" | ProductStatus;
  /** "true" = Đang kinh doanh, "false" = Tạm ngưng kinh doanh */
  listed?: "all" | "true" | "false";
  category?: string;
  /** Root only — shop admins are always scoped to their own shop */
  shopId?: string;
}

export type ProductStats = Record<"total" | ProductStatus | "listed", number>;

export interface ModerateProductInput {
  status: "approved" | "rejected";
  rejectionReason?: string;
}
