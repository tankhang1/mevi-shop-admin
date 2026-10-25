import { useState } from "react";
import { useLocation } from "wouter";
import { Crown, ListChecks, Pause, Play, Plus, Wand2 } from "lucide-react";
import {
  type Column,
  type RowAction,
  Button,
  DataTable,
  DeleteDialog,
  useIsMobile,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import {
  type DispatchTeamRow,
  useAutoAssignOrders,
  useDeleteDispatchTeam,
  useDispatchTeams,
  useUpdateDispatchTeam,
} from "@/features/dispatch-team";
import { useShopFilter } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { Initials } from "@/pages/customer/CustomerListPage";
import { DispatchTeamMobileCard } from "./components/DispatchTeamMobileCard";
import { DispatchTeamFormDialog } from "./components/DispatchTeamFormDialog";

export default function DispatchTeamListPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const shopFilter = useShopFilter();
  const isMobile = useIsMobile();
  const table = useTableParams<{ shopId: string }>({
    shopId: shopFilter.initialShopId,
  });
  const { data: page, isFetching } = useDispatchTeams(table.params);
  const update = useUpdateDispatchTeam();
  const del = useDeleteDispatchTeam();
  const auto = useAutoAssignOrders();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DispatchTeamRow | undefined>();
  const [deleting, setDeleting] = useState<DispatchTeamRow | null>(null);
  const [confirmAuto, setConfirmAuto] = useState(false);

  usePageActions(() => (
    <>
      <Button
        variant="outline"
        className="px-2.5 md:px-4"
        onClick={() => setConfirmAuto(true)}
        aria-label="Tự động phân đơn"
      >
        <Wand2 className="h-4 w-4 md:mr-1.5" />
        <span className="hidden md:inline">Tự động phân đơn</span>
      </Button>
      <Button
        onClick={() => {
          setEditing(undefined);
          setOpen(true);
        }}
      >
        <Plus className="mr-1 h-4 w-4" /> {isMobile ? "Tạo" : "Tạo nhóm"}
      </Button>
    </>
  ), [isMobile]);

  const fail = (e: unknown) =>
    toast({
      variant: "destructive",
      title: "Lỗi",
      description: getErrorMessage(e),
    });

  const runAuto = async () => {
    try {
      const r = await auto.mutateAsync();
      toast({
        title: r.assigned
          ? `Đã phân ${r.assigned} đơn cho các nhóm`
          : "Không có đơn nào cần phân",
        description: r.unmatched
          ? `${r.unmatched} đơn có sản phẩm chưa thuộc nhóm điều phối nào — cần phân thủ công.`
          : undefined,
      });
    } catch (e) {
      fail(e);
    } finally {
      setConfirmAuto(false);
    }
  };

  const columns: Column<DispatchTeamRow>[] = [
    {
      key: "name",
      label: "Nhóm",
      mobilePriority: "primary",
      render: (_, t) => (
        <div className="min-w-0">
          <div className="font-medium">{t.name}</div>
          {t.description && (
            <div className="line-clamp-1 max-w-sm text-xs text-muted-foreground">
              {t.description}
            </div>
          )}
        </div>
      ),
    },
    ...shopFilter.column<DispatchTeamRow>(),
    {
      key: "memberIds",
      label: "Thành viên",
      render: (_, t) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {t.members.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1 rounded-full border py-0.5 pl-0.5 pr-2 text-xs"
              title={m.name}
            >
              <Initials name={m.name} size="h-5 w-5 text-[10px]" />
              {m.name.split(" ").slice(-1)[0]}
              {m.id === t.leaderId && (
                <Crown
                  className="h-3 w-3 text-amber-500"
                  aria-label="Trưởng nhóm"
                />
              )}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "productGroupIds",
      label: "Nhóm sản phẩm",
      render: (_, t) =>
        t.productGroups.length ? (
          <div className="flex flex-wrap gap-1">
            {t.productGroups.map((g) => (
              <span
                key={g.id}
                className="rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                {g.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Chưa gán</span>
        ),
    },
    {
      key: "openOrders",
      label: "Đơn đang xử lý",
      mobilePriority: "secondary",
      render: (v) => (
        <span className="font-semibold tabular-nums">{String(v)}</span>
      ),
    },
    {
      key: "active",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (v) => (
        <StatusPill
          label={v ? "Hoạt động" : "Tạm dừng"}
          className={
            v
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-200 text-slate-700"
          }
        />
      ),
    },
  ];

  const toggle = async (t: DispatchTeamRow) => {
    try {
      await update.mutateAsync({ id: t.id, data: { active: !t.active } });
      toast({
        title: t.active ? "Đã tạm dừng nhóm" : "Đã kích hoạt nhóm",
        description: t.name,
      });
    } catch (e) {
      fail(e);
    }
  };

  const actions: RowAction<DispatchTeamRow>[] = [
    {
      key: "orders",
      label: "Xem đơn của nhóm",
      icon: ListChecks,
      onClick: (t) => navigate(`${ROUTES.orders}?teamId=${t.id}`),
    },
    {
      key: "pause",
      label: "Tạm dừng",
      icon: Pause,
      hidden: (t) => !t.active,
      onClick: (t) => void toggle(t),
    },
    {
      key: "resume",
      label: "Kích hoạt",
      icon: Play,
      hidden: (t) => t.active,
      onClick: (t) => void toggle(t),
    },
  ];

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting.id);
      toast({ title: "Đã xoá nhóm", description: deleting.name });
      setDeleting(null);
    } catch (e) {
      fail(e);
    }
  };

  return (
    <>
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={shopFilter.filter ? [shopFilter.filter] : undefined}
        searchPlaceholder="Tìm theo tên nhóm..."
        enableMobileCard
        renderMobileCard={(t, helpers) => (
          <DispatchTeamMobileCard
            team={t}
            showShop={shopFilter.isRoot}
            onOrders={() => navigate(`${ROUTES.orders}?teamId=${t.id}`)}
            onToggle={() => void toggle(t)}
            helpers={helpers}
          />
        )}
        columnToggleable={!isMobile}
        downloadable={!isMobile}
        onEdit={(t) => {
          setEditing(t);
          setOpen(true);
        }}
        onDelete={setDeleting}
        rowActions={actions}
      />
      <DispatchTeamFormDialog
        open={open}
        onOpenChange={setOpen}
        team={editing}
      />
      <ConfirmDialog
        open={confirmAuto}
        onOpenChange={setConfirmAuto}
        loading={auto.isPending}
        title="Tự động phân đơn?"
        description="Các đơn chưa có nhóm và chưa giao sẽ được chuyển cho nhóm điều phối phụ trách nhóm sản phẩm của đơn, lần lượt cho từng thành viên."
        confirmLabel="Phân đơn"
        onConfirm={() => void runAuto()}
      />
      <DeleteDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Xoá nhóm điều phối?"
        description={`${deleting?.openOrders ?? 0} đơn đang xử lý của "${deleting?.name ?? ""}" sẽ trở về trạng thái chưa phân nhóm.`}
        onConfirm={() => void confirmDelete()}
        loading={del.isPending}
      />
    </>
  );
}
