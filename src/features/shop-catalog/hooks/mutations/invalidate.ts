import { useQueryClient } from "@tanstack/react-query";
import { catalogKeys } from "../query-keys";

/** Category name shows on product rows too */
export function useInvalidateCategories() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: catalogKeys.categories() }),
      qc.invalidateQueries({ queryKey: catalogKeys.products() }),
    ]);
}

/** Product / stock changes affect product, inventory and movement views, and category `productCount` */
export function useInvalidateProducts() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: catalogKeys.products() }),
      qc.invalidateQueries({ queryKey: catalogKeys.categories() }),
      qc.invalidateQueries({ queryKey: catalogKeys.stock() }),
    ]);
}
