import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import {
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
  Textarea,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import {
  HIGHLIGHT_ICON_MAP,
  type StorefrontHighlightCard,
  type StorefrontHighlightSection,
  useStorefrontHomeConfig,
  useUpdateStorefrontHighlights,
} from "@/features/storefront";
import { getErrorMessage } from "@/lib/api-error";
import { StorefrontHighlightCardDialog } from "./StorefrontHighlightCardDialog";

interface Props {
  workspaceId?: string | number | null;
}

export function StorefrontHighlightsTab({ workspaceId }: Props) {
  const { toast } = useToast();
  const {
    data: config,
    isLoading,
    isError,
    error,
  } = useStorefrontHomeConfig(workspaceId);
  const updateMutation = useUpdateStorefrontHighlights(workspaceId);

  const [localSection, setLocalSection] =
    useState<StorefrontHighlightSection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] =
    useState<StorefrontHighlightCard | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<StorefrontHighlightCard | null>(null);

  if (isLoading) return <LoadingBlock />;
  if (isError) {
    return (
      <EmptyBlock>
        Không thể tải cấu hình khối nổi bật: {getErrorMessage(error)}
      </EmptyBlock>
    );
  }

  const current = localSection ??
    config?.highlights ?? {
      enabled: true,
      sectionLabel: "Câu chuyện & Giá trị",
      kicker: "MỖI SẢN PHẨM CÓ CÂU CHUYỆN",
      title: "Biết rõ điều gì đang có trên bàn ăn.",
      description:
        "Mevi kết nối những sản phẩm nông nghiệp có thông tin vùng trồng, quy cách và cách bảo quản rõ ràng. Chọn thực phẩm bằng sự an tâm.",
      cards: [],
    };

  const handleOpenCreate = () => {
    setEditingCard(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (c: StorefrontHighlightCard) => {
    setEditingCard(c);
    setDialogOpen(true);
  };

  const handleSaveCard = (saved: StorefrontHighlightCard) => {
    const exists = current.cards.some((c) => c.id === saved.id);
    const newCards = exists
      ? current.cards.map((c) => (c.id === saved.id ? saved : c))
      : [...current.cards, saved];

    setLocalSection({ ...current, cards: newCards });
    toast({
      title: exists ? "Đã cập nhật thẻ" : "Đã thêm thẻ mới",
      description: "Bấm 'Lưu cấu hình' để hoàn tất.",
    });
  };

  const handleDeleteCard = () => {
    if (!deleteTarget) return;
    const newCards = current.cards.filter((c) => c.id !== deleteTarget.id);
    setLocalSection({ ...current, cards: newCards });
    setDeleteTarget(null);
    toast({ title: "Đã xóa thẻ khỏi danh sách" });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.cards.length) return;

    const newCards = [...current.cards];
    const temp = newCards[index];
    newCards[index] = newCards[targetIndex];
    newCards[targetIndex] = temp;

    setLocalSection({ ...current, cards: newCards });
  };

  const handleSaveAll = async () => {
    try {
      await updateMutation.mutateAsync(current);
      setLocalSection(null);
      toast({
        title: "Đã lưu khối nổi bật thành công",
        description: "Nội dung đã được cập nhật lên trang chủ gian hàng.",
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
    setLocalSection(null);
    toast({ title: "Đã hoàn tác về cấu hình hiện tại" });
  };

  const columns: Column<StorefrontHighlightCard>[] = [
    {
      key: "stt",
      label: "STT",
      width: "110px",
      render: (_, card) => {
        const index = current.cards.findIndex((c) => c.id === card.id);
        const stt = String(index + 1).padStart(2, "0");
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {stt}
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
                disabled={index === current.cards.length - 1}
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
      key: "icon",
      label: "Biểu tượng",
      width: "80px",
      render: (_, card) => {
        const iconDef = HIGHLIGHT_ICON_MAP[card.icon];
        const IconComp = iconDef ? iconDef.icon : ShieldCheck;
        return (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconComp className="h-4 w-4" />
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Tiêu đề & Nội dung",
      mobilePriority: "primary",
      render: (_, card) => (
        <div className="space-y-0.5">
          <div className="font-bold text-sm text-foreground">{card.title}</div>
          <p className="line-clamp-2 text-xs text-muted-foreground max-w-lg">
            {card.description}
          </p>
        </div>
      ),
    },
    {
      key: "linkUrl",
      label: "Liên kết",
      render: (url) =>
        url ? (
          <span className="font-mono text-xs text-primary truncate block max-w-[180px]">
            {String(url)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground italic">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Khối 1: Live Preview mô phỏng Ảnh 2 ── */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-muted/40 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Xem trước giao diện thực tế (Live Preview)
              </CardTitle>
              <CardDescription>
                Tái hiện đúng bố cục và phong cách hiển thị trên trang chủ Mevi
              </CardDescription>
            </div>
            <Badge
              variant={current.enabled ? "default" : "secondary"}
              className="text-xs"
            >
              {current.enabled ? "Khối đang hiển thị" : "Khối đang ẩn"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8 bg-muted/20 border-t">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            {/* Cột trái: Kicker, Tiêu đề lớn & Đoạn mô tả */}
            <div className="lg:col-span-5 space-y-3.5">
              {current.kicker && (
                <p className="text-xs font-bold tracking-widest uppercase text-amber-700 dark:text-amber-500">
                  {current.kicker}
                </p>
              )}
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {current.title || "Tiêu đề khối giới thiệu"}
              </h2>
              {current.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {current.description}
                </p>
              )}
            </div>

            {/* Cột phải: Lưới các thẻ nổi bật (Thích ứng theo số thẻ) */}
            <div className="lg:col-span-7">
              {current.cards.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-xl bg-card">
                  Chưa có thẻ nào trong khối này.
                </div>
              ) : (
                <div
                  className={cn(
                    "grid gap-4 sm:gap-4",
                    current.cards.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-1 sm:grid-cols-2",
                  )}
                >
                  {current.cards.map((c, idx) => {
                    const iconDef = HIGHLIGHT_ICON_MAP[c.icon];
                    const IconComponent = iconDef ? iconDef.icon : ShieldCheck;

                    return (
                      <div
                        key={c.id || idx}
                        className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all"
                      >
                        {/* Top row: Icon on left, Order text on right */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <span className="font-mono text-xs font-bold text-muted-foreground/80">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-foreground mb-1.5">
                            {c.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {c.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Khối 2: Thiết lập thông tin tiêu đề & danh sách thẻ ── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                Thiết lập nội dung khối
              </CardTitle>
              <CardDescription>
                Tùy chỉnh tiêu đề giới thiệu và các thẻ cam kết (không giới hạn
                số thẻ)
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
                disabled={updateMutation.isPending}
                className="px-3"
              >
                {updateMutation.isPending ? (
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
          {/* Header fields */}
          <div className="rounded-xl border p-4 bg-muted/20 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">
                  Hiển thị khối này trên trang chủ
                </Label>
                <p className="text-xs text-muted-foreground">
                  Bật/tắt khối này tại giao diện công khai của gian hàng
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={current.enabled}
                  onCheckedChange={(checked) =>
                    setLocalSection({ ...current, enabled: checked })
                  }
                  id="section-enabled"
                />
                <span className="text-xs font-medium">
                  {current.enabled ? (
                    <span className="text-emerald-600 inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Đang hiển thị
                    </span>
                  ) : (
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <EyeOff className="h-3 w-3" /> Đang ẩn
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">
                  Dòng chữ dẫn phía trên (Dòng dẫn đầu đề)
                </Label>
                <Input
                  value={current.kicker}
                  onChange={(e) =>
                    setLocalSection({ ...current, kicker: e.target.value })
                  }
                  placeholder="VD: MỖI SẢN PHẨM CÓ CÂU CHUYỆN"
                  className="mt-1 uppercase tracking-wider font-semibold text-xs"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Đoạn chữ nhỏ in hoa nằm ngay phía trên tiêu đề chính để dẫn
                  dắt nội dung.
                </p>
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">
                  Tiêu đề chính của khối
                </Label>
                <Input
                  value={current.title}
                  onChange={(e) =>
                    setLocalSection({ ...current, title: e.target.value })
                  }
                  placeholder="VD: Biết rõ điều gì đang có trên bàn ăn."
                  className="mt-1 font-bold text-base"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold">
                  Đoạn mô tả giới thiệu
                </Label>
                <Textarea
                  value={current.description}
                  onChange={(e) =>
                    setLocalSection({ ...current, description: e.target.value })
                  }
                  rows={3}
                  placeholder="VD: Mevi kết nối những sản phẩm nông nghiệp có thông tin vùng trồng, quy cách và cách bảo quản rõ ràng..."
                  className="mt-1 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">Danh sách các thẻ nổi bật</h4>
                <Badge variant="outline" className="text-xs font-semibold">
                  {current.cards.length} thẻ
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleOpenCreate}
                className="h-8 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1 text-primary" />
                Thêm thẻ mới
              </Button>
            </div>

            <DataTable
              data={current.cards}
              columns={columns}
              searchable={false}
              filterable={false}
              columnToggleable={false}
              downloadable={false}
              totalPages={1}
              totalElements={current.cards.length}
              pageSize={current.cards.length || 10}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
              enableMobileCard
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog thêm / sửa thẻ */}
      <StorefrontHighlightCardDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        card={editingCard}
        onSave={handleSaveCard}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa thẻ nổi bật này?"
        description={`Bạn có chắc muốn xóa thẻ "${deleteTarget?.title}"?`}
        onConfirm={handleDeleteCard}
      />
    </div>
  );
}
