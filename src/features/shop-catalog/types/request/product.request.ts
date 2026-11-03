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

export interface SupplySourceInput {
  productionZoneId: number;
  productionSubjectId: number;
  baseUnit: BaseUnit;
}

export interface ProductVariantInput {
  /** Only when editing an existing variant */
  id?: number;
  title: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  /** Quy đổi: 1 quy cách = unitQuantity × sellingUnit (vd bao 5kg = 5). null = không quy đổi, tồn kho riêng */
  unitQuantity?: number | null;
}

export interface CatalogProductInput {
  title: string;
  code?: string | null;
  handle?: string | null;
  description?: string | null;
  categoryId: number;
  agricultural?: boolean;
  /** Nông sản: cây trồng / giống + đơn vị tính cơ bản, chọn ở cấp sản phẩm */
  productionSubjectId?: number | null;
  baseUnit?: BaseUnit | null;
  status: ProductStatus;
  tags?: string[];
  certifications?: string[];
  media?: ProductMediaInput[];
  shelfLifeValue?: number | null;
  shelfLifeUnit?: ShelfLifeUnit | null;
  storageCondition?: StorageCondition | null;
  storageInstructions?: string | null;
  supplySources?: SupplySourceInput[];
  /** Bán theo đơn vị tính — null khi không bán theo đơn vị */
  sellingUnit?: string | null;
  unitPrice?: number | null;
  unitCompareAtPrice?: number | null;
  /** Bán theo quy cách — rỗng khi chỉ bán theo đơn vị */
  variants: ProductVariantInput[];
}

export interface LowStockThresholdInput {
  variantId: number;
  /** null = no warning */
  threshold: number | null;
}
