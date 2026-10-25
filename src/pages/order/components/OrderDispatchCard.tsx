import { useState } from "react";
import { Network } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { useDispatchTeams } from "@/features/dispatch-team";
import {
  type OrderDetail,
  isFinalOrderStatus,
  useAssignOrder,
} from "@/features/order";
import { getErrorMessage } from "@/lib/api-error";

const NONE = "none";

/** Which dispatch team (and which member of it) handles this order */
export function OrderDispatchCard({ order }: { order: OrderDetail }) {
  const { toast } = useToast();
  const { data: teams } = useDispatchTeams({ shopId: order.shopId, size: 100 });
  const assign = useAssignOrder();
  const [teamId, setTeamId] = useState(order.teamId ?? NONE);
  const [assigneeId, setAssigneeId] = useState(order.assigneeId ?? NONE);
  // Paused teams stay selectable only if the order already sits there
  const options = (teams?.items ?? []).filter(
    (t) => t.active || t.id === order.teamId,
  );
  const team = options.find((t) => t.id === teamId);
  const dirty =
    teamId !== (order.teamId ?? NONE) ||
    assigneeId !== (order.assigneeId ?? NONE);
  const locked = isFinalOrderStatus(order.status);

  const onSave = async () => {
    try {
      await assign.mutateAsync({
        id: order.id,
        teamId: teamId === NONE ? null : teamId,
        assigneeId: assigneeId === NONE ? null : assigneeId,
      });
      toast({ title: "Đã cập nhật điều phối", description: order.code });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể lưu",
        description: getErrorMessage(e),
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-1.5 text-base">
          <Network className="h-4 w-4" /> Điều phối
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>Nhóm xử lý</Label>
          <Select
            value={teamId}
            disabled={locked}
            onValueChange={(v) => {
              setTeamId(v);
              setAssigneeId(NONE);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Chưa phân nhóm</SelectItem>
              {options.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Người xử lý</Label>
          <Select
            value={assigneeId}
            onValueChange={setAssigneeId}
            disabled={locked || !team}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Cả nhóm</SelectItem>
              {team?.members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                  {m.id === team.leaderId ? " (trưởng nhóm)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {dirty && (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setTeamId(order.teamId ?? NONE);
                setAssigneeId(order.assigneeId ?? NONE);
              }}
            >
              Huỷ
            </Button>
            <Button
              size="sm"
              onClick={() => void onSave()}
              disabled={assign.isPending}
            >
              Lưu
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
