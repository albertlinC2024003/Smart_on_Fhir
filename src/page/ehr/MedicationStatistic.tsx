import React, { useState, useEffect, useMemo } from 'react';
import { useFhir } from "../../utils/module/FhirContext.tsx";
import { useNavigate } from "react-router-dom";
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {useProvider} from "../../utils/ComponentProvider.tsx";

const COLORS = ['#3182ce', '#38a169', '#d69e2e', '#e53e3e', '#805ad5', '#718096'];

const MedicationAnalytics = () => {
    const { client } = useFhir();
    const navigate = useNavigate();
    const { popUp } = useProvider();

    const [loading, setLoading] = useState(false);
    const [pieData, setPieData] = useState([]); // 本月圓餅圖資料
    const [trendData, setTrendData] = useState([]); // 趨勢圖資料
    const [medOptions, setMedOptions] = useState([]); // 下拉選單藥品
    const [selectedMed, setSelectedMed] = useState(""); // 當前選中藥品
    const [searchQuery, setSearchQuery] = useState(""); // 手動搜尋輸入

    // --- 動作 1: 初始化抓取本月藥單 ---
    const fetchMonthlyMeds = async () => {
        if (!client) return;
        setLoading(true);
        try {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

            // 使用你的 Server 支援的 authoredon
            const bundle = await client.request(`MedicationRequest?authoredon=gt${firstDay}&_count=100`);
            const entries = bundle.entry ? bundle.entry.map(e => e.resource) : [];

            const counts = {};
            entries.forEach(m => {
                const name = m.medicationCodeableConcept?.text || m.medicationReference?.display || "未知藥品";
                counts[name] = (counts[name] || 0) + 1;
            });

            const sortedStats = Object.keys(counts)
                .map(name => ({ name, value: counts[name] }))
                .sort((a, b) => b.value - a.value);

            setPieData(sortedStats);

            // 設定初始下拉選單
            const initialOptions = sortedStats.map(s => s.name);
            setMedOptions(initialOptions);

            // 預設查詢排行第一的藥品
            if (initialOptions.length > 0) {
                handleMedChange(initialOptions[0]);
            }
        } catch (err) {
            console.error("Fetch Monthly Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- 動作 2: 查詢特定藥品半年趨勢 ---
    const fetchMedTrend = async (medName) => {
        if (!client || !medName) return;
        setLoading(true);
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const dateStr = sixMonthsAgo.toISOString().split('T')[0];

            // 根據藥品名稱查詢 (使用 code:text 或是直接用 name 搜尋，視 Server 支援而定)
            // 這裡採用最通用的方式：抓取該藥名在半年內的紀錄
            const bundle = await client.request(`MedicationRequest?authoredon=gt${dateStr}&_count=200`);
            const entries = bundle.entry ? bundle.entry.map(e => e.resource) : [];

            // 建立 6 個月的空容器
            const months = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                months.push({ label: `${d.getMonth() + 1}月`, month: d.getMonth(), year: d.getFullYear(), count: 0 });
            }

            // 過濾並統計
            entries.forEach(m => {
                const name = m.medicationCodeableConcept?.text || m.medicationReference?.display || "";
                if (name.toLowerCase().includes(medName.toLowerCase())) {
                    const dateRaw = m.authoredOn || m.dateWritten;
                    const authDate = new Date(dateRaw);
                    const target = months.find(obj => obj.month === authDate.getMonth() && obj.year === authDate.getFullYear());
                    if (target) target.count += 1;
                }
            });

            setTrendData(months);
            setSelectedMed(medName);
        } catch (err) {
            console.error("Fetch Trend Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // 處理下拉切換或點擊圓餅圖
    const handleMedChange = (name) => {
        const trimmedName = name.trim(); // 去掉前後空格
        // 檢查是否已經存在 (不分大小寫)
        const exists = medOptions.some(opt => opt.toLowerCase() === trimmedName.toLowerCase());
        if (!exists) {
            setMedOptions(prev => [...prev, trimmedName]);
        }
        // 執行查詢 (fetchMedTrend 內部已經有對應處理)
        fetchMedTrend(trimmedName);
    };

    // 處理手動搜尋
    const handleManualSearch = () => {
        if (searchQuery.trim()) {
            handleMedChange(searchQuery.trim());
            setSearchQuery("");
        }
    };

    useEffect(() => { fetchMonthlyMeds(); }, [client]);
    useEffect(() => {
        if (loading) {
            popUp.loading(true, true)
        }else{
            popUp.loading(false)
        }
    }, [loading]);

    return (
        <div style={{ padding: '30px', backgroundColor: '#f4f6f8', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <button onClick={() => navigate('/EHREntry')} style={{ color: '#3182ce', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>⬅ 返回首頁</button>

            {/* 搜尋與控制區 */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <input
                    type="text"
                    placeholder="🔍 輸入藥品名稱手動追蹤趨勢..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
                />
                <button onClick={handleManualSearch} style={{ padding: '10px 25px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>搜尋藥品</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                {/* 左側：本月圓餅圖 */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '450px' }}>
                    <h3 style={{ fontSize: '16px', color: '#4a5568', marginBottom: '20px' }}>📊 本月用藥排行</h3>
                    <div style={{ width: '100%', height: '350px' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%" cy="50%"
                                    outerRadius={80}
                                    onClick={(d) => handleMedChange(d.name)}
                                >
                                    {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} style={{ cursor: 'pointer' }} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 右側：趨勢圖 */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '450px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '16px', color: '#4a5568' }}>📈 半年開立趨勢：<span style={{ color: '#3182ce' }}>{selectedMed}</span></h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '14px', color: '#718096' }}>切換藥品:</span>
                            <select
                                value={selectedMed}
                                onChange={(e) => handleMedChange(e.target.value)}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                            >
                                {/* 使用 name + index 確保 key 絕對唯一 */}
                                {medOptions.map((opt, idx) => <option key={`${opt}-${idx}`} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '350px', minHeight: '350px' }}> {/* 加上 minHeight */}
                        {!loading ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#3182ce" strokeWidth={4} dot={{ r: 6, fill: '#3182ce' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                資料讀取中...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicationAnalytics;