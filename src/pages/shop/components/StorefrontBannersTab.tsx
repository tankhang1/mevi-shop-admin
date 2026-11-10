import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Layers,
  Link2,
  Loader2,
  Plus,
  RotateCcw,
  Save,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { EmptyBlock, LoadingBlock } from "@/components/common/ui-bits";
import {
  type BannerBlockData,
  type BannerSlideInput,
  type BannerSlideItem,
  useContentBlock,
  useCreateBlockItem,
  useDeleteBlockItem,
  useReorderBlockItems,
  useUpdateBlockItem,
  useUpdateBlockSettings,
} from "@/features/content-block";
import { getErrorMessage } from "@/lib/api-error";
import { StorefrontBannerDialog } from "./StorefrontBannerDialog";

interface Props {
  workspaceId?: string | number | null;
}

export function StorefrontBannersTab({ workspaceId }: Props) {
  void workspaceId;
  const { toast } = useToast();

  // 1. Query block data
  const {
    data: block,
    isLoading,
    isError,
    error,
  } = useContentBlock<BannerBlockData>("banner");

  // 2. Mutations
  const updateSettingsMutation = useUpdateBlockSettings("banner");
  const createItemMutation = useCreateBlockItem<
    BannerSlideItem,
    BannerSlideInput
  >("banner");
  const updateItemMutation = useUpdateBlockItem<
    BannerSlideItem,
    BannerSlideInput
  >("banner");
  const deleteItemMutation = useDeleteBlockItem("banner");
  const reorderMutation = useReorderBlockItems("banner");

  // Local settings overrides
  const [customAutoplay, setCustomAutoplay] = useState<boolean | null>(null);
  const [customIntervalSeconds, setCustomIntervalSeconds] = useState<
    number | null
  >(null);

  const autoplay = customAutoplay ?? block?.autoplay ?? false;
  const intervalSeconds = customIntervalSeconds ?? block?.intervalSeconds ?? 5;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSlideItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<BannerSlideItem | null>(
    null,
  );
  const [slideOffset, setSlideOffset] = useState(0);

  const items = block?.items ?? [];
  const activeBanners = items.filter((b) => b.enabled);
  const totalActive = activeBanners.length;

  // Autoplay timer for preview
  useEffect(() => {
    if (!autoplay || totalActive <= 1) return;
    const interval = (intervalSeconds || 5) * 1000;
    const timer = setInterval(() => {
      setSlideOffset((prev) => prev + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, intervalSeconds, totalActive]);

  const currentSlideIndex = totalActive > 0 ? slideOffset % totalActive : 0;

  if (isLoading) return <LoadingBlock />;
  if (isError) {
    return (
      <EmptyBlock>
        Không thể tải cấu hình banner: {getErrorMessage(error)}
      </EmptyBlock>
    );
  }

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (banner: BannerSlideItem) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  };

  const handleSaveBanner = async (input: BannerSlideInput) => {
    if (editingBanner) {
      await updateItemMutation.mutateAsync({
        id: editingBanner.id,
        version: editingBanner.version,
        item: input,
      });
    } else {
      await createItemMutation.mutateAsync(input);
    }
  };

  const handleToggleEnabled = (item: BannerSlideItem) => {
    updateItemMutation.mutate({
      id: item.id,
      version: item.version,
      item: {
        enabled: !item.enabled,
        imageUrl: item.imageUrl,
        badge: item.badge,
        title: item.title,
        description: item.description,
        cta: item.cta,
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

  const hasSettingsChanged =
    Boolean(block) &&
    (autoplay !== (block?.autoplay ?? false) ||
      intervalSeconds !== (block?.intervalSeconds ?? 5));

  const handleSaveSettings = () => {
    if (!block || !hasSettingsChanged) return;
    updateSettingsMutation.mutate(
      {
        version: block.version,
        settings: {
          autoplay,
          intervalSeconds,
        },
      },
      {
        onSuccess: () => {
          setCustomAutoplay(null);
          setCustomIntervalSeconds(null);
        },
      },
    );
  };

  const handleResetSettings = () => {
    setCustomAutoplay(null);
    setCustomIntervalSeconds(null);
  };

  const columns: Column<BannerSlideItem>[] = [
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
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
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
      key: "imageUrl",
      label: "Ảnh nền",
      width: "120px",
      render: (url, item) => (
        <div className="relative aspect-[16/9] w-24 overflow-hidden rounded-md border bg-muted">
          <img
            src={String(url)}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
      ),
    },
    {
      key: "title",
      label: "Nội dung Banner",
      mobilePriority: "primary",
      render: (_, item) => (
        <div className="space-y-1 min-w-[200px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.badge?.enabled && item.badge?.text && (
              <Badge
                variant="secondary"
                className="text-[10px] uppercase font-semibold"
              >
                {item.badge.text}
              </Badge>
            )}
            <span className="font-semibold text-sm line-clamp-1">
              {item.title}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "cta",
      label: "Nút bấm hành động (CTA)",
      mobilePriority: "secondary",
      render: (_, item) => {
        if (item.cta?.enabled) {
          return (
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <Link2 className="h-3 w-3" />
                {item.cta.label || "Nút bấm"}
              </span>
              <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                {item.cta.target || item.cta.linkType}
              </p>
            </div>
          );
        }
        return (
          <span className="text-xs text-muted-foreground italic">
            Không hiển thị nút
          </span>
        );
      },
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

  const handlePreviewButtonClick = (banner: BannerSlideItem) => {
    toast({
      title: `CTA: ${banner.cta?.label || "Bấm nút"}`,
      description: `Đích đến: ${banner.cta?.target || banner.cta?.linkType || "/"}`,
    });
  };

  const currentPreviewBanner = activeBanners[currentSlideIndex] ?? items[0];

  return (
    <div className="space-y-6">
      {/* ── Khối 1: Live Preview ── */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-muted/40 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Xem trước Banner Slider thực tế (Live Preview)
              </CardTitle>
              <CardDescription>
                Mô phỏng trực quan trải nghiệm của khách hàng khi truy cập gian
                hàng Mevi
              </CardDescription>
            </div>
            {totalActive > 1 && (
              <Badge variant="outline" className="text-xs bg-background">
                Slide {currentSlideIndex + 1} / {totalActive}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-5">
          {currentPreviewBanner ? (
            <div className="relative aspect-[16/7] min-h-[220px] sm:min-h-[320px] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md">
              <img
                src={currentPreviewBanner.imageUrl}
                alt={currentPreviewBanner.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

              <div className="relative z-10 flex h-full flex-col justify-center px-12 sm:px-12 md:px-16 max-w-2xl text-white">
                {currentPreviewBanner.badge?.enabled &&
                  currentPreviewBanner.badge?.text && (
                    <div className="mb-2.5 sm:mb-3.5">
                      <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-white shadow-xs border border-white/25">
                        {currentPreviewBanner.badge.text}
                      </span>
                    </div>
                  )}

                <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight">
                  {currentPreviewBanner.title}
                </h2>

                {currentPreviewBanner.description && (
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-white/85 line-clamp-2 sm:line-clamp-3 max-w-xl font-normal leading-relaxed">
                    {currentPreviewBanner.description}
                  </p>
                )}

                {currentPreviewBanner.cta?.enabled && (
                  <div className="mt-4 sm:mt-6">
                    <Button
                      type="button"
                      size="default"
                      onClick={() =>
                        handlePreviewButtonClick(currentPreviewBanner)
                      }
                      className="rounded-full bg-white text-neutral-900 hover:bg-white/90 font-bold px-4 sm:px-6 shadow-lg text-xs sm:text-sm h-9 sm:h-11 transition-all group"
                    >
                      <span>
                        {currentPreviewBanner.cta.label || "Ghé gian hàng"}
                      </span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                )}
              </div>

              {totalActive > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setSlideOffset((prev) =>
                        prev === 0 ? totalActive - 1 : prev - 1,
                      )
                    }
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 text-foreground backdrop-blur-sm shadow hover:bg-white transition-colors"
                    aria-label="Slide trước"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSlideOffset((prev) => (prev + 1) % totalActive)
                    }
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 text-foreground backdrop-blur-sm shadow hover:bg-white transition-colors"
                    aria-label="Slide tiếp theo"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </>
              )}

              {totalActive > 1 && (
                <div className="absolute bottom-3 sm:bottom-5 left-6 sm:left-12 z-20 flex items-center gap-1.5">
                  {activeBanners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSlideOffset(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        idx === currentSlideIndex
                          ? "w-6 bg-white shadow-xs"
                          : "w-2 bg-white/50 hover:bg-white/75",
                      )}
                      aria-label={`Chuyển đến slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 text-muted-foreground text-sm">
              Chưa có slide banner nào được kích hoạt hiển thị
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Khối 2: Cài đặt chung & Danh sách slide ── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                Danh sách slide banner
              </CardTitle>
              <CardDescription>
                Thêm, sửa, sắp xếp thứ tự và cấu hình hành động cho từng slide
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
                Thêm slide mới
              </Button>
            </div>
          </div>

          {/* Autoplay setting bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/40 p-3 border">
            <div className="flex items-center space-x-3">
              <Switch
                checked={autoplay}
                onCheckedChange={setCustomAutoplay}
                id="autoplay-switch"
              />
              <label
                htmlFor="autoplay-switch"
                className="text-xs font-medium cursor-pointer"
              >
                Tự động chuyển slide liên tục
              </label>
            </div>

            {autoplay && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Thời gian chờ mỗi slide:
                </span>
                <Select
                  value={String(intervalSeconds)}
                  onValueChange={(val) => setCustomIntervalSeconds(Number(val))}
                >
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 giây</SelectItem>
                    <SelectItem value="5">5 giây</SelectItem>
                    <SelectItem value="7">7 giây</SelectItem>
                    <SelectItem value="10">10 giây</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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

      {/* Dialog thêm / sửa slide */}
      <StorefrontBannerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        banner={editingBanner}
        onSave={handleSaveBanner}
      />

      {/* Dialog xác nhận xóa */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa slide banner này?"
        description={`Bạn có chắc muốn xóa slide "${deleteTarget?.title}"?`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
