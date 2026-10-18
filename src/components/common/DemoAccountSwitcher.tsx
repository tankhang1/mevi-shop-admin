import { useState } from "react";
import { Check, ChevronUp, FlaskConical } from "lucide-react";
import { cn } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { useAuthStore } from "@/features/auth";
import { DEMO_USERS, mockTokenFor, mockUserFromToken } from "@/mocks/users";

/** Mock mode only: floating account switcher so you can try each role without signing out */
export function DemoAccountSwitcher() {
  const [open, setOpen] = useState(false);
  const token = useAuthStore((s) => s.token);
  const current = mockUserFromToken(token);

  const switchTo = (userId: string) => {
    if (userId === current?.userId) return setOpen(false);
    useAuthStore.getState().setToken(mockTokenFor(userId));
    // Full reload: eco-shared-ui caches /auth/me per token in module state
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 left-4 z-[60] text-sm">
      {open && (
        <div className="mb-2 w-72 overflow-hidden rounded-xl border bg-background shadow-xl">
          <p className="border-b px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Đổi tài khoản demo
          </p>
          {DEMO_USERS.map((u) => (
            <button
              key={u.userId}
              type="button"
              onClick={() => switchTo(u.userId)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{u.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {u.title} · {u.roles?.join(", ")}
                </span>
              </span>
              {u.userId === current?.userId && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-2 font-medium text-amber-900 shadow-lg",
          "hover:bg-amber-100",
        )}
        aria-expanded={open}
      >
        <FlaskConical className="h-4 w-4" />
        <span className="max-w-48 truncate">
          {current ? `${current.name} · ${current.title}` : "Chưa đăng nhập"}
        </span>
        <ChevronUp
          className={cn("h-4 w-4 transition-transform", !open && "rotate-180")}
        />
      </button>
    </div>
  );
}
