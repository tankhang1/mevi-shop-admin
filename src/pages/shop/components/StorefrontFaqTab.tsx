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
  Badge,
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
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import {
  type StorefrontFaqItem,
  type StorefrontFaqSection,
  useStorefrontHomeConfig,
  useUpdateStorefrontFaq,
} from "@/features/storefront";
import { getErrorMessage } from "@/lib/api-error";
import { StorefrontFaqDialog } from "./StorefrontFaqDialog";

interface Props {
  workspaceId?: string | number | null;
}

export function StorefrontFaqTab({ workspaceId }: Props) {
  const { toast } = useToast();
  const {
    data: config,
    isLoading,
    isError,
    error,
  } = useStorefrontHomeConfig(workspaceId);
  const updateFaqMutation = useUpdateStorefrontFaq(workspaceId);

  const [localFaqSection, setLocalFaqSection] =
    useState<StorefrontFaqSection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StorefrontFaqItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<StorefrontFaqItem | null>(
    null,
  );

  if (isLoading) return <LoadingBlock />;
  if (isError) {
    return (
      <EmptyBlock>
        Không thể tải cấu hình câu hỏi thường gặp: {getErrorMessage(error)}
      </EmptyBlock>
    );
  }

  const current = localFaqSection ??
    config?.faq ?? {
      enabled: true,
      kicker: "CÂU HỎI THƯỜNG GẶP",
      title: "Bạn cần biết thêm?",
      items: [],
    };

  const activeItems = current.items.filter((i) => i.active);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: StorefrontFaqItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSaveItem = (saved: StorefrontFaqItem) => {
    const exists = current.items.some((i) => i.id === saved.id);
    const newItems = exists
      ? current.items.map((i) => (i.id === saved.id ? saved : i))
      : [...current.items, saved];

    setLocalFaqSection({ ...current, items: newItems });
    toast({
      title: exists ? "Đã cập nhật câu hỏi" : "Đã thêm câu hỏi mới",
      description: "Nhớ nhấn 'Lưu cấu hình' để hoàn tất.",
    });
  };

  const handleDeleteItem = () => {
    if (!deleteTarget) return;
    const newItems = current.items.filter((i) => i.id !== deleteTarget.id);
    setLocalFaqSection({ ...current, items: newItems });
    setDeleteTarget(null);
    toast({ title: "Đã xóa câu hỏi khỏi danh sách" });
  };

  const handleToggleActive = (id: string) => {
    const newItems = current.items.map((i) =>
      i.id === id ? { ...i, active: !i.active } : i,
    );
    setLocalFaqSection({ ...current, items: newItems });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.items.length) return;

    const newItems = [...current.items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const sorted = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));
    setLocalFaqSection({ ...current, items: sorted });
  };

  const handleSaveAll = async () => {
    try {
      await updateFaqMutation.mutateAsync(current);
      setLocalFaqSection(null);
      toast({
        title: "Đã lưu khối câu hỏi FAQ thành công",
        description: "Các câu hỏi thường gặp đã được cập nhật trên trang chủ.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể lưu",
        description: getErrorMessage(e),
      });
    }
  };

  const handleReset = () => {
    setLocalFaqSection(null);
    toast({ title: "Đã hoàn tác về cấu hình hiện tại" });
  };

  const columns: Column<StorefrontFaqItem>[] = [
    {
      key: "stt",
      label: "Thứ tự",
      width: "90px",
      render: (_, item) => {
        const index = current.items.findIndex((i) => i.id === item.id);
        return (
          <div className="flex items-center gap-1">
            <span className="font-semibold text-xs text-muted-foreground w-4 text-center">
              #{index + 1}
            </span>
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMove(index, "up");
                }}
                title="Di chuyển lên"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                disabled={index === current.items.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMove(index, "down");
                }}
                title="Di chuyển xuống"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      },
    },
    {
      key: "question",
      label: "Câu hỏi",
      mobilePriority: "primary",
      render: (_, item) => (
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary mt-0.5">
            <HelpCircle className="h-3.5 w-3.5" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-sm text-foreground">
              {item.question}
            </div>
            {!item.active && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 text-muted-foreground"
              >
                Đang ẩn
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "answer",
      label: "Nội dung câu trả lời",
      render: (answer) => (
        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed max-w-xl">
          {String(answer)}
        </p>
      ),
    },
    {
      key: "active",
      label: "Trạng thái",
      width: "120px",
      render: (_, item) => (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={item.active}
            onCheckedChange={() => handleToggleActive(item.id)}
          />
          <span
            className={cn(
              "text-xs font-medium max-sm:hidden",
              item.active
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground",
            )}
          >
            {item.active ? "Hiện" : "Ẩn"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Khối 1: Live Preview mô phỏng Ảnh 3 ── */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-muted/40 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Xem trước giao diện thực tế (Live Preview)
              </CardTitle>
              <CardDescription>
                Mô phỏng trải nghiệm người dùng đóng/mở câu hỏi thường gặp trên
                storefront
              </CardDescription>
            </div>
            <Badge
              variant={current.enabled ? "default" : "secondary"}
              className="text-xs"
            >
              {current.enabled ? "Đang hiển thị" : "Đang ẩn"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 bg-muted/20 border-t">
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Header kicker & title */}
            <div>
              {current.kicker && (
                <p className="text-xs font-bold tracking-widest uppercase text-amber-700 dark:text-amber-500 mb-1">
                  {current.kicker}
                </p>
              )}
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {current.title || "Câu hỏi thường gặp"}
              </h2>
            </div>

            {/* Accordion Questions */}
            {activeItems.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-xl bg-card">
                Chưa có câu hỏi nào được kích hoạt hiển thị trong khối FAQ.
              </div>
            ) : (
              <Accordion
                type="single"
                collapsible
                defaultValue={activeItems[0]?.id}
                className="space-y-3"
              >
                {activeItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border border-border rounded-xl bg-card px-4 sm:px-6 shadow-2xs overflow-hidden transition-all data-[state=open]:border-primary/40 data-[state=open]:shadow-sm"
                  >
                    <AccordionTrigger className="text-left font-bold text-sm sm:text-base py-4 hover:no-underline text-foreground">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 pb-4 whitespace-pre-line">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Khối 2: Cài đặt tiêu đề & Danh sách câu hỏi ── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Thiết lập khối FAQ</CardTitle>
              <CardDescription>
                Thêm mới, chỉnh sửa nội dung câu hỏi và sắp xếp thứ tự hiển thị
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Hoàn tác
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={updateFaqMutation.isPending}
                className="px-3"
              >
                {updateFaqMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                )}
                Lưu cấu hình
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Header config */}
          <div className="rounded-xl border p-4 bg-muted/20 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">
                  Hiển thị khối FAQ trên trang chủ
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bật/tắt mục câu hỏi thường gặp đối với khách hàng
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={current.enabled}
                  onCheckedChange={(checked) =>
                    setLocalFaqSection({ ...current, enabled: checked })
                  }
                  id="faq-enabled"
                />
                <span className="text-xs font-medium">
                  {current.enabled ? "Đang bật" : "Đang tắt"}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold">
                  Dòng chữ dẫn phía trên (Dòng dẫn đầu đề)
                </Label>
                <Input
                  value={current.kicker}
                  onChange={(e) =>
                    setLocalFaqSection({ ...current, kicker: e.target.value })
                  }
                  placeholder="VD: CÂU HỎI THƯỜNG GẶP"
                  className="mt-1 uppercase tracking-wider font-semibold text-xs"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Đoạn chữ nhỏ in hoa nằm ngay phía trên tiêu đề chính để định
                  vị chủ đề.
                </p>
              </div>

              <div>
                <Label className="text-xs font-semibold">
                  Tiêu đề chính của khối
                </Label>
                <Input
                  value={current.title}
                  onChange={(e) =>
                    setLocalFaqSection({ ...current, title: e.target.value })
                  }
                  placeholder="VD: Bạn cần biết thêm?"
                  className="mt-1 font-bold text-base"
                />
              </div>
            </div>
          </div>

          {/* Q&A List */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">
                  Danh sách câu hỏi & trả lời
                </h4>
                <Badge variant="outline" className="text-xs font-semibold">
                  {current.items.length} câu hỏi
                </Badge>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={handleOpenCreate}
                className="h-8 text-xs font-semibold bg-primary text-primary-foreground"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Thêm câu hỏi mới
              </Button>
            </div>

            <DataTable
              data={current.items}
              columns={columns}
              searchable={false}
              filterable={false}
              columnToggleable={false}
              downloadable={false}
              totalPages={1}
              totalElements={current.items.length}
              pageSize={current.items.length || 10}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
              enableMobileCard
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog thêm / sửa câu hỏi */}
      <StorefrontFaqDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        defaultSortOrder={current.items.length + 1}
        onSave={handleSaveItem}
      />

      {/* Dialog xác nhận xóa */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa câu hỏi FAQ này?"
        description={`Bạn có chắc muốn xóa câu hỏi "${deleteTarget?.question}"?`}
        onConfirm={handleDeleteItem}
      />
    </div>
  );
}
