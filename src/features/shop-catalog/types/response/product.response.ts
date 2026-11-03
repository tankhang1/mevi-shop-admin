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
  /** null = không bán theo đơn vị tính */
  baseUnit: BaseUnit | null;
  /** Sum of the quy cách's own stock */
  totalInventory: number;
  /** null when no baseUnit */
  unitInventoryQuantity: number | null;
  /** Any quy cách or the đơn vị tính is low */
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
}

export interface ProductVariant {
  id: number;
  title: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  /** Own stock of the quy cách (integer) */
  inventoryQuantity: number;
  /** inventoryQuantity + floor(unitInventoryQuantity / unitQuantity); = inventoryQuantity without quy đổi */
  availableQuantity: number;
  /** Absent when no threshold is set */
  lowStockThreshold?: number;
  lowStock: boolean;
  /** Quy đổi sang đơn vị tính (vd bao 5kg = 5); null = không quy đổi */
  unitQuantity: number | null;
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
  /** null when not nông sản; `name` null when deleted from the catalog */
  productionSubject: { id: number; name: string | null } | null;
  /** null = no Giống restriction */
  productionSubjectVariant: { id: number; name: string | null } | null;
  /** null = không bán theo đơn vị tính; then all unit* fields are null */
  baseUnit: BaseUnit | null;
  unitSku: string | null;
  /** May be null with a baseUnit on legacy products — edit form must require it */
  unitPrice: number | null;
  unitCompareAtPrice: number | null;
  /** Up to 3 decimals */
  unitInventoryQuantity: number | null;
  unitLowStockThreshold: number | null;
  unitLowStock: boolean;
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
  ratingAverage: number | null;
  ratingCount: number;
  ratingDistribution: RatingBucket[];
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}
