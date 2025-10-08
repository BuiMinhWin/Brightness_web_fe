interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_GATEWAY_KEY: string;
  readonly VITE_API_GATEWAY_KEY_HEADER: string;
  // thêm các biến khác nếu cần
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
