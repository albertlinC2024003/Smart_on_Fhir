import React, { useEffect } from 'react';
import FHIR from "fhirclient";

const Launch = () => {
    console.log("Launch");
    useEffect(() => {
        console.log("authorize");
        FHIR.oauth2.authorize({
            clientId: "clinic_stats_app",// 改成註冊的 client_id
            scope: "launch patient/*.read user/*.read openid fhirUser",// 根據需求調整 scope
            redirectUri: "http://localhost:8087/EHREntry", // 改成應用程式 正式URL
            // 加入下面這行解決報錯
            completeInTarget: true
        });
    }, []);
    return <div>正在連線至 EHR，請稍候...</div>;
};

export default Launch;