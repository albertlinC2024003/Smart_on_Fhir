import React, { useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Activity, AlertCircle, Calendar, Filter, Loader2, Users } from 'lucide-react';
import { useFhir } from "../../utils/module/FhirContext.tsx";

const DISEASE_MAP = [
    { id: 'hypertension', label: '高血壓', code: 'I10' },
    { id: 'diabetes', label: '糖尿病', code: 'E11' },
    { id: 'ckd', label: '慢性腎病', code: 'N18' },
    { id: 'asthma', label: '氣喘', code: 'J45' },
    { id: 'copd', label: '肺阻塞', code: 'J44' }
];

const CqlDynamicAudit = () => {
    const { client } = useFhir();
    const [loading, setLoading] = useState(false);
    const [selectedDisease, setSelectedDisease] = useState(DISEASE_MAP[1]); // 預設糖尿病
    const [threshold, setThreshold] = useState(7); // 斷藥緩衝天數
    const [result, setResult] = useState({ total: 0, atRisk: 0, list: [] });

    // --- 核心：發送帶有參數的 CQL 請求 ---
    const evaluateAudit = async () => {
        if (!client) return;
        setLoading(true);
        try {
            // 建構動態參數 URL
            // Parameter 1: 診斷代碼
            // Parameter 2: 緩衝天數
            const baseUrl = `Measure/ChronicAdherenceMeasure/$evaluate-measure`;
            const params = new URLSearchParams({
                periodStart: '2020-01-01',
                periodEnd: new Date().toISOString().split('T')[0],
                reportType: 'subject-list',
                'parameter-TargetDiagnosisCode': selectedDisease.code,
                'parameter-ThresholdDays': threshold.toString()
            });

            const report = await client.request(`${baseUrl}?${params.toString()}`);

            // 解析 MeasureReport 統計
            const populations = report.group?.[0]?.population || [];
            const initialPop = populations.find(p => p.code?.coding?.[0]?.code === 'initial-population')?.count || 0;
            const numerator = populations.find(p => p.code?.coding?.[0]?.code === 'numerator')?.count || 0;

            // 取得高風險清單 (假設伺服器放在 evaluatedResource)
            const patients = report.evaluatedResource
                ?.filter(ref => ref.reference.includes('Patient'))
                .map(ref => ({ id: ref.reference.split('/')[1] }));

            setResult({ total: initialPop, atRisk: numerator, list: patients || [] });
        } catch (err) {
            console.error("CQL 運算失敗:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { evaluateAudit(); }, [client, selectedDisease, threshold]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">CQL 動態臨床審計</h1>
                        <p className="text-gray-500 text-sm">實時運算：根據診斷與斷藥天數過濾全院資料</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border">
                        <Calendar className="text-gray-400 w-4 h-4 ml-2" />
                        <span className="text-sm font-bold text-gray-600">斷藥容忍值:</span>
                        <input
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            className="w-16 bg-gray-100 border-none rounded-lg px-2 py-1 text-sm font-black text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-400 mr-2">天</span>
                    </div>
                </div>

                {/* 篩選切換區 */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {DISEASE_MAP.map(d => (
                        <button
                            key={d.id}
                            onClick={() => setSelectedDisease(d)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${selectedDisease.id === d.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-100'}`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左側統計 */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest">風險分析</h3>
                            {loading && <Loader2 className="animate-spin text-blue-500 w-4 h-4" />}
                        </div>

                        <div className="relative mb-8">
                            <Doughnut
                                data={{
                                    labels: ['正常', '高風險'],
                                    datasets: [{
                                        data: [result.total - result.atRisk, result.atRisk],
                                        backgroundColor: ['#10b981', '#f43f5e'],
                                        borderWidth: 0
                                    }]
                                }}
                                options={{
                                    cutout: '80%',
                                    plugins: { legend: { display: false } }
                                }}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-gray-800">{result.total > 0 ? Math.round((result.atRisk/result.total)*100) : 0}%</span>
                                <span className="text-[10px] text-gray-400 font-bold">斷藥佔比</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-sm font-bold text-gray-500 flex items-center"><Users className="w-4 h-4 mr-2"/> 總診斷人數</span>
                                <span className="font-black">{result.total}</span>
                            </div>
                            <div className="flex justify-between p-4 bg-rose-50 rounded-2xl text-rose-600">
                                <span className="text-sm font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-2"/> 判定斷藥人數</span>
                                <span className="font-black">{result.atRisk}</span>
                            </div>
                        </div>
                    </div>

                    {/* 右側清單 */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center">
                                <Activity className="w-5 h-5 mr-3 text-blue-600" />
                                {selectedDisease.label} - 高風險病患追蹤名單
                            </h3>
                        </div>
                        <div className="overflow-y-auto max-h-[500px]">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">病患編號</th>
                                    <th className="px-8 py-4">判定狀態</th>
                                    <th className="px-8 py-4 text-right">建議</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {result.list.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-gray-700">{p.id}</td>
                                        <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase">
                                                    已斷藥超過 {threshold} 天
                                                </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="text-xs font-bold text-blue-600 hover:underline">立即聯繫</button>
                                        </td>
                                    </tr>
                                ))}
                                {result.list.length === 0 && !loading && (
                                    <tr><td colSpan={3} className="py-20 text-center text-gray-300 font-bold">目前無高風險案例</td></tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CqlDynamicAudit;