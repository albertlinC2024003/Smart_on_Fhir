import React, { createContext, useContext, useEffect, useState } from 'react';
import FHIR from 'fhirclient';
import Client from 'fhirclient/lib/Client';
import {UrlPath} from "./PathListener.tsx";

// 定義 Context 的內容
interface FhirContextType {
    client: Client | null;
    patientId: string | null;
    isAuthorized: boolean;
}

const FhirContext = createContext<FhirContextType | undefined>(undefined);

export const FhirProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        FHIR.oauth2.ready()
            .then((fhirClient) => {
                setClient(fhirClient);
                setLoading(false);
            })
            .catch((err) => {
                console.error("SMART Auth Error:", err);
                setLoading(false);

                // --- 嚴格門禁邏輯 ---
                // 情況 A：使用者直接輸入 URL (網址列沒有 code 或 state，session 也沒資料)
                // 情況 B：Token 過期
                if (window.location.pathname !== UrlPath.EHR_LAUNCH) {
                    console.error("path:", window.location.pathname);
                    // 這裡不導向，而是直接報錯，阻止頁面渲染
                    setError("存取拒絕：此應用程式必須從醫院 EHR 系統中啟動。");
                }
            });
    }, []);

    // 渲染邏輯
    if (error) {
        return (
            <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
                <h2>⚠️ 認證失敗</h2>
                <p>{error}</p>
                <small>請回到 EHR 系統重新點擊連結進入。</small>
            </div>
        );
    }

    const value = {
        client,
        patientId: client?.patient?.id || null,
        isAuthorized: !!client,
    };

    // 當正在檢查狀態時，顯示 Loading
    if (loading) {
        return <div>正在初始化連線...</div>;
    }

    // 如果沒 client 且還在嘗試導向，可以回傳空或 Loading
    if (!client && window.location.pathname !== "/launch") {
        return <div>權限不足，正在重新導向...</div>;
    }

    return (
        <FhirContext.Provider value={value}>
            {children}
        </FhirContext.Provider>
    );
};

export const useFhir = () => {
    const context = useContext(FhirContext);
    if (!context) throw new Error("useFhir must be used within a FhirProvider");
    return context;
};