import {useContext, createContext, type ReactNode} from "react";
import type {AuthData} from "../../dto/dataObj.ts";
import {useProvider} from "../ComponentProvider";
import {AuthStatus, StorageKey} from "../../enum/system";
import {localS, sessionS} from "./ProjectStorage";
import axios from 'axios';
import {CLIENT_ID, LOGOUT_REDIRECT_URL, LOGOUT_URL, REVOCATION_URL} from "../../auth/authConfig.ts";


const AuthContext = createContext<AuthData>({status: AuthStatus.Auth_Loading});

export const useAuth = () => {
    const authData = useContext(AuthContext);
    if (!authData) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    const appLogin = (userId: string) => {
        authData.status = AuthStatus.Auth_SignedIn;
        authData.userId = userId;
        localS.setItem(StorageKey.userId, userId);
    }
    const appLogout = async () => {
        authData.status = AuthStatus.Auth_SignedOut;
        authData.userId = '未登入';
        localS.removeItem(StorageKey.userId);
    }
    const authLogout = async () => {
        try {
            const refreshToken = sessionS.getItem(StorageKey.refreshToken);

            if (refreshToken) {
                // 步驟 1: 撤銷 Refresh Token (可選但推薦)
                const revocationUrl = REVOCATION_URL;
                const params = new URLSearchParams();
                params.append('client_id', CLIENT_ID);
                params.append('token', refreshToken);
                params.append('token_type_hint', 'refresh_token');

                await axios.post(revocationUrl, params, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
            }
        } catch (error) {
            console.error("Failed to revoke token", error);
            // 即使撤銷失敗，也要繼續執行登出流程
        } finally {

            console.log("準備導轉到登出頁");
            // 步驟 2: 清除前端儲存
            sessionS.removeItem(StorageKey.accessToken);
            sessionS.removeItem(StorageKey.refreshToken);
            sessionS.removeItem(StorageKey.idToken);
            // 步驟 3: 重新導向到 Keycloak 登出頁面
            // post_logout_redirect_uri 告訴 Keycloak 登出後要跳轉回哪裡
            // 這個 URL 必須在 Keycloak Client 設定的 "Valid Post Logout Redirect URIs" 中註冊
            const logoutUrl = new URL(LOGOUT_URL);
            logoutUrl.searchParams.append('post_logout_redirect_uri', LOGOUT_REDIRECT_URL);
            logoutUrl.searchParams.append('client_id', CLIENT_ID);
            console.log(logoutUrl.toString());
            // setTimeout(() => {
            // }, 3000);
            window.location.href = logoutUrl.toString();
        }
    };
    return {authData, appLogin, appLogout, authLogout};
};


const AuthProvider = ({children}: { children: ReactNode }) => {
    const {authData, appLogin, appLogout, authLogout} = useAuth();
    const userId = localS.getItem(StorageKey.userId);
    console.log('userId=',userId);
    if (userId !== null) {
        console.log('有登入');
        appLogin(userId);
    } else {
        console.log('未登入');
        appLogout();
    }
    return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>;
};
export default AuthProvider;