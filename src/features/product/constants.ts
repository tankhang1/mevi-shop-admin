import type { ProductStatus } from "./types";

export const PRODUCT_STATUS: Record<ProductStatus, { label: string; className: string }> = {
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Đã duyệt", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Từ chối", className: "bg-red-100 text-red-700" },
};

export const PRODUCT_CATEGORIES = ["Gạo", "Cà phê", "Trà", "Mật ong", "Gia vị", "Hạt", "Trái cây sấy", "Khác"];

export const PRODUCT_CERTIFICATIONS = ["VietGAP", "GlobalGAP", "Hữu cơ", "OCOP 3 sao", "OCOP 4 sao", "OCOP 5 sao", "HACCP", "ISO 22000"];

export const PRODUCT_IMAGE = {
  maxSize: 8 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/webp"],
};
