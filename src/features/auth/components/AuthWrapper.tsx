import { type ReactNode, useEffect, useState } from "react";
import { LoadingBlock } from "@/components/common/ui-bits";
import { ROUTES } from "@/config/routes";
import { authApi } from "../api/auth.api";
import { getAccessToken, useAuthStore } from "../store/auth.store";

const isSafeRedirect = (path: string | null): path is string =>
  !!path &&
  path.startsWith("/") &&
  !path.startsWith("//") &&
  path !== "/" &&
  !path.startsWith(ROUTES.authCallback) &&
  !path.startsWith(ROUTES.login);

const isCallbackRoute = () => window.location.pathname.startsWith(ROUTES.authCallback);

function handleCallback() {
  const token = authApi.getCallbackToken();
  if (!token) {
    window.location.replace(ROUTES.login);
    return;
  }
  useAuthStore.getState().setToken(token);
  const saved = authApi.takeRedirect();
  window.location.replace(isSafeRedirect(saved) ? saved : ROUTES.dashboard);
}

/** Handles the SSO callback; sends users without a token to the login page */
export function AuthWrapper({ children }: { children: ReactNode }) {
  const [isReady] = useState(() => !isCallbackRoute() && !!getAccessToken());

  useEffect(() => {
    if (isReady) return;
    if (isCallbackRoute()) return handleCallback();
    const current = window.location.pathname + window.location.search;
    if (isSafeRedirect(current)) authApi.saveRedirect(current);
    window.location.replace(ROUTES.login);
  }, [isReady]);

  if (!isReady) return <LoadingBlock />;
  return <>{children}</>;
}
