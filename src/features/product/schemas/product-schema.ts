import { z } from "zod";
import type { Product, ProductInput } from "../types";

/** "" from an empty number input → undefined, so it reports "Vui lòng nhập giá" instead of "> 0" */
const emptyToUndefined = (v: unknown) =>
  v === "" || v === null ? undefined : v;

const requiredPrice = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ message: "Vui lòng nhập giá" })
    .int()
    .positive("Giá phải lớn hơn 0"),
);

const optionalPrice = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int().positive("Giá phải lớn hơn 0").optional(),
);

/** Nông sản: amount of the base unit in one pack — can be fractional (0.5 kg) */
const optionalBaseQuantity = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ message: "Vui lòng nhập số hợp lệ" })
    .positive("Phải lớn hơn 0")
    .optional(),
);

const variantSchema = z
  .object({
    name: z.string().trim().min(1, "Vui lòng nhập quy cách"),
    price: requiredPrice,
    originalPrice: optionalPrice,
    baseQuantity: optionalBaseQuantity,
  })
  .refine((v) => !v.originalPrice || v.originalPrice > v.price, {
    path: ["originalPrice"],
    message: "Giá gốc phải lớn hơn giá bán",
  });

const supplierSchema = z.object({
  farmId: z.string().min(1, "Vui lòng chọn nông hộ"),
  importPrice: optionalPrice,
});

/** A vườn linked to a nông sản product; crop & base unit come from the product */
const sourceSchema = z.object({
  farmId: z.string().min(1, "Vui lòng chọn nông hộ"),
  regionId: z.string().min(1, "Vui lòng chọn vườn"),
  cropId: z.string().optional(),
  baseUnit: z.enum(["kg", "lit"]).optional(),
  importPrice: optionalPrice,
});

export const productSchema = z
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
    shelfLife: z.string().optional(),
    storage: z.string().optional(),
    certifications: z.array(z.string()),
    // Bước 1 — Nông sản: Nông hộ -> Vườn -> Cây trồng, đơn vị cơ bản kg / lit
    isAgricultural: z.boolean(),
    farmId: z.string().optional(),
    regionId: z.string().optional(),
    cropId: z.string().optional(),
    baseUnit: z.enum(["kg", "lit"]),
    // Bước 2 — Hình ảnh
    images: z
      .array(z.string())
      .min(1, "Cần ít nhất 1 ảnh sản phẩm")
      .max(8, "Tối đa 8 ảnh"),
    // Bước 3 — Quy cách & giá
    variants: z
      .array(variantSchema)
      .min(1, "Cần ít nhất 1 quy cách")
      .refine(
        (vs) =>
          new Set(vs.map((v) => v.name.trim().toLowerCase())).size ===
          vs.length,
        "Quy cách bị trùng tên",
      ),
    // Sản phẩm cũ vẫn giữ danh sách nông hộ (không còn nhập ở form)
    suppliers: z
      .array(supplierSchema)
      .refine(
        (ss) => new Set(ss.map((s) => s.farmId)).size === ss.length,
        "Mỗi nông hộ chỉ chọn một lần",
      ),
    // Bước 4 — Nguồn cung: các vườn liên kết (chỉ nông sản)
    sources: z.array(sourceSchema),
  })
  .superRefine((v, ctx) => {
    if (!v.isAgricultural) return;
    if (!v.farmId) {
      ctx.addIssue({
        code: "custom",
        path: ["farmId"],
        message: "Vui lòng chọn nông hộ",
      });
    }
    if (!v.regionId) {
      ctx.addIssue({
        code: "custom",
        path: ["regionId"],
        message: "Vui lòng chọn vườn canh tác",
      });
    }
    if (!v.cropId) {
      ctx.addIssue({
        code: "custom",
        path: ["cropId"],
        message: "Vui lòng chọn cây trồng / giống",
      });
    }
    if (v.sources.length < 1 && !v.regionId) {
      ctx.addIssue({
        code: "custom",
        path: ["sources"],
        message: "Cần liên kết ít nhất 1 vườn",
      });
    } else if (
      v.sources.length > 0 &&
      new Set(v.sources.map((s) => s.regionId)).size !== v.sources.length
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["sources"],
        message: "Mỗi vườn chỉ liên kết một lần",
      });
    }
  });

export type ProductFormValues = z.input<typeof productSchema>;
export type VariantFormValues = ProductFormValues["variants"][number];
export type SourceFormValues = ProductFormValues["sources"][number];

