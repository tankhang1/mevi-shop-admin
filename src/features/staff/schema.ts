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
});

export type StaffFormValues = z.infer<typeof staffSchema>;
