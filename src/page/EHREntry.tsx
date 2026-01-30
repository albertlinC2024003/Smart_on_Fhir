import React, { useEffect, useState } from 'react';
import FHIR from 'fhirclient';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {useFhir} from "../utils/module/FhirContext.tsx";

// 註冊 Chart.js 必要元件
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EHREntry = () => {
    // const [client, setClient] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log("進入 EHREntry");
    // useEffect(() => {
    //     console.log("初始化 SMART Client");
    //     // 1. 初始化 SMART Client
    //     FHIR.oauth2.ready()
    //         .then((client) => {
    //             console.log("取得Client", client);
    //             const tokenResponse = client.state.tokenResponse;
    //             console.log("Access Token:", tokenResponse.access_token);
    //
    //             // 3. 獲取 Id Token (包含使用者資訊，通常是 JWT 格式)
    //             console.log("ID Token:", tokenResponse.id_token);
    //
    //             // 4. 獲取當前病患 ID
    //             console.log("Patient ID:", client.patient.id);
    //             setClient(client);
    //             return fetchConditions(client);
    //         })
    //         .catch((err) => {
    //             console.log("授權失敗", err);
    //             setError(`授權失敗: ${err.message}`);
    //             setLoading(false);
    //         });
    // }, []);

    const { client, patientId } = useFhir();
    useEffect(() => {
        if (client) {
            console.log("取得 Client:", client);
            console.log("Patient ID:", patientId);
            fetchConditions(client);
        }
    }, [client]);

    const fetchConditions = async (fhirClient) => {
        try {
            // 2. 設定查詢條件 (最近 90 天)
            const d = new Date();
            d.setDate(d.getDate() - 3650);
            const startDate = d.toISOString().split('T')[0];

            // 抓取 Condition
            const query = `Condition?clinical-status=active&recorded-date=ge${startDate}&_count=100`;
            const bundle = await fhirClient.request(query);

            // 3. 處理資料
            processStats(bundle);
        } catch (err) {
            setError(`資料撈取失敗: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const processStats = (bundle) => {
        const counts = {};
        const entries = bundle.entry || [];

        if (entries.length === 0) {
            setChartData(null);
            return;
        }

        entries.forEach((item) => {
            const condition = item.resource;
            // 優先取 display 名稱
            const name = condition.code?.coding?.[0]?.display || condition.code?.coding?.[0]?.code || "未知病情";
            counts[name] = (counts[name] || 0) + 1;
        });

        // 轉為 Chart.js 格式
        const sortedData = Object.entries(counts)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 10);

        setChartData({
            labels: sortedData.map((s) => s[0]),
            datasets: [
                {
                    label: '病例數量',
                    data: sortedData.map((s) => s[1]),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
            ],
        });
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>🏥 FHIR 數據讀取中...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>⚠️ 錯誤: {error}</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <h2>診所病情種類統計 (最近三個月)</h2>
            {chartData ? (
                <Bar
                    data={chartData}
                    options={{
                        indexAxis: 'y', // 橫向長條圖
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                            title: { display: false },
                        },
                    }}
                />
            ) : (
                <p>此期間內查無診斷數據。</p>
            )}
        </div>
    );
};

export default EHREntry;