import { z } from "zod";
import type { Product, ProductInput } from "../types";

const optionalPrice = z
  .union([z.coerce.number().int().positive("Giá phải lớn hơn 0"), z.literal("").transform(() => null)])
  .nullable()
  .optional();

const baseSchema = z
  .object({
    // Bước 1 — Thông tin cơ bản
    name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm"),
    sku: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập mã sản phẩm")
      .regex(/^[A-Za-z0-9-]+$/, "Chỉ gồm chữ, số và dấu gạch ngang"),
    category: z.string().min(1, "Vui lòng chọn nhóm sản phẩm"),
    description: z.string().optional(),
    // Bước 2 — Giá & quy cách
    price: z.coerce.number({ message: "Vui lòng nhập giá" }).int().positive("Giá phải lớn hơn 0"),
    salePrice: optionalPrice,
    origin: z.string().optional(),
    farmId: z.string().optional(),
    packaging: z.string().optional(),
    shelfLife: z.string().optional(),
    storage: z.string().optional(),
    certifications: z.array(z.string()),
    // Bước 3 — Hình ảnh
    images: z.array(z.string()).min(1, "Cần ít nhất 1 ảnh sản phẩm").max(8, "Tối đa 8 ảnh"),
  })
  .refine((v) => !v.salePrice || v.salePrice < v.price, {
    path: ["salePrice"],
    message: "Giá khuyến mãi phải nhỏ hơn giá bán",
  });

export const productSchema = baseSchema;

export type ProductFormValues = z.input<typeof productSchema>;

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  salePrice: "",
  origin: "",
  farmId: "",
  packaging: "",
  shelfLife: "",
  storage: "",
  certifications: [],
  images: [],
};

export const productToFormValues = ({ shopId: _shopId, ...p }: Product): ProductFormValues => ({
  ...EMPTY_PRODUCT,
  ...p,
  certifications: p.certifications ?? [],
  price: String(p.price),
  salePrice: p.salePrice ? String(p.salePrice) : "",
  farmId: p.farmId ?? "",
});

export const formValuesToInput = (values: ProductFormValues): ProductInput => {
  const v = productSchema.parse(values);
  return { ...v, salePrice: v.salePrice ?? null, farmId: v.farmId || null };
};
