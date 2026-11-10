import { useEffect, useState } from "react";
import { BarChart3, Leaf, Loader2, LogIn, PackageCheck, ShieldCheck, Store } from "lucide-react";
import { Button } from "@Team-Trung-Vu-Khang/eco-shared-ui";
import { authApi } from "@/features/auth";
import loginFarm from "@/assets/images/login-farm.webp";

const FEATURES = [
  { icon: PackageCheck, title: "Sản phẩm & tồn kho", desc: "Quản lý danh mục, nhập hàng, cảnh báo sắp hết" },
  { icon: Store, title: "Đơn hàng & khách hàng", desc: "Theo dõi đơn, chăm sóc khách quen" },
  { icon: BarChart3, title: "Báo cáo", desc: "Doanh thu, đại lý, hiệu quả bán hàng" },
];

const Logo = ({ light }: { light?: boolean }) => (
  <div className="flex items-center gap-2.5">
    <span
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${light ? "bg-white/15 text-white ring-1 ring-white/25" : "bg-[#214c3a] text-white"}`}
    >
      <Leaf className="h-5 w-5" />
    </span>
    <span className={`text-lg font-bold tracking-tight ${light ? "text-white" : "text-[#214c3a]"}`}>
      Trạm xanh MEVI
    </span>
  </div>
);

export default function LoginPage() {
  const [redirecting, setRedirecting] = useState(false);

  // Back button from the SSO page restores this page from bfcache — un-stick the spinner
  useEffect(() => {
    const reset = () => setRedirecting(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const login = () => {
    setRedirecting(true);
    authApi.startLogin();
  };

  return (
    <div className="grid min-h-screen bg-[#f6f7f4] lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-[#123526] p-12 text-white lg:flex lg:flex-col">
        <img src={loginFarm} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        {/* Keep text readable over the sky; darken the field for the footer */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0d2a1d]/90 via-[#0d2a1d]/55 via-50% to-[#0d2a1d]/75" />

        <div className="relative">
          <Logo light />
        </div>

        <div className="relative mt-16 max-w-md xl:mt-24">
          <h2 className="text-4xl font-bold leading-tight">
            Quản trị cửa hàng nông sản, <span className="text-emerald-200">gọn trong một nơi.</span>
          </h2>
          <p className="mt-4 text-base text-white/70">
            Từ nông trại đến tay khách hàng — theo dõi sản phẩm, đơn hàng và doanh thu mỗi ngày.
          </p>

          <ul className="mt-10 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4 rounded-xl bg-[#0d2a1d]/35 p-3 ring-1 ring-white/10 backdrop-blur-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <f.icon className="h-5 w-5 text-emerald-200" />
                </span>
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-white/60">{f.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-auto text-xs text-white/60">© {new Date().getFullYear()} MEVI. All rights reserved.</p>
      </aside>

      {/* Login */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#1b4332]">Chào mừng trở lại 👋</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Đăng nhập bằng tài khoản Mevi để vào trang quản trị cửa hàng.
          </p>

          <Button type="button" className="mt-8 h-12 w-full text-base shadow-sm" disabled={redirecting} onClick={login}>
            {redirecting ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" />
            )}
            {redirecting ? "Đang chuyển hướng..." : "Đăng nhập với Mevi"}
          </Button>

          <div className="mt-6 flex items-start gap-2.5 rounded-lg border bg-white p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Bạn sẽ được chuyển sang trang đăng nhập bảo mật của Mevi. Chỉ tài khoản quản trị / cửa hàng mới truy cập
              được.
            </span>
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground lg:hidden">
            © {new Date().getFullYear()} MEVI
          </p>
        </div>
      </main>
    </div>
  );
}
