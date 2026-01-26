import React, { useEffect } from 'react';
import FHIR from 'fhirclient';

const Launch = () => {
    useEffect(() => {
        FHIR.oauth2.authorize({
            clientId: "clinic_stats_app",// 改成註冊的 client_id
            scope: "launch patient/*.read user/*.read openid fhirUser",// 根據需求調整 scope
            redirectUri: "http://192.168.41.8:8087/EHREntry" // 改成應用程式 正式URL
        });
    }, []);

    return <div>正在連線至 EHR，請稍候...</div>;
};

export default Launch;