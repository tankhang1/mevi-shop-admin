import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { ListPlus, Pencil, Trash2, X } from "lucide-react";
import { Button, Card, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { PRODUCT_STATUS } from "@/features/product";
import { useProductGroup, useSetGroupProducts } from "@/features/product-group";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";
import { AssignProductsDialog } from "./components/AssignProductsDialog";
import { DeleteProductGroupDialog } from "./components/DeleteProductGroupDialog";
import { ProductGroupFormDialog } from "./components/ProductGroupFormDialog";
import { GroupThumb } from "./ProductGroupListPage";

export default function ProductGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { data: group, isLoading, isError } = useProductGroup(id);
  const setProducts = useSetGroupProducts();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);

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

  const remove = async (productId: string, name: string) => {
    try {
      await setProducts.mutateAsync({ id: group.id, productIds: group.productIds.filter((x) => x !== productId) });
      toast({ title: "Đã gỡ khỏi nhóm", description: name });
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể gỡ", description: getErrorMessage(e) });
    }
  };

  return (
    <div className="space-y-4">
      <BackLink to={ROUTES.productGroups} label="Nhóm sản phẩm" />

      <Card className="flex items-start gap-4 p-4 sm:p-5">
        <GroupThumb group={group} size="h-20 w-20" />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{group.name}</h2>
          {group.shopName && <p className="text-xs text-muted-foreground">{group.shopName}</p>}
          <p className="mt-1 text-sm text-muted-foreground">{group.description || "Chưa có mô tả."}</p>
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Sản phẩm trong nhóm</h3>
            <p className="text-sm text-muted-foreground">{group.products.length} sản phẩm</p>
          </div>
          <Button size="sm" onClick={() => setAssigning(true)}>
            <ListPlus className="mr-1.5 h-4 w-4" /> Chọn sản phẩm
          </Button>
        </div>

        {group.products.length === 0 ? (
          <EmptyBlock>Nhóm chưa có sản phẩm nào. Bấm “Chọn sản phẩm” để thêm.</EmptyBlock>
        ) : (
          <ul className="divide-y">
            {group.products.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <img src={p.images[0] || placeholder} alt="" className="h-10 w-10 shrink-0 rounded-md border object-cover" />
                <Link href={ROUTES.productDetail(p.id)} className="min-w-0 flex-1 hover:underline">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.sku} · {formatVnd(p.salePrice ?? p.price)}
                  </div>
                </Link>
                <StatusPill {...PRODUCT_STATUS[p.status]} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  disabled={setProducts.isPending}
                  onClick={() => void remove(p.id, p.name)}
                  aria-label="Gỡ khỏi nhóm"
                  title="Gỡ khỏi nhóm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ProductGroupFormDialog open={editing} onOpenChange={setEditing} group={group} />
      <AssignProductsDialog group={group} open={assigning} onOpenChange={setAssigning} />
      <DeleteProductGroupDialog
        group={deleting ? group : null}
        onOpenChange={setDeleting}
        onDeleted={() => navigate(ROUTES.productGroups)}
      />
    </div>
  );
}
