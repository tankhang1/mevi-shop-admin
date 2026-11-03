import { type ReactNode, useEffect, useState } from "react";
import { type FieldErrors, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, Save } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
  useToast,
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { usePageActions } from "@/app/layouts/page-header.store";
import { ImageUploadField, TextField, TextareaField } from "@/components/form";
import type { PartnerProfile } from "@/features/partner";
import {
  type StorefrontProfileValues,
  profileToStorefrontValues,
  storefrontProfileSchema,
  useUploadStorefrontPhoto,
} from "@/features/storefront";
import { useDeferredImageUpload } from "@/hooks/useDeferredImageUpload";
import { ShopPreview } from "./ShopPreview";

const SHOP_URL = import.meta.env.VITE_SHOP_URL ?? "https://mevi.vn";
type F = StorefrontProfileValues;

const FORM_TABS = [
  {
    value: "brand",
    label: "Thương hiệu",
    fields: [
      "coverImageUrl",
      "logoUrl",
      "name",
      "handle",
      "slogan",
      "brandColor",
    ],
  },
  { value: "about", label: "Giới thiệu", fields: ["description", "province"] },
  {
    value: "contact",
    label: "Liên hệ",
    fields: ["contactName", "contactPhone", "contactEmail"],
  },
] as const satisfies readonly {
  value: string;
  label: string;
  fields: readonly (keyof F)[];
}[];

