import { z } from "zod";
import { CODE_PATTERN, HANDLE_PATTERN, PRODUCT_LIMITS as L } from "../constants";
import type { CatalogProduct, CatalogProductInput } from "../types";

/** "" from an empty number input → undefined, so "required" reads better than "invalid number" */
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v);

const requiredPrice = z.preprocess(
  emptyToUndefined,
  z.coerce.number({ message: "Vui lòng nhập giá" }).int("Giá phải là số nguyên").min(0, "Giá không được âm"),
);
const optionalPrice = z.preprocess(
  emptyToUndefined,
  z.coerce.number().int("Giá phải là số nguyên").min(0, "Giá không được âm").optional(),
);
const max = (n: number) => `Tối đa ${n} ký tự`;

const variantSchema = z
  .object({
    /** Existing variant id (edit) — kept as string so the form stays plain */
    id: z.string(),
    title: z.string().trim().min(1, "Vui lòng nhập quy cách").max(L.variantTitle, max(L.variantTitle)),
    sku: z
      .string()
      .trim()
      .max(L.sku, max(L.sku))
      .refine((v) => !v || CODE_PATTERN.test(v), "Chỉ gồm chữ, số và - _ ."),
    price: requiredPrice,
    compareAtPrice: optionalPrice,
  })
  .refine((v) => v.compareAtPrice == null || v.compareAtPrice > v.price, {
    path: ["compareAtPrice"],
    message: "Giá gốc phải lớn hơn giá bán",
  });

const mediaSchema = z.object({ url: z.string(), thumbnailUrl: z.string().nullable() });

/** `workspaceId` drives the Nông hộ → Vườn pickers; the `*Name` fields are display-only. Neither is sent. */
const supplySourceSchema = z.object({
  workspaceId: z.string().min(1, "Vui lòng chọn nông hộ"),
  workspaceName: z.string(),
  productionZoneId: z.string().min(1, "Vui lòng chọn vườn"),
  zoneName: z.string(),
  productionSubjectId: z.string().min(1, "Vui lòng chọn cây trồng"),
  subjectName: z.string(),
  baseUnit: z.enum(["KG", "LITER"]),
});

export const catalogProductSchema = z
  .object({
    title: z.string().trim().min(1, "Vui lòng nhập tên sản phẩm").max(L.title, max(L.title)),
    code: z
      .string()
      .trim()
      .max(L.code, max(L.code))
      .refine((v) => !v || CODE_PATTERN.test(v), "Chỉ gồm chữ, số và - _ ."),
    handle: z
      .string()
      .trim()
      .toLowerCase()
      .max(L.handle, max(L.handle))
      .refine((v) => !v || HANDLE_PATTERN.test(v), "Chỉ gồm a-z, 0-9 và dấu -"),
    categoryId: z.string().min(1, "Vui lòng chọn nhóm sản phẩm"),
    description: z.string().max(L.description, max(L.description)),
    active: z.boolean(),
    agricultural: z.boolean(),
    certifications: z.array(z.string()).max(L.certifications, `Tối đa ${L.certifications} chứng nhận`),
    /** No input yet — carried through so PUT (full overwrite) keeps existing tags */
    tags: z.array(z.string()),
    shelfLifeValue: z
      .string()
      .trim()
      .refine((v) => !v || (/^\d+$/.test(v) && +v >= 1 && +v <= 9999), "Từ 1 đến 9999"),
    shelfLifeUnit: z.enum(["", "DAY", "WEEK", "MONTH", "YEAR"]),
    storageCondition: z.enum(["", "AMBIENT", "CHILLED", "FROZEN"]),
    storageInstructions: z.string().max(L.storageInstructions, max(L.storageInstructions)),
    media: z.array(mediaSchema).min(1, "Cần ít nhất 1 ảnh sản phẩm").max(L.media, `Tối đa ${L.media} ảnh`),
    supplySources: z.array(supplySourceSchema).max(L.supplySources, `Tối đa ${L.supplySources} nguồn`),
    variants: z
      .array(variantSchema)
      .min(1, "Cần ít nhất 1 quy cách")
      .max(L.variants, `Tối đa ${L.variants} quy cách`)
      .refine((vs) => {
        const skus = vs.map((v) => v.sku.trim().toUpperCase()).filter(Boolean);
        return new Set(skus).size === skus.length;
      }, "SKU bị trùng giữa các quy cách"),
  })
  .superRefine((v, ctx) => {
    if (!!v.shelfLifeValue !== !!v.shelfLifeUnit) {
      ctx.addIssue({
        code: "custom",
        path: [v.shelfLifeValue ? "shelfLifeUnit" : "shelfLifeValue"],
        message: "Nhập cả số và đơn vị hạn sử dụng",
      });
    }
    if (!v.agricultural) return;
    if (!v.supplySources.length) {
      ctx.addIssue({ code: "custom", path: ["supplySources"], message: "Cần liên kết ít nhất 1 vườn" });
      return;
    }
    const pairs = v.supplySources.map((s) => `${s.productionZoneId}:${s.productionSubjectId}`);
    if (new Set(pairs).size !== pairs.length) {
      ctx.addIssue({ code: "custom", path: ["supplySources"], message: "Mỗi cặp vườn + cây trồng chỉ chọn một lần" });
    }
  });

