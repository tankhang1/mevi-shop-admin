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
    <div className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-3 z-[60] flex flex-col items-end text-sm md:bottom-4 md:left-4 md:right-auto md:items-start">
      {open && (
        <div className="mb-2 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border bg-background shadow-xl">
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
          "flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 p-2.5 font-medium text-amber-900 shadow-lg md:px-3 md:py-2",
          "hover:bg-amber-100",
        )}
        aria-expanded={open}
        aria-label="Đổi tài khoản demo"
      >
        <FlaskConical className="h-4 w-4" />
        {/* Mobile shows just the flask so it never covers content above the bottom nav */}
        <span className="hidden max-w-48 truncate md:inline">
          {current ? `${current.name} · ${current.title}` : "Chưa đăng nhập"}
        </span>
        <ChevronUp
          className={cn("hidden h-4 w-4 transition-transform md:block", !open && "rotate-180")}
        />
      </button>
    </div>
  );
}
