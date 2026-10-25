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
              className="mt-0.5 max-w-48 truncate text-xs text-destructive"
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

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Tổng đăng ký"
          value={stats?.total ?? "—"}
          icon={Sprout}
        />
        <StatsCard
          title="Chờ duyệt"
          value={stats?.pending ?? "—"}
          icon={Clock}
        />
        <StatsCard
          title="Đã duyệt"
          value={stats?.approved ?? "—"}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Từ chối"
          value={stats?.rejected ?? "—"}
          icon={XCircle}
        />
      </div>

      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={filters}
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
