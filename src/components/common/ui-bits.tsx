import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";

export function StatusPill({ label, className }: { label: string; className: string }) {
  return (
    <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
      {label}
    </span>
  );
}

export function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải...
    </div>
  );
}

export function EmptyBlock({ children }: { children: ReactNode }) {
  return <div className="py-16 text-center text-sm text-muted-foreground">{children}</div>;
}

export function PageHeader({ description, actions }: { description?: ReactNode; actions?: ReactNode }) {
  if (!description && !actions) return null;
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : <span />}
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
