import { useState } from "react";
import { useLocation } from "wouter";
import {
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sprout,
  X,
  XCircle,
} from "lucide-react";
import {
  type Column,
  type RowAction,
  type TableFilterDef,
  DataTable,
  StatsCard,
  cn,
  useIsMobile,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { ReasonDialog } from "@/components/common/ReasonDialog";
import { StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useFarms } from "@/features/farm";
import {
  type FarmRegistration,
  REGISTRATION_STATUS,
  type RegistrationListParams,
  type RegistrationStatus,
  useFarmRegistrationStats,
  useFarmRegistrations,
  useRejectRegistration,
} from "@/features/farm-registration";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate, formatVnd } from "@/lib/format";
import { ApproveRegistrationDialog } from "./components/ApproveRegistrationDialog";

export default function FarmRegistrationPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();
  const { data: farms } = useFarms();
  const { data: stats } = useFarmRegistrationStats();
  const table = useTableParams<
    Required<Pick<RegistrationListParams, "status">> & { farmId: string }
  >({
    status: "pending",
    farmId: "all",
  });
  const { data: page, isFetching } = useFarmRegistrations(table.params);
  const reject = useRejectRegistration();
  const [approving, setApproving] = useState<FarmRegistration | null>(null);
  const [rejecting, setRejecting] = useState<FarmRegistration | null>(null);

  const filters: TableFilterDef[] = [
    {
      key: "status",
      label: "Trạng thái",
      options: (Object.keys(REGISTRATION_STATUS) as RegistrationStatus[]).map(
        (s) => ({ label: REGISTRATION_STATUS[s].label, value: s }),
      ),
    },
    {
      key: "farmId",
      label: "Nông hộ",
      options: (farms ?? []).map((f) => ({ label: f.name, value: f.id })),
    },
  ];

  const columns: Column<FarmRegistration>[] = [
    {
      key: "name",
      label: "Sản phẩm đề xuất",
      mobilePriority: "primary",
      render: (_, r) => (
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={r.images[0] || placeholder}
            alt=""
            className="h-10 w-10 shrink-0 rounded-md border object-cover"
          />
          <div className="min-w-0">
            <div className="truncate font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">
              {r.category}
              {r.packaging && ` · ${r.packaging}`}
            </div>
            {/* Mobile card: the badge slot is too narrow for the reason */}
            {r.rejectionReason && (
              <div className="mt-0.5 line-clamp-2 text-xs text-destructive md:hidden">
                {r.rejectionReason}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "farmName",
      label: "Nông hộ",
      mobilePriority: "secondary",
      render: (_, r) => (
        <div className="text-sm">
          <div>{r.farmName}</div>
          <div className="text-xs text-muted-foreground">{r.farmLocation}</div>
        </div>
      ),
    },
    {
      key: "proposedPrice",
      label: "Giá đề xuất",
      render: (v) => (
        <span className="whitespace-nowrap">{formatVnd(Number(v))}</span>
      ),
    },
    {
      key: "quantity",
      label: "Số lượng",
      render: (v) => <span className="tabular-nums">{String(v)}</span>,
    },
    {
      key: "createdAt",
      label: "Ngày gửi",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">
          {formatDate(String(v))}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (_, r) => (
        <div>
          <StatusPill {...REGISTRATION_STATUS[r.status]} />
          {r.rejectionReason && (
            <div
              className="mt-0.5 hidden max-w-48 truncate text-xs text-destructive md:block"
              title={r.rejectionReason}
            >
              {r.rejectionReason}
            </div>
          )}
        </div>
      ),
    },
  ];

  const actions: RowAction<FarmRegistration>[] = [
    {
      key: "approve",
      label: "Duyệt & tạo sản phẩm",
      icon: Check,
      hidden: (r) => r.status !== "pending",
      onClick: setApproving,
    },
    {
      key: "product",
      label: "Xem sản phẩm",
      icon: ExternalLink,
      hidden: (r) => !r.productId,
      onClick: (r) => navigate(ROUTES.productDetail(r.productId!)),
    },
    {
      key: "reject",
      label: "Từ chối",
      icon: X,
      destructive: true,
      hidden: (r) => r.status !== "pending",
      onClick: setRejecting,
    },
  ];

  const bound = table.bind(page, isFetching);
  const statusChips = [
    { value: "pending", label: "Chờ duyệt", count: stats?.pending },
    { value: "approved", label: "Đã duyệt", count: stats?.approved },
    { value: "rejected", label: "Từ chối", count: stats?.rejected },
    { value: "all", label: "Tất cả", count: stats?.total },
  ];

  const statItems = [
    { title: "Tổng đăng ký", value: stats?.total ?? "—", icon: Sprout },
    { title: "Chờ duyệt", value: stats?.pending ?? "—", icon: Clock },
    { title: "Đã duyệt", value: stats?.approved ?? "—", icon: CheckCircle2 },
    { title: "Từ chối", value: stats?.rejected ?? "—", icon: XCircle },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Mobile: stats double as the status filter — one scrollable chip row */}
      {isMobile && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {statusChips.map((c) => {
            const active = table.state.filters.status === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => bound.onFilterChange("status", c.value)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground",
                )}
              >
                {c.label}
                <span
                  className={cn(
                    "min-w-5 rounded-full px-1.5 text-center text-xs font-semibold tabular-nums",
                    active ? "bg-primary-foreground/20" : "bg-muted text-foreground",
                  )}
                >
                  {c.count ?? "—"}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-4">
        {statItems.map((it) => (
          <StatsCard key={it.title} title={it.title} value={it.value} icon={it.icon} />
        ))}
      </div>

      <DataTable
        {...bound}
        columns={columns}
        filters={isMobile ? filters.filter((f) => f.key !== "status") : filters}
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        searchPlaceholder="Tìm theo sản phẩm, nông hộ..."
        enableMobileCard
        rowActions={actions}
      />

      <ApproveRegistrationDialog
        registration={approving}
        onOpenChange={(o) => !o && setApproving(null)}
      />
      <ReasonDialog
        open={!!rejecting}
        onOpenChange={(o) => !o && setRejecting(null)}
        title={`Từ chối "${rejecting?.name ?? ""}"?`}
        label="Lý do từ chối (gửi lại cho nông hộ)"
        loading={reject.isPending}
        onConfirm={(reason) =>
          rejecting &&
          reject
            .mutateAsync({ id: rejecting.id, reason })
            .then(() =>
              toast({
                title: "Đã từ chối đăng ký",
                description: rejecting.name,
              }),
            )
            .catch((e) =>
              toast({
                variant: "destructive",
                title: "Lỗi",
                description: getErrorMessage(e),
              }),
            )
            .finally(() => setRejecting(null))
        }
      />
    </div>
  );
}
