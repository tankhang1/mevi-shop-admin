import { useState } from "react";
import { Check, X, Sprout, AlertCircle } from "lucide-react";
import {
  type Column,
  type RowAction,
  DataTable,
  cn,
  useIsMobile,
  useToast,
  Badge,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ReasonDialog } from "@/components/common/ReasonDialog";
import { useAccess } from "@/features/auth";
import { useFarms } from "@/features/farm";
import {
  type StockMovement,
  type MovementStatus,
  useApproveMovement,
  useRejectMovement,
  useSupplyRequests,
} from "@/features/inventory";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatVnd } from "@/lib/format";
import placeholder from "@/assets/images/image-placeholder.webp";

const dt = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

interface StatusTabDef {
  key: "all" | MovementStatus;
  label: string;
}

const STATUS_TABS: StatusTabDef[] = [
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Bị từ chối" },
  { key: "all", label: "Tất cả" },
];

export function SupplyRequestsTable() {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { isShopAdmin, isRoot } = useAccess();
  const { data: farms } = useFarms();

  const [activeStatus, setActiveStatus] = useState<"all" | MovementStatus>(
    "pending",
  );

  const table = useTableParams<{
    farmId?: string;
    productId?: string;
  }>({
    farmId: undefined,
    productId: undefined,
  });

  const { data: response, isFetching } = useSupplyRequests({
    ...table.params,
    status: activeStatus,
  });

  const summary = response?.summary;
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
      key: "code",
      label: "Mã yêu cầu",
      render: (_, m) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {m.code || m.id}
        </span>
      ),
    },
    {
      key: "productName",
      label: "Sản phẩm & Cây trồng",
      mobilePriority: "primary",
      render: (_, m) => (
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={placeholder}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg border object-cover"
          />
          <div className="min-w-0">
            <div className="truncate font-semibold text-foreground">
              {m.productName}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span>{m.sku}</span>
              {m.cropName && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 font-sans font-medium">
                    <Sprout className="h-3 w-3" />
                    {m.cropName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "regionName",
      label: "Vườn & Nông hộ",
      render: (_, m) => (
        <div className="text-sm">
          <div className="font-medium text-foreground whitespace-nowrap">
            {m.regionName || "Vườn nông hộ"}
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {m.farmName || "—"}
            {!!m.importPrice && (
              <span className="ml-1 text-muted-foreground/80">
                · {formatVnd(m.importPrice)} / {m.unit || "kg"}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "delta",
      label: "Số lượng cung ứng",
      mobilePriority: "secondary",
      render: (_, m) => (
        <div className="whitespace-nowrap">
          <span className="text-base font-bold text-emerald-700 tabular-nums">
            +{m.delta}
          </span>
          <span className="ml-1 text-xs text-muted-foreground font-medium">
            {m.unit || "kg"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_, m) => {
        if (m.status === "pending") {
          return (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-50 text-amber-800"
            >
              Chờ duyệt
            </Badge>
          );
        }
        if (m.status === "approved") {
          return (
            <div className="space-y-0.5">
              <Badge
                variant="outline"
                className="border-emerald-600/30 bg-emerald-50 text-emerald-800"
              >
                Đã duyệt
              </Badge>
              {m.reviewedBy && (
                <p className="text-[11px] text-muted-foreground">
                  {m.reviewedBy} ·{" "}
                  {m.reviewedAt ? dt.format(new Date(m.reviewedAt)) : ""}
                </p>
              )}
            </div>
          );
        }
        return (
          <div className="space-y-0.5">
            <Badge
              variant="outline"
              className="border-rose-500/30 bg-rose-50 text-rose-800"
            >
              Bị từ chối
            </Badge>
            {m.rejectionReason && (
              <p
                className="text-xs text-destructive max-w-[200px] truncate"
                title={m.rejectionReason}
              >
                {m.rejectionReason}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "createdBy",
      label: "Người gửi & Thời gian",
      render: (_, m) => (
        <div className="text-xs space-y-0.5 whitespace-nowrap">
          <p className="font-semibold text-foreground">{m.createdBy || "—"}</p>
          <p className="text-muted-foreground text-[11px]">
            {m.createdAt ? dt.format(new Date(m.createdAt)) : "—"}
          </p>
        </div>
      ),
    },
  ];

  const canReview = isShopAdmin || isRoot;
  const actions: RowAction<StockMovement>[] = canReview
    ? [
        {
          key: "approve",
          label: "Duyệt yêu cầu",
          icon: Check,
          onClick: setApproving,
          hidden: (m) => m.status !== "pending",
        },
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

  const farmFilterOptions = (farms ?? []).map((f) => ({
    label: f.name,
    value: f.id,
  }));

  const TAB_STYLES: Record<
    "all" | MovementStatus,
    {
      active: string;
      activeCount: string;
      inactive: string;
      inactiveCount: string;
    }
  > = {
    pending: {
      active: "bg-amber-500 text-white shadow-xs hover:bg-amber-600",
      activeCount: "bg-white/25 text-white",
      inactive:
        "bg-amber-50/90 text-amber-800 border border-amber-300 hover:bg-amber-100 hover:text-amber-900",
      inactiveCount: "bg-amber-200/80 text-amber-900",
    },
    approved: {
      active: "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700",
      activeCount: "bg-white/25 text-white",
      inactive:
        "bg-emerald-50/90 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 hover:text-emerald-900",
      inactiveCount: "bg-emerald-200/80 text-emerald-900",
    },
    rejected: {
      active: "bg-rose-600 text-white shadow-xs hover:bg-rose-700",
      activeCount: "bg-white/25 text-white",
      inactive:
        "bg-rose-50/90 text-rose-800 border border-rose-300 hover:bg-rose-100 hover:text-rose-900",
      inactiveCount: "bg-rose-200/80 text-rose-900",
    },
    all: {
      active: "bg-slate-700 text-white shadow-xs hover:bg-slate-800",
      activeCount: "bg-white/25 text-white",
      inactive:
        "bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 hover:text-slate-900",
      inactiveCount: "bg-slate-200 text-slate-900",
    },
  };

  return (
    <div className="space-y-4">
      {/* Segmented Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {STATUS_TABS.map((tab) => {
          const active = activeStatus === tab.key;
          const count = summary ? summary[tab.key] : undefined;
          const styles = TAB_STYLES[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveStatus(tab.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                active ? styles.active : styles.inactive,
              )}
            >
              <span>{tab.label}</span>
              {count !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    active ? styles.activeCount : styles.inactiveCount,
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <DataTable
        {...table.bind(response, isFetching)}
        columns={columns}
        filters={
          farmFilterOptions.length
            ? [
                {
                  key: "farmId",
                  label: "Nông hộ",
                  options: farmFilterOptions,
                },
              ]
            : undefined
        }
        searchPlaceholder="Tìm theo mã yêu cầu, sản phẩm, vườn..."
        enableMobileCard
        renderMobileCard={(m) => (
          <div className="rounded-xl border bg-card p-3.5 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold text-primary">
                  {m.code || m.id}
                </span>
                <p className="font-semibold text-sm text-foreground leading-snug mt-0.5">
                  {m.productName}
                </p>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {m.sku} {m.cropName && `· ${m.cropName}`}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-bold text-emerald-700 tabular-nums">
                  +{m.delta}
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  {m.unit || "kg"}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-2.5 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Vườn & Nông hộ:</span>
                <span className="font-medium text-foreground">
                  {m.regionName || "Vườn"} · {m.farmName}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                <span>{m.createdBy}</span>
                <span>{dt.format(new Date(m.createdAt))}</span>
              </div>
            </div>

            {/* Trạng thái / Hành động mobile */}
            {m.status === "pending" && canReview ? (
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
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-muted-foreground">Trạng thái:</span>
                {m.status === "approved" ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-600/30 bg-emerald-50 text-emerald-800"
                  >
                    Đã duyệt
                  </Badge>
                ) : m.status === "rejected" ? (
                  <Badge
                    variant="outline"
                    className="border-rose-500/30 bg-rose-50 text-rose-800"
                  >
                    Bị từ chối
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-50 text-amber-800"
                  >
                    Chờ duyệt
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        rowActions={actions}
      />

      {/* Confirm approve dialog */}
      <ConfirmDialog
        open={!!approving}
        onOpenChange={(o) => !o && setApproving(null)}
        loading={approve.isPending}
        title={`Duyệt yêu cầu cung ứng "${approving?.productName ?? ""}"?`}
        description={
          approving ? (
            <div className="space-y-2 mt-2 text-left">
              <div className="rounded-xl border bg-muted/40 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đề xuất:</span>
                  <span className="font-mono font-semibold">
                    {approving.code || approving.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vườn cung ứng:</span>
                  <span className="font-medium text-foreground">
                    {approving.regionName || "Vườn nông hộ"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nông hộ:</span>
                  <span className="font-medium text-foreground">
                    {approving.farmName || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số lượng duyệt:</span>
                  <span className="font-bold text-emerald-700">
                    +{approving.delta} {approving.unit || "kg"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                Sau khi duyệt, số lượng tồn kho của vườn này sẽ được tự động
                cộng dồn vào hệ thống.
              </p>
            </div>
          ) : undefined
        }
        confirmLabel="Xác nhận duyệt"
        onConfirm={() =>
          approving &&
          approve
            .mutateAsync(approving.id)
            .then(() =>
              toast({
                title: "Đã duyệt yêu cầu cung ứng",
                description: `${approving.productName} (+${approving.delta} ${approving.unit || "kg"})`,
              }),
            )
            .catch(fail)
            .finally(() => setApproving(null))
        }
      />

      {/* Reject dialog */}
      <ReasonDialog
        open={!!rejecting}
        onOpenChange={(o) => !o && setRejecting(null)}
        title={`Từ chối yêu cầu cung ứng "${rejecting?.productName ?? ""}"?`}
        loading={reject.isPending}
        onConfirm={(reason) =>
          rejecting &&
          reject
            .mutateAsync({ id: rejecting.id, reason })
            .then(() =>
              toast({
                title: "Đã từ chối yêu cầu cung ứng",
                description: rejecting.productName,
              }),
            )
            .catch(fail)
            .finally(() => setRejecting(null))
        }
      />
    </div>
  );
}
