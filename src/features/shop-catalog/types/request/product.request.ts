import type { PageParams } from "@/types/api";
import type { BaseUnit, ProductStatus, ShelfLifeUnit, StorageCondition } from "../enums";

export interface CatalogProductListParams extends PageParams {
  status?: ProductStatus;
  categoryId?: number;
  agricultural?: boolean;
  lowStock?: boolean;
}

/** Same filters as the list, without `status` */
export type CatalogProductStatusCountParams = Omit<CatalogProductListParams, "status" | "page" | "size">;

export interface BulkSetProductCategoryInput {
  /** 1–100 public product ids */
  productIds: number[];
  categoryId: number;
}

export interface ProductMediaInput {
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
  cover?: boolean;
}

/** Vườn must grow the product's Cây trồng (and Giống, when set) */
export interface SupplySourceInput {
  productionZoneId: number;
}

export interface ProductVariantInput {
  /** Only when editing an existing variant */
  id?: number;
  title: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  /** Quy đổi: 1 quy cách = unitQuantity × baseUnit (vd bao 5kg = 5), > 0, ≤ 3 decimals. Only with baseUnit. null = không quy đổi */
  unitQuantity?: number | null;
}

export interface CatalogProductInput {
  title: string;
  code?: string | null;
  handle?: string | null;
  description?: string | null;
  categoryId: number;
  agricultural?: boolean;
  /** Required when agricultural; ignored (and cleared) otherwise */
  productionSubjectId?: number | null;
  /** Giống of that Cây trồng; null = any giống */
  productionSubjectVariantId?: number | null;
  /**
   * Đơn vị tính — null = không bán theo đơn vị (then unitSku/unitPrice/unitCompareAtPrice are cleared).
   * Required when `variants` is empty. Nông sản: KG / LITER. Change/remove only when unit stock = 0.
   */
  baseUnit?: BaseUnit | null;
  /** Empty: BE generates `DV-<productId>` the first time, then keeps it. Unique across all SKUs */
  unitSku?: string | null;
  /** Required with baseUnit, VND */
  unitPrice?: number | null;
  /** Must be > unitPrice */
  unitCompareAtPrice?: number | null;
  status: ProductStatus;
  tags?: string[];
  certifications?: string[];
  media?: ProductMediaInput[];
  shelfLifeValue?: number | null;
  shelfLifeUnit?: ShelfLifeUnit | null;
  storageCondition?: StorageCondition | null;
  storageInstructions?: string | null;
  supplySources?: SupplySourceInput[];
  /** 0–100; required when no baseUnit */
  variants: ProductVariantInput[];
}

export interface LowStockThresholdInput {
  /** null = threshold of the đơn vị tính (≤ 3 decimals); quy cách thresholds stay integers */
  variantId: number | null;
  /** null = no warning */
  threshold: number | null;
}
