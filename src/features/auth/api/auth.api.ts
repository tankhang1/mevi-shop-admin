import { API_ENDPOINTS } from "@/config/api-endpoints";
import { env } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/lib/axios";
import { useAuthStore } from "../store/auth.store";
import type { AuthMe } from "../types";

const REDIRECT_KEY = "redirect_path";

export const authApi = {
  getMe: async () => (await apiClient.get<AuthMe>(API_ENDPOINTS.auth.me)).data,

  /** Backend redirects back to `callback_url?token=...` after SSO login */
  startLogin: () => {
    const callbackUrl = new URL(ROUTES.authCallback, window.location.origin);
    const url = new URL(API_ENDPOINTS.auth.login(env.auth.provider), env.apiBaseUrl || window.location.origin);
    url.searchParams.set("callback_url", callbackUrl.toString());
    window.location.replace(url.toString());
  },

  getCallbackToken: () => new URLSearchParams(window.location.search).get("token"),

  saveRedirect: (path: string) => sessionStorage.setItem(REDIRECT_KEY, path),
  takeRedirect: () => {
    const path = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
    return path;
  },

  logout: () => {
    useAuthStore.getState().clear();
    window.location.replace(env.auth.postLogoutRedirectUri || ROUTES.login);
  },
};
