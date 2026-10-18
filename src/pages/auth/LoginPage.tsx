import { LogIn } from "lucide-react";
import { Button, Card, CardContent } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { authApi } from "@/features/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#214c3a] p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold">
            Eco <span className="font-normal text-muted-foreground">Shop</span>
          </h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">Đăng nhập trang quản trị cửa hàng</p>
          <Button type="button" className="h-11 w-full" onClick={() => authApi.startLogin()}>
            <LogIn className="mr-2 h-4 w-4" /> Đăng nhập với Mevi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
