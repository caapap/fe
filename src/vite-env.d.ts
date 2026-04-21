/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  /** stellar-fe package.json version，构建时由 vite.config 注入 */
  readonly VITE_FE_PKG_VERSION: string;
}
