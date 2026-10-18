import { z } from "zod";

export const agencySchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên gian hàng"),
  slug: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập slug")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Chỉ gồm chữ thường, số và dấu gạch ngang"),
  brandColor: z.string().optional(),
  logoUrl: z.union([z.literal(""), z.url("URL không hợp lệ")]).optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(""), z.email("Email không hợp lệ")]).optional(),
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
