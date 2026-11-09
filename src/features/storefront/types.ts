export interface StorefrontCatalogProduct {
  id: number;
  title: string;
  handle: string;
  status: "ACTIVE" | "INACTIVE";
  category: { id: number; name: string; handle: string };
  thumbnailUrl: string | null;
  minPrice: number;
  maxPrice: number;
  compareAtPrice?: number | null;
  variantCount: number;
  totalInventory: number;
  ratingAverage?: number | null;
  ratingCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontProductItem {
  id: number;
  product: StorefrontCatalogProduct;
  visible: boolean;
}

export interface StorefrontCatalogItem {
  id: number;
  product: StorefrontCatalogProduct;
  inStorefront: boolean;
}

export interface UpdateStorefrontProfileInput {
  name: string;
  handle: string;
  slogan?: string;
  brandColor?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  description?: string;
  province: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
}

export type StorefrontPhotoType = "COVER" | "LOGO";
export type StorefrontPhotoFormat = "JPEG" | "WEBP";

export interface StorefrontPhotoUploadResponse {
  bucket: string;
  objectKey: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  etag: string;
  type: StorefrontPhotoType;
  width: number;
  height: number;
}

export interface ListStorefrontCatalogParams {
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface ListStorefrontProductsParams {
  page?: number;
  size?: number;
}

// ── Storefront Home / Landing Sections ──

export type BannerActionType =
  | "NONE"
  | "INTERNAL_LINK"
  | "EXTERNAL_LINK"
  | "CONTACT";
export type BannerContactType = "HOTLINE" | "ZALO" | "EMAIL";

export interface BannerButtonConfig {
  enabled: boolean;
  text: string;
  actionType: BannerActionType;
  targetUrl?: string;
  openInNewTab?: boolean;
  contactType?: BannerContactType;
}

export interface StorefrontBannerItem {
  id: string;
  badge?: string;
  showBadge?: boolean;
  title: string;
  description?: string;
  imageUrl: string;
  button: BannerButtonConfig;
  active: boolean;
  sortOrder: number;
}

export interface StorefrontBannerSettings {
  autoplay: boolean;
  autoplayIntervalSeconds: number;
  items: StorefrontBannerItem[];
}

export interface StorefrontHighlightCard {
  id: string;
  icon: string;
  orderText?: string;
  title: string;
  description: string;
  linkUrl?: string;
}

export interface StorefrontHighlightSection {
  enabled: boolean;
  sectionLabel?: string;
  kicker: string;
  title: string;
  description: string;
  cards: StorefrontHighlightCard[];
}

export interface StorefrontFaqItem {
  id: string;
  question: string;
  answer: string;
  active: boolean;
  sortOrder: number;
}

export interface StorefrontFaqSection {
  enabled: boolean;
  kicker: string;
  title: string;
  items: StorefrontFaqItem[];
}

export interface StorefrontHomeConfig {
  banners: StorefrontBannerSettings;
  highlights: StorefrontHighlightSection;
  faq: StorefrontFaqSection;
}
