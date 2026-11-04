import { useState } from "react";
import { Lock, LockOpen, Mail, Plus } from "lucide-react";
import {
  type Column,
  type RowAction,
  type TableFilterDef,
  Button,
  DataTable,
  DeleteDialog,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { StatusPill } from "@/components/common/ui-bits";
import {
  STAFF_STATUS,
  type Staff,
  type StaffListParams,
  type StaffStatus,
  useDeleteStaff,
  useResendInvite,
  useStaffList,
  useUpdateStaff,
} from "@/features/staff";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { Initials } from "@/pages/customer/CustomerListPage";
import { StaffFormDialog } from "./components/StaffFormDialog";

const baseFilters: TableFilterDef[] = [
  {
    key: "status",
    label: "Trạng thái",
    options: (Object.keys(STAFF_STATUS) as StaffStatus[]).map((s) => ({
      label: STAFF_STATUS[s].label,
      value: s,
    })),
  },
];

export default function StaffListPage() {
  const { toast } = useToast();
  const table = useTableParams<Required<Pick<StaffListParams, "status">>>({
    status: "all",
  });
  const { data: page, isFetching } = useStaffList(table.params);
  const update = useUpdateStaff();
  const del = useDeleteStaff();
  const resend = useResendInvite();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | undefined>();
  const [deleting, setDeleting] = useState<Staff | null>(null);

  usePageActions(() => (
    <Button
      onClick={() => {
        setEditing(undefined);
        setOpen(true);
      }}
    >
      <Plus className="mr-1 h-4 w-4" /> Thêm nhân viên
    </Button>
  ));

  const run = async (fn: () => Promise<unknown>, ok: string, desc: string) => {
    try {
      await fn();
      toast({ title: ok, description: desc });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: getErrorMessage(e),
      });
    }
  };

  const columns: Column<Staff>[] = [
    {
      key: "name",
      label: "Nhân viên",
      mobilePriority: "primary",
      render: (_, s) => {
        const displayName = s.fullName || s.name || "Nhân viên";
        const phone = s.phoneNumber || s.phone || "—";
        return (
          <div className="flex min-w-0 items-center gap-3">
            <Initials name={displayName} />
            <div className="min-w-0">
              <div className="truncate font-medium">{displayName}</div>
              <div className="truncate text-xs text-muted-foreground">
                {s.code && <span className="font-mono">{s.code} · </span>}
                {s.email} · {phone}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "lastActiveAt",
      label: "Hoạt động gần nhất",
      render: (_, s) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {s.lastLoginAt
            ? formatDate(s.lastLoginAt)
            : s.lastActiveAt
              ? formatDate(s.lastActiveAt)
              : `Mời ${formatDate(s.invitedAt ?? s.createdAt)}`}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (_, s) => {
        if (s.status === "disabled" || s.status === "inactive") {
          return (
            <StatusPill
              label="Tạm khoá"
              className="bg-slate-200 text-slate-700"
            />
          );
        }
        if (
          s.status === "invited" ||
          (s.status === "active" && s.mustChangePassword)
        ) {
          return (
            <StatusPill
              label="Chờ kích hoạt"
              className="bg-amber-100 text-amber-800"
            />
          );
        }
        return (
          <StatusPill
            label="Hoạt động"
            className="bg-emerald-100 text-emerald-800"
          />
        );
      },
    },
  ];

  const actions: RowAction<Staff>[] = [
    {
      key: "resend",
      label: "Gửi lại lời mời",
      icon: Mail,
      hidden: (s) => s.status !== "invited",
      onClick: (s) =>
        void run(() => resend.mutateAsync(s.id), "Đã gửi lại lời mời", s.email),
    },
    {
      key: "lock",
      label: "Tạm khoá",
      icon: Lock,
      hidden: (s) => s.status !== "active",
      onClick: (s) =>
        void run(
          () => update.mutateAsync({ id: s.id, data: { status: "inactive" } }),
          "Đã tạm khoá tài khoản",
          s.fullName || s.name,
        ),
    },
    {
      key: "unlock",
      label: "Mở khoá",
      icon: LockOpen,
      hidden: (s) => s.status !== "disabled" && s.status !== "inactive",
      onClick: (s) =>
        void run(
          () => update.mutateAsync({ id: s.id, data: { status: "active" } }),
          "Đã mở khoá tài khoản",
          s.fullName || s.name,
        ),
    },
  ];

  const confirmDelete = async () => {
    if (!deleting) return;
    await run(
      () => del.mutateAsync(deleting.id),
      "Đã xoá nhân viên",
      deleting.name,
    );
    setDeleting(null);
  };

  return (
    <>
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={baseFilters}
        searchPlaceholder="Tìm theo tên, email, SĐT..."
        enableMobileCard
        onEdit={(s) => {
          setEditing(s);
          setOpen(true);
        }}
        onDelete={setDeleting}
        rowActions={actions}
      />
      <StaffFormDialog open={open} onOpenChange={setOpen} staff={editing} />
      <DeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Xoá nhân viên?"
        description={`${deleting?.name ?? ""} sẽ mất quyền truy cập ngay lập tức và không còn nhận đơn điều phối. Lịch sử thao tác của họ vẫn được giữ lại.`}
        onConfirm={() => void confirmDelete()}
        loading={del.isPending}
      />
    </>
  );
}
