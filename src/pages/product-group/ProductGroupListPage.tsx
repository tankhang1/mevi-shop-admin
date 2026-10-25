import { useState } from "react";
import { useLocation } from "wouter";
import { FolderTree, Plus } from "lucide-react";
import { type Column, Button, DataTable, useIsMobile } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { ROUTES } from "@/config/routes";
import { type ProductGroup, useProductGroups } from "@/features/product-group";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { ProductGroupMobileCard } from "./components/ProductGroupMobileCard";
import { DeleteProductGroupDialog } from "./components/DeleteProductGroupDialog";
import { ProductGroupFormDialog } from "./components/ProductGroupFormDialog";

export function GroupThumb({ group, size = "h-10 w-10" }: { group: Pick<ProductGroup, "imageUrl">; size?: string }) {
  return group.imageUrl ? (
    <img src={group.imageUrl} alt="" className={`${size} shrink-0 rounded-lg border object-cover`} />
  ) : (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground`}>
      <FolderTree className="h-4 w-4" />
    </div>
  );
}

export default function ProductGroupListPage() {
  const [, navigate] = useLocation();
  const shopFilter = useShopFilter();
  const isMobile = useIsMobile();
  const table = useTableParams<{ shopId: string }>({ shopId: shopFilter.initialShopId });
  const { data: page, isFetching } = useProductGroups(table.params);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductGroup | undefined>();
  const [deleting, setDeleting] = useState<ProductGroup | null>(null);

  usePageActions(() => (
    <Button
      onClick={() => {
        setEditing(undefined);
        setOpen(true);
      }}
    >
      <Plus className="mr-1 h-4 w-4" /> {isMobile ? "Thêm" : "Thêm nhóm"}
    </Button>
  ), [isMobile]);

  const columns: Column<ProductGroup>[] = [
    {
      key: "name",
      label: "Nhóm sản phẩm",
      mobilePriority: "primary",
      render: (_, g) => (
        <div className="flex min-w-0 items-center gap-3">
          <GroupThumb group={g} />
          <div className="min-w-0">
            <div className="truncate font-medium">{g.name}</div>
            {g.description && <div className="line-clamp-1 max-w-md text-xs text-muted-foreground">{g.description}</div>}
          </div>
        </div>
      ),
    },
    ...shopFilter.column<ProductGroup>(),
    {
      key: "productIds",
      label: "Sản phẩm",
      width: "110px",
      mobilePriority: "badge",
      render: (_, g) => <span className="whitespace-nowrap text-sm">{g.productIds.length} sản phẩm</span>,
    },
  ];

  return (
    <>
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={shopFilter.filter ? [shopFilter.filter] : undefined}
        searchPlaceholder="Tìm theo tên nhóm..."
        enableMobileCard
        renderMobileCard={(g, helpers) => (
          <ProductGroupMobileCard group={g} showShop={shopFilter.isRoot} helpers={helpers} />
        )}
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        onView={(g) => navigate(ROUTES.productGroupDetail(g.id))}
        onEdit={(g) => {
          setEditing(g);
          setOpen(true);
        }}
        onDelete={setDeleting}
      />
      <ProductGroupFormDialog open={open} onOpenChange={setOpen} group={editing} />
      <DeleteProductGroupDialog group={deleting} onOpenChange={(o) => !o && setDeleting(null)} />
    </>
  );
}
