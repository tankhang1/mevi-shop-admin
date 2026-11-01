import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "@/config/api-endpoints";
import { env } from "@/config/env";
import { getAccessToken, useAuthStore } from "@/features/auth/store/auth.store";
import { mockAdapter } from "@/mocks/adapter";

const REFRESH_PATH = API_ENDPOINTS.auth.refresh;

function createClient({ mock }: { mock: boolean }) {
  return axios.create({
    baseURL: env.apiBaseUrl,
    timeout: 30_000,
    headers: { "Content-Type": "application/json" },
    // Explicit network adapter: mocks/install.ts swaps axios.defaults.adapter, which instances would inherit
    adapter: mock ? mockAdapter : ["xhr", "fetch"],
  });
}

/** Always hits the real backend: auth + APIs already live (shop-catalog) */
export const realApiClient = createClient({ mock: false });

/** Legacy screens — answered by src/mocks while VITE_USE_MOCK=true */
export const apiClient = env.useMock ? createClient({ mock: true }) : realApiClient;

/** POST /auth/refresh with the old Bearer token → `string` or `{ access_token }` */
async function requestNewToken() {
  const res = await realApiClient.post<string | { access_token: string }>(REFRESH_PATH);
  const token = typeof res.data === "string" ? res.data : res.data?.access_token;
  if (!token) throw new Error("Refresh returned no token");
  return token;
}

/** One refresh at a time; concurrent 401s wait on the same promise */
let refreshing: Promise<string> | null = null;

function sessionExpired() {
  useAuthStore.getState().clear();
  window.location.replace(env.auth.postLogoutRedirectUri || "/login");
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const config = error.config as RetriableConfig | undefined;
      const status = error.response?.status;

      if (status === 401 && config && !config._retried && !config.url?.endsWith(REFRESH_PATH)) {
        config._retried = true;
        try {
          refreshing ??= requestNewToken().finally(() => (refreshing = null));
          const token = await refreshing;
          useAuthStore.getState().setToken(token);
          config.headers.Authorization = `Bearer ${token}`;
          return client(config);
        } catch {
          sessionExpired();
        }
      } else if (status === 401) {
        sessionExpired();
      } else if (status === 403) {
        console.warn(`[api] 403 Forbidden: ${config?.method?.toUpperCase()} ${config?.url}`);
      }
      return Promise.reject(error);
    },
  );
}

attachInterceptors(realApiClient);
if (apiClient !== realApiClient) attachInterceptors(apiClient);
