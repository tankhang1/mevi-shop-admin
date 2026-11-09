import { useWorkspace } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { RequireRole } from "@/components/common/RequireRole";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { StorefrontFaqTab } from "./components/StorefrontFaqTab";

function StorefrontFaq() {
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

  return <StorefrontFaqTab workspaceId={effectiveWorkspaceId} />;
}

export default function StorefrontFaqPage() {
  return (
    <RequireRole shopAdmin root>
      <StorefrontFaq />
    </RequireRole>
  );
}

