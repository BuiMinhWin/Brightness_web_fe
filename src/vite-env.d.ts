interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_GATEWAY_KEY: string;
  readonly VITE_API_GATEWAY_KEY_HEADER: string;
  readonly VITE_IDLE_TIMEOUT_MS: string;
  readonly VITE_TOKEN_REFRESH_BEFORE_EXPIRY_MS: string;
  readonly VITE_SESSION_STORAGE_KEY: string;
  readonly VITE_IDLE_WARNING_BEFORE_MS: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
