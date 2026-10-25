import { useState } from "react";
import { Wallet } from "lucide-react";
import { type Column, Button, Card, DataTable, type TableFilterDef, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { StatusPill } from "@/components/common/ui-bits";
import {
  type Agency,
  COMMISSION_STATUS,
  type Commission,
  type CommissionListParams,
  type CommissionStatus,
  useAgencyCommissions,
  usePayoutCommissions,
} from "@/features/agency";
import { ORDER_STATUS } from "@/features/order";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate, formatVnd } from "@/lib/format";

const statusFilter: TableFilterDef = {
  key: "status",
  label: "Trạng thái",
  options: (Object.keys(COMMISSION_STATUS) as CommissionStatus[]).map((s) => ({ label: COMMISSION_STATUS[s].label, value: s })),
};

const SUMMARY: { key: Exclude<CommissionStatus, "void">; note: string }[] = [
  { key: "pending", note: "Đơn chưa hoàn tất" },
  { key: "payable", note: "Đơn hoàn tất, chưa chi trả" },
  { key: "paid", note: "Tổng đã chi trả" },
];

/** Commission on each referred order + paying out everything that's due */
export function AgencyCommissions({ agency }: { agency: Agency }) {
  const { toast } = useToast();
  const table = useTableParams<Pick<CommissionListParams, "status">>({ status: "all" });
  const { data: page, isFetching } = useAgencyCommissions(agency.id, table.params);
  // Every payable row, not just the visible page, so "Chi trả" settles the whole balance
  const { data: payable } = useAgencyCommissions(agency.id, { status: "payable", size: 10_000 });
  const payout = usePayoutCommissions();
  const [confirm, setConfirm] = useState(false);
  const due = page?.summary.payable ?? 0;
  const dueRows = payable?.items ?? [];

  const onPayout = async () => {
    try {
      const r = await payout.mutateAsync({ id: agency.id, orderIds: dueRows.map((c) => c.orderId) });
      toast({ title: "Đã ghi nhận chi trả hoa hồng", description: `${agency.name} · ${r.count} đơn · ${formatVnd(r.amount)}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể chi trả", description: getErrorMessage(e) });
    } finally {
      setConfirm(false);
    }
  };

  const columns: Column<Commission>[] = [
    { key: "orderCode", label: "Mã đơn", mobilePriority: "primary", render: (v) => <span className="font-mono text-sm">{String(v)}</span> },
    { key: "createdAt", label: "Ngày đặt", render: (v) => <span className="whitespace-nowrap text-sm">{formatDate(String(v))}</span> },
    {
      key: "orderStatus",
      label: "Đơn hàng",
      render: (_, c) => <StatusPill {...ORDER_STATUS[c.orderStatus]} />,
    },
    { key: "orderTotal", label: "Giá trị đơn", render: (v) => <span className="whitespace-nowrap">{formatVnd(Number(v))}</span> },
    { key: "rate", label: "Tỉ lệ", render: (v) => `${v}%` },
    {
      key: "amount",
      label: "Hoa hồng",
      mobilePriority: "secondary",
      render: (_, c) => (
        <span className={c.status === "void" ? "text-muted-foreground line-through" : "whitespace-nowrap font-semibold"}>
          {formatVnd(c.amount)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (_, c) => (
        <div>
          <StatusPill {...COMMISSION_STATUS[c.status]} />
          {c.paidAt && <div className="mt-0.5 text-xs text-muted-foreground">{formatDate(c.paidAt)}</div>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {SUMMARY.map(({ key, note }) => (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{COMMISSION_STATUS[key].label}</span>
              {key === "payable" && due > 0 && (
                <Button size="sm" onClick={() => setConfirm(true)}>
                  <Wallet className="mr-1.5 h-3.5 w-3.5" /> Chi trả
                </Button>
              )}
            </div>
            <div className="mt-1 text-xl font-bold tabular-nums">{page ? formatVnd(page.summary[key]) : "—"}</div>
            <div className="text-xs text-muted-foreground">{note}</div>
          </Card>
        ))}
      </div>

      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={[statusFilter]}
        searchPlaceholder="Tìm theo mã đơn..."
        enableMobileCard
      />

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        loading={payout.isPending}
        title={`Chi trả hoa hồng cho ${agency.name}?`}
        description={`Ghi nhận đã chuyển ${formatVnd(due)} cho ${dueRows.length} đơn hoàn tất. Thao tác này không thể hoàn tác.`}
        confirmLabel="Xác nhận đã chi trả"
        onConfirm={() => void onPayout()}
      />
    </div>
  );
}
