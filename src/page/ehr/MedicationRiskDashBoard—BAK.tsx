import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { AlertCircle, Clock, CheckCircle2, ChevronRight, Loader2, Filter } from 'lucide-react';
import { useFhir } from "../../utils/module/FhirContext.tsx";

ChartJS.register(ArcElement, Tooltip, Legend);

const PAGE_SIZE = 20; // 邏輯分頁：每頁顯示 20 人

const CHRONIC_OPTIONS = [
    { id: 'DIABETES', label: '糖尿病', codes: 'E11.9' },
    { id: 'HYPERTENSION', label: '高血壓', codes: 'I10' },
    { id: 'LIPID', label: '高血脂', codes: 'E78.5' }
];

const ChronicAdherenceDashboard = () => {
    const { client } = useFhir();

    // --- 狀態管理 ---
    const [loading, setLoading] = useState(false);
    const [displayPatients, setDisplayPatients] = useState([]); // 當前頁面顯示的資料
    const [dataBuffer, setDataBuffer] = useState([]);          // 緩衝區：存儲已過濾但尚未顯示的資料
    const [selectedIds, setSelectedIds] = useState(['DIABETES', 'HYPERTENSION']);

    // --- 分頁指標 ---
    const nextFhirLink = useRef(null);    // 記錄 FHIR 伺服器的下一個物理分頁網址
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    // --- 工具函數 ---
    const normalizeId = (id) => id ? (id.includes('/') ? id.split('/').pop() : id) : "";

    const calculateData = (mr) => {
        const days = mr.dispenseRequest?.expectedSupplyDuration?.value || 0;
        const authoredDate = new Date(mr.authoredOn);
        const expiryDate = new Date(authoredDate.getTime() + days * 24 * 60 * 60 * 1000);
        const remaining = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return {
            remaining,
            status: remaining <= 0 ? 'Critical' : (remaining <= 7 ? 'Warning' : 'Safe')
        };
    };

    // --- 核心邏輯：遞迴抓取直到滿足數量 ---
    const fetchMoreUntilSatisfied = useCallback(async (targetCount, currentBuffer) => {
        if (!client) return { newBuffer: currentBuffer, nextLink: null };

        let tempBuffer = [...currentBuffer];
        let currentNextUrl = nextFhirLink.current;
        let fetchCount = 0; // 安全計數，避免過度請求

        setLoading(true);

        try {
            // 迴圈條件：緩衝區不夠目標數量，且伺服器還有下一頁，且請求次數小於 10 次
            while (tempBuffer.length < targetCount && fetchCount < 10) {
                // 如果是第一次抓取，建立初始查詢
                const codes = CHRONIC_OPTIONS
                    .filter(opt => selectedIds.includes(opt.id))
                    .map(opt => opt.codes)
                    .join(',');

                const url = currentNextUrl || `MedicationRequest?status=active,completed&_count=100&_include=MedicationRequest:patient&_sort=-_lastUpdated`;

                console.log(`📡 正在請求 FHIR 數據... (目前緩衝: ${tempBuffer.length})`);
                const bundle = await client.request(url);

                if (!bundle.entry) break;

                // 1. 建立病患地圖
                const patientMap = bundle.entry
                    .filter(e => e.resource.resourceType === 'Patient')
                    .reduce((acc, e) => {
                        acc[normalizeId(e.resource.id)] = e.resource.name?.[0]?.text || e.resource.id;
                        return acc;
                    }, {});

                // 2. 過濾藥單 (天數 > 21)
                const filtered = bundle.entry
                    .filter(e => e.resource.resourceType === 'MedicationRequest')
                    .map(e => e.resource)
                    .filter(mr => (mr.dispenseRequest?.expectedSupplyDuration?.value > 21))
                    .map(mr => {
                        const { remaining, status } = calculateData(mr);
                        const pId = normalizeId(mr.subject?.reference);
                        return {
                            id: mr.id,
                            patientId: pId,
                            name: patientMap[pId] || pId,
                            drug: mr.medicationCodeableConcept?.text || "未知藥品",
                            lastFill: mr.authoredOn?.split('T')[0],
                            remaining,
                            status
                        };
                    });

                // 3. 加入暫存並去重
                const newItems = filtered.filter(f => !tempBuffer.some(t => t.id === f.id));
                tempBuffer = [...tempBuffer, ...newItems];

                // 4. 更新下一個連結
                const nextLinkObj = bundle.link?.find(l => l.relation === 'next');
                currentNextUrl = nextLinkObj ? nextLinkObj.url : null;
                nextFhirLink.current = currentNextUrl;

                fetchCount++;
                if (!currentNextUrl) break; // 伺服器沒資料了，跳出
            }
        } catch (err) {
            console.error("抓取失敗:", err);
        } finally {
            setLoading(false);
        }

        return { newBuffer: tempBuffer, nextLink: currentNextUrl };
    }, [client, selectedIds]);

    // --- 換頁處理 ---
    const loadNextPage = async () => {
        // 從緩衝區拿資料，如果不夠，就去抓
        const { newBuffer, nextLink } = await fetchMoreUntilSatisfied(PAGE_SIZE, dataBuffer);

        const toShow = newBuffer.slice(0, PAGE_SIZE);
        const remaining = newBuffer.slice(PAGE_SIZE);

        setDisplayPatients(toShow);
        setDataBuffer(remaining);
        setHasMore(nextLink !== null || remaining.length > 0);
        setCurrentPage(prev => prev + 1);
    };

    // --- 初始化與篩選變更 ---
    useEffect(() => {
        const resetAndFetch = async () => {
            nextFhirLink.current = null;
            setDataBuffer([]);
            const { newBuffer, nextLink } = await fetchMoreUntilSatisfied(PAGE_SIZE, []);
            setDisplayPatients(newBuffer.slice(0, PAGE_SIZE));
            setDataBuffer(newBuffer.slice(PAGE_SIZE));
            setHasMore(nextLink !== null || newBuffer.length > PAGE_SIZE);
            setCurrentPage(1);
        };
        if (client) resetAndFetch();
    }, [client, selectedIds]);

    // --- 圖表數據 ---
    const chartData = useMemo(() => ({
        labels: ['高風險', '警告', '安全'],
        datasets: [{
            data: [
                displayPatients.filter(p => p.status === 'Critical').length,
                displayPatients.filter(p => p.status === 'Warning').length,
                displayPatients.filter(p => p.status === 'Safe').length,
            ],
            backgroundColor: ['#f43f5e', '#fbbf24', '#10b981'],
            borderWidth: 0,
        }],
    }), [displayPatients]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-800">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">全院慢性病斷藥審計</h1>
                        <p className="text-gray-500 font-medium">邏輯分頁模式：緩衝遞迴抓取 (Page Size: {PAGE_SIZE})</p>
                    </div>
                    <div className="flex bg-white p-1 rounded-xl shadow-sm border">
                        {CHRONIC_OPTIONS.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedIds(prev => prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id])}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedIds.includes(opt.id) ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* 左側：統計圖表 */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                            <h3 className="text-center font-bold text-gray-400 uppercase text-xs tracking-widest mb-6">當前頁面風險分佈</h3>
                            <Doughnut data={chartData} options={{ cutout: '78%', plugins: { legend: { display: false } } }} />
                            <div className="mt-8 space-y-4">
                                <div className="flex items-center justify-between p-3 bg-rose-50 rounded-2xl">
                                    <span className="text-rose-600 text-sm font-bold flex items-center"><AlertCircle className="w-4 h-4 mr-2"/> 已斷藥</span>
                                    <span className="text-rose-700 font-black">{displayPatients.filter(p => p.status === 'Critical').length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl">
                                    <span className="text-emerald-600 text-sm font-bold flex items-center"><CheckCircle2 className="w-4 h-4 mr-2"/> 穩定</span>
                                    <span className="text-emerald-700 font-black">{displayPatients.filter(p => p.status === 'Safe').length}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-200">
                            <h4 className="font-bold mb-2 flex items-center"><Clock className="w-4 h-4 mr-2"/> 系統狀態</h4>
                            <p className="text-blue-100 text-xs leading-relaxed">緩衝區目前存儲了 {dataBuffer.length} 筆備用資料，將於下一頁直接顯示。</p>
                        </div>
                    </div>

                    {/* 右側：表格清單 */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                                    <th className="px-8 py-5">病患名稱</th>
                                    <th className="px-8 py-5">藥品明細 (天數&gt;21)</th>
                                    <th className="px-8 py-5">最後開單日期</th>
                                    <th className="px-8 py-5 text-center">剩餘天數</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {displayPatients.map((p, idx) => (
                                    <tr key={`${p.id}-${idx}`} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{p.name}</div>
                                            <div className="text-[10px] text-gray-400 font-mono">{p.patientId}</div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-gray-600">{p.drug}</td>
                                        <td className="px-8 py-5 text-sm text-gray-400">{p.lastFill}</td>
                                        <td className="px-8 py-5 text-center">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black ${
                                                    p.status === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                                        p.status === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                    {p.remaining <= 0 ? `已斷藥 ${Math.abs(p.remaining)} 天` : `${p.remaining} 天`}
                                                </span>
                                        </td>
                                    </tr>
                                ))}
                                {displayPatients.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="py-24 text-center">
                                            <div className="text-gray-300 font-bold">目前無符合條件的資料</div>
                                            <div className="text-gray-400 text-xs mt-1">請嘗試調整篩選器或檢查伺服器連線</div>
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>

                            {/* 分頁控制列 */}
                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-sm text-gray-400 font-bold">第 {currentPage} 頁</div>
                                <button
                                    onClick={loadNextPage}
                                    disabled={loading || !hasMore}
                                    className="flex items-center px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <ChevronRight className="w-4 h-4 mr-2"/>}
                                    載入更多 (下一頁)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChronicAdherenceDashboard;