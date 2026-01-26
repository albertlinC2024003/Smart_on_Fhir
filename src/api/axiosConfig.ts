import axios from 'axios'
import {sessionS} from '../utils/module/ProjectStorage'
import {StorageKey} from '../enum/system'
import {NotLoginError, TokenExpiredError} from "../dto/error.ts";
import {CLIENT_ID, SOURCE_BASE, TOKEN_URL} from "../auth/authConfig.ts";
//因為在Provider中的初始化順序因素 axiosConfig適合設定全域的攔截器 與UI無關的東西
//其餘和UI有關、或需要使用Hooks的攔截器放在AxiosInstance裡面

// 取得後端伺服器的基礎 URL
const api = axios.create({
    baseURL: SOURCE_BASE,
    headers: {
        accept: 'application/json'
    },
    withCredentials: true,
    withXSRFToken: true,
    timeout: 30000
})

api.interceptors.request.use(
    (config) => {
        // 夾帶 Access Token
        const accessToken = sessionS.getItem(StorageKey.accessToken);
        if (accessToken) {
            // 將 token 加入 Authorization 標頭，格式為 "Bearer <token>"
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config;
        if(originalRequest._retry){
            console.log("重試失敗，停止重試");
        }
        // 檢查是否為 401 錯誤且不是刷新 token 本身的請求失敗
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 標記為已重試，避免無限循環
            console.log("初次 401 錯誤，嘗試刷新 token", error.response.data);
            try {
                const newAccessToken = await refreshToken();
                axios.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken; // 更新全域預設標頭 避免多個請求同時失敗時使用舊的token
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                console.log("token成功刷新 token");
                return api(originalRequest); // 使用新的 token 重試原始請求
            } catch (refreshError) {
                const { url, method, headers, params, data } = originalRequest;
                console.log("紀錄當前API=",url, method);
                sessionS.setItem(StorageKey.previousApi, JSON.stringify({ url, method, headers, params, data }));
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error)
    }
)

// 刷新 Token 的函式
const refreshToken = async () => {
    try {
        console.log('refresh token');
        const refreshToken = sessionS.getItem(StorageKey.refreshToken);
        if (!refreshToken) {
            console.log("沒有refreshToken，直接拋出NotLoginError");
            throw new NotLoginError();
        }

        const tokenUrl = TOKEN_URL;
        const refreshParams = new URLSearchParams();
        refreshParams.append('grant_type', 'refresh_token');
        refreshParams.append('client_id', CLIENT_ID);
        refreshParams.append('refresh_token', refreshToken);

        const response = await axios.post(tokenUrl, refreshParams, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log('Try to refresh token');
        const { access_token, refresh_token } = response.data;
        sessionS.setItem(StorageKey.accessToken, access_token);
        sessionS.setItem(StorageKey.refreshToken, refresh_token);

        return access_token;
    } catch (error) {
        // 如果刷新失敗，清除所有 token 並導向登入頁
        sessionS.removeItem(StorageKey.accessToken);
        sessionS.removeItem(StorageKey.refreshToken);
        sessionS.removeItem(StorageKey.idToken);
        // 判斷是否為 refresh token 逾時
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 400)) {
            return Promise.reject(new TokenExpiredError());
        }
        //後續會由AxiosInstance的interceptor導向登入頁
        return Promise.reject(error);
    }
};


export {api}

