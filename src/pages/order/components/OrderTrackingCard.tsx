import { useState } from "react";
import { Copy, Truck } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { type Order, SHIPPING_CARRIERS, useUpdateOrderTracking } from "@/features/order";
import { getErrorMessage } from "@/lib/api-error";

/** Mã vận đơn + carrier. Remount with a key on the saved values to reset the draft */
export function OrderTrackingCard({ order }: { order: Order }) {
  const { toast } = useToast();
  const save = useUpdateOrderTracking();
  const [carrier, setCarrier] = useState(order.carrier ?? "");
  const [code, setCode] = useState(order.trackingCode ?? "");
  const dirty = carrier !== (order.carrier ?? "") || code.trim() !== (order.trackingCode ?? "");

  const onSave = async () => {
    try {
      await save.mutateAsync({ id: order.id, carrier, trackingCode: code });
      toast({ title: code.trim() ? "Đã lưu mã vận đơn" : "Đã xoá mã vận đơn", description: order.code });
    } catch (e) {
      toast({ variant: "destructive", title: "Không thể lưu", description: getErrorMessage(e) });
    }
  };

  const copy = () => {
    void navigator.clipboard?.writeText(code.trim());
    toast({ title: "Đã sao chép mã vận đơn" });
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
        <CardTitle className="flex items-center gap-1.5 text-base">
          <Truck className="h-4 w-4" /> Vận chuyển
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="space-y-1.5">
          <Label>Đơn vị vận chuyển</Label>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn đơn vị vận chuyển" />
            </SelectTrigger>
            <SelectContent>
              {SHIPPING_CARRIERS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tracking">Mã vận đơn</Label>
          <div className="flex gap-2">
            <Input
              id="tracking"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: GHN123456789"
              className="font-mono"
            />
            {!!order.trackingCode && !dirty && (
              <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Sao chép mã vận đơn">
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        {dirty && (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setCarrier(order.carrier ?? "");
                setCode(order.trackingCode ?? "");
              }}
            >
              Huỷ
            </Button>
            <Button size="sm" onClick={() => void onSave()} disabled={save.isPending || (!!code.trim() && !carrier)}>
              Lưu mã vận đơn
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
