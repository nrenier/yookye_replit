
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REST_API_URL: string
  readonly VITE_REST_API_USERNAME: string
  readonly VITE_REST_API_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