export type CatalogProductFormValues = z.input<typeof catalogProductSchema>;
export type CatalogVariantFormValues = CatalogProductFormValues["variants"][number];
export type SupplySourceFormValues = CatalogProductFormValues["supplySources"][number];

export const EMPTY_CATALOG_VARIANT: CatalogVariantFormValues = {
  id: "",
  title: "",
  sku: "",
  price: "",
  compareAtPrice: "",
};

export const EMPTY_SUPPLY_SOURCE: SupplySourceFormValues = {
  workspaceId: "",
  workspaceName: "",
  productionZoneId: "",
  zoneName: "",
  productionSubjectId: "",
  subjectName: "",
  baseUnit: "KG",
};

export const EMPTY_CATALOG_PRODUCT: CatalogProductFormValues = {
  title: "",
  code: "",
  handle: "",
  categoryId: "",
  description: "",
  active: true,
  agricultural: false,
  certifications: [],
  tags: [],
  shelfLifeValue: "",
  shelfLifeUnit: "",
  storageCondition: "",
  storageInstructions: "",
  media: [],
  supplySources: [],
  variants: [EMPTY_CATALOG_VARIANT],
};

export const catalogProductToFormValues = (p: CatalogProduct): CatalogProductFormValues => ({
  title: p.title,
  code: p.code,
  handle: p.handle,
  categoryId: String(p.category.id),
  description: p.description ?? "",
  active: p.status === "ACTIVE",
  agricultural: p.agricultural,
  certifications: p.certifications,
  tags: p.tags,
  shelfLifeValue: p.shelfLifeValue ? String(p.shelfLifeValue) : "",
  shelfLifeUnit: p.shelfLifeUnit ?? "",
  storageCondition: p.storageCondition ?? "",
  storageInstructions: p.storageInstructions ?? "",
  media: p.media.map((m) => ({ url: m.url, thumbnailUrl: m.thumbnailUrl })),
  supplySources: p.supplySources.map((s) => ({
    workspaceId: String(s.workspace.id),
    workspaceName: s.workspace.name ?? "",
    productionZoneId: String(s.productionZone.id),
    zoneName: s.productionZone.name ?? "",
    productionSubjectId: String(s.productionSubject.id),
    subjectName: s.productionSubject.name ?? "",
    baseUnit: s.baseUnit,
  })),
  variants: p.variants.map((v) => ({
    id: String(v.id),
    title: v.title,
    sku: v.sku,
    price: String(v.price),
    compareAtPrice: v.compareAtPrice != null ? String(v.compareAtPrice) : "",
  })),
});

/** Empty → null so the backend applies its defaults (code / handle / sku generated or kept) */
export const catalogFormValuesToInput = (values: CatalogProductFormValues): CatalogProductInput => {
  const v = catalogProductSchema.parse(values);
  return {
    title: v.title,
    code: v.code || null,
    handle: v.handle || null,
    description: v.description.trim() || null,
    categoryId: Number(v.categoryId),
    agricultural: v.agricultural,
    status: v.active ? "ACTIVE" : "INACTIVE",
    tags: v.tags,
    certifications: v.certifications,
    // First image is the cover
    media: v.media.map((m, i) => ({ url: m.url, thumbnailUrl: m.thumbnailUrl, cover: i === 0 })),
    shelfLifeValue: v.shelfLifeValue ? Number(v.shelfLifeValue) : null,
    shelfLifeUnit: v.shelfLifeUnit || null,
    storageCondition: v.storageCondition || null,
    storageInstructions: v.storageInstructions.trim() || null,
    supplySources: v.agricultural
      ? v.supplySources.map((s) => ({
          productionZoneId: Number(s.productionZoneId),
          productionSubjectId: Number(s.productionSubjectId),
          baseUnit: s.baseUnit,
        }))
      : [],
    variants: v.variants.map((x) => ({
      ...(x.id && { id: Number(x.id) }),
      title: x.title,
      sku: x.sku || null,
      price: x.price,
      compareAtPrice: x.compareAtPrice ?? null,
    })),
  };
};
