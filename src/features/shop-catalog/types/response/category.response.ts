export interface ProductCategory {
  id: number;
  name: string;
  handle: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRef {
  id: number;
  name: string;
  handle: string;
}
