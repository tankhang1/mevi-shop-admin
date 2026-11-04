import { z } from "zod";

export const agencySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên gian hàng"),
  kind: z.enum(["agency", "ctv"]).optional(),
  slug: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập slug")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Chỉ gồm chữ thường, số và dấu gạch ngang"),
  slogan: z.string().trim().max(80, "Tối đa 80 ký tự").optional(),
  brandColor: z.string().optional(),
  logoUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(""), z.email("Email không hợp lệ")]).optional(),
  province: z.string().optional(),
});

export type AgencyFormValues = z.infer<typeof agencySchema>;

/** "Đặc sản Tây Bắc" → "dac-san-tay-bac" */
export const toSlug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
