import { useState } from "react";
import { useLocation } from "wouter";
import { Check, X } from "lucide-react";
import {
  type Column,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
  useIsMobile,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { ViewToggle } from "@/components/common/ViewToggle";
import { ROUTES } from "@/config/routes";
import { type Product, useModerateProduct, useProducts } from "@/features/product";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { useListView } from "@/stores/ui-prefs.store";
import { ApprovalGrid } from "./components/ApprovalGrid";
import { ApprovalMobileList } from "./components/ApprovalMobileList";
import { productColumns, productFilters } from "./components/product-columns";

const GRID_SIZE = 12;
const TABLE_SIZE = 10;
// Every row here is "pending" — the status column/filter would be noise
const columns: Column<Product>[] = [
  ...productColumns.filter((c) => c.key !== "status").slice(0, 2),
  { key: "shopName", label: "Gian hàng", render: (v) => <span className="whitespace-nowrap text-sm">{String(v ?? "—")}</span> },
  ...productColumns.filter((c) => c.key !== "status").slice(2),
];
const filters = productFilters.filter((f) => f.key !== "status");

export default function ProductApprovalPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [savedView, setView] = useListView("product-approval", "grid");
  // Phones always get the card list; the table/grid switch is a desktop thing
  const view = isMobile ? "grid" : savedView;
  const table = useTableParams({ category: "all" }, view === "grid" ? GRID_SIZE : TABLE_SIZE);
  const { data: page, isFetching } = useProducts({ ...table.params, status: "pending" });
  const moderate = useModerateProduct();
  const [rejecting, setRejecting] = useState<Product | null>(null);
  const [reason, setReason] = useState("");

  const switchView = (v: typeof view) => {
    setView(v);
    table.reset(v === "grid" ? GRID_SIZE : TABLE_SIZE);
  };

  usePageActions(() => !isMobile && <ViewToggle value={view} onChange={switchView} />, [view, isMobile]);

  const approve = async (p: Product) => {
    try {
      await moderate.mutateAsync({ id: p.id, data: { status: "approved" } });
      toast({ title: "Đã duyệt", description: `${p.name} đã hiển thị trên cửa hàng` });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const closeReject = () => {
    setRejecting(null);
    setReason("");
  };

  const reject = async () => {
    if (!rejecting || !reason.trim()) return;
    try {
      await moderate.mutateAsync({ id: rejecting.id, data: { status: "rejected", rejectionReason: reason.trim() } });
      toast({ title: "Đã từ chối", description: rejecting.name });
      closeReject();
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const tableColumns: Column<Product>[] = [
    ...columns,
    {
      key: "createdAt",
      label: "Gửi lúc",
      sortable: true,
      render: (v) => <span className="whitespace-nowrap text-sm">{formatDate(String(v))}</span>,
    },
    {
      key: "moderate",
      label: "Duyệt",
      width: "200px",
      render: (_, p) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void approve(p)} disabled={moderate.isPending}>
            <Check className="mr-1 h-4 w-4" /> Duyệt
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRejecting(p)}>
            <X className="mr-1 h-4 w-4" /> Từ chối
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {view === "table" ? (
        <DataTable
          {...table.bind(page, isFetching)}
          columns={tableColumns}
          filters={filters}
          searchPlaceholder="Tìm theo tên, mã sản phẩm..."
          enableMobileCard
          onView={(p) => navigate(ROUTES.productDetail(p.id))}
        />
      ) : isMobile ? (
        <ApprovalMobileList
          page={page}
          loading={isFetching}
          keyword={table.state.keyword}
          category={table.state.filters.category}
          onSearch={table.bind(page, isFetching).onSearch}
          onCategory={(v) => table.bind(page, isFetching).onFilterChange("category", v)}
          onPage={table.bind(page, isFetching).onIndexChange}
          onView={(p) => navigate(ROUTES.productDetail(p.id))}
          onApprove={(p) => void approve(p)}
          onReject={setRejecting}
          busy={moderate.isPending}
        />
      ) : (
        <ApprovalGrid
          page={page}
          loading={isFetching}
          keyword={table.state.keyword}
          category={table.state.filters.category}
          onSearch={table.bind(page, isFetching).onSearch}
          onCategory={(v) => table.bind(page, isFetching).onFilterChange("category", v)}
          onPage={table.bind(page, isFetching).onIndexChange}
          onView={(p) => navigate(ROUTES.productDetail(p.id))}
          onApprove={(p) => void approve(p)}
          onReject={setRejecting}
          busy={moderate.isPending}
        />
      )}

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && closeReject()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối "{rejecting?.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reason">
              Lý do từ chối<span className="text-destructive"> *</span>
            </Label>
            <Textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Thiếu giấy chứng nhận ATTP, ảnh không rõ..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeReject}>
              Huỷ
            </Button>
            <Button variant="destructive" disabled={!reason.trim() || moderate.isPending} onClick={() => void reject()}>
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
