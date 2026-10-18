import { useState } from "react";
import { Link } from "wouter";
import { CornerDownRight, Eye, EyeOff, Loader2, MessageSquareReply, Pencil, ThumbsUp } from "lucide-react";
import { Button, Card, CardContent, Textarea, cn, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import placeholder from "@/assets/images/image-placeholder.webp";
import { ROUTES } from "@/config/routes";
import { Stars } from "@/features/review/components/review-bits";
import { type Review, useReplyReview, useSetReviewHidden } from "@/features/review";
import { getErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";

const QUICK_REPLIES = [
  "Cảm ơn anh/chị đã tin tưởng ủng hộ shop. Chúc anh/chị và gia đình nhiều sức khoẻ!",
  "Shop rất tiếc về trải nghiệm chưa tốt. Shop sẽ liên hệ anh/chị để hỗ trợ đổi trả ngay ạ.",
];

/** One review with inline reply editor and hide/show — reused on the product detail page */
export function ReviewCard({ review: r, showProduct = true, showShop = false }: { review: Review; showProduct?: boolean; showShop?: boolean }) {
  const { toast } = useToast();
  const reply = useReplyReview();
  const visibility = useSetReviewHidden();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");

  const startEdit = () => {
    setText(r.reply?.content ?? "");
    setEditing(true);
  };

  const save = async (content: string) => {
    try {
      await reply.mutateAsync({ id: r.id, content });
      toast({ title: content ? "Đã gửi phản hồi" : "Đã xoá phản hồi" });
      setEditing(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const toggleHidden = () =>
    visibility.mutate(
      { id: r.id, hidden: !r.hidden },
      {
        onSuccess: () => toast({ title: r.hidden ? "Đã hiện lại đánh giá" : "Đã ẩn đánh giá khỏi cửa hàng" }),
        onError: (e) => toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) }),
      },
    );

  return (
    <Card className={cn(r.hidden && "border-dashed opacity-70")}>
      <CardContent className="space-y-3 p-4">
        {showProduct && (
          <Link href={ROUTES.productDetail(r.productId)} className="flex items-center gap-2 text-sm hover:underline">
            <img src={r.productImage || placeholder} alt="" className="h-8 w-8 rounded-md border object-cover" />
            <span className="truncate font-medium">{r.productName}</span>
            {showShop && r.shopName && <span className="shrink-0 text-xs text-muted-foreground">· {r.shopName}</span>}
          </Link>
        )}

        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-medium">{r.author}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Stars value={r.rating} /> {formatDate(r.createdAt)}
              {r.helpful > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  · <ThumbsUp className="h-3 w-3" /> {r.helpful}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {r.hidden && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Đang ẩn</span>}
            <Button variant="ghost" size="sm" onClick={toggleHidden} disabled={visibility.isPending} title={r.hidden ? "Hiện lại" : "Ẩn khỏi cửa hàng"}>
              {r.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="ml-1 max-sm:hidden">{r.hidden ? "Hiện" : "Ẩn"}</span>
            </Button>
          </div>
        </div>

        <p className="text-sm leading-relaxed">{r.content}</p>
        {(r.tags.length > 0 || r.images.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {r.tags.map((t) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {t}
              </span>
            ))}
            {r.images.map((src) => (
              <a key={src} href={src} target="_blank" rel="noreferrer">
                <img src={src} alt="Ảnh khách hàng" className="h-14 w-14 rounded-md border object-cover" />
              </a>
            ))}
          </div>
        )}

        {editing ? (
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <Textarea autoFocus rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Viết phản hồi công khai cho khách hàng…" maxLength={1000} />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map((q) => (
                <button key={q} type="button" onClick={() => setText(q)} className="rounded-full border bg-background px-2 py-0.5 text-xs hover:border-primary">
                  {q.slice(0, 36)}…
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              {r.reply && (
                <Button variant="ghost" size="sm" className="mr-auto text-destructive" onClick={() => void save("")} disabled={reply.isPending}>
                  Xoá phản hồi
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                Huỷ
              </Button>
              <Button size="sm" onClick={() => void save(text)} disabled={!text.trim() || reply.isPending}>
                {reply.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Gửi phản hồi
              </Button>
            </div>
          </div>
        ) : r.reply ? (
          <div className="flex gap-2 rounded-lg bg-muted/50 p-3 text-sm">
            <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                {r.reply.by === "mevi" ? "Mevi" : "Phản hồi của shop"} · {formatDate(r.reply.repliedAt)}
              </p>
              <p className="mt-0.5">{r.reply.content}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={startEdit} aria-label="Sửa phản hồi">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <MessageSquareReply className="mr-1.5 h-4 w-4" /> Trả lời
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
