export type ContentBlockType = "banner" | "highlights" | "faq";

// ── Slide Banner ──
export interface BannerBadge {
  enabled: boolean;
  text: string;
}

export interface BannerCta {
  enabled: boolean;
  label: string;
  linkType: string;
  target: string;
}

export interface BannerSlideItem {
  id: string;
  version: number;
  enabled: boolean;
  imageUrl: string;
  badge: BannerBadge;
  title: string;
  description?: string | null;
  cta: BannerCta;
}

export interface BannerBlockSettings {
  autoplay: boolean;
  intervalSeconds: number;
}

export interface BannerBlockData extends BannerBlockSettings {
  version: number;
  items: BannerSlideItem[];
}

export interface BannerSlideInput {
  enabled: boolean;
  imageUrl: string;
  badge: BannerBadge;
  title: string;
  description?: string | null;
  cta: BannerCta;
}

// ── Thẻ Nổi Bật & Giá Trị ──
export interface HighlightCardItem {
  id: string;
  version: number;
  enabled: boolean;
  icon: string;
  title: string;
  description?: string | null;
  link?: string | null;
}

export interface HighlightBlockSettings {
  enabled: boolean;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface HighlightsBlockData extends HighlightBlockSettings {
  version: number;
  items: HighlightCardItem[];
}

export interface HighlightCardInput {
  enabled: boolean;
  icon: string;
  title: string;
  description?: string | null;
  link?: string | null;
}

// ── Câu Hỏi FAQ ──
export interface FaqQuestionItem {
  id: string;
  version: number;
  enabled: boolean;
  question: string;
  answer: string;
}

export interface FaqBlockSettings {
  enabled: boolean;
  eyebrow?: string | null;
  title?: string | null;
}

export interface FaqBlockData extends FaqBlockSettings {
  version: number;
  items: FaqQuestionItem[];
}

export interface FaqQuestionInput {
  enabled: boolean;
  question: string;
  answer: string;
}

// ── Web Public Response ──
export interface PublicBannerSlide {
  imageUrl: string;
  badge?: string | null;
  title: string;
  description?: string | null;
  cta?: {
    label: string;
    linkType: string;
    target: string;
  } | null;
}

export interface PublicHighlightCard {
  icon: string;
  title: string;
  description?: string | null;
  link?: string | null;
}

export interface PublicFaqQuestion {
  question: string;
  answer: string;
}

export interface PublicContentBlocksResponse {
  banner?: {
    autoplay: boolean;
    intervalSeconds: number;
    items: PublicBannerSlide[];
  } | null;
  highlights?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
    items: PublicHighlightCard[];
  } | null;
  faq?: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
    items: PublicFaqQuestion[];
  } | null;
}

