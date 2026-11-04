import { z } from "zod";

export const staffSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+?84|0)(3|5|7|8|9)\d{8}$/,
      "Số điện thoại gồm 10 số (bắt đầu bằng 0 hoặc +84)",
    ),
  email: z.union([z.literal(""), z.email("Email không hợp lệ")]).optional(),
  /** Required when creating; blank on edit keeps the current password */
  password: z
    .string()
    .refine((v) => !v || v.length >= 8, "Mật khẩu tối thiểu 8 ký tự")
    .optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  idNumber: z
    .string()
    .trim()
    .refine((v) => !v || /^\d{12}$/.test(v), "Số CCCD gồm 12 chữ số")
    .optional(),
  address: z.string().trim().optional(),
  /** "" = chưa thuộc nhóm nào */
  teamId: z.string().optional(),
  audienceType: z.enum(["individual", "cooperative", "business", "other"]),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