interface Props {
  profile: PartnerProfile;
  workspaceId?: string | number | null;
  saving?: boolean;
  submitLabel?: string;
  isNew?: boolean;
  headerExtra?: ReactNode;
  onSubmit: (values: F) => void;
  /** Non-form tabs appended after the profile tabs (e.g. the storefront products) */
  extraTabs?: { value: string; label: ReactNode; content: ReactNode }[];
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Storefront profile form mapped to backend /api/shop/profile */
export function ShopProfileForm({
  profile,
  workspaceId,
  saving,
  submitLabel,
  isNew = false,
  headerExtra,
  onSubmit,
  extraTabs = [],
}: Props) {
  const { toast } = useToast();
  const form = useForm<F>({
    resolver: zodResolver(storefrontProfileSchema),
    defaultValues: profileToStorefrontValues(profile),
    mode: "onTouched",
  });
  const values = useWatch({ control: form.control });
  const { isDirty, errors } = form.formState;
  const [tab, setTab] = useState<string>("brand");
  const onFormTab = FORM_TABS.some((t) => t.value === tab);

  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const isBusy = saving || isUploadingPhotos;

  const uploadMutation = useUploadStorefrontPhoto(workspaceId);

  const {
    setPendingFile,
    uploadWithCache,
    resetPendingFiles,
  } = useDeferredImageUpload<"COVER" | "LOGO">({
    uploadFn: async (type, file) => {
      const res = await uploadMutation.mutateAsync({ type, file });
      return res.fileUrl;
    },
  });

  const handleReset = () => {
    const currentCover = form.getValues("coverImageUrl");
    const currentLogo = form.getValues("logoUrl");
    if (currentCover?.startsWith("blob:")) URL.revokeObjectURL(currentCover);
    if (currentLogo?.startsWith("blob:")) URL.revokeObjectURL(currentLogo);
    form.reset(profileToStorefrontValues(profile));
    resetPendingFiles();
  };

  usePageActions(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        {headerExtra}
        {onFormTab && (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={(!isDirty && !isNew) || isBusy}
              onClick={handleReset}
              className="px-2.5 sm:px-3"
              title="Hoàn tác thay đổi"
              aria-label="Hoàn tác"
            >
              <RotateCcw className="h-4 w-4 sm:mr-1.5" />
              <span className="max-sm:hidden">Hoàn tác</span>
            </Button>
            <Button
              type="submit"
              form="shop-profile-form"
              disabled={(!isDirty && !isNew) || isBusy}
              className="px-3 sm:px-4"
            >
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin sm:mr-1.5" />
              ) : (
                <Save className="h-4 w-4 sm:mr-1.5" />
              )}
              <span>
                {isUploadingPhotos
                  ? "Đang tải ảnh..."
                  : submitLabel || (isNew ? "Khởi tạo gian hàng" : "Lưu thay đổi")}
              </span>
            </Button>
          </>
        )}
      </div>
    ),
    [headerExtra, onFormTab, isDirty, isNew, isBusy, isUploadingPhotos, submitLabel, form, handleReset],
  );

  // After a save the server copy becomes the new baseline
  useEffect(() => {
    form.reset(profileToStorefrontValues(profile));
    resetPendingFiles();
  }, [profile, form, resetPendingFiles]);

  // Revoke any blob URL preview when component unmounts
  useEffect(() => {
    return () => {
      const currentCover = form.getValues("coverImageUrl");
      const currentLogo = form.getValues("logoUrl");
      if (currentCover?.startsWith("blob:")) URL.revokeObjectURL(currentCover);
      if (currentLogo?.startsWith("blob:")) URL.revokeObjectURL(currentLogo);
    };
  }, [form]);

  const handleFormSubmit = async (formValues: F) => {
    setIsUploadingPhotos(true);
    try {
      const [coverImageUrl, logoUrl] = await Promise.all([
        uploadWithCache("coverImageUrl", "COVER", formValues.coverImageUrl),
        uploadWithCache("logoUrl", "LOGO", formValues.logoUrl),
      ]);

      await onSubmit({
        ...formValues,
        coverImageUrl,
        logoUrl,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Tải ảnh thất bại",
        description: e instanceof Error ? e.message : "Vui lòng thử lại sau.",
      });
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const tabHasError = (fields: readonly (keyof F)[]) =>
    fields.some((f) => errors[f]);

  // Errors may sit on a tab that isn't open — jump to the first one
  const onInvalid = (errs: FieldErrors<F>) => {
    const first = FORM_TABS.find((t) => t.fields.some((f) => errs[f]));
    if (first) setTab(first.value);
  };

  return (
    <Form {...form}>
      <form
        id="shop-profile-form"
        onSubmit={form.handleSubmit(handleFormSubmit, onInvalid)}
      >
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-max">
              {FORM_TABS.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  disabled={isBusy}
                  className="gap-1.5"
                >
                  {t.label}
                  {tabHasError(t.fields) && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-destructive"
                      aria-label="Có lỗi"
                    />
                  )}
                </TabsTrigger>
              ))}
              {extraTabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} disabled={isBusy}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <fieldset disabled={isBusy} className="contents border-0 p-0 m-0">
            <TabsContent value="brand" className="mt-0">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                <Section
                  title="Nhận diện thương hiệu"
                  hint="Hiển thị trên trang gian hàng, thẻ sản phẩm và kết quả tìm kiếm."
                >
                  <div className="space-y-5">
                    <ImageUploadField<F>
                      name="coverImageUrl"
                      label="Ảnh bìa"
                      aspect="cover"
                      disabled={isBusy}
                      onFileChange={(file) => setPendingFile("coverImageUrl", file)}
                      hint="Tỉ lệ 16:5, tối thiểu 1600×500px. JPEG/PNG/WebP ≤ 8 MB."
                    />
                    <ImageUploadField<F>
                      name="logoUrl"
                      label="Logo / ảnh đại diện"
                      disabled={isBusy}
                      onFileChange={(file) => setPendingFile("logoUrl", file)}
                      hint="Ảnh vuông, tối thiểu 200×200px."
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField<F>
                        name="name"
                        label="Tên gian hàng"
                        required
                        disabled={isBusy}
                      />
                      <FormField
                        control={form.control}
                        name="handle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Đường dẫn gian hàng (Handle)
                              <span className="text-destructive"> *</span>
                            </FormLabel>
                            <FormControl>
                              <div
                                className={cn(
                                  "flex items-center overflow-hidden rounded-md border bg-muted/40 focus-within:ring-2 focus-within:ring-ring",
                                  isBusy && "opacity-50 cursor-not-allowed",
                                )}
                              >
                                <span className="shrink-0 pl-3 text-sm text-muted-foreground">
                                  /shops/
                                </span>
                                <Input
                                  {...field}
                                  disabled={isBusy}
                                  placeholder="rau-sach-co-ba"
                                  className="border-0 bg-transparent pl-1 shadow-none focus-visible:ring-0"
                                />
                              </div>
                            </FormControl>
                            <p className="truncate text-xs text-muted-foreground">
                              {SHOP_URL}/shops/{values.handle || "…"}
                              {profile.id ? `-i.${profile.id}` : ""}
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <TextField<F>
                        name="slogan"
                        label="Slogan"
                        className="sm:col-span-2"
                        disabled={isBusy}
                        placeholder="VD: Rau củ sạch từ nông trại đến bàn ăn"
                        description="Tối đa 80 ký tự, hiện ngay dưới tên gian hàng."
                      />
                      <FormField
                        control={form.control}
                        name="brandColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Màu thương hiệu</FormLabel>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={field.value || "#214c3a"}
                                onChange={field.onChange}
                                disabled={isBusy}
                                className={cn(
                                  "h-9 w-12 shrink-0 cursor-pointer rounded border",
                                  isBusy && "opacity-50 cursor-not-allowed",
                                )}
                                aria-label="Chọn màu"
                              />
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={isBusy}
                                  className="font-mono"
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Section>
                <div className="lg:sticky lg:top-20 lg:self-start">
                  <ShopPreview values={values} profile={profile} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <Section
                title="Giới thiệu"
                hint="Giúp khách hàng hiểu câu chuyện và nguồn gốc sản phẩm của bạn."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextareaField<F>
                    name="description"
                    label="Mô tả gian hàng"
                    rows={6}
                    disabled={isBusy}
                    className="sm:col-span-2"
                    placeholder="Câu chuyện thương hiệu, nguồn gốc nông sản, cam kết chất lượng…"
                    description={`${values.description?.length ?? 0}/1000 ký tự`}
                  />
                  <TextField<F>
                    name="province"
                    label="Tỉnh / Thành phố"
                    required
                    disabled={isBusy}
                    placeholder="VD: Lâm Đồng, TP. Hồ Chí Minh"
                  />
                </div>
              </Section>
            </TabsContent>

            <TabsContent value="contact" className="mt-0">
              <Section
                title="Thông tin liên hệ"
                hint="Thông tin đại diện phụ trách gian hàng để Mevi và khách hàng liên hệ."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField<F>
                    name="contactName"
                    label="Người đại diện"
                    required
                    disabled={isBusy}
                  />
                  <TextField<F>
                    name="contactPhone"
                    label="Số điện thoại"
                    required
                    type="tel"
                    disabled={isBusy}
                  />
                  <TextField<F>
                    name="contactEmail"
                    label="Email liên hệ"
                    type="email"
                    disabled={isBusy}
                  />
                </div>
              </Section>
            </TabsContent>
          </fieldset>

          {extraTabs.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0">
              {t.content}
            </TabsContent>
          ))}
        </Tabs>
      </form>
    </Form>
  );
}
