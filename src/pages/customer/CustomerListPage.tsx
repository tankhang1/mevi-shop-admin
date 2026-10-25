import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, UserPlus, Users } from "lucide-react";
import {
  type Column,
  Button,
  DataTable,
  StatsCard,
  type TableFilterDef,
  useIsMobile,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { ROUTES } from "@/config/routes";
import {
  CUSTOMER_TAG_SUGGESTIONS,
  type CustomerWithStats,
  useCustomerStats,
  useCustomers,
} from "@/features/customer";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDate, formatVnd } from "@/lib/format";
import { CustomerMobileCard } from "./components/CustomerMobileCard";
import { CustomerFormDialog } from "./components/CustomerFormDialog";

const filters: TableFilterDef[] = [
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
  const isMobile = useIsMobile();
  const table = useTableParams<
    { tag: string }
  >({ tag: "all" });
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
      <Plus className="mr-1 h-4 w-4" /> {isMobile ? "Thêm" : "Thêm khách hàng"}
    </Button>
  ), [isMobile]);

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
      label: "Tổng đơn",
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
  ];

  const statItems = [
    { title: "Tổng khách hàng", short: "Tổng khách hàng", value: stats?.total ?? "—", icon: Users, tone: "text-primary" },
    { title: "Khách hàng mới trong tháng", short: "Mới trong tháng", value: stats?.newThisMonth ?? "—", icon: UserPlus, tone: "text-sky-600" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Mobile: one compact row instead of stacked cards */}
      <div className="grid grid-cols-2 divide-x rounded-xl border bg-card md:hidden!">
        {statItems.map((it) => (
          <div key={it.title} className="flex flex-col items-center gap-1 px-1 py-3">
            <it.icon className={`h-4 w-4 ${it.tone}`} />
            <span className="text-lg font-bold leading-none tabular-nums">{it.value}</span>
            <span className="text-center text-[11px] leading-tight text-muted-foreground">{it.short}</span>
          </div>
        ))}
      </div>
      <div className="hidden gap-4 md:grid! md:grid-cols-2">
        {statItems.map((it) => (
          <StatsCard key={it.title} title={it.title} value={it.value} icon={it.icon} />
        ))}
      </div>

      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={filters}
        searchPlaceholder="Tìm theo tên, SĐT, email, nhãn..."
        enableMobileCard
        renderMobileCard={(c, helpers) => <CustomerMobileCard customer={c} helpers={helpers} />}
        columnToggleable={!isMobile}
        downloadable={!isMobile}
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
