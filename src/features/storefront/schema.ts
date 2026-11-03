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
