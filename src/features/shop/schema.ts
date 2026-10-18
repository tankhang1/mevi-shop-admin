import { z } from "zod";
import type { Shop, ShopProfileInput } from "./types";

const optionalEmail = z.union([z.literal(""), z.email("Email không hợp lệ")]);

export const shopProfileSchema = z.object({
  name: z.string().trim().min(2, "Tên gian hàng tối thiểu 2 ký tự").max(80),
  slug: z
    .string()
    .trim()
    .min(3, "Tối thiểu 3 ký tự")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Chỉ gồm chữ thường, số và dấu gạch ngang"),
  tagline: z.string().trim().max(80, "Tối đa 80 ký tự"),
  description: z.string().trim().max(1000, "Tối đa 1000 ký tự"),
  location: z.string().trim().min(1, "Vui lòng nhập khu vực"),
  logoUrl: z.string(),
  coverUrl: z.string(),
  brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Mã màu dạng #RRGGBB"),
  contactName: z.string().trim().min(1, "Vui lòng nhập người liên hệ"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại 10 chữ số, bắt đầu bằng 0"),
  email: optionalEmail,
  address: z.string().trim(),
});

export type ShopProfileValues = z.infer<typeof shopProfileSchema>;

export const shopToProfileValues = (s: Shop): ShopProfileValues => ({
  name: s.name,
  slug: s.slug,
  tagline: s.tagline ?? "",
  description: s.description ?? "",
  location: s.location ?? "",
  logoUrl: s.logoUrl ?? "",
  coverUrl: s.coverUrl ?? "",
  brandColor: s.brandColor || "#214c3a",
  contactName: s.contactName ?? "",
  phone: s.phone ?? "",
  email: s.email ?? "",
  address: s.address ?? "",
});

export const profileValuesToInput = (v: ShopProfileValues): ShopProfileInput => shopProfileSchema.parse(v);
