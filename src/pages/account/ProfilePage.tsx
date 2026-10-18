import { LogOut } from "lucide-react";
import { Button, Card, CardContent } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { LoadingBlock } from "@/components/common/ui-bits";
import { authApi, useCurrentUser } from "@/features/auth";

/** Mobile "Tài khoản" tab */
export default function ProfilePage() {
  const { data, roles, isLoading } = useCurrentUser();
  if (isLoading) return <LoadingBlock />;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Card>
        <CardContent className="space-y-1 p-5">
          <p className="text-lg font-semibold">{data?.name || data?.username || "—"}</p>
          {data?.email && <p className="text-sm text-muted-foreground">{data.email}</p>}
          {data?.phoneNumber && <p className="text-sm text-muted-foreground">{data.phoneNumber}</p>}
          {roles.length > 0 && <p className="pt-2 text-xs text-muted-foreground">{roles.join(" · ")}</p>}
        </CardContent>
      </Card>
      <Button variant="outline" className="w-full" onClick={authApi.logout}>
        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
      </Button>
    </div>
  );
}
