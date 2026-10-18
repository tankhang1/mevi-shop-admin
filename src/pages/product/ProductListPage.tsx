import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DataTable,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { PageHeader } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { type Product, type ProductListParams, useDeleteProduct, useProducts } from "@/features/product";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { productColumns, productFilters } from "./components/product-columns";

export default function ProductListPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const table = useTableParams<Pick<ProductListParams, "status" | "category">>({ status: "all" });
  const { data: page, isFetching } = useProducts(table.params);
  const del = useDeleteProduct();
  const [target, setTarget] = useState<Product | null>(null);

  const confirmDelete = async () => {
    if (!target) return;
    try {
      await del.mutateAsync(target.id);
      toast({ title: "Đã xoá sản phẩm", description: target.name });
      setTarget(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  return (
    <>
      <PageHeader
        description={`${page?.total ?? 0} sản phẩm`}
        actions={
          <Button asChild>
            <Link href={ROUTES.productCreate}>
              <Plus className="mr-1 h-4 w-4" /> Thêm sản phẩm
            </Link>
          </Button>
        }
      />
      <DataTable
        {...table.bind(page, isFetching)}
        columns={productColumns}
        filters={productFilters}
        searchPlaceholder="Tìm theo tên, SKU..."
        enableMobileCard
        onEdit={(p) => navigate(ROUTES.productEdit(p.id))}
        onDelete={setTarget}
      />

      <AlertDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>Sản phẩm "{target?.name}" sẽ bị xoá vĩnh viễn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              disabled={del.isPending}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
