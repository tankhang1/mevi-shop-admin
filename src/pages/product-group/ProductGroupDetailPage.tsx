import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowRightLeft, ListPlus, Pencil, Trash2 } from "lucide-react";
import { Button, Card, DataTable, useIsMobile } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useCatalogProducts, useCategory } from "@/features/shop-catalog";
import { useTableParams } from "@/hooks/useTableParams";
import { fromSpringPage, toSpringPageParams } from "@/lib/pagination";
import { CatalogProductMobileCard } from "@/pages/product/components/CatalogProductMobileCard";
import { catalogProductColumns } from "@/pages/product/components/catalog-product-columns";
import { AssignProductsDialog } from "./components/AssignProductsDialog";
import { MoveProductsDialog } from "./components/MoveProductsDialog";
import { DeleteProductGroupDialog } from "./components/DeleteProductGroupDialog";
import { ProductGroupFormDialog } from "./components/ProductGroupFormDialog";
import { GroupThumb } from "./ProductGroupListPage";

export default function ProductGroupDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id) || undefined;
  const [, navigate] = useLocation();
  const { data: group, isLoading, isError } = useCategory(id);
  // A product belongs to exactly one category — members come from the product list filtered by it
  const isMobile = useIsMobile();
  const table = useTableParams();
  const { data: products, isFetching } = useCatalogProducts(toSpringPageParams({ ...table.params, categoryId: id }));
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  // undefined = closed; [] = open with nothing ticked; [id] = opened from a row
  const [moving, setMoving] = useState<number[] | undefined>();

  usePageActions(
    () =>
      group && (
        <>
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-1.5 h-4 w-4" /> Sửa
          </Button>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleting(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Xoá
          </Button>
        </>
      ),
    [group?.id],
  );

  if (isLoading) return <LoadingBlock />;
  if (isError || !group) return <EmptyBlock>Không tìm thấy nhóm sản phẩm.</EmptyBlock>;


  return (
    <div className="space-y-4">
      <BackLink to={ROUTES.productGroups} label="Nhóm sản phẩm" />

      <Card className="flex items-start gap-4 p-4 sm:p-5">
        <GroupThumb group={group} size="h-20 w-20" />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{group.name}</h2>
          <p className="font-mono text-xs text-muted-foreground">{group.handle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{group.description || "Chưa có mô tả."}</p>
        </div>
      </Card>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-semibold">Sản phẩm trong nhóm</h3>
            <p className="text-sm text-muted-foreground">{group.productCount} sản phẩm</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMoving([])} disabled={!group.productCount}>
              <ArrowRightLeft className="mr-1.5 h-4 w-4" /> Chuyển nhóm
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAssigning(true)}>
              <ListPlus className="mr-1.5 h-4 w-4" /> Thêm sản phẩm
            </Button>
          </div>
        </div>

        <DataTable
          {...table.bind(fromSpringPage(products), isFetching)}
          // Same columns as the product list, minus the category (it's this group)
          columns={catalogProductColumns.filter((c) => c.key !== "category")}
          searchPlaceholder="Tìm trong nhóm theo tên, mã, SKU..."
          enableMobileCard
          renderMobileCard={(p, helpers) => <CatalogProductMobileCard product={p} helpers={helpers} />}
          columnToggleable={!isMobile}
          onView={(p) => navigate(ROUTES.productDetail(String(p.id)))}
          onEdit={(p) => navigate(ROUTES.productEdit(String(p.id)))}
          rowActions={[{ key: "move", label: "Chuyển nhóm", icon: ArrowRightLeft, onClick: (p) => setMoving([p.id]) }]}
        />
        {!isFetching && products?.totalElements === 0 && !table.params.keyword && (
          <p className="mt-3 text-sm text-muted-foreground">
            Nhóm chưa có sản phẩm nào. Bấm “Thêm sản phẩm” hoặc chọn nhóm này trong form tạo / sửa sản phẩm.
          </p>
        )}
      </section>

      <MoveProductsDialog
        group={group}
        open={!!moving}
        onOpenChange={(o) => !o && setMoving(undefined)}
        initialIds={moving}
      />
      <AssignProductsDialog group={group} open={assigning} onOpenChange={setAssigning} />
      <ProductGroupFormDialog open={editing} onOpenChange={setEditing} group={group} />
      <DeleteProductGroupDialog
        group={deleting ? group : null}
        onOpenChange={setDeleting}
        onDeleted={() => navigate(ROUTES.productGroups)}
      />
    </div>
  );
}
