import { useState } from "react";
import { Check, X } from "lucide-react";
import {
  type Column,
  type RowAction,
  DataTable,
  cn,
  useIsMobile,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ReasonDialog } from "@/components/common/ReasonDialog";
import { useAccess } from "@/features/auth";
import {
  type StockMovement,
  useApproveMovement,
  useRejectMovement,
  useStockMovements,
} from "@/features/inventory";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";

const dt = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

/** "Chờ duyệt nhập hàng": farm imports waiting for review; approval adds the delta to the stock as it is then */
export function PendingMovementsTable() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { isShopAdmin, isRoot } = useAccess();
  const table = useTableParams();
  const { data: page, isFetching } = useStockMovements({
    ...table.params,
    status: "pending",
    type: "in",
    source: "farm",
  });
  const approve = useApproveMovement();
  const reject = useRejectMovement();
  const [approving, setApproving] = useState<StockMovement | null>(null);
  const [rejecting, setRejecting] = useState<StockMovement | null>(null);

  const fail = (e: unknown) =>
    toast({
      variant: "destructive",
      title: "Lỗi",
      description: getErrorMessage(e),
    });

  const columns: Column<StockMovement>[] = [
    {
      key: "productName",
      label: "Sản phẩm",
      mobilePriority: "primary",
      render: (_, m) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{m.productName}</div>
          <div className="font-mono text-xs text-muted-foreground">{m.sku}</div>
        </div>
      ),
    },
    {
      key: "variant",
      label: "Quy cách",
      render: (v) => <span className="whitespace-nowrap text-sm">{String(v ?? "—")}</span>,
    },
    {
      key: "farmName",
      label: "Nông hộ",
      render: (_, m) => (
        <div className="text-sm">
          <div className="whitespace-nowrap">{m.farmName ?? "—"}</div>
          {!!m.importPrice && (
            <div className="whitespace-nowrap text-xs text-muted-foreground">Giá nhập {formatVnd(m.importPrice)}</div>
          )}
        </div>
      ),
    },
    {
      key: "delta",
      label: "Số lượng",
      mobilePriority: "secondary",
      render: (_, m) => (
        <span
          className={cn(
            "font-semibold",
            m.delta > 0 ? "text-emerald-700" : "text-red-600",
          )}
        >
          {m.delta > 0 ? `+${m.delta}` : m.delta}
        </span>
      ),
    },
    {
      key: "note",
      label: "Ghi chú",
      render: (v) => (
        <span className="text-sm text-muted-foreground">
          {String(v ?? "—")}
        </span>
      ),
    },
    {
      key: "createdBy",
      label: "Người đề xuất",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">{String(v)}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Thời gian",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">
          {dt.format(new Date(String(v)))}
        </span>
      ),
    },
  ];

  const canReview = isShopAdmin || isRoot;
  const actions: RowAction<StockMovement>[] = canReview
    ? [
        { key: "approve", label: "Duyệt", icon: Check, onClick: setApproving, hidden: (m) => m.status !== "pending" },
        {
          key: "reject",
          label: "Từ chối",
          icon: X,
          destructive: true,
          onClick: setRejecting,
          hidden: (m) => m.status !== "pending",
        },
      ]
    : [];

  return (
    <>
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        searchPlaceholder="Tìm theo sản phẩm, ghi chú..."
        filterable={false}
        enableMobileCard
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        rowActions={actions}
      />
      <ConfirmDialog
        open={!!approving}
        onOpenChange={(o) => !o && setApproving(null)}
        loading={approve.isPending}
        title={`Duyệt phiếu nhập hàng "${approving?.productName ?? ""}"?`}
        description={`${approving && approving.delta > 0 ? "+" : ""}${approving?.delta ?? 0} sẽ được cộng dồn vào hàng tồn hiện tại.`}
        confirmLabel="Duyệt"
        onConfirm={() =>
          approving &&
          approve
            .mutateAsync(approving.id)
            .then(() =>
              toast({
                title: "Đã duyệt, hàng tồn đã cập nhật",
                description: approving.productName,
              }),
            )
            .catch(fail)
            .finally(() => setApproving(null))
        }
      />
      <ReasonDialog
        open={!!rejecting}
        onOpenChange={(o) => !o && setRejecting(null)}
        title={`Từ chối phiếu nhập hàng "${rejecting?.productName ?? ""}"?`}
        loading={reject.isPending}
        onConfirm={(reason) =>
          rejecting &&
          reject
            .mutateAsync({ id: rejecting.id, reason })
            .then(() =>
              toast({
                title: "Đã từ chối",
                description: rejecting.productName,
              }),
            )
            .catch(fail)
            .finally(() => setRejecting(null))
        }
      />
    </>
  );
}
