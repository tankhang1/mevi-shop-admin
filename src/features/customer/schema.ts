import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên khách hàng"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại gồm 10 số, bắt đầu bằng 0"),
  email: z.union([z.literal(""), z.email("Email không hợp lệ")]).optional(),
  address: z.string().trim().optional(),
  tags: z.array(z.string()),
  note: z.string().trim().max(500, "Tối đa 500 ký tự").optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
