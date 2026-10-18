import { useSearch } from "wouter";
import type { Column, TableFilterDef } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { useAccess } from "@/features/auth";
import { useShops } from "./use-shops";

/**
 * Root-only "Gian hàng" column + filter for product/order tables.
 * Shop admins get nothing — their lists are already scoped server-side.
 * `initialShopId` comes from `?shopId=` (links from the shop detail page).
 */
export function useShopFilter() {
  const { isRoot } = useAccess();
  const search = useSearch();
  const { data: shops } = useShops({ size: 100 }, isRoot);
  const initialShopId = (isRoot && new URLSearchParams(search).get("shopId")) || "all";

  const filter: TableFilterDef | null = isRoot
    ? { key: "shopId", label: "Gian hàng", options: (shops?.items ?? []).map((s) => ({ label: s.name, value: s.id })) }
    : null;

  function column<T extends { shopName?: string }>(): Column<T>[] {
    return isRoot
      ? [{ key: "shopName", label: "Gian hàng", render: (v) => <span className="whitespace-nowrap text-sm">{String(v ?? "—")}</span> }]
      : [];
  }

  const shopName = (id: string) => shops?.items.find((s) => s.id === id)?.name;

  return { isRoot, initialShopId, filter, column, shopName };
}
