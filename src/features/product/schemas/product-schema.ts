import { z } from "zod";

const optionalPrice = z
  .union([z.coerce.number().int().positive("Giá phải lớn hơn 0"), z.literal("").transform(() => null)])
  .nullable()
  .optional();

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập tên"),
    sku: z.string().trim().min(1, "Vui lòng nhập SKU"),
    category: z.string().min(1, "Vui lòng chọn danh mục"),
    price: z.coerce.number({ message: "Vui lòng nhập giá" }).int().positive("Giá phải lớn hơn 0"),
    salePrice: optionalPrice,
    description: z.string().optional(),
    origin: z.string().optional(),
    packaging: z.string().optional(),
    shelfLife: z.string().optional(),
    storage: z.string().optional(),
  })
  .refine((v) => !v.salePrice || v.salePrice < v.price, {
    path: ["salePrice"],
    message: "Giá khuyến mãi phải nhỏ hơn giá bán",
  });

export type ProductFormValues = z.input<typeof productSchema>;
