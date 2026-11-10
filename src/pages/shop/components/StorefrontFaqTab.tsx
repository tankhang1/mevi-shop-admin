import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  HelpCircle,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
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
  cn,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import {
  type FaqBlockData,
  type FaqQuestionInput,
  type FaqQuestionItem,
  useContentBlock,
  useCreateBlockItem,
  useDeleteBlockItem,
  useReorderBlockItems,
  useUpdateBlockItem,
  useUpdateBlockSettings,
} from "@/features/content-block";
import { getErrorMessage } from "@/lib/api-error";
import { StorefrontFaqDialog } from "./StorefrontFaqDialog";

interface Props {
  workspaceId?: string | number | null;
}

export function StorefrontFaqTab({ workspaceId }: Props) {
  void workspaceId;
  // 1. Query block
  const {
    data: block,
    isLoading,
    isError,
    error,
  } = useContentBlock<FaqBlockData>("faq");

  // 2. Mutations
  const updateSettingsMutation = useUpdateBlockSettings("faq");
  const createItemMutation = useCreateBlockItem<FaqQuestionItem, FaqQuestionInput>("faq");
  const updateItemMutation = useUpdateBlockItem<FaqQuestionItem, FaqQuestionInput>("faq");
  const deleteItemMutation = useDeleteBlockItem("faq");
  const reorderMutation = useReorderBlockItems("faq");

  // Local settings overrides
  const [customEnabled, setCustomEnabled] = useState<boolean | null>(null);
  const [customEyebrow, setCustomEyebrow] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState<string | null>(null);

  const enabled = customEnabled ?? block?.enabled ?? false;
  const eyebrow = customEyebrow ?? block?.eyebrow ?? "";
  const title = customTitle ?? block?.title ?? "";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqQuestionItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqQuestionItem | null>(null);

  if (isLoading) return <LoadingBlock />;
  if (isError) {
    return (
      <EmptyBlock>
        Không thể tải cấu hình câu hỏi thường gặp: {getErrorMessage(error)}
      </EmptyBlock>
    );
  }

  const items = block?.items ?? [];

  const handleOpenCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: FaqQuestionItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSaveItem = async (input: FaqQuestionInput) => {
    if (editingItem) {
      await updateItemMutation.mutateAsync({
        id: editingItem.id,
        version: editingItem.version,
        item: input,
      });
    } else {
      await createItemMutation.mutateAsync(input);
    }
  };

  const handleToggleEnabled = (item: FaqQuestionItem) => {
    updateItemMutation.mutate({
      id: item.id,
      version: item.version,
      item: {
        enabled: !item.enabled,
        question: item.question,
        answer: item.answer,
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
  const serverEnabled = block?.enabled ?? false;

  const hasSettingsChanged =
    Boolean(block) &&
    (enabled !== serverEnabled ||
      currentEyebrow !== serverEyebrow ||
      currentTitle !== serverTitle);

  const handleSaveSettings = () => {
    if (!block || !hasSettingsChanged) return;
    updateSettingsMutation.mutate(
      {
        version: block.version,
        settings: {
          enabled,
          eyebrow: currentEyebrow,
          title: currentTitle,
        },
      },
      {
        onSuccess: () => {
          setCustomEnabled(null);
          setCustomEyebrow(null);
          setCustomTitle(null);
        },
      },
    );
  };

  const handleResetSettings = () => {
    setCustomEnabled(null);
    setCustomEyebrow(null);
    setCustomTitle(null);
  };

  const columns: Column<FaqQuestionItem>[] = [
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
      key: "question",
      label: "Câu hỏi & Câu trả lời",
      mobilePriority: "primary",
      render: (_, item) => (
        <div className="space-y-1">
          <div className="font-semibold text-sm flex items-start gap-1.5">
            <HelpCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{item.question}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 pl-5.5">
            {item.answer}
          </p>
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

  const activeItems = items.filter((i) => i.enabled);

  return (
    <div className="space-y-6">
      {/* ── Khối 1: Live Preview ── */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-muted/40 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Xem trước Câu hỏi thường gặp thực tế (Live Preview)
          </CardTitle>
          <CardDescription>
            Giao diện mở rộng dạng Accordion mà khách mua hàng sẽ nhìn thấy
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950/40">
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="text-center space-y-1.5">
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
                  (Chưa cấu hình tiêu đề FAQ)
                </div>
              )}
            </div>

            {activeItems.length > 0 ? (
              <Accordion type="single" collapsible className="w-full space-y-2">
                {activeItems.map((item, idx) => (
                  <AccordionItem
                    key={item.id || idx}
                    value={`faq-${item.id || idx}`}
                    className="border rounded-xl bg-card px-4 shadow-2xs"
                  >
                    <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                          Q
                        </span>
                        <span>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-4 pl-7">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 text-muted-foreground text-xs">
                Chưa có câu hỏi nào được bật hiển thị
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Khối 2: Cấu hình chung & Danh sách câu hỏi ── */}
      <Card>
        <CardHeader className="pb-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                Cấu hình Khối & Danh sách câu hỏi
              </CardTitle>
              <CardDescription>
                Bật/tắt hiển thị khối trên trang chủ và chỉnh sửa các câu hỏi thường gặp
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
                Thêm câu hỏi mới
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
                  Khối FAQ chỉ xuất hiện trên web khi công tắc này được Bật và Lưu cấu hình
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
                  placeholder="VD: CÂU HỎI THƯỜNG GẶP"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tiêu đề chính của khối</Label>
                <Input
                  value={title}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="VD: Bạn cần biết thêm?"
                />
              </div>
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

      {/* Dialog thêm / sửa câu hỏi */}
      <StorefrontFaqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSave={handleSaveItem}
      />

      {/* Dialog xác nhận xóa */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa câu hỏi FAQ này?"
        description={`Bạn có chắc muốn xóa câu hỏi "${deleteTarget?.question}"?`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
