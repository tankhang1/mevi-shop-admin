import axios from "axios";
import { env } from "@/config/env";
import { getAccessToken, useAuthStore } from "@/features/auth/store/auth.store";
import { mockAdapter } from "@/mocks/adapter";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
  // Dummy data until the backend is ready — set VITE_USE_MOCK=false to hit the real API
  ...(env.useMock && { adapter: mockAdapter }),
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clear();
      window.location.replace("/login");
    }
    return Promise.reject(error);
  },
);
