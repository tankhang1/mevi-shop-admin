import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, Clock, Package, Plus, Store, XCircle } from "lucide-react";
import { Button, DataTable, DeleteDialog, StatsCard, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
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
import { productColumns, productFilters } from "./components/product-columns";

export default function ProductListPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const shopFilter = useShopFilter();
  const table = useTableParams<Pick<ProductListParams, "status" | "category"> & { shopId: string }>({
    status: "all",
    shopId: shopFilter.initialShopId,
  });
  const { data: page, isFetching } = useProducts(table.params);
  const { data: stats } = useProductStats();
  const del = useDeleteProduct();
  const [target, setTarget] = useState<Product | null>(null);

  usePageActions(() => (
    <Button asChild>
      <Link href={ROUTES.productCreate}>
        <Plus className="mr-1 h-4 w-4" /> Thêm sản phẩm
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard title="Tổng sản phẩm" value={stats?.total ?? "—"} icon={Package} />
        <StatsCard title="Đã duyệt" value={stats?.approved ?? "—"} icon={CheckCircle2} />
        <StatsCard title="Đang lên kệ" value={stats?.listed ?? "—"} icon={Store} />
        <StatsCard title="Chờ duyệt" value={stats?.pending ?? "—"} icon={Clock} />
        <StatsCard title="Bị từ chối" value={stats?.rejected ?? "—"} icon={XCircle} />
      </div>

      <DataTable
        {...table.bind(page, isFetching)}
        columns={[...productColumns.slice(0, 2), ...shopFilter.column<Product>(), ...productColumns.slice(2)]}
        filters={shopFilter.filter ? [shopFilter.filter, ...productFilters] : productFilters}
        searchPlaceholder="Tìm theo tên, SKU..."
        enableMobileCard
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
