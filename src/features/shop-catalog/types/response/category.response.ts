export interface ProductCategory {
  id: number;
  name: string;
  handle: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  /** Non-deleted products (ACTIVE + INACTIVE); delete → 409 while > 0 */
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRef {
  id: number;
  name: string;
  handle: string;
}
