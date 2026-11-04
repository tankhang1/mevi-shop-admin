import { useState } from "react";
import { useLocation } from "wouter";
import {
  type Column,
  type RowAction,
  DataTable,
  type TableFilterDef,
  Badge,
  Button,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import {
  ArrowLeftRight,
  Ban,
  CheckCircle2,
  Coins,
  ShieldCheck,
  User,
  UserPlus,
} from "lucide-react";
import { RequireRole } from "@/components/common/RequireRole";
import { ROUTES } from "@/config/routes";
import {
  type PartnerProfile,
  type PartnerType,
  usePartnerProfiles,
} from "@/features/partner";
import { useTableParams } from "@/hooks/useTableParams";
import {
  cleanFilters,
  fromSpringPage,
  toSpringPageParams,
} from "@/lib/pagination";
import { PartnerTypeDialog } from "./components/PartnerTypeDialog";
import { PartnerSuspensionDialog } from "./components/PartnerSuspensionDialog";
import { PartnerAccountDetailDialog } from "./components/PartnerAccountDetailDialog";
import { CreatePartnerAccountDialog } from "@/pages/partner/components/CreatePartnerAccountDialog";

const filters: TableFilterDef[] = [
  {
    key: "partnerType",
    label: "Loại đối tác",
    options: [
      { label: "Đại lý", value: "AGENCY" },
      { label: "Cộng tác viên (CTV)", value: "COLLABORATOR" },
    ],
  },
  {
    key: "suspended",
    label: "Trạng thái",
    options: [
      { label: "Đang hoạt động", value: "false" },
      { label: "Bị tạm khóa", value: "true" },
    ],
  },
];

function PartnerList() {
  const [, navigate] = useLocation();
  const table = useTableParams<{ partnerType: string; suspended: string }>({
    partnerType: "all",
    suspended: "all",
  });

  const queryParams = toSpringPageParams({
    ...cleanFilters(table.params as unknown as Record<string, unknown>),
    keyword: table.params.keyword,
    partnerType:
      table.params.partnerType === "all"
        ? undefined
        : (table.params.partnerType as PartnerType),
    suspended:
      table.params.suspended === "all"
        ? undefined
        : (table.params.suspended as "true" | "false"),
  });

  const { data, isFetching } = usePartnerProfiles(queryParams);
  const page = fromSpringPage(data);

  const [selectedPartner, setSelectedPartner] = useState<
    PartnerProfile | undefined
  >();
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);

  const columns: Column<PartnerProfile>[] = [
    {
      key: "name",
      label: "Đối tác / Gian hàng",
      mobilePriority: "primary",
      render: (_, p) => (
        <button
          type="button"
          onClick={() => navigate(ROUTES.agencyDetail(String(p.id)))}
          className="flex items-center gap-2.5 text-left group transition hover:opacity-80"
          title="Bấm để xem chi tiết, hoa hồng và báo cáo"
        >
          {p.logoUrl ? (
            <img
              src={p.logoUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-lg border object-cover"
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white uppercase"
              style={{ background: p.brandColor || "#2E7D32" }}
            >
              {p.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1 font-semibold text-foreground group-hover:text-primary">
              <span className="truncate group-hover:underline">{p.name}</span>
              {p.verified && (
                <ShieldCheck
                  className="h-3.5 w-3.5 text-sky-600 shrink-0"
                  aria-label="Đã xác minh"
                />
              )}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              @{p.handle}
            </div>
          </div>
        </button>
      ),
    },
    {
      key: "partnerType",
      label: "Phân loại",
      mobilePriority: "badge",
      render: (_, p) => (
        <Badge
          variant={p.partnerType === "AGENCY" ? "default" : "secondary"}
          className="text-xs"
        >
          {p.partnerType === "AGENCY" ? "Đại lý" : "Cộng tác viên"}
        </Badge>
      ),
    },
    {
      key: "contact",
      label: "Người đại diện & SĐT",
      mobilePriority: "secondary",
      render: (_, p) => (
        <div className="text-xs">
          <div className="font-medium text-foreground">{p.contactName}</div>
          <div className="text-muted-foreground font-mono">
            {p.contactPhone}
          </div>
        </div>
      ),
    },
    {
      key: "province",
      label: "Khu vực",
      render: (_, p) => <span className="text-xs">{p.province}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_, p) =>
        p.suspended ? (
          <Badge variant="destructive" className="text-xs">
            Bị tạm khóa
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs text-emerald-600 border-emerald-300"
          >
            Hoạt động
          </Badge>
        ),
    },
  ];

  const rowActions: RowAction<PartnerProfile>[] = [
    {
      key: "detail",
      label: "Hoa hồng & Chi tiết",
      icon: Coins,
      onClick: (p) => navigate(ROUTES.agencyDetail(String(p.id))),
    },
    {
      key: "type",
      label: "Đổi loại đối tác",
      icon: ArrowLeftRight,
      onClick: (p) => {
        setSelectedPartner(p);
        setTypeDialogOpen(true);
      },
    },
    {
      key: "suspend",
      label: "Tạm khóa",
      icon: Ban,
      destructive: true,
      hidden: (p) => p.suspended,
      onClick: (p) => {
        setSelectedPartner(p);
        setSuspensionDialogOpen(true);
      },
    },
    {
      key: "resume",
      label: "Mở lại hoạt động",
      icon: CheckCircle2,
      hidden: (p) => !p.suspended,
      onClick: (p) => {
        setSelectedPartner(p);
        setSuspensionDialogOpen(true);
      },
    },
    {
      key: "account",
      label: "Tài khoản đăng nhập",
      icon: User,
      onClick: (p) => {
        setSelectedPartner(p);
        setAccountDialogOpen(true);
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Quản lý Đối tác</h1>
          <p className="text-sm text-muted-foreground">
            Danh sách Cộng tác viên (CTV) và Đại lý bán hàng trong hệ sinh thái
            Mevi Shop
          </p>
        </div>
        <Button onClick={() => setCreateAccountOpen(true)}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Cấp tài khoản đối tác
        </Button>
      </div>

      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={filters}
        searchPlaceholder="Tìm theo tên gian hàng, handle, người đại diện, SĐT..."
        enableMobileCard
        rowActions={rowActions}
      />

      <PartnerTypeDialog
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        partner={selectedPartner}
      />

      <PartnerSuspensionDialog
        open={suspensionDialogOpen}
        onOpenChange={setSuspensionDialogOpen}
        partner={selectedPartner}
      />

      <PartnerAccountDetailDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        partnerId={selectedPartner?.id}
      />

      <CreatePartnerAccountDialog
        open={createAccountOpen}
        onOpenChange={setCreateAccountOpen}
      />
    </div>
  );
}

export default function AgencyListPage() {
  return (
    <RequireRole root>
      <PartnerList />
    </RequireRole>
  );
}
