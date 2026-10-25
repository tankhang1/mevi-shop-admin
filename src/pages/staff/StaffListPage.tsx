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
import { useShopFilter } from "@/features/shop";
import {
  STAFF_PERMISSION,
  STAFF_ROLE,
  STAFF_STATUS,
  type Staff,
  type StaffListParams,
  type StaffRole,
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
    key: "role",
    label: "Vai trò",
    options: (Object.keys(STAFF_ROLE) as StaffRole[]).map((r) => ({ label: STAFF_ROLE[r].label, value: r })),
  },
  {
    key: "status",
    label: "Trạng thái",
    options: (Object.keys(STAFF_STATUS) as StaffStatus[]).map((s) => ({ label: STAFF_STATUS[s].label, value: s })),
  },
];

export default function StaffListPage() {
  const { toast } = useToast();
  const shopFilter = useShopFilter();
  const table = useTableParams<Required<Pick<StaffListParams, "role" | "status">> & { shopId: string }>({
    role: "all",
    status: "all",
    shopId: shopFilter.initialShopId,
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
      <Plus className="mr-1 h-4 w-4" /> Mời nhân viên
    </Button>
  ));

  const run = async (fn: () => Promise<unknown>, ok: string, desc: string) => {
    try {
      await fn();
      toast({ title: ok, description: desc });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const columns: Column<Staff>[] = [
    {
      key: "name",
      label: "Nhân viên",
      mobilePriority: "primary",
      render: (_, s) => (
        <div className="flex min-w-0 items-center gap-3">
          <Initials name={s.name} />
          <div className="min-w-0">
            <div className="truncate font-medium">{s.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {s.email} · {s.phone}
            </div>
          </div>
        </div>
      ),
    },
    ...shopFilter.column<Staff>(),
    {
      key: "role",
      label: "Vai trò",
      mobilePriority: "secondary",
      render: (_, s) => <span className="text-sm font-medium">{STAFF_ROLE[s.role].label}</span>,
    },
    {
      key: "permissions",
      label: "Quyền",
      render: (_, s) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {s.permissions.map((p) => (
            <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-xs">
              {STAFF_PERMISSION[p].label}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "lastActiveAt",
      label: "Hoạt động gần nhất",
      render: (_, s) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {s.lastActiveAt ? formatDate(s.lastActiveAt) : `Mời ${formatDate(s.invitedAt)}`}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (v) => <StatusPill {...STAFF_STATUS[v as StaffStatus]} />,
    },
  ];

  const actions: RowAction<Staff>[] = [
    {
      key: "resend",
      label: "Gửi lại lời mời",
      icon: Mail,
      hidden: (s) => s.status !== "invited",
      onClick: (s) => void run(() => resend.mutateAsync(s.id), "Đã gửi lại lời mời", s.email),
    },
    {
      key: "lock",
      label: "Tạm khoá",
      icon: Lock,
      hidden: (s) => s.status !== "active",
      onClick: (s) => void run(() => update.mutateAsync({ id: s.id, data: { status: "disabled" } }), "Đã tạm khoá tài khoản", s.name),
    },
    {
      key: "unlock",
      label: "Mở khoá",
      icon: LockOpen,
      hidden: (s) => s.status !== "disabled",
      onClick: (s) => void run(() => update.mutateAsync({ id: s.id, data: { status: "active" } }), "Đã mở khoá tài khoản", s.name),
    },
  ];

  const confirmDelete = async () => {
    if (!deleting) return;
    await run(() => del.mutateAsync(deleting.id), "Đã xoá nhân viên", deleting.name);
    setDeleting(null);
  };

  return (
    <>
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={shopFilter.filter ? [shopFilter.filter, ...baseFilters] : baseFilters}
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
        description={`${deleting?.name ?? ""} sẽ mất quyền truy cập gian hàng ngay lập tức. Lịch sử thao tác của họ vẫn được giữ lại.`}
        onConfirm={() => void confirmDelete()}
        loading={del.isPending}
      />
    </>
  );
}
