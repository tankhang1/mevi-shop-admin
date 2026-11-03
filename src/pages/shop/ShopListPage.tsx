import { useLocation } from "wouter";
import { BadgeCheck, Eye } from "lucide-react";
import {
  type Column,
  DataTable,
  Switch,
  type TableFilterDef,
  useToast,
  Button,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { RequireRole } from "@/components/common/RequireRole";
import { ROUTES } from "@/config/routes";
import {
  type PartnerProfile,
  usePartnerProfiles,
  useUpdatePartnerSuspension,
  useUpdatePartnerVerification,
} from "@/features/partner";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import {
  cleanFilters,
  fromSpringPage,
  toSpringPageParams,
} from "@/lib/pagination";

const filters: TableFilterDef[] = [
  {
    key: "verified",
    label: "Xác minh",
    options: [
      { label: "Đã xác minh", value: "true" },
      { label: "Chưa xác minh", value: "false" },
    ],
  },
  {
    key: "suspended",
    label: "Hiển thị",
    options: [
      { label: "Đang hiển thị", value: "false" },
      { label: "Đang tạm khóa", value: "true" },
    ],
  },
];

function ShopList() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const table = useTableParams<{ verified: string; suspended: string }>({
    verified: "all",
    suspended: "all",
  });

  const queryParams = toSpringPageParams({
    ...cleanFilters(table.params as unknown as Record<string, unknown>),
    keyword: table.params.keyword,
    verified:
      table.params.verified === "all"
        ? undefined
        : (table.params.verified as "true" | "false"),
    suspended:
      table.params.suspended === "all"
        ? undefined
        : (table.params.suspended as "true" | "false"),
  });

  const { data, isFetching } = usePartnerProfiles(queryParams);
  const page = fromSpringPage(data);

  const updateVerification = useUpdatePartnerVerification();
  const updateSuspension = useUpdatePartnerSuspension();

  const handleToggleVerified = async (p: PartnerProfile, verified: boolean) => {
    try {
      await updateVerification.mutateAsync({
        id: p.id,
        input: { verified },
      });
      toast({
        title: verified ? "Đã xác minh gian hàng" : "Đã gỡ xác minh",
        description: p.name,
      });
    } catch (err) {
      toast({
        title: "Lỗi",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const handleToggleSuspension = async (p: PartnerProfile, active: boolean) => {
    try {
      await updateSuspension.mutateAsync({
        id: p.id,
        input: { suspended: !active },
      });
      toast({
        title: active ? "Đã mở gian hàng" : "Đã tạm khóa gian hàng",
        description: p.name,
      });
    } catch (err) {
      toast({
        title: "Lỗi",
        description: getErrorMessage(err),
        variant: "destructive",
      });
    }
  };

  const columns: Column<PartnerProfile>[] = [
    {
      key: "name",
      label: "Gian hàng",
      mobilePriority: "primary",
      render: (_, s) => (
        <div className="flex items-center gap-3">
          {s.logoUrl ? (
            <img
              src={s.logoUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-xl border object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white uppercase"
              style={{ background: s.brandColor || "#2E7D32" }}
            >
              {s.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="flex items-center gap-1 font-medium">
              <span className="truncate">{s.name}</span>
              {s.verified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-sky-600" />
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {s.slogan || `@${s.handle}`}
            </p>
          </div>
        </div>
      ),
    },
    { key: "province", label: "Khu vực", mobilePriority: "secondary" },
    {
      key: "contactName",
      label: "Liên hệ",
      render: (_, s) => (
        <div className="text-sm">
          <div>{s.contactName}</div>
          <div className="text-xs text-muted-foreground">{s.contactPhone}</div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Tham gia",
      render: (v) => <span className="text-xs">{formatDate(String(v))}</span>,
    },
    {
      key: "verified",
      label: "Xác minh",
      render: (_, s) => (
        <Switch
          checked={s.verified}
          disabled={updateVerification.isPending}
          onCheckedChange={(checked) => handleToggleVerified(s, checked)}
        />
      ),
    },
    {
      key: "active",
      label: "Hiển thị",
      mobilePriority: "badge",
      render: (_, s) => (
        <Switch
          checked={!s.suspended}
          disabled={updateSuspension.isPending}
          onCheckedChange={(checked) => handleToggleSuspension(s, checked)}
        />
      ),
    },
    {
      key: "actions",
      label: "Chi tiết",
      render: (_, s) => (
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2"
          onClick={() => navigate(ROUTES.shopDetail(String(s.id)))}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">Xem</span>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Quản lý Gian hàng</h1>
        <p className="text-sm text-muted-foreground">
          Danh sách toàn bộ gian hàng của đối tác trên nền tảng Mevi Shop
        </p>
      </div>

      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        filters={filters}
        searchPlaceholder="Tìm theo tên gian hàng, handle, SĐT liên hệ..."
        enableMobileCard
      />
    </div>
  );
}

export default function ShopListPage() {
  return (
    <RequireRole root>
      <ShopList />
    </RequireRole>
  );
}
