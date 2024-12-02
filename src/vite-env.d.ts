/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_GH_CLIENT_ID: string
  readonly VITE_APP_GH_CLIENT_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 