import { useWorkspace } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { RequireRole } from "@/components/common/RequireRole";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { StorefrontBannersTab } from "./components/StorefrontBannersTab";

function StorefrontBanners() {
  const {
    currentWorkspaceId,
    workspaces,
    isLoading: isWorkspaceLoading,
  } = useWorkspace();
  const effectiveWorkspaceId = currentWorkspaceId || workspaces[0]?.id || null;

  if (isWorkspaceLoading) return <LoadingBlock />;
  if (!effectiveWorkspaceId) {
    return (
      <EmptyBlock>
        Tài khoản chưa được liên kết với đơn vị (workspace) gian hàng nào. Vui
        lòng liên hệ quản trị viên để hoàn tất cấu hình gian hàng.
      </EmptyBlock>
    );
  }

  return <StorefrontBannersTab workspaceId={effectiveWorkspaceId} />;
}

export default function StorefrontBannersPage() {
  return (
    <RequireRole shopAdmin root>
      <StorefrontBanners />
    </RequireRole>
  );
}