export const EMPTY_VARIANT: VariantFormValues = {
  name: "",
  price: "",
  originalPrice: "",
  baseQuantity: "",
};
export const EMPTY_SUPPLIER: ProductFormValues["suppliers"][number] = {
  farmId: "",
  importPrice: "",
};
export const EMPTY_SOURCE: SourceFormValues = {
  farmId: "",
  regionId: "",
  cropId: "",
  baseUnit: "kg",
  importPrice: "",
};

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
  isAgricultural: false,
  farmId: "",
  regionId: "",
  cropId: "",
  baseUnit: "kg",
  suppliers: [],
  sources: [],
};

/** Older products only have the flat price / salePrice / packaging / farmId fields */
export const productToFormValues = (p: Product): ProductFormValues => ({
  name: p.name,
  sku: p.sku,
  category: p.category,
  description: p.description ?? "",
  images: p.images ?? [],
  variants: p.variants?.length
    ? p.variants.map((v) => ({
        name: v.name,
        price: String(v.price),
        originalPrice: v.originalPrice ? String(v.originalPrice) : "",
        baseQuantity: v.baseQuantity ? String(v.baseQuantity) : "",
      }))
    : [
        {
          name: p.packaging ?? "",
          price: String(p.salePrice ?? p.price),
          originalPrice: p.salePrice ? String(p.price) : "",
          baseQuantity: "",
        },
      ],
  shelfLife: p.shelfLife ?? "",
  storage: p.storage ?? "",
  certifications: p.certifications ?? [],
  isAgricultural: !!p.isAgricultural,
  farmId: p.farmId
    ? String(p.farmId)
    : p.sources?.[0]?.farmId
      ? String(p.sources[0].farmId)
      : "",
  regionId: p.regionId
    ? String(p.regionId)
    : p.sources?.[0]?.regionId
      ? String(p.sources[0].regionId)
      : "",
  cropId: p.cropId ? String(p.cropId) : "",
  baseUnit: p.baseUnit ?? "kg",
  suppliers: p.suppliers?.length
    ? p.suppliers.map((s) => ({
        farmId: s.farmId,
        importPrice: s.importPrice ? String(s.importPrice) : "",
      }))
    : p.farmId
      ? [{ farmId: p.farmId, importPrice: "" }]
      : [],
  sources: (p.sources ?? []).map((s) => ({
    farmId: s.farmId,
    regionId: String(s.regionId),
    cropId: p.cropId ? String(p.cropId) : "",
    baseUnit: p.baseUnit ?? "kg",
    importPrice: s.importPrice ? String(s.importPrice) : "",
  })),
});

export const formValuesToInput = (values: ProductFormValues): ProductInput => {
  const {
    sources: formSources,
    cropId,
    farmId,
    regionId,
    ...v
  } = productSchema.parse(values);
  const variants = v.variants.map((x) => ({
    name: x.name,
    price: x.price,
    originalPrice: x.originalPrice ?? null,
    baseQuantity: v.isAgricultural ? (x.baseQuantity ?? null) : null,
  }));
  const first = variants[0];
  const primarySource =
    farmId && regionId
      ? [
          {
            farmId,
            regionId: Number(regionId),
            cropId: cropId ? Number(cropId) : undefined,
            baseUnit: v.baseUnit,
            importPrice: 0,
          },
        ]
      : [];
  const extraSources = formSources.map((s) => ({
    farmId: s.farmId,
    regionId: Number(s.regionId),
    cropId: cropId ? Number(cropId) : undefined,
    baseUnit: v.baseUnit,
    importPrice: s.importPrice ?? 0,
  }));
  const sources = v.isAgricultural ? [...primarySource, ...extraSources] : [];
  // Nông sản: the supplier list mirrors the linked vườn's farms so older views / reports keep working
  const suppliers = v.isAgricultural
    ? sources
        .filter((s, i) => sources.findIndex((x) => x.farmId === s.farmId) === i)
        .map((s) => ({ farmId: s.farmId, importPrice: 0 }))
    : v.suppliers.map((s) => ({
        farmId: s.farmId,
        importPrice: s.importPrice ?? 0,
      }));
  return {
    ...v,
    variants,
    suppliers,
    sources,
    farmId: v.isAgricultural
      ? farmId || sources[0]?.farmId || null
      : (suppliers[0]?.farmId ?? null),
    regionId: v.isAgricultural
      ? regionId
        ? Number(regionId)
        : (sources[0]?.regionId ?? null)
      : null,
    cropId: v.isAgricultural && cropId ? Number(cropId) : null,
    baseUnit: v.isAgricultural ? v.baseUnit : null,
    // Flat fields mirror the first quy cách / supplier for list views and reports
    price: first.originalPrice ?? first.price,
    salePrice: first.originalPrice ? first.price : null,
    packaging: first.name,
  };
};
