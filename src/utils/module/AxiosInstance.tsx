import { ReactNode, useEffect} from 'react'
import { api } from '../../api/axiosConfig';
import { useProvider } from '../ComponentProvider';
import { ResponseData } from '../../dto/apiObj';
import { AxiosError } from 'axios';
import {generateCodeChallenge, generateCodeVerifier} from "./PKCETool.ts";
import {sessionS} from "./ProjectStorage.ts";
import {StorageKey} from "../../enum/system.ts";
import {NotLoginError, TokenExpiredError} from "../../dto/error.ts";
import {AUTH_URL, CLIENT_ID, TOKEN_REDIRECT_URL} from "../../auth/authConfig.ts";

// const sleep = (milliseconds) => {
//     return new Promise(resolve => setTimeout(resolve, milliseconds));
// };

const AxiosInstance = ({children}: {children:ReactNode}) => {
    const {popUp} = useProvider();
    //為了讓axios可以使用hook，所以在這裡添加一個額外的interceptor
    useEffect(() => {
        // 將攔截器改為 async 函式以支援 await
        //http status不是200的時候，進入這個interceptor
        const res_error = async (error:AxiosError<ResponseData<object>>) => {
            console.log("res_error");
            if (error instanceof NotLoginError || error instanceof TokenExpiredError ||
                error.response.status === 401 || error.response.status === 403) {
                console.log("401 403 redirect to login page");

                // 1. 產生並儲存 code_verifier
                const codeVerifier = generateCodeVerifier();
                sessionS.setItem(StorageKey.pkce, codeVerifier); // 假設您有 PKCE 的 StorageKey
                // 2. 產生 code_challenge
                const codeChallenge = await generateCodeChallenge(codeVerifier);
                // 3. 組合授權 URL
                const authServerUrl = AUTH_URL;
                const redirectUri = TOKEN_REDIRECT_URL;// 準備接收code的頁面
                console.log('redirectUri=', redirectUri);
                const scope = 'openid profile email';
                const state = Math.random().toString(36).substring(2);

                //{KEYCLOAK_URL}/realms/{REALM_NAME}/protocol/openid-connect/auth? client_id={YOUR_CLIENT_ID} &redirect_uri={YOUR_APP_CALLBACK_URL} &response_type=code &scope=openid {OTHER_SCOPES} &state={RANDOM_STATE_STRING}
                const authorizationUrl = `${authServerUrl}` +
                    `?response_type=code` +
                    `&client_id=${encodeURIComponent(CLIENT_ID)}` +
                    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                    `&scope=${encodeURIComponent(scope)}` +
                    `&state=${encodeURIComponent(state)}` +
                    `&code_challenge=${codeChallenge}` +
                    `&code_challenge_method=S256`; // 指定雜湊演算法
                // 4. 重新導向到授權伺服器
                console.log('authorizationUrl=',authorizationUrl);
                window.location.href = authorizationUrl;
            }
            if (error.response.data.code === 101 || error.response.data.code === 105) {
                console.log("101 105 redirect to login page");
                // window.location.href = 'http://localhost:8086/SmartAuth/oauth2/authorize';
            } else if(error.response.data.msg) {
                popUp.openPopUp(error.response.data.msg, true);
            } else {
                popUp.openPopUp('系統錯誤:'+error.message, true);
            }
            return Promise.reject(error);
        }
        const res_interceptor = api.interceptors.response.use(null, res_error);
        return () => {
            api.interceptors.response.eject(res_interceptor);
        };
    }, [])
    return children
}

export default AxiosInstance