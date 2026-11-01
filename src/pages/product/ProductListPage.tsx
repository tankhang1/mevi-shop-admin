import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CirclePause, CirclePlay, Package, Plus } from "lucide-react";
import { Button, DataTable, DeleteDialog, StatsCard, useIsMobile, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { ROUTES } from "@/config/routes";
import {
  type CatalogProductListItem,
  type CatalogProductListParams,
  type ProductStatus,
  isStorefrontSyncError,
  useCatalogProducts,
  useCategories,
  useDeleteCatalogProduct,
} from "@/features/shop-catalog";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { cleanFilters, fromSpringPage, toSpringPageParams } from "@/lib/pagination";
import { CatalogProductMobileCard } from "./components/CatalogProductMobileCard";
import { ProductMobileSummary } from "./components/ProductMobileSummary";
import { catalogProductColumns, catalogProductFilters } from "./components/catalog-product-columns";

type Filters = { status: "all" | ProductStatus; categoryId: string; agricultural: string; lowStock: string };

/** Table filter strings → API query */
function toQuery({ page, size, keyword, ...f }: { page?: number; size?: number; keyword?: string } & Filters) {
  const c = cleanFilters(f);
  return toSpringPageParams({
    page,
    size,
    keyword,
    status: c.status as ProductStatus | undefined,
    categoryId: c.categoryId ? Number(c.categoryId) : undefined,
    agricultural: c.agricultural ? c.agricultural === "true" : undefined,
    lowStock: c.lowStock ? c.lowStock === "true" : undefined,
  }) satisfies CatalogProductListParams;
}

/** No stats endpoint — the counts are the `totalElements` of size-1 list calls */
function useStatusCounts() {
  const all = useCatalogProducts({ size: 1 });
  const active = useCatalogProducts({ size: 1, status: "ACTIVE" });
  const inactive = useCatalogProducts({ size: 1, status: "INACTIVE" });
  if (!all.data || !active.data || !inactive.data) return undefined;
  return { total: all.data.totalElements, active: active.data.totalElements, inactive: inactive.data.totalElements };
}

export default function ProductListPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const table = useTableParams<Filters>({ status: "all", categoryId: "all", agricultural: "all", lowStock: "all" });
  const { data, isFetching } = useCatalogProducts(toQuery(table.params));
  const page = fromSpringPage(data);
  const stats = useStatusCounts();
  const { data: categories } = useCategories();
  const del = useDeleteCatalogProduct();
  const [target, setTarget] = useState<CatalogProductListItem | null>(null);

  usePageActions(() => (
    <Button asChild className="h-8! min-h-8! px-3! text-sm max-md:rounded-full md:h-10! md:min-h-10! md:px-4!">
      <Link href={ROUTES.productCreate}>
        {/* The mobile title row already says "Danh mục sản phẩm" — keep the button short there.
            max-md:* instead of hidden/md:inline: shared-ui's prebuilt `.hidden`/`.rounded-full` load later and win */}
        <Plus className="mr-1 h-4 w-4" /> <span className="md:hidden">Thêm</span>
        <span className="max-md:hidden">Thêm sản phẩm</span>
      </Link>
    </Button>
  ));

  const confirmDelete = async () => {
    if (!target) return;
    try {
      await del.mutateAsync(target.id);
      toast({ title: "Đã xoá sản phẩm", description: target.title });
      setTarget(null);
    } catch (e) {
      toast({
        variant: "destructive",
        title: isStorefrontSyncError(e) ? "Chưa cập nhật được trang shop, vui lòng thử lại" : "Không thể xoá",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <div className="space-y-5">
      {isMobile ? (
        <ProductMobileSummary
          stats={stats}
          status={table.state.filters.status}
          onStatusChange={(s) => table.bind(page, isFetching).onFilterChange("status", s)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Tổng sản phẩm" value={stats?.total ?? "—"} icon={Package} />
          <StatsCard title="Đang kinh doanh" value={stats?.active ?? "—"} icon={CirclePlay} />
          <StatsCard title="Tạm ngưng kinh doanh" value={stats?.inactive ?? "—"} icon={CirclePause} />
        </div>
      )}

      <DataTable
        {...table.bind(page, isFetching)}
        columns={catalogProductColumns}
        filters={catalogProductFilters(categories).filter((f) => !isMobile || f.key !== "status")}
        searchPlaceholder="Tìm theo tên, mã sản phẩm, SKU..."
        enableMobileCard
        renderMobileCard={(p, helpers) => <CatalogProductMobileCard product={p} helpers={helpers} />}
        // Status lives in the chips on mobile; column toggle / export aren't useful on a phone
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        onView={(p) => navigate(ROUTES.productDetail(String(p.id)))}
        onEdit={(p) => navigate(ROUTES.productEdit(String(p.id)))}
        onDelete={setTarget}
      />

      <DeleteDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title="Xoá sản phẩm?"
        description={`Sản phẩm "${target?.title ?? ""}" sẽ bị xoá khỏi admin và cửa hàng. Mã sản phẩm và SKU không dùng lại được.`}
        onConfirm={() => void confirmDelete()}
        loading={del.isPending}
      />
    </div>
  );
}
