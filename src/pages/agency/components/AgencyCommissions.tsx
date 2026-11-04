import { useMemo, useState } from "react";
import { History, Wallet } from "lucide-react";
import {
  type Column,
  Button,
  Card,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  type TableFilterDef,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { StatusPill } from "@/components/common/ui-bits";
import {
  type Agency,
  COMMISSION_STATUS,
  type Commission,
  type CommissionListParams,
  type CommissionStatus,
} from "@/features/agency";
import {
  type PartnerCommissionPayout,
  useCreatePartnerCommissionPayout,
  usePartnerCommissionPayouts,
  usePartnerCommissionSummary,
} from "@/features/partner";
import { ORDER_STATUS, useOrders } from "@/features/order";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate, formatVnd } from "@/lib/format";

const statusFilter: TableFilterDef = {
  key: "status",
  label: "Trạng thái",
  options: (Object.keys(COMMISSION_STATUS) as CommissionStatus[]).map((s) => ({
    label: COMMISSION_STATUS[s].label,
    value: s,
  })),
};

const SUMMARY: { key: Exclude<CommissionStatus, "void">; note: string }[] = [
  { key: "pending", note: "Đơn chưa hoàn tất" },
  { key: "payable", note: "Đơn hoàn tất, chưa chi trả" },
  { key: "paid", note: "Tổng đã chi trả" },
];

