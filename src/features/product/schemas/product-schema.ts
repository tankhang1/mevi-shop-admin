import { z } from "zod";
import type { Product, ProductInput } from "../types";

/** "" from an empty number input → undefined, so it reports "Vui lòng nhập giá" instead of "> 0" */
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

const requiredPrice = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ message: "Vui lòng nhập giá" }).int().positive("Giá phải lớn hơn 0"),
);

const optionalPrice = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().positive("Giá phải lớn hơn 0").optional(),
);

const variantSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập quy cách"),
    price: requiredPrice,
    originalPrice: optionalPrice,
  })
  .refine((v) => !v.originalPrice || v.originalPrice > v.price, {
    path: ["originalPrice"],
    message: "Giá gốc phải lớn hơn giá bán",
  });

const supplierSchema = z.object({
  farmId: z.string().min(1, "Vui lòng chọn nông hộ"),
  importPrice: requiredPrice,
});

export const productSchema = z.object({
  // Bước 1 — Thông tin cơ bản
  name: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm"),
  sku: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã sản phẩm")
    .regex(/^[A-Za-z0-9-]+$/, "Chỉ gồm chữ, số và dấu gạch ngang"),
  category: z.string().min(1, "Vui lòng chọn nhóm sản phẩm"),
  description: z.string().optional(),
  shelfLife: z.string().optional(),
  storage: z.string().optional(),
  certifications: z.array(z.string()),
  // Bước 2 — Hình ảnh
  images: z.array(z.string()).min(1, "Cần ít nhất 1 ảnh sản phẩm").max(8, "Tối đa 8 ảnh"),
  // Bước 3 — Quy cách & giá
  variants: z
    .array(variantSchema)
    .min(1, "Cần ít nhất 1 quy cách")
    .refine((vs) => new Set(vs.map((v) => v.name.trim().toLowerCase())).size === vs.length, "Quy cách bị trùng tên"),
  // Bước 4 — Nông hộ cung cấp
  suppliers: z
    .array(supplierSchema)
    .refine((ss) => new Set(ss.map((s) => s.farmId)).size === ss.length, "Mỗi nông hộ chỉ chọn một lần"),
});

export type ProductFormValues = z.input<typeof productSchema>;
export type VariantFormValues = ProductFormValues["variants"][number];

export const EMPTY_VARIANT: VariantFormValues = { name: "", price: "", originalPrice: "" };
export const EMPTY_SUPPLIER: ProductFormValues["suppliers"][number] = { farmId: "", importPrice: "" };

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "",
  sku: "",
  category: "",
  description: "",
  images: [],
  variants: [EMPTY_VARIANT],
  shelfLife: "",
  storage: "",
  certifications: [],
  suppliers: [],
};

/** Older products only have the flat price / salePrice / packaging / farmId fields */
export const productToFormValues = (p: Product): ProductFormValues => ({
  name: p.name,
  sku: p.sku,
  category: p.category,
  description: p.description ?? "",
  images: p.images ?? [],
  variants: p.variants?.length
    ? p.variants.map((v) => ({ name: v.name, price: String(v.price), originalPrice: v.originalPrice ? String(v.originalPrice) : "" }))
    : [
        {
          name: p.packaging ?? "",
          price: String(p.salePrice ?? p.price),
          originalPrice: p.salePrice ? String(p.price) : "",
        },
      ],
  shelfLife: p.shelfLife ?? "",
  storage: p.storage ?? "",
  certifications: p.certifications ?? [],
  suppliers: p.suppliers?.length
    ? p.suppliers.map((s) => ({ farmId: s.farmId, importPrice: String(s.importPrice) }))
    : p.farmId
      ? [{ farmId: p.farmId, importPrice: "" }]
      : [],
});

export const formValuesToInput = (values: ProductFormValues): ProductInput => {
  const v = productSchema.parse(values);
  const variants = v.variants.map((x) => ({ ...x, originalPrice: x.originalPrice ?? null }));
  const first = variants[0];
  return {
    ...v,
    variants,
    // Flat fields mirror the first quy cách / supplier for list views and reports
    price: first.originalPrice ?? first.price,
    salePrice: first.originalPrice ? first.price : null,
    packaging: first.name,
    farmId: v.suppliers[0]?.farmId ?? null,
  };
};
