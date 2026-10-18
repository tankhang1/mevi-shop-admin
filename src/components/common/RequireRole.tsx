import type { ReactNode } from "react";
import { Link } from "wouter";
import { ShieldAlert } from "lucide-react";
import { Button, Card, CardContent } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ROUTES } from "@/config/routes";
import { useAccess } from "@/features/auth";
import { LoadingBlock } from "./ui-bits";

/**
 * Page-level guard. The backend already rejects these calls (403); this just shows
 * a clear message instead of a page full of errors when someone opens the URL directly.
 */
export function RequireRole({ root, shopAdmin, children }: { root?: boolean; shopAdmin?: boolean; children: ReactNode }) {
  const { isRoot, isShopAdmin, isLoading } = useAccess();
  if (isLoading) return <LoadingBlock />;
  if ((root && isRoot) || (shopAdmin && isShopAdmin)) return <>{children}</>;
  return (
    <Card className="mx-auto mt-10 max-w-md">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold">Không có quyền truy cập</h2>
        <p className="text-sm text-muted-foreground">
          {root ? "Trang này chỉ dành cho quản trị viên Mevi." : "Trang này chỉ dành cho chủ gian hàng."}
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.dashboard}>Về tổng quan</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
