import type {UserManagerSettings} from 'oidc-client-ts';

const oidcConfig: UserManagerSettings = {
    authority: 'https://你的授權伺服器',
    client_id: '你的client_id',
    redirect_uri: 'http://localhost:5173/callback',
    response_type: 'code',
    scope: 'openid profile email',
    post_logout_redirect_uri: 'http://localhost:5173/',
};

export default oidcConfig;