import type { BaseUnit, ProductStatus, ShelfLifeUnit, StorageCondition } from "../enums";
import type { CategoryRef } from "./category.response";

/** Product / variant IDs are public 15–16 digit numbers — never compute on them */
export interface CatalogProductStatusCounts {
  active: number;
  inactive: number;
  /** active + inactive */
  total: number;
}

export interface CatalogProductListItem {
  id: number;
  code: string;
  title: string;
  handle: string;
  status: ProductStatus;
  category: CategoryRef;
  agricultural: boolean;
  thumbnailUrl: string | null;
  minPrice: number;
  maxPrice: number;
  compareAtPrice: number | null;
  variantCount: number;
  totalInventory: number;
  lowStock: boolean;
  ratingAverage: number | null;
  ratingCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductMedia {
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
}

export interface SupplySource {
  /** `code` / `name` are null when the zone was deleted on the farm side */
  productionZone: { id: number; code: string | null; name: string | null };
  workspace: { id: number; name: string | null };
  productionSubject: { id: number; name: string | null };
  baseUnit: BaseUnit;
}

export interface ProductVariant {
  id: number;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  inventoryQuantity: number;
  /** Absent when no threshold is set */
  lowStockThreshold?: number;
  lowStock: boolean;
  /** Quy đổi sang đơn vị tính (vd bao 5kg = 5) */
  unitQuantity?: number | null;
}

export interface RatingBucket {
  stars: number;
  count: number;
}

export interface CatalogProduct {
  id: number;
  code: string;
  title: string;
  handle: string;
  description: string | null;
  category: CategoryRef;
  agricultural: boolean;
  /** Nông sản: cây trồng + đơn vị tính cơ bản (optional — chưa có ở API cũ) */
  productionSubject?: { id: number; name: string | null } | null;
  baseUnit?: BaseUnit | null;
  status: ProductStatus;
  tags: string[];
  certifications: string[];
  /** First item is the cover */
  media: ProductMedia[];
  shelfLifeValue: number | null;
  shelfLifeUnit: ShelfLifeUnit | null;
  storageCondition: StorageCondition | null;
  storageInstructions: string | null;
  supplySources: SupplySource[];
  variants: ProductVariant[];
  /** Bán theo đơn vị tính (optional — chưa có ở API cũ) */
  sellingUnit?: string | null;
  unitPrice?: number | null;
  unitCompareAtPrice?: number | null;
  /** Tồn kho theo đơn vị tính */
  unitInventoryQuantity?: number | null;
  ratingAverage: number | null;
  ratingCount: number;
  ratingDistribution: RatingBucket[];
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}
