import { useState } from "react";
import { useLocation } from "wouter";
import { Crown, Plus, Repeat, UserPlus, Users } from "lucide-react";
import {
  type Column,
  Button,
  DataTable,
  StatsCard,
  type TableFilterDef,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { StatusPill } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import {
  CUSTOMER_SEGMENT,
  CUSTOMER_TAG_SUGGESTIONS,
  type CustomerListParams,
  type CustomerSegment,
  type CustomerWithStats,
  useCustomerStats,
  useCustomers,
} from "@/features/customer";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDate, formatVnd } from "@/lib/format";
import { CustomerFormDialog } from "./components/CustomerFormDialog";

const filters: TableFilterDef[] = [
  {
    key: "segment",
    label: "Phân loại",
    options: (Object.keys(CUSTOMER_SEGMENT) as CustomerSegment[]).map((s) => ({
      label: CUSTOMER_SEGMENT[s].label,
      value: s,
    })),
  },
  {
    key: "tag",
    label: "Nhãn",
    options: CUSTOMER_TAG_SUGGESTIONS.map((t) => ({ label: t, value: t })),
  },
];

export const Initials = ({
  name,
  size = "h-9 w-9 text-sm",
}: {
  name: string;
  size?: string;
}) => (
  <span
    className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${size}`}
  >
    {name
      .split(" ")
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase()}
  </span>
);

export default function CustomerListPage() {
  const [, navigate] = useLocation();
  const table = useTableParams<
    Required<Pick<CustomerListParams, "segment">> & { tag: string }
  >({ segment: "all", tag: "all" });
  const { data: page, isFetching } = useCustomers(table.params);
  const { data: stats } = useCustomerStats();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerWithStats | undefined>();

  usePageActions(() => (
    <Button
      onClick={() => {
        setEditing(undefined);
        setOpen(true);
      }}
    >
      <Plus className="mr-1 h-4 w-4" /> Thêm khách hàng
    </Button>
  ));

  const columns: Column<CustomerWithStats>[] = [
    {
      key: "name",
      label: "Khách hàng",
      mobilePriority: "primary",
      render: (_, c) => (
        <div className="flex min-w-0 items-center gap-3">
          <Initials name={c.name} />
          <div className="min-w-0">
            <div className="truncate font-medium">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: "tags",
      label: "Nhãn",
      render: (_, c) =>
        c.tags.length ? (
          <div className="flex flex-wrap gap-1">
            {c.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                {t}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "orderCount",
      label: "Số đơn",
      sortable: true,
      render: (v) => <span className="tabular-nums">{String(v)}</span>,
    },
    {
      key: "totalSpent",
      label: "Đã chi tiêu",
      sortable: true,
      mobilePriority: "secondary",
      render: (v) => (
        <span className="whitespace-nowrap font-medium tabular-nums">
          {formatVnd(Number(v))}
        </span>
      ),
    },
    {
      key: "lastOrderAt",
      label: "Đơn gần nhất",
      render: (v) => (
        <span className="whitespace-nowrap text-sm">
          {v ? formatDate(String(v)) : "—"}
        </span>
      ),
    },
    {
      key: "segment",
      label: "Phân loại",
      mobilePriority: "badge",
      render: (v) => <StatusPill {...CUSTOMER_SEGMENT[v as CustomerSegment]} />,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Tổng khách hàng"
          value={stats?.total ?? "—"}
          icon={Users}
        />
        <StatsCard
          title="Mới 30 ngày"
          value={stats?.newThisMonth ?? "—"}
          icon={UserPlus}
        />
        <StatsCard
          title="Khách quen"
          value={stats?.returning ?? "—"}
          icon={Repeat}
        />
        <StatsCard title="VIP" value={stats?.vip ?? "—"} icon={Crown} />
      </div>

      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={filters}
        searchPlaceholder="Tìm theo tên, SĐT, email, nhãn..."
        enableMobileCard
        onView={(c) => navigate(ROUTES.customerDetail(c.id))}
        onEdit={(c) => {
          setEditing(c);
          setOpen(true);
        }}
      />

      <CustomerFormDialog
        open={open}
        onOpenChange={setOpen}
        customer={editing}
        onCreated={(c) => navigate(ROUTES.customerDetail(c.id))}
      />
    </div>
  );
}
