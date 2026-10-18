import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  Card,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock, PageHeader } from "@/components/common/ui-bits";
import { useAgencies, useUpdateAgency } from "@/features/agency";
import { getErrorMessage } from "@/lib/api-error";
import { AgencyFormDialog } from "./components/AgencyFormDialog";

export default function AgencyListPage() {
  const { toast } = useToast();
  const { data: page, isLoading } = useAgencies();
  const data = page?.items ?? [];
  const update = useUpdateAgency();
  const [open, setOpen] = useState(false);

  const toggleActive = (id: string, active: boolean) =>
    update.mutate(
      { id, data: { active } },
      { onError: (e) => toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) }) },
    );

  return (
    <>
      <PageHeader
        description={`${page?.total ?? 0} đại lý · ${data.filter((a) => a.active).length} đang hoạt động`}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Thêm đại lý
          </Button>
        }
      />
      <Card className="overflow-x-auto">
        {isLoading ? (
          <LoadingBlock />
        ) : data.length === 0 ? (
          <EmptyBlock>Chưa có đại lý</EmptyBlock>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gian hàng</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Hoạt động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {a.logoUrl ? (
                        <img src={a.logoUrl} alt="" className="h-9 w-9 rounded-lg border object-cover" />
                      ) : (
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                          style={{ background: a.brandColor || "#214c3a" }}
                        >
                          {a.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">{a.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{a.slug}</TableCell>
                  <TableCell className="text-sm">
                    <div>{a.contactName || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {[a.phone, a.email].filter(Boolean).join(" · ")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={a.active} onCheckedChange={(active) => toggleActive(a.id, active)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <AgencyFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
