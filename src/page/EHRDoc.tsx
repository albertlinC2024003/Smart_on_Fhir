import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChartBarIcon,
    UsersIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { UrlPath } from "../utils/module/PathListener.tsx";

const EHRDoc = () => {
    const navigate = useNavigate();
    const handleNavigate = (id: string) => {
        navigate(id);
    };

    const modules = [
        {
            id: UrlPath.EHR_CHRONIC_DISEASE,
            title: '慢性病指標統計',
            description: '分析病患分佈、疾病比例及長期趨勢追蹤。透過視覺化圖表，協助診所掌握不同慢性病族群的控制情況與季節性趨勢。',
            icon: <ChartBarIcon className="w-10 h-10 text-blue-600" />,
            active: true,
            color: 'bg-blue-50',
        },
        {
            id: UrlPath.EHR_MEDICATION_RISK,
            title: '慢病追蹤與風險管理',
            description: '即時追蹤病患的血糖、血壓異常波動，並結合領藥紀錄進行斷藥風險評估，預防併發症發生。',
            icon: <UsersIcon className="w-10 h-10 text-green-600" />,
            active: true,
            color: 'bg-green-50',
        },
        {
            id: UrlPath.EHR_MEDICATION_STATISTIC,
            title: '診所藥品統計',
            description: '彙整本月用藥排行與半年消耗趨勢。支持手動檢索特定藥品，優化診所庫存管理與醫師處方偏好分析。',
            icon: <ClipboardDocumentCheckIcon className="w-10 h-10 text-purple-600" />,
            active: true,
            color: 'bg-purple-50',
        },
        // {
        //     id: 'lab_results',
        //     title: '檢驗報告分析',
        //     description: '快速查看檢驗室回傳結果與異常數值提醒。',
        //     icon: <BeakerIcon className="w-8 h-8 text-red-600" />,
        //     active: false,
        //     color: 'bg-red-50',
        // },
        // {
        //     id: 'scheduling',
        //     title: '門診排班管理',
        //     description: '調整診別時段與預約掛號流量管控。',
        //     icon: <CalendarIcon className="w-8 h-8 text-orange-600" />,
        //     active: false,
        //     color: 'bg-orange-50',
        // },
        // {
        //     id: 'settings',
        //     title: '系統參數設定',
        //     description: '自定義 ICD-10 診斷組與診所基本配置。',
        //     icon: <Cog6ToothIcon className="w-8 h-8 text-gray-600" />,
        //     active: false,
        //     color: 'bg-gray-100',
        // },
    ];

    return (
        /* 使用 flex flex-col 搭配 h-screen，確保內容填滿整個視窗 */
        <div className="h-screen bg-slate-50 p-8 flex flex-col">
            <header className="mb-8 flex-shrink-0">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">診所經營智慧管理系統</h1>
                <p className="text-slate-500 mt-3 text-lg">歡迎回來，醫師。請選擇您要進入的決策支援模組：</p>
            </header>

            {/* 核心改動：flex-1 會自動撐開剩餘空間，grid-cols-3 確保左中右排列 */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 mb-4">
                {modules.map((module) => (
                    <div
                        key={module.id}
                        onClick={() => module.active && handleNavigate(module.id)}
                        className={`
                            relative group p-10 rounded-3xl shadow-sm border border-slate-200 transition-all duration-500
                            flex flex-col items-start justify-between
                            ${module.active
                            ? 'bg-white cursor-pointer hover:shadow-2xl hover:-translate-y-2'
                            : 'bg-slate-50 cursor-not-allowed opacity-60'}
                        `}
                    >
                        {/* 頂部內容 */}
                        <div className="w-full">
                            <div className={`${module.color} w-20 h-20 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:rotate-6 group-hover:scale-110`}>
                                {module.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">{module.title}</h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                                {module.description}
                            </p>
                        </div>

                        {/* 底部導向標籤 */}
                        {module.active && (
                            <div className="mt-8 flex items-center text-blue-600 font-bold text-lg group-hover:translate-x-2 transition-transform">
                                進入分析
                                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 底部版權或裝飾線 */}
            <footer className="mt-4 py-4 text-center text-slate-400 text-sm border-t border-slate-200 flex-shrink-0">
                © 2026 Smart FHIR Clinic Dashboard | 臨床決策支援系統
            </footer>
        </div>
    );
};

export default EHRDoc;