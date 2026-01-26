import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { sessionS } from "./ProjectStorage.ts";
import { StorageKey } from "../../enum/system.ts";
import axios from "axios";
import {CLIENT_ID, TOKEN_REDIRECT_URL, TOKEN_URL} from "../../auth/authConfig.ts";
import {UrlPath} from "./PathListener.tsx";

// 這個元件是處理 OAuth2 回調的專用元件
const CodeHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const exchangeCode = async () => {
            // 1. 從 URL 取得 code
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            console.log('receive code=',code);
            if (!code) {
                setError("授權碼 (code) 不存在。");
                return;
            }

            // 2. 從 sessionStorage 取得 code_verifier
            const codeVerifier = sessionS.getItem(StorageKey.pkce);
            if (!codeVerifier) {
                setError("PKCE 驗證碼 (verifier) 不存在，無法交換權杖。");
                return;
            }
            // 使用後立即刪除，防止重放攻擊
            sessionS.removeItem(StorageKey.pkce);

            // 3. 準備發送到 token 端點的資料
            const tokenUrl = TOKEN_URL;
            const tokenParams = new URLSearchParams();
            tokenParams.append('grant_type', 'authorization_code');
            tokenParams.append('client_id', CLIENT_ID);
            tokenParams.append('redirect_uri', TOKEN_REDIRECT_URL);
            tokenParams.append('code', code);
            tokenParams.append('code_verifier', codeVerifier);
            console.log('tokenUrl=',tokenUrl);
            console.log('tokenParams=',tokenParams);
            try {
                // 4. 發送請求交換 token
                // 注意：這裡使用原始 axios，因為交換 token 的請求不需要帶上 CSRF token 等攔截器邏輯
                const response = await axios.post(tokenUrl, tokenParams, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                const { access_token, refresh_token, id_token } = response.data;
                console.log('access_token=',access_token);
                console.log('refresh_token=',refresh_token);
                console.log('id_token=',id_token);
                if (access_token) {
                    const payload = access_token.split('.')[1];
                    const decoded = JSON.parse(atob(payload));
                    console.log('Access Token payload:', decoded);
                }
                // 5. 儲存 token (這裡以 sessionStorage 為例)
                sessionS.setItem(StorageKey.accessToken, access_token);
                sessionS.setItem(StorageKey.refreshToken, refresh_token);
                sessionS.setItem(StorageKey.idToken, id_token);

                // 6. 導向到主頁或使用者原本想去的頁面
                var path = sessionS.getItem(StorageKey.previousPage) ?? UrlPath.TEST;
                navigate(path); // 或者導向到一個更合適的登入後首頁

            } catch (err: any) {
                const errorMsg = err.response?.data?.error_description || err.message;
                setError(`交換權杖失敗: ${errorMsg}`);
            } finally {
                sessionS.removeItem(StorageKey.previousPage);
            }
        };

        exchangeCode();
    }, [location, navigate]);

    // 在處理過程中顯示載入畫面或錯誤訊息
    return (
        <Box className="flex flex-col items-center justify-center h-screen w-full text-2xl">
            {error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>正在驗證登入，請稍候...</Typography>
                </>
            )}
        </Box>
    );
};

export default CodeHandler;