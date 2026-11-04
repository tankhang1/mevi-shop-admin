import { useState } from "react";
import { Link } from "wouter";
import { BadgeCheck, CornerDownRight, Eye, EyeOff, Loader2, MessageSquareReply, Package, Pencil, ThumbsUp } from "lucide-react";
import { Button, Card, CardContent, Textarea, cn, useToast } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { ReasonDialog } from "@/components/common/ReasonDialog";
import { ROUTES } from "@/config/routes";
import { Stars } from "@/features/review/components/review-bits";
import { type Review, useDeleteReviewReply, useSaveReviewReply, useSetReviewVisibility } from "@/features/review";
import { getErrorMessage } from "@/lib/api-error";
import { formatDateVN } from "@/lib/format";

const QUICK_REPLIES = [
  "Cảm ơn anh/chị đã tin tưởng ủng hộ shop. Chúc anh/chị và gia đình nhiều sức khoẻ!",
  "Shop rất tiếc về trải nghiệm chưa tốt. Shop sẽ liên hệ anh/chị để hỗ trợ đổi trả ngay ạ.",
];

/** One review with inline reply editor and hide/show — reused on the product detail page */
export function ReviewCard({ review: r, showProduct = true }: { review: Review; showProduct?: boolean }) {
  const { toast } = useToast();
  const saveReply = useSaveReviewReply();
  const deleteReply = useDeleteReviewReply();
  const visibility = useSetReviewVisibility();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [hideOpen, setHideOpen] = useState(false);
  const replyPending = saveReply.isPending || deleteReply.isPending;
  const author = r.reviewer.fullName ?? "Khách hàng";

  const startEdit = () => {
    setText(r.reply?.content ?? "");
    setEditing(true);
  };

  const save = async () => {
    try {
      await saveReply.mutateAsync({ id: r.id, content: text.trim() });
      toast({ title: "Đã gửi phản hồi" });
      setEditing(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const removeReply = async () => {
    try {
      await deleteReply.mutateAsync(r.id);
      toast({ title: "Đã xoá phản hồi" });
      setEditing(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) });
    }
  };

  const setHidden = (hidden: boolean, reason?: string) =>
    visibility.mutate(
      { id: r.id, hidden, reason },
      {
        onSuccess: () => {
          setHideOpen(false);
          toast({ title: hidden ? "Đã ẩn đánh giá khỏi cửa hàng" : "Đã hiện lại đánh giá" });
        },
        onError: (e) => toast({ variant: "destructive", title: "Lỗi", description: getErrorMessage(e) }),
      },
    );

  // Avatar tint follows the rating so bad reviews stand out while scrolling
  const tone =
    r.rating >= 4 ? "bg-emerald-100 text-emerald-800" : r.rating === 3 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700";
  const initials = author
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Card className={cn("overflow-hidden", r.hidden && "border-dashed opacity-70")}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold", tone)}>
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{author}</p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
              <Stars value={r.rating} />
              <span>{formatDateVN(r.createdAt)}</span>
              {r.helpfulCount > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  <ThumbsUp className="h-3 w-3" /> {r.helpfulCount}
                </span>
              )}
              {r.verifiedPurchase && (
                <span className="inline-flex items-center gap-0.5 font-medium text-emerald-700">
                  <BadgeCheck className="h-3 w-3" /> Đã mua hàng
                </span>
              )}
            </div>
          </div>
          {r.hidden ? (
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Đang ẩn</span>
          ) : (
            !r.reply && (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">Chưa trả lời</span>
            )
          )}
        </div>

        <p className="text-[15px] leading-relaxed">{r.content}</p>

        {r.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {r.tags.map((t) => (
              <span key={t} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}
        {r.media.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {r.media.map((m) => (
              <a key={m.url} href={m.url} target="_blank" rel="noreferrer" className="shrink-0">
                <img src={m.thumbnailUrl} alt="Ảnh khách hàng" className="h-20 w-20 rounded-xl border object-cover" />
              </a>
            ))}
          </div>
        )}

        {r.hidden && (
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            Lý do ẩn: {r.hiddenReason || "Không ghi lý do"}
            {r.hiddenAt && ` · ${formatDateVN(r.hiddenAt)}`}
          </p>
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
                <Button variant="ghost" size="sm" className="mr-auto text-destructive" onClick={() => void removeReply()} disabled={replyPending}>
                  Xoá phản hồi
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                Huỷ
              </Button>
              <Button size="sm" onClick={() => void save()} disabled={!text.trim() || replyPending}>
                {saveReply.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Gửi phản hồi
              </Button>
            </div>
          </div>
        ) : (
          r.reply && (
            <div className="flex gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-sm">
              <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-emerald-800">
                  {r.reply.repliedBy.fullName ?? "Phản hồi của shop"}
                  <span className="font-normal text-emerald-700/80"> · {formatDateVN(r.reply.repliedAt)}</span>
                </p>
                <p className="mt-0.5">{r.reply.content}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={startEdit} aria-label="Sửa phản hồi">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        )}
      </CardContent>

      <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2">
        {showProduct ? (
          <Link href={ROUTES.productDetail(String(r.product.id))} className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <Package className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {r.product.title} · {r.product.code}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 px-2 text-muted-foreground"
          onClick={() => (r.hidden ? setHidden(false) : setHideOpen(true))}
          disabled={visibility.isPending}
          title={r.hidden ? "Hiện lại" : "Ẩn khỏi cửa hàng"}
        >
          {r.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span className="ml-1">{r.hidden ? "Hiện" : "Ẩn"}</span>
        </Button>
        {!r.reply && !editing && (
          <Button size="sm" className="h-8 shrink-0 rounded-full" onClick={startEdit}>
            <MessageSquareReply className="mr-1.5 h-4 w-4" /> Trả lời
          </Button>
        )}
      </div>

      <ReasonDialog
        open={hideOpen}
        onOpenChange={setHideOpen}
        title="Ẩn đánh giá khỏi cửa hàng"
        label="Lý do (chỉ admin thấy)"
        confirmLabel="Ẩn đánh giá"
        optional
        maxLength={500}
        loading={visibility.isPending}
        onConfirm={(reason) => setHidden(true, reason || undefined)}
      />
    </Card>
  );
}
