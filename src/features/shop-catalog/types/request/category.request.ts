export interface CategoryListParams {
  /** Matches name or handle, case-insensitive */
  keyword?: string;
}

export interface ProductCategoryInput {
  name: string;
  /** Empty: generated from name on create, kept on update */
  handle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
}
