import type {UserManagerSettings} from 'oidc-client-ts';

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

const oidcConfig: UserManagerSettings = {
    authority: 'https://你的授權伺服器',
    client_id: '你的client_id',
    redirect_uri: 'http://localhost:5173/callback',
    response_type: 'code',
    scope: 'openid profile email',
    post_logout_redirect_uri: 'http://localhost:5173/',
};

export default oidcConfig;