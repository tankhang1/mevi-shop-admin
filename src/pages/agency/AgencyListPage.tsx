import { useState } from "react";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import {
  type Column,
  Button,
  DataTable,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { ROUTES } from "@/config/routes";
import { type Agency, useAgencies } from "@/features/agency";
import { useTableParams } from "@/hooks/useTableParams";
import { AgencyActiveToggle } from "./components/AgencyActiveToggle";
import { AgencyFormDialog } from "./components/AgencyFormDialog";
import { DeleteAgencyDialog } from "./components/DeleteAgencyDialog";

export default function AgencyListPage() {
  const [, navigate] = useLocation();
  const table = useTableParams();
  const { data: page, isFetching } = useAgencies(table.params);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Agency | undefined>();
  const [deleting, setDeleting] = useState<Agency | null>(null);

  usePageActions(() => (
    <Button
      onClick={() => {
        setEditing(undefined);
        setOpen(true);
      }}
    >
      <Plus className="mr-1 h-4 w-4" /> Thêm đại lý
    </Button>
  ));

  const columns: Column<Agency>[] = [
    {
      key: "name",
      label: "Gian hàng",
      mobilePriority: "primary",
      render: (_, a) => (
        <div className="flex items-center gap-3">
          {a.logoUrl ? (
            <img
              src={a.logoUrl}
              alt=""
              className="h-9 w-9 rounded-lg border object-cover"
            />
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
      key: "commissionRate",
      label: "Hoa hồng",
      width: "96px",
      render: (v) => <span className="font-medium">{String(v ?? 0)}%</span>,
    },
    {
      key: "contactName",
      label: "Liên hệ",
      render: (_, a) => (
        <div className="text-sm">
          <div>{a.contactName || "—"}</div>
          <div className="text-xs text-muted-foreground">
            {[a.phone, a.email].filter(Boolean).join(" · ")}
          </div>
        </div>
      ),
    },
    {
      key: "active",
      label: "Hoạt động",
      mobilePriority: "badge",
      render: (_, a) => <AgencyActiveToggle agency={a} />,
    },
  ];

  return (
    <>
      <DataTable
        {...table.bind(page, isFetching)}
        columns={columns}
        onView={(a) => navigate(ROUTES.agencyDetail(a.id))}
        onEdit={(a) => {
          setEditing(a);
          setOpen(true);
        }}
        onDelete={setDeleting}
        searchPlaceholder="Tìm theo tên, slug..."
        enableMobileCard
      />
      <AgencyFormDialog open={open} onOpenChange={setOpen} agency={editing} />
      <DeleteAgencyDialog
        agency={deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      />
    </>
  );
}
