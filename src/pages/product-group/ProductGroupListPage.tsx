import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { FolderTree, Plus } from "lucide-react";
import { type Column, Button, DataTable, useIsMobile } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { ROUTES } from "@/config/routes";
import { type ProductCategory, useCategories } from "@/features/shop-catalog";
import { useTableParams } from "@/hooks/useTableParams";
import { ProductGroupMobileCard } from "./components/ProductGroupMobileCard";
import { DeleteProductGroupDialog } from "./components/DeleteProductGroupDialog";
import { ProductGroupFormDialog } from "./components/ProductGroupFormDialog";

export function GroupThumb({ group, size = "h-10 w-10" }: { group: Pick<ProductCategory, "imageUrl">; size?: string }) {
  return group.imageUrl ? (
    <img src={group.imageUrl} alt="" className={`${size} shrink-0 rounded-lg border object-cover`} />
  ) : (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground`}>
      <FolderTree className="h-4 w-4" />
    </div>
  );
}

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function ProductGroupListPage() {
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  const table = useTableParams();
  // The API returns every category at once (no paging / search) — filter + page on the client
  const { data: categories, isFetching } = useCategories();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | undefined>();
  const [deleting, setDeleting] = useState<ProductCategory | null>(null);

  const page = useMemo(() => {
    const { page: p = 1, size = 10, keyword } = table.params;
    const q = keyword ? normalize(keyword) : "";
    const rows = (categories ?? []).filter((c) => !q || normalize(`${c.name} ${c.handle}`).includes(q));
    return { items: rows.slice((p - 1) * size, p * size), page: p, size, total: rows.length };
  }, [categories, table.params]);

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

  const columns: Column<ProductCategory>[] = [
    {
      key: "name",
      label: "Nhóm sản phẩm",
      mobilePriority: "primary",
      render: (_, g) => (
        <div className="flex min-w-0 items-center gap-3">
          <GroupThumb group={g} />
          <div className="truncate font-medium">{g.name}</div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Mô tả",
      render: (v) => <span className="line-clamp-2 max-w-md text-sm text-muted-foreground">{v ? String(v) : "—"}</span>,
    },
    { key: "handle", label: "Đường dẫn", render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
  ];

  return (
    <>
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        searchPlaceholder="Tìm theo tên nhóm..."
        enableMobileCard
        renderMobileCard={(g, helpers) => <ProductGroupMobileCard group={g} helpers={helpers} />}
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        onView={(g) => navigate(ROUTES.productGroupDetail(String(g.id)))}
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
