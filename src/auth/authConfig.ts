// 客戶端設定
export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
export const LOGOUT_REDIRECT_URL = import.meta.env.VITE_CLIENT_LOGOUT_REDIRECT_URL;
export const TOKEN_REDIRECT_URL = import.meta.env.VITE_CLIENT_TOKEN_REDIRECT_URL;

// 資源伺服器
export const SOURCE_BASE = import.meta.env.VITE_SOURCE_BASE;

//授權伺服器
export const KEYCLOAK_URL = import.meta.env.VITE_AUTH_URL;
export const REALM = import.meta.env.VITE_AUTH_REALM;
export const AUTH_URL = import.meta.env.VITE_AUTH_AUTH_URL;
export const TOKEN_URL = import.meta.env.VITE_AUTH_TOKEN_URL;
export const REVOCATION_URL = import.meta.env.VITE_AUTH_REVOCATION_URL;
export const LOGOUT_URL = import.meta.env.VITE_AUTH_LOGOUT_URL;
