import { useLocation } from "wouter";
import { BadgeCheck, Star } from "lucide-react";
import { type Column, DataTable, Switch, type TableFilterDef, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { RequireRole } from "@/components/common/RequireRole";
import { ROUTES } from "@/config/routes";
import { type Shop, type ShopListParams, useShops, useUpdateShop } from "@/features/shop";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";

const filters: TableFilterDef[] = [
  {
    key: "verified",
    label: "Xác minh",
    options: [
      { label: "Đã xác minh", value: "true" },
      { label: "Chưa xác minh", value: "false" },
    ],
  },
];

function ShopList() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const table = useTableParams<Pick<ShopListParams, "verified">>({ verified: "all" });
  const { data: page, isFetching } = useShops(table.params);
  const update = useUpdateShop();

  const toggle = (s: Shop, data: Partial<Pick<Shop, "verified" | "active">>, done: string) =>
    update.mutate(
      { id: s.id, data },
      {
        onSuccess: () => toast({ title: done, description: s.name }),
        onError: (e) => toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) }),
      },
    );

  const columns: Column<Shop>[] = [
    {
      key: "name",
      label: "Gian hàng",
      mobilePriority: "primary",
      render: (_, s) => (
        <div className="flex items-center gap-3">
          <img src={s.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-xl border object-cover" />
          <div className="min-w-0">
            <p className="flex items-center gap-1 font-medium">
              <span className="truncate">{s.name}</span>
              {s.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-sky-600" />}
            </p>
            <p className="truncate text-xs text-muted-foreground">{s.tagline}</p>
          </div>
        </div>
      ),
    },
    { key: "location", label: "Khu vực", mobilePriority: "secondary" },
    {
      key: "contactName",
      label: "Liên hệ",
      render: (_, s) => (
        <div className="text-sm">
          <div>{s.contactName}</div>
          <div className="text-xs text-muted-foreground">{s.phone}</div>
        </div>
      ),
    },
    { key: "productCount", label: "Sản phẩm", sortable: true },
    {
      key: "rating",
      label: "Đánh giá",
      sortable: true,
      render: (_, s) =>
        s.reviewCount ? (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {s.rating.toFixed(1)}
            <span className="text-xs text-muted-foreground">({s.reviewCount})</span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "joinedAt", label: "Tham gia", render: (v) => <span className="text-sm">{formatDate(String(v)).split(" ")[1]}</span> },
    {
      key: "verified",
      label: "Xác minh",
      render: (_, s) => (
        <Switch
          checked={s.verified}
          onCheckedChange={(verified) => toggle(s, { verified }, verified ? "Đã xác minh gian hàng" : "Đã gỡ xác minh")}
        />
      ),
    },
    {
      key: "active",
      label: "Hiển thị",
      mobilePriority: "badge",
      render: (_, s) => (
        <Switch
          checked={s.active}
          onCheckedChange={(active) => toggle(s, { active }, active ? "Đã mở gian hàng" : "Đã ẩn gian hàng")}
        />
      ),
    },
  ];

  return (
    <DataTable
      {...table.bind(page, isFetching)}
      columns={columns}
      filters={filters}
      searchPlaceholder="Tìm theo tên, khu vực, người liên hệ..."
      enableMobileCard
      onView={(s) => navigate(ROUTES.shopDetail(s.id))}
    />
  );
}

export default function ShopListPage() {
  return (
    <RequireRole root>
      <ShopList />
    </RequireRole>
  );
}
