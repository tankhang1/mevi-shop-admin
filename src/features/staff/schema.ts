import { z } from "zod";

export const staffSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ tên"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại gồm 10 số, bắt đầu bằng 0"),
  email: z.email("Email không hợp lệ"),
  role: z.enum(["manager", "sales", "warehouse"]),
  permissions: z
    .array(z.enum(["products", "inventory", "orders", "customers", "reviews", "shop"]))
    .min(1, "Chọn ít nhất một quyền"),
  shopId: z.string().optional(),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
