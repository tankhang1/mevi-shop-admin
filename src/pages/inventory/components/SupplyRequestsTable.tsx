import { useState } from "react";
import { Check, Sprout, X } from "lucide-react";
import {
  type Column,
  type RowAction,
  DataTable,
  cn,
  useIsMobile,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ReasonDialog } from "@/components/common/ReasonDialog";
import { useAccess } from "@/features/auth";
import {
  type StockMovement,
  type StockMovementStatus,
  isConflictError,
  isStorefrontSyncError,
  useCatalogStockMovements,
  useRejectStockMovement,
  useStockMovementCounts,
  stockItemLabel,
  stockPerLabel,
} from "@/features/shop-catalog";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { fromSpringPage, toSpringPageParams } from "@/lib/pagination";
import { formatVnd } from "@/lib/format";
import { ApproveMovementDialog } from "./ApproveMovementDialog";
import { MovementStatusCell } from "./movement-bits";
import { formatVnDateTime, userName } from "./movement-format";

type TabKey = "all" | StockMovementStatus;

const STATUS_TABS: { key: TabKey; label: string; count: "pending" | "approved" | "rejected" | "cancelled" | "total" }[] = [
  { key: "PENDING", label: "Chờ duyệt", count: "pending" },
  { key: "APPROVED", label: "Đã duyệt", count: "approved" },
  { key: "REJECTED", label: "Bị từ chối", count: "rejected" },
  { key: "CANCELLED", label: "Đã huỷ", count: "cancelled" },
  { key: "all", label: "Tất cả", count: "total" },
];

const TAB_STYLES: Record<TabKey, { active: string; inactive: string; inactiveCount: string }> = {
  PENDING: {
    active: "bg-amber-500 text-white shadow-xs hover:bg-amber-600",
    inactive: "bg-amber-50/90 text-amber-800 border border-amber-300 hover:bg-amber-100 hover:text-amber-900",
    inactiveCount: "bg-amber-200/80 text-amber-900",
  },
  APPROVED: {
    active: "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700",
    inactive: "bg-emerald-50/90 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900",
    inactiveCount: "bg-emerald-200/80 text-emerald-900",
  },
  REJECTED: {
    active: "bg-rose-600 text-white shadow-xs hover:bg-rose-700",
    inactive: "bg-rose-50/90 text-rose-800 border border-rose-300 hover:bg-rose-100 hover:text-rose-900",
    inactiveCount: "bg-rose-200/80 text-rose-900",
  },
  CANCELLED: {
    active: "bg-slate-500 text-white shadow-xs hover:bg-slate-600",
    inactive: "bg-slate-50 text-slate-700 border border-slate-300 hover:bg-slate-100",
    inactiveCount: "bg-slate-200 text-slate-800",
  },
  all: {
    active: "bg-slate-700 text-white shadow-xs hover:bg-slate-800",
    inactive: "bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 hover:text-slate-900",
    inactiveCount: "bg-slate-200 text-slate-900",
  },
};

