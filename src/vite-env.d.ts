/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_GH_CLIENT_ID: string
  readonly MODE: string
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 