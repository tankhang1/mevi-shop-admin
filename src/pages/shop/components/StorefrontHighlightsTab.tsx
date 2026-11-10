import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Layers,
  Link as LinkIcon,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  type Column,
  DataTable,
  DeleteDialog,
  Input,
  Label,
  Switch,
  Textarea,
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import { HIGHLIGHT_ICON_MAP } from "@/features/storefront";
import {
  type HighlightCardInput,
  type HighlightCardItem,
  type HighlightsBlockData,
  useContentBlock,
  useCreateBlockItem,
  useDeleteBlockItem,
  useReorderBlockItems,
  useUpdateBlockItem,
  useUpdateBlockSettings,
} from "@/features/content-block";
import { getErrorMessage } from "@/lib/api-error";
import { StorefrontHighlightCardDialog } from "./StorefrontHighlightCardDialog";

interface Props {
  workspaceId?: string | number | null;
}

export function StorefrontHighlightsTab({ workspaceId }: Props) {
  void workspaceId;
  // 1. Query
  const {
    data: block,
    isLoading,
    isError,
    error,
  } = useContentBlock<HighlightsBlockData>("highlights");

  // 2. Mutations
  const updateSettingsMutation = useUpdateBlockSettings("highlights");
  const createItemMutation = useCreateBlockItem<HighlightCardItem, HighlightCardInput>("highlights");
  const updateItemMutation = useUpdateBlockItem<HighlightCardItem, HighlightCardInput>("highlights");
  const deleteItemMutation = useDeleteBlockItem("highlights");
  const reorderMutation = useReorderBlockItems("highlights");

  // Local settings overrides
  const [customEnabled, setCustomEnabled] = useState<boolean | null>(null);
  const [customEyebrow, setCustomEyebrow] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [customDescription, setCustomDescription] = useState<string | null>(null);

  const enabled = customEnabled ?? block?.enabled ?? false;
  const eyebrow = customEyebrow ?? block?.eyebrow ?? "";
  const title = customTitle ?? block?.title ?? "";
  const description = customDescription ?? block?.description ?? "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<HighlightCardItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HighlightCardItem | null>(null);

  if (isLoading) return <LoadingBlock />;
  if (isError) {
    return (
      <EmptyBlock>
        Không thể tải cấu hình khối nổi bật: {getErrorMessage(error)}
      </EmptyBlock>
    );
  }

  const items = block?.items ?? [];

  const handleOpenCreate = () => {
    setEditingCard(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (c: HighlightCardItem) => {
    setEditingCard(c);
    setDialogOpen(true);
  };

  const handleSaveCard = async (input: HighlightCardInput) => {
    if (editingCard) {
      await updateItemMutation.mutateAsync({
        id: editingCard.id,
        version: editingCard.version,
        item: input,
      });
    } else {
      await createItemMutation.mutateAsync(input);
    }
  };

  const handleToggleEnabled = (item: HighlightCardItem) => {
    updateItemMutation.mutate({
      id: item.id,
      version: item.version,
      item: {
        enabled: !item.enabled,
        icon: item.icon,
        title: item.title,
        description: item.description,
        link: item.link,
      },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteItemMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const newIds = newItems.map((it) => it.id);
    reorderMutation.mutate(newIds);
  };

  const currentEyebrow = eyebrow.trim() || null;
  const serverEyebrow = block?.eyebrow ?? null;
  const currentTitle = title.trim() || null;
  const serverTitle = block?.title ?? null;
  const currentDesc = description.trim() || null;
  const serverDesc = block?.description ?? null;
  const serverEnabled = block?.enabled ?? false;

  const hasSettingsChanged =
    Boolean(block) &&
    (enabled !== serverEnabled ||
      currentEyebrow !== serverEyebrow ||
      currentTitle !== serverTitle ||
      currentDesc !== serverDesc);

  const handleSaveSettings = () => {
    if (!block || !hasSettingsChanged) return;
    updateSettingsMutation.mutate(
      {
        version: block.version,
        settings: {
          enabled,
          eyebrow: currentEyebrow,
          title: currentTitle,
          description: currentDesc,
        },
      },
      {
        onSuccess: () => {
          setCustomEnabled(null);
          setCustomEyebrow(null);
          setCustomTitle(null);
          setCustomDescription(null);
        },
      },
    );
  };

  const handleResetSettings = () => {
    setCustomEnabled(null);
    setCustomEyebrow(null);
    setCustomTitle(null);
    setCustomDescription(null);
  };

  const columns: Column<HighlightCardItem>[] = [
    {
      key: "id",
      label: "STT",
      width: "60px",
      render: (_, row) => {
        const index = items.findIndex((it) => it.id === row.id);
        return (
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            #{String(index + 1).padStart(2, "0")}
          </span>
        );
      },
    },
    {
      key: "order",
      label: "Thứ tự",
      width: "90px",
      render: (_, row) => {
        const index = items.findIndex((it) => it.id === row.id);
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={index <= 0}
              onClick={() => handleMove(index, "up")}
              title="Di chuyển lên trên"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={index < 0 || index >= items.length - 1}
              onClick={() => handleMove(index, "down")}
              title="Di chuyển xuống dưới"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
    {
      key: "icon",
      label: "Biểu tượng",
      width: "80px",
      render: (iconKey) => {
        const iconDef = HIGHLIGHT_ICON_MAP[String(iconKey)];
        const IconComponent = iconDef ? iconDef.icon : Sparkles;
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <IconComponent className="h-4 w-4" />
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Nội dung cam kết",
      mobilePriority: "primary",
      render: (_, item) => (
        <div className="space-y-1">
          <div className="font-semibold text-sm">{item.title}</div>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          {item.link && (
            <div className="flex items-center gap-1 text-[11px] text-primary">
              <LinkIcon className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{item.link}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "enabled",
      label: "Trạng thái",
      width: "120px",
      render: (_, item) => (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={item.enabled}
            onCheckedChange={() => handleToggleEnabled(item)}
          />
          <span
            className={cn(
              "text-xs font-medium max-sm:hidden",
              item.enabled
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground",
            )}
          >
            {item.enabled ? "Hiện" : "Ẩn"}
          </span>
        </div>
      ),
    },
  ];

  const activeCards = items.filter((c) => c.enabled);

  return (
    <div className="space-y-6">
      {/* ── Khối 1: Live Preview ── */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-muted/40 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Xem trước Khối Nổi bật thực tế (Live Preview)
          </CardTitle>
          <CardDescription>
            Khối hiển thị trực quan cam kết chất lượng của Mevi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/40">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="text-center space-y-2">
              {eyebrow ? (
                <div className="text-[11px] font-bold tracking-wider uppercase text-primary">
                  {eyebrow}
                </div>
              ) : null}
              {title ? (
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
                  {title}
                </h3>
              ) : (
                <div className="text-sm sm:text-base font-semibold italic text-muted-foreground/60">
                  (Chưa cấu hình tiêu đề khối nổi bật)
                </div>
              )}
              {description ? (
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto">
                  {description}
                </p>
              ) : null}
            </div>

            {activeCards.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {activeCards.map((c, i) => {
                  const iconDef = HIGHLIGHT_ICON_MAP[c.icon];
                  const Icon = iconDef ? iconDef.icon : Sparkles;
                  return (
                    <div
                      key={c.id || i}
                      className="rounded-xl border bg-card p-4 shadow-xs space-y-2 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm text-foreground">
                          {c.title}
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {c.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 text-muted-foreground text-xs">
                Chưa có thẻ nổi bật nào được bật hiển thị
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Khối 2: Cấu hình khối & Danh sách thẻ ── */}
      <Card>
        <CardHeader className="pb-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                Cấu hình Khối & Danh sách thẻ
              </CardTitle>
              <CardDescription>
                Bật/tắt hiển thị khối trên trang chủ và chỉnh sửa các thẻ cam kết
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetSettings}
                disabled={!hasSettingsChanged || updateSettingsMutation.isPending}
                title="Khôi phục trạng thái ban đầu"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Hoàn tác
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSettings}
                disabled={!hasSettingsChanged || updateSettingsMutation.isPending}
                className="px-3"
              >
                {updateSettingsMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                )}
                Lưu cấu hình
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleOpenCreate}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Thêm thẻ mới
              </Button>
            </div>
          </div>

          {/* Form cấu hình khối */}
          <div className="rounded-lg bg-muted/40 p-4 border space-y-3">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <Label className="text-sm font-semibold">
                  Hiển thị khối trên trang chủ
                </Label>
                <p className="text-xs text-muted-foreground">
                  Khối chỉ xuất hiện trên web khi công tắc này được Bật và Lưu cấu hình
                </p>
              </div>
              <Switch checked={enabled} onCheckedChange={setCustomEnabled} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Dòng chữ dẫn phía trên (Eyebrow)</Label>
                <Input
                  value={eyebrow}
                  onChange={(e) => setCustomEyebrow(e.target.value)}
                  placeholder="VD: MỖI SẢN PHẨM CÓ CÂU CHUYỆN"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tiêu đề chính của khối</Label>
                <Input
                  value={title}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="VD: Biết rõ điều gì đang có trên bàn ăn."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Đoạn mô tả giới thiệu</Label>
              <Textarea
                value={description}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={2}
                placeholder="VD: Mevi kết nối những sản phẩm nông nghiệp..."
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            data={items}
            columns={columns}
            searchable={false}
            filterable={false}
            columnToggleable={false}
            downloadable={false}
            totalPages={1}
            totalElements={items.length}
            pageSize={items.length || 10}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTarget}
            enableMobileCard
          />
        </CardContent>
      </Card>

      {/* Dialog thêm / sửa thẻ */}
      <StorefrontHighlightCardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        card={editingCard}
        onSave={handleSaveCard}
      />

      {/* Dialog xác nhận xóa */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa thẻ nổi bật này?"
        description={`Bạn có chắc muốn xóa thẻ "${deleteTarget?.title}"?`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
