import { useState } from "react";
import { Plus } from "lucide-react";
import { type Column, Button, DataTable, Switch, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { PageHeader } from "@/components/common/ui-bits";
import { type Agency, useAgencies, useUpdateAgency } from "@/features/agency";
import { useTableParams } from "@/hooks/useTableParams";
import { getErrorMessage } from "@/lib/api-error";
import { AgencyFormDialog } from "./components/AgencyFormDialog";

export default function AgencyListPage() {
  const { toast } = useToast();
  const table = useTableParams();
  const { data: page, isFetching } = useAgencies(table.params);
  const update = useUpdateAgency();
  const [open, setOpen] = useState(false);

  const toggleActive = (id: string, active: boolean) =>
    update.mutate(
      { id, data: { active } },
      { onError: (e) => toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) }) },
    );

  const columns: Column<Agency>[] = [
    {
      key: "name",
      label: "Gian hàng",
      mobilePriority: "primary",
      render: (_, a) => (
        <div className="flex items-center gap-3">
          {a.logoUrl ? (
            <img src={a.logoUrl} alt="" className="h-9 w-9 rounded-lg border object-cover" />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
              style={{ background: a.brandColor || "#214c3a" }}
            >
              {a.name.charAt(0)}
            </div>
          )}
          <span className="font-medium">{a.name}</span>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      mobilePriority: "secondary",
      render: (v) => <span className="font-mono text-xs">{String(v)}</span>,
    },
    {
      key: "contactName",
      label: "Liên hệ",
      render: (_, a) => (
        <div className="text-sm">
          <div>{a.contactName || "—"}</div>
          <div className="text-xs text-muted-foreground">{[a.phone, a.email].filter(Boolean).join(" · ")}</div>
        </div>
      ),
    },
    {
      key: "active",
      label: "Hoạt động",
      mobilePriority: "badge",
      render: (_, a) => <Switch checked={a.active} onCheckedChange={(active) => toggleActive(a.id, active)} />,
    },
  ];

  return (
    <>
      <PageHeader
        description={`${page?.total ?? 0} đại lý`}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Thêm đại lý
          </Button>
        }
      />
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        searchPlaceholder="Tìm theo tên, slug..."
        enableMobileCard
      />
      <AgencyFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
