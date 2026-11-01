import { FlaskConical } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";

/** Marks UI still backed by src/mocks (no real API yet) — grep `MockBadge` to find what's left to integrate */
export function MockBadge({ className, title = "Chưa có API thật — đang dùng dữ liệu giả" }: { className?: string; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded border border-dashed border-amber-400 bg-amber-50 px-1 py-px align-middle text-[10px] font-semibold uppercase leading-none tracking-wide text-amber-700",
        className,
      )}
    >
      <FlaskConical className="h-2.5 w-2.5" /> Mock
    </span>
  );
}
