/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_PROVIDER: string;
  readonly VITE_AUTH_CALLBACK_PATH: string;
  readonly VITE_AUTH_POST_LOGOUT_REDIRECT_URI: string;
  readonly VITE_GOONG_API_KEY: string;
  readonly VITE_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
