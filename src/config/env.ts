const read = (value: string | undefined, fallback = "") => value?.trim() || fallback;

export const env = {
  apiBaseUrl: read(import.meta.env.VITE_API_BASE_URL),
  /** "true" → legacy APIs (apiClient) are answered by src/mocks; auth + shop-catalog always hit the real backend */
  useMock: read(import.meta.env.VITE_USE_MOCK, "true") === "true",
  auth: {
    provider: read(import.meta.env.VITE_AUTH_PROVIDER, "farm"),
    callbackPath: read(import.meta.env.VITE_AUTH_CALLBACK_PATH, "/auth/callback"),
    postLogoutRedirectUri: read(import.meta.env.VITE_AUTH_POST_LOGOUT_REDIRECT_URI),
  },
};
