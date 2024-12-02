/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_GH_APP_ID: string
  readonly VITE_APP_GH_PRIVATE_KEY?: string
  readonly VITE_APP_GH_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 