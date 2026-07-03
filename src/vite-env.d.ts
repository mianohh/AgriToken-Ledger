/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_SEPOLIA_RPC_URL: string;
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_EXPLORER_URL: string;
  readonly VITE_OXLO_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
