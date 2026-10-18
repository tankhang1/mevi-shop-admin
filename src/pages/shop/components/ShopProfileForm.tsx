import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
} from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ImageUploadField, TextField, TextareaField } from "@/components/form";
import { type Shop, type ShopProfileValues, shopProfileSchema, shopToProfileValues } from "@/features/shop";
import { ShopPreview } from "./ShopPreview";

const SHOP_URL = import.meta.env.VITE_SHOP_URL ?? "https://mevi.vn";
type F = ShopProfileValues;

interface Props {
  shop: Shop;
  saving?: boolean;
  onSubmit: (values: F) => void;
}

/** Storefront profile — same fields the customer app shows on /shops/:slug */
export function ShopProfileForm({ shop, saving, onSubmit }: Props) {
  const form = useForm<F>({ resolver: zodResolver(shopProfileSchema), defaultValues: shopToProfileValues(shop), mode: "onTouched" });
  const values = useWatch({ control: form.control });
  const { isDirty } = form.formState;

  // After a save the server copy becomes the new baseline
  useEffect(() => form.reset(shopToProfileValues(shop)), [shop, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Nhận diện thương hiệu</CardTitle>
              <p className="text-sm text-muted-foreground">Hiển thị trên trang gian hàng, thẻ sản phẩm và kết quả tìm kiếm.</p>
            </CardHeader>
            <CardContent className="space-y-5">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Giới thiệu</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextareaField<F>
                name="description"
                label="Mô tả gian hàng"
                rows={5}
                className="sm:col-span-2"
                placeholder="Câu chuyện, vùng trồng, quy trình canh tác…"
                description={`${values.description?.length ?? 0}/1000 ký tự`}
              />
              <TextField<F> name="location" label="Khu vực" required placeholder="VD: Đà Lạt, Lâm Đồng" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Liên hệ & kho hàng</CardTitle>
              <p className="text-sm text-muted-foreground">Mevi dùng để xác nhận đơn và lấy hàng; khách hàng không thấy địa chỉ kho.</p>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField<F> name="contactName" label="Người liên hệ" required />
              <TextField<F> name="phone" label="Số điện thoại" required type="tel" />
              <TextField<F> name="email" label="Email" type="email" />
              <TextField<F> name="address" label="Địa chỉ kho / lấy hàng" />
            </CardContent>
          </Card>

          <div className="sticky bottom-0 z-10 -mx-1 flex justify-end gap-2 border-t bg-background/95 px-1 py-3 backdrop-blur">
            <Button type="button" variant="outline" disabled={!isDirty || saving} onClick={() => form.reset()}>
              <RotateCcw className="mr-1.5 h-4 w-4" /> Hoàn tác
            </Button>
            <Button type="submit" disabled={!isDirty || saving}>
              {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <ShopPreview values={values} shop={shop} />
        </div>
      </form>
    </Form>
  );
}
