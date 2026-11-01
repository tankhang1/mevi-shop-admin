import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { Pencil, Trash2 } from "lucide-react";
import { Button, Card } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import { EmptyBlock, LoadingBlock, StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useCatalogProducts, useCategory } from "@/features/shop-catalog";
import { formatVnd } from "@/lib/format";
import { DeleteProductGroupDialog } from "./components/DeleteProductGroupDialog";
import { ProductGroupFormDialog } from "./components/ProductGroupFormDialog";
import { GroupThumb } from "./ProductGroupListPage";

const STATUS = {
  ACTIVE: { label: "Đang kinh doanh", className: "bg-emerald-100 text-emerald-800" },
  INACTIVE: { label: "Tạm ngưng", className: "bg-slate-100 text-slate-700" },
};

export default function ProductGroupDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id) || undefined;
  const [, navigate] = useLocation();
  const { data: group, isLoading, isError } = useCategory(id);
  // A product belongs to exactly one category — members come from the product list filtered by it
  const { data: products, isLoading: loadingProducts } = useCatalogProducts({ categoryId: id, size: 100 });
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const items = products?.content ?? [];

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

      <Card className="p-4 sm:p-5">
        <div className="mb-3">
          <h3 className="font-semibold">Sản phẩm trong nhóm</h3>
          <p className="text-sm text-muted-foreground">{products?.totalElements ?? 0} sản phẩm</p>
        </div>

        {loadingProducts ? (
          <LoadingBlock />
        ) : items.length === 0 ? (
          <EmptyBlock>Nhóm chưa có sản phẩm nào. Chọn nhóm này trong form tạo / sửa sản phẩm để thêm.</EmptyBlock>
        ) : (
          <ul className="divide-y">
            {items.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <img src={p.thumbnailUrl || placeholder} alt="" className="h-10 w-10 shrink-0 rounded-md border object-cover" />
                <Link href={ROUTES.productDetail(String(p.id))} className="min-w-0 flex-1 hover:underline">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.code} · {formatVnd(p.minPrice)}
                    {p.maxPrice !== p.minPrice && ` – ${formatVnd(p.maxPrice)}`}
                  </div>
                </Link>
                <StatusPill {...STATUS[p.status]} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ProductGroupFormDialog open={editing} onOpenChange={setEditing} group={group} />
      <DeleteProductGroupDialog
        group={deleting ? group : null}
        onOpenChange={setDeleting}
        onDeleted={() => navigate(ROUTES.productGroups)}
      />
    </div>
  );
}
