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
  KeyRound,
  Percent,
  ShieldCheck,
  Store,
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
import { PartnerSuspensionDialog } from "./components/PartnerSuspensionDialog";
import { PartnerTypeDialog } from "./components/PartnerTypeDialog";
import { PartnerCommissionDialog } from "./components/PartnerCommissionDialog";
import { ResetPasswordDialog } from "./components/ResetPasswordDialog";
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
  const [suspensionDialogOpen, setSuspensionDialogOpen] = useState(false);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);

  const columns: Column<PartnerProfile>[] = [
    {
      key: "partner",
      label: "Đối tác",
      mobilePriority: "primary",
      render: (_, p) => (
        <button
          type="button"
          onClick={() => navigate(ROUTES.agencyDetail(String(p.id)))}
          className="flex items-center gap-2.5 text-left group transition hover:opacity-80"
          title="Bấm để xem thông tin chi tiết và hoa hồng đối tác"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
            {p.contactName ? (
              p.contactName.charAt(0)
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground group-hover:text-primary group-hover:underline truncate">
              {p.contactName || "Chưa cập nhật"}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {p.contactPhone || "Chưa có SĐT"}
            </div>
          </div>
        </button>
      ),
    },
    {
      key: "storefront",
      label: "Gian hàng",
      mobilePriority: "secondary",
      render: (_, p) => (
        <button
          type="button"
          onClick={() => navigate(ROUTES.shopDetail(String(p.id)))}
          className="flex items-center gap-2.5 text-left group transition hover:opacity-80"
          title="Bấm để xem thông tin chi tiết gian hàng"
        >
          {p.logoUrl ? (
            <img
              src={p.logoUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-lg border object-cover"
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white uppercase shadow-xs"
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
      key: "commissionRate",
      label: "Hoa hồng",
      render: (_, p) => (
        <button
          type="button"
          onClick={() => {
            setSelectedPartner(p);
            setCommissionDialogOpen(true);
          }}
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline text-xs"
          title="Bấm để cập nhật tỷ lệ hoa hồng"
        >
          {p.commissionRate != null ? `${p.commissionRate}%` : "—"}
        </button>
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
      label: "Xem thông tin",
      icon: Coins,
      onClick: (p) => navigate(ROUTES.agencyDetail(String(p.id))),
    },
    {
      key: "shopDetail",
      label: "Xem gian hàng",
      icon: Store,
      onClick: (p) => navigate(ROUTES.shopDetail(String(p.id))),
    },
    {
      key: "commission",
      label: "Chia sẻ hoa hồng",
      icon: Percent,
      onClick: (p) => {
        setSelectedPartner(p);
        setCommissionDialogOpen(true);
      },
    },
    {
      key: "changeType",
      label: "Chuyển loại đối tác",
      icon: ArrowLeftRight,
      onClick: (p) => {
        setSelectedPartner(p);
        setTypeDialogOpen(true);
      },
    },
    {
      key: "resetPassword",
      label: "Đặt lại mật khẩu",
      icon: KeyRound,
      onClick: (p) => {
        setSelectedPartner(p);
        setResetPasswordOpen(true);
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
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Danh sách Cộng tác viên (CTV) và Đại lý bán hàng trong hệ sinh thái
            Mevi Shop
          </p>
        </div>
        <Button onClick={() => setCreateAccountOpen(true)}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Thêm đối tác
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

      <PartnerSuspensionDialog
        open={suspensionDialogOpen}
        onOpenChange={setSuspensionDialogOpen}
        partner={selectedPartner}
      />

      <PartnerTypeDialog
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        partner={selectedPartner}
      />

      <PartnerCommissionDialog
        open={commissionDialogOpen}
        onOpenChange={setCommissionDialogOpen}
        partner={selectedPartner}
      />

      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        partner={selectedPartner}
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
