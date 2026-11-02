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
