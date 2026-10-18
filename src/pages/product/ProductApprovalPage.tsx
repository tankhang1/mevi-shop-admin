import { useState } from "react";
import { Check, X } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { type Product, useModerateProduct, useProducts } from "@/features/product";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate, formatVnd } from "@/lib/format";
import { EmptyBlock, LoadingBlock, PageHeader } from "@/components/common/ui-bits";

export default function ProductApprovalPage() {
  const { toast } = useToast();
  const { data: page, isLoading } = useProducts({ status: "pending" });
  const data = page?.items ?? [];
  const moderate = useModerateProduct();
  const [rejecting, setRejecting] = useState<Product | null>(null);
  const [reason, setReason] = useState("");

  const approve = async (p: Product) => {
    try {
      await moderate.mutateAsync({ id: p.id, data: { status: "approved" } });
      toast({ title: "Đã duyệt", description: `${p.name} đã hiển thị trên cửa hàng` });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const reject = async () => {
    if (!rejecting || !reason.trim()) return;
    try {
      await moderate.mutateAsync({ id: rejecting.id, data: { status: "rejected", rejectionReason: reason.trim() } });
      toast({ title: "Đã từ chối", description: rejecting.name });
      setRejecting(null);
      setReason("");
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  if (isLoading) return <LoadingBlock />;

  return (
    <>
      <PageHeader description={`${data.length} sản phẩm đang chờ duyệt`} />
      {data.length === 0 ? (
        <Card>
          <EmptyBlock>Không có sản phẩm nào chờ duyệt 🎉</EmptyBlock>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <img src={p.images[0] || placeholder} alt="" className="aspect-[4/3] w-full object-cover" />
              <CardContent className="space-y-3 p-4">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {p.sku} · {p.category} · {formatDate(p.createdAt)}
                  </p>
                </div>
                <p className="font-medium">{formatVnd(p.salePrice ?? p.price)}</p>
                {p.origin && <p className="text-sm text-muted-foreground">Nguồn gốc: {p.origin}</p>}
                <div className="flex gap-2 pt-1">
                  <Button className="flex-1" onClick={() => void approve(p)} disabled={moderate.isPending}>
                    <Check className="mr-1 h-4 w-4" /> Duyệt
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setRejecting(p)}>
                    <X className="mr-1 h-4 w-4" /> Từ chối
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && (setRejecting(null), setReason(""))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối "{rejecting?.name}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reason">
              Lý do từ chối<span className="text-destructive"> *</span>
            </Label>
            <Textarea id="reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Huỷ
            </Button>
            <Button variant="destructive" disabled={!reason.trim() || moderate.isPending} onClick={() => void reject()}>
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
