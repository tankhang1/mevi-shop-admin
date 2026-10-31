import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CirclePause, CirclePlay, Package, Plus } from "lucide-react";
import { Button, DataTable, DeleteDialog, StatsCard, useIsMobile, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { ROUTES } from "@/config/routes";
import {
  type Product,
  type ProductListParams,
  useDeleteProduct,
  useProductStats,
  useProducts,
} from "@/features/product";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { ProductMobileCard } from "./components/ProductMobileCard";
import { ProductMobileSummary } from "./components/ProductMobileSummary";
import { productColumns, productFilters } from "./components/product-columns";

export default function ProductListPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const shopFilter = useShopFilter();
  const table = useTableParams<Pick<ProductListParams, "listed" | "category"> & { shopId: string }>({
    listed: "all",
    shopId: shopFilter.initialShopId,
  });
  const { data: page, isFetching } = useProducts(table.params);
  const { data: stats } = useProductStats();
  const del = useDeleteProduct();
  const [target, setTarget] = useState<Product | null>(null);

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
      toast({ title: "Đã xoá sản phẩm", description: target.name });
      setTarget(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể xoá", description: getErrorMessage(e) });
    }
  };

  return (
    <div className="space-y-5">
      {isMobile ? (
        <ProductMobileSummary
          stats={stats}
          listed={table.state.filters.listed ?? "all"}
          onListedChange={(s) => table.bind(page, isFetching).onFilterChange("listed", s)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Tổng sản phẩm" value={stats?.total ?? "—"} icon={Package} />
          <StatsCard title="Đang kinh doanh" value={stats?.listed ?? "—"} icon={CirclePlay} />
          <StatsCard title="Tạm ngưng kinh doanh" value={stats ? stats.total - stats.listed : "—"} icon={CirclePause} />
        </div>
      )}

      <DataTable
        {...table.bind(page, isFetching)}
        columns={[...productColumns.slice(0, 2), ...shopFilter.column<Product>(), ...productColumns.slice(2)]}
        filters={[
          ...(shopFilter.filter ? [shopFilter.filter] : []),
          ...productFilters.filter((f) => !isMobile || f.key !== "listed"),
        ]}
        searchPlaceholder="Tìm theo tên, mã sản phẩm..."
        enableMobileCard
        renderMobileCard={(p, helpers) => <ProductMobileCard product={p} helpers={helpers} />}
        // Status lives in the chips on mobile; column toggle / export aren't useful on a phone
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        onView={(p) => navigate(ROUTES.productDetail(p.id))}
        onEdit={(p) => navigate(ROUTES.productEdit(p.id))}
        onDelete={setTarget}
      />

      <DeleteDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title="Xoá sản phẩm?"
        description={`Sản phẩm "${target?.name ?? ""}" sẽ bị xoá vĩnh viễn và không thể khôi phục.`}
        onConfirm={() => void confirmDelete()}
        loading={del.isPending}
      />
    </div>
  );
}
