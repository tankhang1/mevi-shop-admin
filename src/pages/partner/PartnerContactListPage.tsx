import { useState } from "react";
import {
  type Column,
  DataTable,
  type TableFilterDef,
  Badge,
  Button,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { UserCheck, Eye, PhoneCall, UserPlus } from "lucide-react";
import { RequireRole } from "@/components/common/RequireRole";
import {
  type ContactRequestStatus,
  type PartnerContactRequest,
  usePartnerContactRequests,
} from "@/features/partner";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDate } from "@/lib/format";
import {
  cleanFilters,
  fromSpringPage,
  toSpringPageParams,
} from "@/lib/pagination";
import { PartnerContactDetailDialog } from "./components/PartnerContactDetailDialog";
import { CreatePartnerAccountDialog } from "./components/CreatePartnerAccountDialog";

const filters: TableFilterDef[] = [
  {
    key: "status",
    label: "Trạng thái",
    options: [
      { label: "Mới", value: "NEW" },
      { label: "Đã liên hệ", value: "CONTACTED" },
      { label: "Đã cấp tài khoản", value: "ACCOUNT_CREATED" },
      { label: "Không hợp tác", value: "REJECTED" },
    ],
  },
];

const STATUS_MAP: Record<
  ContactRequestStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  NEW: { label: "Chờ liên hệ", variant: "default" },
  CONTACTED: { label: "Đã liên hệ", variant: "secondary" },
  ACCOUNT_CREATED: { label: "Đã cấp tài khoản", variant: "outline" },
  REJECTED: { label: "Không hợp tác", variant: "destructive" },
};

function PartnerContactList() {
  const table = useTableParams<{ status: string }>({ status: "all" });

  const queryParams = toSpringPageParams({
    ...cleanFilters(table.params as unknown as Record<string, unknown>),
    keyword: table.params.keyword,
    status:
      table.params.status === "all"
        ? undefined
        : (table.params.status as ContactRequestStatus),
  });

  const { data, isFetching } = usePartnerContactRequests(queryParams);
  const page = fromSpringPage(data);

  const [selectedRequest, setSelectedRequest] = useState<
    PartnerContactRequest | undefined
  >();
  const [detailOpen, setDetailOpen] = useState(false);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);

  const handleOpenDetail = (req: PartnerContactRequest) => {
    setSelectedRequest(req);
    setDetailOpen(true);
  };

  const handleOpenCreateAccount = (req: PartnerContactRequest) => {
    setSelectedRequest(req);
    setCreateAccountOpen(true);
  };

  const columns: Column<PartnerContactRequest>[] = [
    {
      key: "fullName",
      label: "Họ và tên",
      mobilePriority: "primary",
      render: (_, r) => (
        <div>
          <div className="font-semibold text-foreground">{r.fullName}</div>
          {r.note && (
            <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
              {r.note}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "phoneNumber",
      label: "Số điện thoại",
      mobilePriority: "secondary",
      render: (_, r) => (
        <a
          href={`tel:${r.phoneNumber}`}
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          <PhoneCall className="h-3 w-3" />
          {r.phoneNumber}
        </a>
      ),
    },
    {
      key: "email",
      label: "Email & Khu vực",
      render: (_, r) => (
        <div className="text-xs">
          <div>{r.email || "—"}</div>
          <div className="text-muted-foreground font-medium">
            {r.province || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      mobilePriority: "badge",
      render: (_, r) => {
        const config = STATUS_MAP[r.status] || {
          label: r.status,
          variant: "outline",
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: "createdAt",
      label: "Ngày gửi",
      render: (_, r) => (
        <span className="text-xs">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (_, r) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            title="Xem chi tiết"
            onClick={() => handleOpenDetail(r)}
          >
            <Eye className="h-4 w-4 mr-1" />
            <span className="text-xs">Chi tiết</span>
          </Button>
          {r.status !== "ACCOUNT_CREATED" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2 text-primary border-primary/30"
              title="Cấp tài khoản đối tác"
              onClick={() => handleOpenCreateAccount(r)}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              <span className="text-xs">Cấp tài khoản</span>
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="-mt-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between md:-mt-5">
        <p className="text-sm text-muted-foreground">
          Danh sách người quan tâm gửi thông tin liên hệ làm Cộng tác viên / Đại
          lý Mevi Shop
        </p>
        <Button
          onClick={() => {
            setSelectedRequest(undefined);
            setCreateAccountOpen(true);
          }}
        >
          <UserPlus className="mr-1.5 h-4 w-4" />
          Cấp tài khoản đối tác
        </Button>
      </div>

      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={filters}
        searchPlaceholder="Tìm theo họ tên, SĐT, email..."
        enableMobileCard
      />

      <PartnerContactDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        request={selectedRequest}
        onOpenCreateAccount={handleOpenCreateAccount}
      />

      <CreatePartnerAccountDialog
        open={createAccountOpen}
        onOpenChange={setCreateAccountOpen}
        contactRequest={selectedRequest}
      />
    </div>
  );
}

export default function PartnerContactListPage() {
  return (
    <RequireRole root>
      <PartnerContactList />
    </RequireRole>
  );
}