/** Commission on each referred order + paying out everything that's due */
export function AgencyCommissions({ agency }: { agency: Agency }) {
  const { toast } = useToast();
  const table = useTableParams<Pick<CommissionListParams, "status">>({
    status: "all",
  });

  const rawStatus = table.params.status;
  const commissionStatus =
    rawStatus === "pending"
      ? "PENDING"
      : rawStatus === "payable"
        ? "PAYABLE"
        : rawStatus === "paid"
          ? "PAID"
          : rawStatus === "void"
            ? "CANCELLED"
            : undefined;

  const { data: orderPage, isFetching } = useOrders({
    page: table.params.page,
    size: table.params.size,
    storefrontId: agency.id,
    commissionStatus,
  });

  const commissions: Commission[] = useMemo(() => {
    return (orderPage?.items ?? []).map((order) => {
      let status: CommissionStatus = "pending";
      if (order.commission?.status) {
        status = order.commission.status.toLowerCase() as CommissionStatus;
      } else if (order.status === "DELIVERED") {
        status = "payable";
      } else if (order.status === "CANCELLED") {
        status = "void";
      }

      return {
        id: String(order.id),
        orderId: String(order.id),
        orderCode: order.code,
        orderTotal: order.total,
        orderStatus: order.status,
        rate: order.commission?.rate ?? agency.commissionRate ?? 0,
        amount: order.commission?.amount ?? 0,
        status,
        paidAt: null,
        createdAt: order.createdAt,
      };
    });
  }, [orderPage?.items, agency.commissionRate]);

  const page = useMemo(
    () => ({
      items: commissions,
      total: orderPage?.total ?? commissions.length,
      page: orderPage?.page ?? 1,
      size: orderPage?.size ?? 10,
    }),
    [commissions, orderPage?.total, orderPage?.page, orderPage?.size],
  );

  // API hoa hồng đối tác (Mục 13.5)
  const { data: summary } = usePartnerCommissionSummary(agency.id);
  const { data: payouts } = usePartnerCommissionPayouts(agency.id);
  const createPayoutMutation = useCreatePartnerCommissionPayout();

  const [confirm, setConfirm] = useState(false);
  const [payoutNote, setPayoutNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const due = summary?.payableAmount ?? 0;
  const dueCount = summary?.payableOrderCount ?? 0;

  const onPayout = async () => {
    try {
      const r = await createPayoutMutation.mutateAsync({
        id: agency.id,
        input: { note: payoutNote.trim() || undefined },
      });
      toast({
        title: "Đã ghi nhận chi trả hoa hồng thành công",
        description: `${agency.name} · ${r.orderCount} đơn · ${formatVnd(r.amount)}`,
      });
      setConfirm(false);
      setPayoutNote("");
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể chi trả",
        description: getErrorMessage(e),
      });
    }
  };

  const summaryValues = {
    pending: summary?.pendingAmount ?? 0,
    payable: due,
    paid: summary?.paidAmount ?? 0,
  };

  const columns: Column<Commission>[] = [
    {
      key: "orderCode",
      label: "Mã đơn",
      mobilePriority: "primary",
      render: (v) => <span className="font-mono text-sm">{String(v)}</span>,
    },
    {
      key: "createdAt",
      label: "Ngày đặt",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">
          {formatDate(String(v))}
        </span>
      ),
    },
    {
      key: "orderStatus",
      label: "Đơn hàng",
      render: (_, c) => <StatusPill {...ORDER_STATUS[c.orderStatus]} />,
    },
    {
      key: "orderTotal",
      label: "Giá trị đơn",
      render: (v) => (
        <span className="whitespace-nowrap">{formatVnd(Number(v))}</span>
      ),
    },
    { key: "rate", label: "Tỉ lệ", render: (v) => `${v}%` },
    {
      key: "amount",
      label: "Hoa hồng",
      mobilePriority: "secondary",
      render: (_, c) => (
        <span
          className={
            c.status === "void"
              ? "text-muted-foreground line-through"
              : "whitespace-nowrap font-semibold"
          }
        >
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
          {c.paidAt && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(c.paidAt)}
            </div>
          )}
        </div>
      ),
    },
  ];

  const payoutList: PartnerCommissionPayout[] = Array.isArray(payouts)
    ? payouts
    : (payouts?.content ?? []);

  const payoutHistoryColumns: Column<PartnerCommissionPayout>[] = [
    {
      key: "id",
      label: "Mã đợt",
      mobilePriority: "primary",
      render: (v) => <span className="font-mono text-sm">#{String(v)}</span>,
    },
    {
      key: "paidAt",
      label: "Thời gian",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">
          {formatDate(String(v))}
        </span>
      ),
    },
    {
      key: "orderCount",
      label: "Số đơn gom",
      render: (v) => <span>{Number(v)} đơn</span>,
    },
    {
      key: "amount",
      label: "Số tiền đã chi",
      mobilePriority: "secondary",
      render: (v) => (
        <span className="whitespace-nowrap font-semibold text-emerald-700">
          {formatVnd(Number(v))}
        </span>
      ),
    },
    {
      key: "note",
      label: "Ghi chú",
      render: (v) => (
        <span className="text-xs text-muted-foreground">
          {String(v || "—")}
        </span>
      ),
    },
    {
      key: "paidBy",
      label: "Người chi trả",
      render: (_, p) => (
        <span className="text-sm">{p.paidBy?.fullName || "Quản trị viên"}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {SUMMARY.map(({ key, note }) => (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {COMMISSION_STATUS[key].label}
              </span>
              {key === "payable" && due > 0 && (
                <Button size="sm" onClick={() => setConfirm(true)}>
                  <Wallet className="mr-1.5 h-3.5 w-3.5" /> Chi trả
                </Button>
              )}
            </div>
            <div className="mt-1 text-xl font-bold tabular-nums">
              {formatVnd(summaryValues[key])}
            </div>
            <div className="text-xs text-muted-foreground">
              {key === "payable" && dueCount > 0
                ? `${dueCount} đơn hoàn tất chưa chi trả`
                : note}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <h3 className="text-base font-semibold">Danh sách đơn tính hoa hồng</h3>
        {payoutList.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory((prev) => !prev)}
            className="text-xs"
          >
            <History className="mr-1.5 h-3.5 w-3.5" />
            {showHistory
              ? "Xem danh sách đơn"
              : `Lịch sử chi trả (${payoutList.length})`}
          </Button>
        )}
      </div>

      {showHistory && payoutList.length > 0 ? (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">
            Lịch sử các đợt chi trả hoa hồng
          </h4>
          <DataTable
            data={payoutList}
            columns={payoutHistoryColumns}
            searchPlaceholder="Tìm kiếm..."
            enableMobileCard
          />
        </Card>
      ) : (
        <DataTable
          {...table.bind(page, isFetching)}
          columns={columns}
          filters={[statusFilter]}
          searchPlaceholder="Tìm theo mã đơn..."
          enableMobileCard
        />
      )}

      {/* Dialog Chi trả hoa hồng (Mục 13.5) */}
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận chi trả hoa hồng</DialogTitle>
            <DialogDescription>
              Gom toàn bộ các đơn hoàn tất đang chờ thanh toán của đại lý{" "}
              <b>{agency.name}</b> vào một đợt chi trả duy nhất.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted/50 p-3.5 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số lượng đơn gom:</span>
                <span className="font-semibold">
                  {dueCount > 0 ? `${dueCount} đơn` : "Tất cả đơn PAYABLE"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tổng số tiền chi trả:
                </span>
                <span className="font-bold text-base text-emerald-700">
                  {formatVnd(due)}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payout-note" className="text-sm font-medium">
                Ghi chú chi trả (tùy chọn)
              </Label>
              <Input
                id="payout-note"
                maxLength={1000}
                placeholder="VD: Chuyển khoản Vietcombank 04/11, UNC #108..."
                value={payoutNote}
                onChange={(e) => setPayoutNote(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Tối đa 1000 ký tự. Các đơn được gom sẽ chuyển sang trạng thái{" "}
                <b>PAID</b> (Đã chi trả).
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={createPayoutMutation.isPending}
              onClick={() => setConfirm(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              disabled={createPayoutMutation.isPending || due <= 0}
              onClick={() => void onPayout()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {createPayoutMutation.isPending
                ? "Đang xử lý..."
                : "Xác nhận đã chi trả"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
