import { type ReactNode, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { authApi } from "../api/auth.api";
import { isRootRole } from "../roles";
import { getAccessToken, useAuthStore } from "../store/auth.store";

const isSafeRedirect = (path: string | null): path is string =>
  !!path &&
  path.startsWith("/") &&
  !path.startsWith("//") &&
  path !== "/" &&
  !path.startsWith(ROUTES.authCallback) &&
  !path.startsWith(ROUTES.login);

/** Pages only Mevi root staff may open (mirrors `rootOnly` in the router) */
const isRootOnlyPath = (path: string) => path.startsWith(ROUTES.agencies);

const isCallbackRoute = () =>
  window.location.pathname.startsWith(ROUTES.authCallback);

async function handleCallback() {
  const token = authApi.getCallbackToken();
  if (!token) {
    authApi.startLogin();
    return;
  }
  useAuthStore.getState().setToken(token);

  let isRoot = false;
  try {
    const me = await authApi.getMe();
    isRoot = isRootRole([...(me.roles ?? []), ...[me.role ?? []].flat()]);
  } catch {
    // Profile failed — treat as non-root; the backend still enforces access
  }

  // Priority: ?redirect / ?redirect_url → path saved before login → dashboard
  const params = new URLSearchParams(window.location.search);
  const saved = authApi.takeRedirect();
  let target =
    [params.get("redirect"), params.get("redirect_url"), saved].find(
      isSafeRedirect,
    ) ?? null;
  if (target && isRootOnlyPath(target) && !isRoot) target = null;

  window.location.replace(target ?? ROUTES.products);
}

/** Handles the SSO callback; sends users without a token straight to SSO */
export function AuthWrapper({ children }: { children: ReactNode }) {
  const [isReady] = useState(() => !isCallbackRoute() && !!getAccessToken());

  useEffect(() => {
    if (isReady) return;
    if (isCallbackRoute()) {
      void handleCallback();
      return;
    }
    const current =
      window.location.pathname + window.location.search + window.location.hash;
    if (isSafeRedirect(current)) authApi.saveRedirect(current);
    authApi.startLogin();
  }, [isReady]);

  if (!isReady) return <LoadingBlock />;
  return <>{children}</>;
}
