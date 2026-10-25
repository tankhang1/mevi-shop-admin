import type { ElementType } from "react";
import { Link } from "wouter";
import { LayoutGrid, LogOut, Mail, Phone, ShieldCheck } from "lucide-react";
import { Button, Card } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { LoadingBlock } from "@/components/common/ui-bits";
import { menuFor } from "@/config/menu";
import { authApi, useCurrentUser } from "@/features/auth";

const ROLE_LABEL: Record<string, string> = {
  MEVI_SUPER_ADMIN: "Quản trị viên Mevi",
  MEVI_ADMIN: "Nhân viên vận hành Mevi",
  MEVI_SHOP_ADMIN: "Chủ gian hàng",
  MEVI_SHOP_STAFF: "Nhân viên xử lý đơn",
};

type Shortcut = { id: string; label: string; href: string; icon: ElementType };

/** The sidebar menu (already filtered by role), flattened into tappable shortcuts per section */
function shortcutsFor(roles: readonly string[]) {
  return menuFor(roles).flatMap((section) => {
    if (!("items" in section)) return [];
    const items: Shortcut[] = section.items.flatMap((item) => {
      const icon = (typeof item.icon === "string" ? undefined : item.icon) ?? LayoutGrid;
      if (item.children?.length)
        return item.children.flatMap((c) => (c.href ? [{ id: c.id, label: c.label, href: c.href, icon }] : []));
      return item.href ? [{ id: item.id, label: item.label, href: item.href, icon }] : [];
    });
    return items.length ? [{ title: section.title, items }] : [];
  });
}

/** Mobile "Tài khoản" tab — profile plus every feature the bottom nav has no room for */
export default function ProfilePage() {
  const { data, roles, isLoading } = useCurrentUser();
  if (isLoading) return <LoadingBlock />;

  const name = data?.name || data?.username || "—";
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const sections = shortcutsFor(roles);

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-emerald-700 via-emerald-600 to-teal-500 p-5 text-white shadow-md">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 right-20 h-28 w-28 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl font-bold ring-2 ring-white/40">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{name}</p>
            {roles.map((r) => (
              <span key={r} className="mt-1 mr-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-medium">
                <ShieldCheck className="h-3 w-3" /> {ROLE_LABEL[r] ?? r}
              </span>
            ))}
          </div>
        </div>
        {(data?.email || data?.phoneNumber) && (
          <div className="relative mt-4 space-y-1.5 border-t border-white/20 pt-3 text-sm text-white/90">
            {data?.email && (
              <p className="flex items-center gap-2 truncate">
                <Mail className="h-4 w-4 shrink-0" /> {data.email}
              </p>
            )}
            {data?.phoneNumber && (
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" /> {data.phoneNumber}
              </p>
            )}
          </div>
        )}
      </div>

      {sections.map((s) => (
        <section key={s.title} className="space-y-2">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.title}</h2>
          <Card className="grid grid-cols-3 gap-1 p-2">
            {s.items.map((i) => (
              <Link
                key={i.id}
                href={i.href}
                className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-center active:bg-muted"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <i.icon className="h-5 w-5" />
                </span>
                <span className="line-clamp-2 text-[11px] font-medium leading-tight">{i.label}</span>
              </Link>
            ))}
          </Card>
        </section>
      ))}

      <Button variant="outline" className="w-full text-destructive hover:text-destructive" onClick={authApi.logout}>
        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
      </Button>
    </div>
  );
}
