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
  type StorefrontBannerItem,
  type StorefrontBannerSettings,
  useStorefrontHomeConfig,
  useUpdateStorefrontBanners,
} from "@/features/storefront";
import { getErrorMessage } from "@/lib/api-error";
import { StorefrontBannerDialog } from "./StorefrontBannerDialog";

interface Props {
  workspaceId?: string | number | null;
}

export function StorefrontBannersTab({ workspaceId }: Props) {
  const { toast } = useToast();
  const {
    data: config,
    isLoading,
    isError,
    error,
  } = useStorefrontHomeConfig(workspaceId);
  const updateBannersMutation = useUpdateStorefrontBanners(workspaceId);

  const [localSettings, setLocalSettings] =
    useState<StorefrontBannerSettings | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] =
    useState<StorefrontBannerItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StorefrontBannerItem | null>(
    null,
  );
  const [slideOffset, setSlideOffset] = useState(0);

  const settings = localSettings ?? config?.banners ?? null;

  // Autoplay timer for preview
  const activeBanners = settings?.items.filter((b) => b.active) ?? [];
  const totalActive = activeBanners.length;

  useEffect(() => {
    if (!settings?.autoplay || totalActive <= 1) return;
    const interval = (settings.autoplayIntervalSeconds || 5) * 1000;
    const timer = setInterval(() => {
      setSlideOffset((prev) => prev + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [settings?.autoplay, settings?.autoplayIntervalSeconds, totalActive]);

  const currentSlideIndex = totalActive > 0 ? slideOffset % totalActive : 0;

  if (isLoading) return <LoadingBlock />;
  if (isError) {
    return (
      <EmptyBlock>
        Không thể tải cấu hình banner: {getErrorMessage(error)}
      </EmptyBlock>
    );
  }

  const items = settings?.items ?? [];

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (banner: StorefrontBannerItem) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  };

  const handleSaveBanner = (savedBanner: StorefrontBannerItem) => {
    if (!settings) return;
    const exists = settings.items.some((b) => b.id === savedBanner.id);
    const newItems = exists
      ? settings.items.map((b) => (b.id === savedBanner.id ? savedBanner : b))
      : [
          ...settings.items,
          { ...savedBanner, sortOrder: settings.items.length + 1 },
        ];

    setLocalSettings({
      ...settings,
      items: newItems,
    });
    toast({
      title: exists ? "Đã cập nhật slide" : "Đã thêm slide banner",
      description: "Nhấn 'Lưu cấu hình' để áp dụng các thay đổi lên trang chủ.",
    });
  };

  const handleDeleteConfirm = () => {
    if (!settings || !deleteTarget) return;
    const newItems = settings.items.filter((b) => b.id !== deleteTarget.id);
    setLocalSettings({
      ...settings,
      items: newItems,
    });
    setDeleteTarget(null);
    toast({
      title: "Đã xóa slide",
      description: "Nhấn 'Lưu cấu hình' để hoàn tất.",
    });
  };

  const handleToggleActive = (id: string) => {
    if (!settings) return;
    const newItems = settings.items.map((b) =>
      b.id === id ? { ...b, active: !b.active } : b,
    );
    setLocalSettings({ ...settings, items: newItems });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (!settings) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.items.length) return;

    const newItems = [...settings.items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // re-assign sortOrder
    const sorted = newItems.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }));
    setLocalSettings({ ...settings, items: sorted });
  };

  const handleSaveAll = async () => {
    if (!settings) return;
    try {
      await updateBannersMutation.mutateAsync(settings);
      setLocalSettings(null);
      toast({
        title: "Đã lưu cấu hình banner thành công",
        description:
          "Các slide banner đã được cập nhật trên trang chủ gian hàng.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Không thể lưu cấu hình",
        description: getErrorMessage(e),
      });
    }
  };

  const handleReset = () => {
    setLocalSettings(null);
    toast({ title: "Đã hoàn tác về cấu hình hiện tại" });
  };

  const columns: Column<StorefrontBannerItem>[] = [
    {
      key: "stt",
      label: "Thứ tự",
      width: "90px",
      render: (_, item) => {
        const index = items.findIndex((b) => b.id === item.id);
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
                disabled={index === items.length - 1}
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
      key: "imageUrl",
      label: "Hình ảnh",
      width: "100px",
      render: (url, item) => (
        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted border">
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
      label: "Tiêu đề & Nội dung",
      mobilePriority: "primary",
      render: (_, item) => (
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-sm text-foreground">
              {item.title}
            </span>
            {item.showBadge && item.badge && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-primary/30 text-primary"
              >
                {item.badge}
              </Badge>
            )}
          </div>
          {item.description && (
            <p className="line-clamp-1 text-xs text-muted-foreground max-w-md">
              {item.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "button",
      label: "Nút bấm hành động",
      render: (_, item) => {
        const actionLabel =
          item.button.actionType === "INTERNAL_LINK"
            ? `Nội bộ: ${item.button.targetUrl || "/"}`
            : item.button.actionType === "EXTERNAL_LINK"
              ? `Liên kết ngoài: ${item.button.targetUrl || "—"}`
              : item.button.actionType === "CONTACT"
                ? `Liên hệ: ${item.button.contactType}`
                : "Không gắn action";

        return item.button.enabled ? (
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Link2 className="h-3 w-3 text-primary" />
              &quot;{item.button.text}&quot;
            </span>
            <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
              {actionLabel}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Không hiển thị nút
          </span>
        );
      },
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

  // Preview interactive button action
  const handlePreviewButtonClick = (banner: StorefrontBannerItem) => {
    const { actionType, targetUrl, openInNewTab, contactType } = banner.button;
    if (actionType === "INTERNAL_LINK") {
      toast({
        title: `Hành động: Chuyển trang nội bộ`,
        description: `Đường dẫn đích: ${targetUrl || "/"}`,
      });
    } else if (actionType === "EXTERNAL_LINK") {
      toast({
        title: `Hành động: Mở liên kết ngoài ${openInNewTab ? "(Tab mới)" : ""}`,
        description: targetUrl || "Chưa thiết lập URL",
      });
    } else if (actionType === "CONTACT") {
      toast({
        title: `Hành động: Kích hoạt liên hệ`,
        description: `Loại liên hệ: ${contactType}`,
      });
    }
  };

  const currentPreviewBanner = activeBanners[currentSlideIndex] ?? items[0];

  return (
    <div className="space-y-6">
      {/* ── Khối 1: Live Preview mô phỏng Ảnh 1 ── */}
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
              {/* Background Image */}
              <img
                src={currentPreviewBanner.imageUrl}
                alt={currentPreviewBanner.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

              {/* Banner Content */}
              <div className="relative z-10 flex h-full flex-col justify-center px-12 sm:px-12 md:px-16 max-w-2xl text-white">
                {currentPreviewBanner.showBadge &&
                  currentPreviewBanner.badge && (
                    <div className="mb-2.5 sm:mb-3.5">
                      <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-white shadow-xs border border-white/25">
                        {currentPreviewBanner.badge}
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

                {/* CTA Button */}
                {currentPreviewBanner.button?.enabled && (
                  <div className="mt-4 sm:mt-6">
                    <Button
                      type="button"
                      size="default"
                      onClick={() =>
                        handlePreviewButtonClick(currentPreviewBanner)
                      }
                      className="rounded-full bg-white text-neutral-900 hover:bg-white/90 font-bold px-4 sm:px-6 shadow-lg text-xs sm:text-sm h-9 sm:h-11 transition-all group"
                    >
                      <span>{currentPreviewBanner.button.text}</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
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

              {/* Pagination Dots */}
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
                onClick={handleReset}
                title="Khôi phục trạng thái ban đầu"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Hoàn tác
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={updateBannersMutation.isPending}
                className="px-3"
              >
                {updateBannersMutation.isPending ? (
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
                checked={settings?.autoplay ?? true}
                onCheckedChange={(checked) =>
                  setLocalSettings(
                    settings
                      ? { ...settings, autoplay: checked }
                      : {
                          autoplay: checked,
                          autoplayIntervalSeconds: 5,
                          items: [],
                        },
                  )
                }
                id="autoplay-switch"
              />
              <label
                htmlFor="autoplay-switch"
                className="text-xs font-medium cursor-pointer"
              >
                Tự động chuyển slide liên tục
              </label>
            </div>

            {settings?.autoplay && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Thời gian chờ mỗi slide:
                </span>
                <Select
                  value={String(settings?.autoplayIntervalSeconds ?? 5)}
                  onValueChange={(val) =>
                    setLocalSettings(
                      settings
                        ? { ...settings, autoplayIntervalSeconds: Number(val) }
                        : null,
                    )
                  }
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
        workspaceId={workspaceId}
        onSave={handleSaveBanner}
      />

      {/* Dialog xác nhận xóa */}
      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Xóa slide banner này?"
        description={`Bạn có chắc muốn xóa slide "${deleteTarget?.title}"? Thay đổi sẽ chỉ được lưu khi bạn bấm "Lưu cấu hình".`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
