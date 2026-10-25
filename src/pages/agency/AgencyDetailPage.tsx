import { type ElementType, type ReactNode, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  Banknote,
  Clock3,
  Copy,
  ExternalLink,
  Mail,
  Pencil,
  Phone,
  ShoppingBag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { BackLink } from "@/components/common/BackLink";
import {
  EmptyBlock,
  LoadingBlock,
  StatusPill,
} from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { useAgency } from "@/features/agency";
import {
  type OrderListParams,
  isFinalOrderStatus,
  useOrders,
} from "@/features/order";
import {
  orderColumns,
  orderFilters,
} from "@/features/order/components/order-columns";
import { useTableParams } from "@/hooks/useTableParams";
import { formatDate, formatVnd } from "@/lib/format";
import { AgencyActiveToggle } from "./components/AgencyActiveToggle";
import { AgencyCommissions } from "./components/AgencyCommissions";
import { AgencyFormDialog } from "./components/AgencyFormDialog";
import { DeleteAgencyDialog } from "./components/DeleteAgencyDialog";

/** Storefront the agency's referral link points to (?ref={slug}) */
const SHOP_URL = import.meta.env.VITE_SHOP_URL ?? "https://mevi.vn";

const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium">
      {children || "—"}
    </dd>
  </div>
);

function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: ElementType;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

export default function AgencyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { data: agency, isLoading, isError } = useAgency(id);
  const [, navigate] = useLocation();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // All of the agency's orders for the stat cards; the table below pages separately
  const { data: allOrders } = useOrders({ agencyId: id, size: 10_000 });
  const table = useTableParams<Pick<OrderListParams, "status">>({
    status: "all",
  });
  const { data: page, isFetching } = useOrders({
    ...table.params,
    agencyId: id,
  });

  usePageActions(
    () =>
      agency && (
        <>
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1.5 h-4 w-4 text-destructive" /> Xoá
          </Button>
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-4 w-4" /> Sửa thông tin
          </Button>
        </>
      ),
    [agency?.id],
  );

  if (isLoading) return <LoadingBlock />;
  if (isError || !agency) {
    return (
      <EmptyBlock>
        Không tìm thấy đại lý.{" "}
        <Link href={ROUTES.agencies} className="text-primary underline">
          Quay lại danh sách
        </Link>
      </EmptyBlock>
    );
  }

  const orders = allOrders?.items ?? [];
  const completed = orders.filter((o) => o.status === "completed");
  const revenue = completed.reduce((s, o) => s + o.total, 0);
  const color = agency.brandColor || "#214c3a";
  const shareUrl = `${SHOP_URL}/?ref=${agency.slug}`;

  const copyLink = () =>
    navigator.clipboard.writeText(shareUrl).then(
      () =>
        toast({ title: "Đã sao chép link gian hàng", description: shareUrl }),
      () => toast({ variant: "destructive", title: "Không thể sao chép" }),
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <BackLink to={ROUTES.agencies} label="Danh sách đại lý" />
        <StatusPill
          label={agency.active ? "Đang hoạt động" : "Tạm dừng"}
          className={
            agency.active
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-200 text-slate-700"
          }
        />
        <span className="text-xs text-muted-foreground">
          Tham gia {formatDate(agency.createdAt)}
        </span>
      </div>

      <Card className="overflow-hidden">
        <div className="h-1.5" style={{ background: color }} />
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {agency.logoUrl ? (
              <img
                src={agency.logoUrl}
                alt=""
                className="h-16 w-16 rounded-xl border object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white"
                style={{ background: color }}
              >
                {agency.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-bold" style={{ color }}>
                {agency.name}
              </h2>
              <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                {agency.slug}
                <StatusPill
                  label={`Hoa hồng ${agency.commissionRate}%`}
                  className="bg-primary/10 font-sans text-primary"
                />
              </p>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs font-medium">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Gian hàng công khai
                </a>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Copy className="h-3.5 w-3.5" /> Sao chép link
                </button>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            Hoạt động <AgencyActiveToggle agency={agency} />
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Thông tin liên hệ</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4">
              <InfoRow label="Người liên hệ">{agency.contactName}</InfoRow>
              <InfoRow label="Điện thoại">
                {agency.phone && (
                  <a
                    href={`tel:${agency.phone}`}
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" /> {agency.phone}
                  </a>
                )}
              </InfoRow>
              <InfoRow label="Email">
                {agency.email && (
                  <a
                    href={`mailto:${agency.email}`}
                    className="inline-flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" /> {agency.email}
                  </a>
                )}
              </InfoRow>
              <InfoRow label="Màu thương hiệu">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-5 w-5 rounded border"
                    style={{ background: color }}
                  />
                  <span className="font-mono text-xs">{color}</span>
                </span>
              </InfoRow>
              <InfoRow label="Logo">
                {agency.logoUrl ? (
                  <img
                    src={agency.logoUrl}
                    alt="Logo"
                    className="h-14 w-14 rounded-lg border object-cover"
                  />
                ) : (
                  "Chưa có logo"
                )}
              </InfoRow>
              <InfoRow label="Ngày tham gia">
                {formatDate(agency.createdAt)}
              </InfoRow>
            </dl>
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Tổng đơn"
              value={String(orders.length)}
              note="Qua link giới thiệu"
              icon={ShoppingBag}
            />
            <StatCard
              label="Đang xử lý"
              value={String(
                orders.filter((o) => !isFinalOrderStatus(o.status)).length,
              )}
              note="Chưa hoàn tất"
              icon={Clock3}
            />
            <StatCard
              label="Doanh thu"
              value={formatVnd(revenue)}
              note="Đơn hoàn tất"
              icon={Banknote}
            />
            <StatCard
              label="Giá trị TB"
              value={formatVnd(
                completed.length ? Math.round(revenue / completed.length) : 0,
              )}
              note="Mỗi đơn hoàn tất"
              icon={TrendingUp}
            />
          </div>

          <Tabs defaultValue="orders" className="space-y-3">
            <TabsList>
              <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
              <TabsTrigger value="commissions">Hoa hồng</TabsTrigger>
            </TabsList>
            <TabsContent value="orders" className="mt-0">
              <DataTable
                {...table.bind(page, isFetching)}
                columns={orderColumns}
                onView={(o) => navigate(ROUTES.orderDetail(o.id))}
                filters={orderFilters}
                searchPlaceholder="Tìm theo mã đơn, người nhận, SĐT..."
                enableMobileCard
              />
            </TabsContent>
            <TabsContent value="commissions" className="mt-0">
              <AgencyCommissions agency={agency} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AgencyFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        agency={agency}
      />
      <DeleteAgencyDialog
        agency={deleteOpen ? agency : null}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate(ROUTES.agencies)}
      />
    </div>
  );
}
