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
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ImageUploadField, TextField, TextareaField } from "@/components/form";
import { type Shop, type ShopProfileValues, shopProfileSchema, shopToProfileValues } from "@/features/shop";
import { ShopPreview } from "./ShopPreview";

const SHOP_URL = import.meta.env.VITE_SHOP_URL ?? "https://mevi.vn";
type F = ShopProfileValues;

const FORM_TABS = [
  { value: "brand", label: "Thương hiệu", fields: ["coverUrl", "logoUrl", "name", "slug", "tagline", "brandColor"] },
  { value: "about", label: "Giới thiệu", fields: ["description", "location"] },
  { value: "contact", label: "Liên hệ & kho", fields: ["contactName", "phone", "email", "address"] },
] as const satisfies readonly { value: string; label: string; fields: readonly (keyof F)[] }[];

interface Props {
  shop: Shop;
  saving?: boolean;
  onSubmit: (values: F) => void;
  /** Non-form tabs appended after the profile tabs (e.g. the shop's shelf) */
  extraTabs?: { value: string; label: ReactNode; content: ReactNode }[];
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
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

/** Storefront profile — same fields the customer app shows on /shops/:slug */
export function ShopProfileForm({ shop, saving, onSubmit, extraTabs = [] }: Props) {
  const form = useForm<F>({ resolver: zodResolver(shopProfileSchema), defaultValues: shopToProfileValues(shop), mode: "onTouched" });
  const values = useWatch({ control: form.control });
  const { isDirty, errors } = form.formState;
  const [tab, setTab] = useState<string>("brand");
  const onFormTab = FORM_TABS.some((t) => t.value === tab);

  // After a save the server copy becomes the new baseline
  useEffect(() => form.reset(shopToProfileValues(shop)), [shop, form]);

  const tabHasError = (fields: readonly (keyof F)[]) => fields.some((f) => errors[f]);

  // Errors may sit on a tab that isn't open — jump to the first one
  const onInvalid = (errs: FieldErrors<F>) => {
    const first = FORM_TABS.find((t) => t.fields.some((f) => errs[f]));
    if (first) setTab(first.value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-max">
              {FORM_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                  {t.label}
                  {tabHasError(t.fields) && <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-label="Có lỗi" />}
                </TabsTrigger>
              ))}
              {extraTabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="brand" className="mt-0">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <Section title="Nhận diện thương hiệu" hint="Hiển thị trên trang gian hàng, thẻ sản phẩm và kết quả tìm kiếm.">
                <div className="space-y-5">
                  <ImageUploadField<F> name="coverUrl" label="Ảnh bìa" aspect="cover" hint="Tỉ lệ 16:5, tối thiểu 1600×500px. JPEG/PNG/WebP ≤ 8 MB." />
                  <ImageUploadField<F> name="logoUrl" label="Logo / ảnh đại diện" hint="Ảnh vuông, tối thiểu 200×200px." />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField<F> name="name" label="Tên gian hàng" required />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Đường dẫn gian hàng<span className="text-destructive"> *</span>
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center overflow-hidden rounded-md border bg-muted/40 focus-within:ring-2 focus-within:ring-ring">
                              <span className="shrink-0 pl-3 text-sm text-muted-foreground">/shops/</span>
                              <Input {...field} className="border-0 bg-transparent pl-1 shadow-none focus-visible:ring-0" />
                            </div>
                          </FormControl>
                          <p className="truncate text-xs text-muted-foreground">
                            {SHOP_URL}/shops/{values.slug || "…"}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <TextField<F> name="tagline" label="Slogan" className="sm:col-span-2" placeholder="VD: Rau củ sạch hái mỗi sáng" description="Tối đa 80 ký tự, hiện ngay dưới tên gian hàng." />
                    <FormField
                      control={form.control}
                      name="brandColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Màu thương hiệu</FormLabel>
                          <div className="flex gap-2">
                            <input type="color" value={field.value} onChange={field.onChange} className="h-9 w-12 shrink-0 cursor-pointer rounded border" aria-label="Chọn màu" />
                            <FormControl>
                              <Input {...field} className="font-mono" />
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
                <ShopPreview values={values} shop={shop} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <Section title="Giới thiệu" hint="Giúp khách hàng hiểu câu chuyện và nguồn gốc sản phẩm của bạn.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextareaField<F>
                  name="description"
                  label="Mô tả gian hàng"
                  rows={6}
                  className="sm:col-span-2"
                  placeholder="Câu chuyện, vùng trồng, quy trình canh tác…"
                  description={`${values.description?.length ?? 0}/1000 ký tự`}
                />
                <TextField<F> name="location" label="Khu vực" required placeholder="VD: Đà Lạt, Lâm Đồng" />
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="contact" className="mt-0">
            <Section title="Liên hệ & kho hàng" hint="Mevi dùng để xác nhận đơn và lấy hàng; khách hàng không thấy địa chỉ kho.">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField<F> name="contactName" label="Người liên hệ" required />
                <TextField<F> name="phone" label="Số điện thoại" required type="tel" />
                <TextField<F> name="email" label="Email" type="email" />
                <TextField<F> name="address" label="Địa chỉ kho / lấy hàng" />
              </div>
            </Section>
          </TabsContent>

          {extraTabs.map((t) => (
            <TabsContent key={t.value} value={t.value} className="mt-0">
              {t.content}
            </TabsContent>
          ))}
        </Tabs>

        {/* Shared by all profile tabs; hidden on non-form tabs which save instantly */}
        <div
          className={cn(
            // Mobile: sit above the fixed 72px bottom nav
            "sticky bottom-18 z-10 mt-5 flex items-center justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur md:bottom-0",
            !onFormTab && "hidden",
          )}
        >
          {isDirty && <span className="mr-auto hidden text-sm text-muted-foreground sm:inline">Bạn có thay đổi chưa lưu</span>}
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" disabled={!isDirty || saving} onClick={() => form.reset()}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Hoàn tác
          </Button>
          <Button type="submit" className="flex-1 sm:flex-none" disabled={!isDirty || saving}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Form>
  );
}