/** "Yêu cầu cung ứng": farm stock receipts (source=FARM), review pending ones (§2.5.3–2.5.5) */
export function SupplyRequestsTable() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { isShopAdmin, isRoot } = useAccess();
  const [activeStatus, setActiveStatus] = useState<TabKey>("PENDING");
  const table = useTableParams();
  const { page, size, keyword } = table.params;

  const { data, isFetching } = useCatalogStockMovements(
    toSpringPageParams({
      page,
      size,
      keyword,
      source: "FARM" as const,
      status: activeStatus === "all" ? undefined : activeStatus,
    }),
  );
  const { data: counts } = useStockMovementCounts({ source: "FARM", keyword });
  const reject = useRejectStockMovement();
  const [approving, setApproving] = useState<StockMovement | null>(null);
  const [rejecting, setRejecting] = useState<StockMovement | null>(null);

  const canReview = isShopAdmin || isRoot;

  const columns: Column<StockMovement>[] = [
    {
      key: "code",
      label: "Mã yêu cầu",
      render: (_, m) => <span className="font-mono text-xs font-semibold text-primary">{m.code}</span>,
    },
    {
      key: "product",
      label: "Sản phẩm & Cây trồng",
      mobilePriority: "primary",
      render: (_, m) => (
        <div className="min-w-0">
          <div className="truncate font-semibold text-foreground">{m.product.title}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono">{m.product.code}</span>
            {m.productionSubject?.name && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-0.5 font-medium text-emerald-700">
                  <Sprout className="h-3 w-3" />
                  {m.productionSubject.name}
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {m.variant ? "Quy cách: " : ""}
            {stockItemLabel(m)}
          </div>
        </div>
      ),
    },
    {
      key: "productionZone",
      label: "Vườn & Nông hộ",
      render: (_, m) => (
        <div className="text-sm">
          <div className="whitespace-nowrap font-medium text-foreground">{m.productionZone?.name ?? "—"}</div>
          <div className="whitespace-nowrap text-xs text-muted-foreground">
            {m.workspace?.name ?? "—"}
            {m.unitCost != null && <span className="ml-1">· {formatVnd(m.unitCost)} / {stockPerLabel(m)}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Số lượng cung ứng",
      mobilePriority: "secondary",
      render: (_, m) => (
        <div className="whitespace-nowrap">
          <span className="text-base font-bold tabular-nums text-emerald-700">+{m.quantity}</span>
          <span className="ml-1 text-xs font-medium text-muted-foreground">{stockPerLabel(m)}</span>
        </div>
      ),
    },
    { key: "status", label: "Trạng thái", render: (_, m) => <MovementStatusCell m={m} /> },
    {
      key: "createdBy",
      label: "Người gửi & Thời gian",
      render: (_, m) => (
        <div className="space-y-0.5 whitespace-nowrap text-xs">
          <p className="font-semibold text-foreground">
            {userName(m.createdBy)}
            {m.channel === "FARM" && <span className="ml-1 font-normal text-muted-foreground">(nông hộ)</span>}
          </p>
          <p className="text-[11px] text-muted-foreground">{formatVnDateTime(m.createdAt)}</p>
        </div>
      ),
    },
  ];

  const actions: RowAction<StockMovement>[] = canReview
    ? [
        { key: "approve", label: "Duyệt yêu cầu", icon: Check, onClick: setApproving, hidden: (m) => m.status !== "PENDING" },
        {
          key: "reject",
          label: "Từ chối",
          icon: X,
          destructive: true,
          onClick: setRejecting,
          hidden: (m) => m.status !== "PENDING",
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const active = activeStatus === tab.key;
          const styles = TAB_STYLES[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveStatus(tab.key);
                table.bind(undefined, false).onIndexChange(1);
              }}
              className={cn(
                "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                active ? styles.active : styles.inactive,
              )}
            >
              <span>{tab.label}</span>
              {counts && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    active ? "bg-white/25 text-white" : styles.inactiveCount,
                  )}
                >
                  {counts[tab.count]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <DataTable
        {...table.bind(fromSpringPage(data), isFetching)}
        columns={columns}
        searchPlaceholder="Tìm theo mã yêu cầu, sản phẩm, vườn, nông hộ..."
        enableMobileCard
        renderMobileCard={(m) => (
          <div className="space-y-3 rounded-xl border bg-card p-3.5 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-mono text-xs font-bold text-primary">{m.code}</span>
                <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">{m.product.title}</p>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {stockItemLabel(m)}
                  {m.productionSubject?.name && ` · ${m.productionSubject.name}`}
                </div>
              </div>
              <span className="shrink-0 text-base font-bold tabular-nums text-emerald-700">+{m.quantity}</span>
            </div>
            <div className="space-y-1 rounded-lg bg-muted/50 p-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Vườn & Nông hộ</span>
                <span className="text-right font-medium text-foreground">
                  {m.productionZone?.name ?? "—"} · {m.workspace?.name ?? "—"}
                </span>
              </div>
              {m.unitCost != null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Giá đề xuất</span>
                  <span className="font-medium">{formatVnd(m.unitCost)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-border/50 pt-1 text-[11px] text-muted-foreground">
                <span>
                  {userName(m.createdBy)}
                  {m.channel === "FARM" && " (nông hộ)"}
                </span>
                <span>{formatVnDateTime(m.createdAt)}</span>
              </div>
            </div>
            {m.status === "PENDING" && canReview ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRejecting(m)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                >
                  <X className="h-3.5 w-3.5" /> Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => setApproving(m)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-xs transition hover:bg-primary/90"
                >
                  <Check className="h-3.5 w-3.5" /> Duyệt nhập
                </button>
              </div>
            ) : (
              <MovementStatusCell m={m} />
            )}
          </div>
        )}
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        rowActions={actions}
      />

      <ApproveMovementDialog movement={approving} onOpenChange={(o) => !o && setApproving(null)} onReject={setRejecting} />

      <ReasonDialog
        open={!!rejecting}
        onOpenChange={(o) => !o && setRejecting(null)}
        title={`Từ chối yêu cầu cung ứng "${rejecting?.product.title ?? ""}"?`}
        loading={reject.isPending}
        onConfirm={(reason) =>
          rejecting &&
          reject
            .mutateAsync({ id: rejecting.id, data: { reason } })
            .then(() => {
              toast({ title: "Đã từ chối yêu cầu cung ứng", description: rejecting.product.title });
              setRejecting(null);
            })
            // Stay open on failure so the typed reason isn't lost (except 409: nothing left to reject)
            .catch((e) => {
              toast({
                variant: "destructive",
                title: "Không thể từ chối",
                description: isConflictError(e)
                  ? "Phiếu không còn chờ duyệt."
                  : isStorefrontSyncError(e)
                    ? "Chưa cập nhật được trang shop, vui lòng thử lại"
                    : getErrorMessage(e),
              });
              if (isConflictError(e)) setRejecting(null);
            })
        }
      />
    </div>
  );
}
