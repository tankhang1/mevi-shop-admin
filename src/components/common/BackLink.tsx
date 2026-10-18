import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export function BackLink({
  to,
  label = "Quay lại",
}: {
  to: string;
  label?: string;
}) {
  return (
    <Link
      href={to}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}
