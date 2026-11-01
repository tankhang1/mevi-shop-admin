/** `a-z0-9-`, no leading/trailing `-`, no `--` (category + product handle) */
export const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Field limits from BE notice §1.2 */
export const CATEGORY_LIMITS = {
  name: 255,
  handle: 80,
  description: 1000,
  imageUrl: 1000,
} as const;

/** `code` / `sku`: letters, digits and `-` `_` `.` */
export const CODE_PATTERN = /^[A-Za-z0-9._-]+$/;

/** Field limits from BE notice §2.3 */
export const PRODUCT_LIMITS = {
  title: 255,
  code: 64,
  handle: 80,
  description: 20000,
  tags: 20,
  certifications: 20,
  media: 20,
  storageInstructions: 1000,
  supplySources: 50,
  variants: 100,
  variantTitle: 255,
  sku: 64,
} as const;

export const PRODUCT_STATUS_LABEL = {
  ACTIVE: "Đang kinh doanh",
  INACTIVE: "Tạm ngưng kinh doanh",
} as const;

export const SHELF_LIFE_UNIT_LABEL = { DAY: "Ngày", WEEK: "Tuần", MONTH: "Tháng", YEAR: "Năm" } as const;

export const STORAGE_CONDITION_LABEL = {
  AMBIENT: "Nhiệt độ thường",
  CHILLED: "Bảo quản mát",
  FROZEN: "Đông lạnh",
} as const;

export const BASE_UNIT_LABEL = { KG: "Kilogram (kg)", LITER: "Lít (lit)" } as const;
export const BASE_UNIT_SHORT = { KG: "kg", LITER: "lít" } as const;

/** Quick picks for the free-text `certifications` list */
export const CERTIFICATION_SUGGESTIONS = ["VietGAP", "GlobalGAP", "Hữu cơ", "OCOP 3 sao", "OCOP 4 sao", "OCOP 5 sao", "HACCP", "ISO 22000"];

export const MOVEMENT_STATUS_STYLE = {
  PENDING: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-800" },
  APPROVED: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-800" },
  REJECTED: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Nông hộ đã huỷ", className: "bg-slate-100 text-slate-600" },
} as const;

export const MOVEMENT_TYPE_STYLE = {
  RECEIPT: { label: "Nhập hàng", className: "bg-emerald-100 text-emerald-800" },
  ADJUSTMENT: { label: "Điều chỉnh", className: "bg-sky-100 text-sky-800" },
} as const;

/** Stock quantity / unit cost limits (§2.5) */
export const STOCK_LIMITS = { quantity: 100_000_000, note: 1000 } as const;

export const STOCK_STATUS_STYLE = {
  IN_STOCK: { label: "Còn hàng", className: "bg-emerald-100 text-emerald-800" },
  LOW_STOCK: { label: "Sắp hết", className: "bg-amber-100 text-amber-800" },
  OUT_OF_STOCK: { label: "Hết hàng", className: "bg-red-100 text-red-700" },
} as const;
