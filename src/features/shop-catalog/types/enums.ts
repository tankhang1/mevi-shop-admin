export type ProductStatus = "ACTIVE" | "INACTIVE";
export type ShelfLifeUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";
export type StorageCondition = "AMBIENT" | "CHILLED" | "FROZEN";
/** Đơn vị tính. Nông sản chỉ KG / LITER */
export type BaseUnit = "KG" | "GRAM" | "LITER" | "ML" | "PIECE" | "BOX" | "BOTTLE" | "PACK" | "BAG";
export type AgriBaseUnit = Extract<BaseUnit, "KG" | "LITER">;

export type StockMovementType = "RECEIPT" | "ADJUSTMENT";
export type StockMovementSource = "MEVI" | "FARM";
export type StockMovementStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type StockMovementChannel = "FARM" | "ADMIN";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type PhotoFormat = "JPEG" | "WEBP";
