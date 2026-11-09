import { z } from "zod";
import { vnPhoneSchema } from "@/lib/regex";

export const storefrontProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên gian hàng")
    .max(255, "Tên gian hàng tối đa 255 ký tự"),
  handle: z
    .string()
    .trim()
    .min(3, "Handle tối thiểu 3 ký tự")
    .max(80, "Handle tối đa 80 ký tự")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Handle chỉ gồm chữ thường a-z, số 0-9 và dấu gạch ngang ở giữa (ví dụ: rau-sach-co-ba)",
    ),
  slogan: z.string().trim().max(80, "Slogan tối đa 80 ký tự").optional(),
  brandColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Mã màu phải dạng #RRGGBB")
    .optional()
    .or(z.literal("")),
  logoUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  coverImageUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(1000, "Mô tả tối đa 1000 ký tự")
    .optional(),
  province: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập hoặc chọn tỉnh/thành phố")
    .max(255),
  contactName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ tên người liên hệ")
    .max(255),
  contactPhone: vnPhoneSchema(
    "Số điện thoại liên hệ không hợp lệ (VD: 0912345678)",
  ),
  contactEmail: z
    .string()
    .trim()
    .email("Email không hợp lệ")
    .max(255)
    .optional()
    .or(z.literal("")),
});

export type StorefrontProfileValues = z.infer<typeof storefrontProfileSchema>;

export function profileToStorefrontValues(
  profile: Partial<{
    name: string | null;
    handle: string | null;
    slogan: string | null;
    brandColor: string | null;
    logoUrl: string | null;
    coverImageUrl: string | null;
    description: string | null;
    province: string | null;
    contactName: string | null;
    contactPhone: string | null;
    contactEmail: string | null;
  }>,
): StorefrontProfileValues {
  return {
    name: profile.name ?? "",
    handle: profile.handle ?? "",
    slogan: profile.slogan ?? "",
    brandColor: profile.brandColor || "#214c3a",
    logoUrl: profile.logoUrl ?? "",
    coverImageUrl: profile.coverImageUrl ?? "",
    description: profile.description ?? "",
    province: profile.province ?? "",
    contactName: profile.contactName ?? "",
    contactPhone: profile.contactPhone ?? "",
    contactEmail: profile.contactEmail ?? "",
  };
}

// ── Storefront Home Schemas ──

export const bannerButtonConfigSchema = z.object({
  enabled: z.boolean(),
  text: z.string().trim().max(50, "Nội dung nút tối đa 50 ký tự"),
  actionType: z.enum(["NONE", "INTERNAL_LINK", "EXTERNAL_LINK", "CONTACT"]),
  targetUrl: z.string().trim().max(500).optional().or(z.literal("")),
  openInNewTab: z.boolean(),
  contactType: z.enum(["HOTLINE", "ZALO", "EMAIL"]).optional(),
});

export const bannerItemFormSchema = z.object({
  id: z.string().optional(),
  badge: z
    .string()
    .trim()
    .max(50, "Badge tối đa 50 ký tự")
    .optional()
    .or(z.literal("")),
  showBadge: z.boolean(),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tiêu đề banner")
    .max(150, "Tiêu đề tối đa 150 ký tự"),
  description: z
    .string()
    .trim()
    .max(300, "Mô tả tối đa 300 ký tự")
    .optional()
    .or(z.literal("")),
  imageUrl: z.string().trim().min(1, "Vui lòng chọn hoặc tải lên ảnh banner"),
  button: bannerButtonConfigSchema,
  active: z.boolean(),
  sortOrder: z.number().optional(),
});

export type BannerItemFormValues = z.infer<typeof bannerItemFormSchema>;

export const highlightCardFormSchema = z.object({
  id: z.string().optional(),
  icon: z.string().trim().min(1, "Vui lòng chọn biểu tượng"),
  orderText: z.string().trim().max(10).optional().or(z.literal("")),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tiêu đề thẻ")
    .max(100, "Tiêu đề tối đa 100 ký tự"),
  description: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nội dung mô tả")
    .max(400, "Mô tả tối đa 400 ký tự"),
  linkUrl: z.string().trim().max(500).optional().or(z.literal("")),
});

export type HighlightCardFormValues = z.infer<typeof highlightCardFormSchema>;

export const highlightSectionFormSchema = z.object({
  enabled: z.boolean(),
  sectionLabel: z.string().trim().max(60).optional().or(z.literal("")),
  kicker: z.string().trim().max(100).optional().or(z.literal("")),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tiêu đề khối")
    .max(150, "Tiêu đề khối tối đa 150 ký tự"),
  description: z.string().trim().max(600).optional().or(z.literal("")),
});

export type HighlightSectionFormValues = z.infer<
  typeof highlightSectionFormSchema
>;

export const faqItemFormSchema = z.object({
  id: z.string().optional(),
  question: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập câu hỏi")
    .max(250, "Câu hỏi tối đa 250 ký tự"),
  answer: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập câu trả lời")
    .max(2500, "Câu trả lời tối đa 2500 ký tự"),
  active: z.boolean(),
  sortOrder: z.number().optional(),
});

export type FaqItemFormValues = z.infer<typeof faqItemFormSchema>;

export const faqSectionHeaderSchema = z.object({
  enabled: z.boolean(),
  kicker: z.string().trim().max(100).optional().or(z.literal("")),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tiêu đề khối FAQ")
    .max(150, "Tiêu đề khối FAQ tối đa 150 ký tự"),
});

export type FaqSectionHeaderValues = z.infer<typeof faqSectionHeaderSchema>;
