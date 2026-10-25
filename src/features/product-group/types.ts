import type { Product } from "@/features/product/types";
import type { ListParams } from "@/types/api";

/** Shop-defined collection shown as a section/filter on the storefront, e.g. "Quà Tết", "Gạo đặc sản" */
export interface ProductGroup {
  id: string;
  /** Owning seller; set from the token for shop admins, chosen in the form by root */
  shopId: string;
  /** Joined by the backend for list/detail views */
  shopName?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  productIds: string[];
  createdAt: string;
}

/** Detail view also joins the member products */
export interface ProductGroupDetail extends ProductGroup {
  products: Product[];
}

export type ProductGroupInput = Pick<ProductGroup, "name" | "description" | "imageUrl"> & { shopId?: string };

export interface ProductGroupListParams extends ListParams {
  /** Root only — shop admins are always scoped to their own shop */
  shopId?: string;
}
