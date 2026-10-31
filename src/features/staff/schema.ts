import { z } from "zod";

export const staffSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại gồm 10 số, bắt đầu bằng 0"),
  email: z.email("Email không hợp lệ"),
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
});

export type StaffFormValues = z.infer<typeof staffSchema>;
