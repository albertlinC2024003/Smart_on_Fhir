import React, { useState } from 'react';
import {useFhir} from "../utils/module/FhirContext.tsx";

const SearchByCondition = () => {
    const {client} = useFhir();

    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);

    // 篩選狀態
    const [filters, setFilters] = useState({
        disease: '',
        gender: 'all',
        ageGroup: 'all'
    });

    // 台灣常見慢性病對應表
    const diseaseOptions = [
        { label: '全部慢性病', code: 'E11,I10,E78,N18,J44' },
        { label: '2型糖尿病 (E11)', code: 'E11' },
        { label: '高血壓 (I10)', code: 'I10' },
        { label: '高血脂 (E78)', code: 'E78' },
        { label: '慢性腎病 (N18)', code: 'N18' },
        { label: 'COPD (J44)', code: 'J44' }
    ];


    const handleSearch = async () => {
        if (!client) return;
        setLoading(true);

        try {
            // 1. 基本 Query：抓取 Condition 並包含 Patient 資料
            let query = `Condition?_include=Condition:patient&_count=50`;

            // 2. 加入疾病篩選
            if (filters.disease) {
                query += `&code=${filters.disease}`;
            }

            // 3. 加入性別篩選
            if (filters.gender !== 'all') {
                query += `&patient.gender=${filters.gender}`;
            }

            // 4. 加入年齡篩選 (以今天 2026-01-26 為基準計算)
            if (filters.ageGroup === 'senior') {
                // 65歲以上 = 1961-01-26 以前出生
                query += `&patient.birthdate=le1961-01-26`;
            } else if (filters.ageGroup === 'adult') {
                // 18-64歲 = 1961-01-27 ~ 2008-01-26
                query += `&patient.birthdate=gt1961-01-26&patient.birthdate=le2008-01-26`;
            }

            const bundle = await client.request(query);
            parseBundle(bundle);
        } catch (err) {
            alert("搜尋失敗：" + err.message);
        } finally {
            setLoading(false);
        }
    };

    // 解析 Bundle：將 Condition 與 Patient 配對
    const parseBundle = (bundle) => {
        if (!bundle.entry) {
            setPatients([]);
            return;
        }

        // 建立病人字典 (ID -> Data)
        const patientMap = {};
        bundle.entry.forEach(entry => {
            if (entry.resource.resourceType === 'Patient') {
                patientMap[entry.resource.id] = entry.resource;
            }
        });

        // 提取診斷並關聯病人
        const results = bundle.entry
            .filter(entry => entry.resource.resourceType === 'Condition')
            .map(entry => {
                const cond = entry.resource;
                const patientId = cond.subject.reference.split('/')[1];
                const patient = patientMap[patientId];

                return {
                    id: cond.id,
                    patientName: patient?.name?.[0]?.text || patient?.name?.[0]?.family || "未知",
                    gender: patient?.gender === 'male' ? '男' : '女',
                    birthDate: patient?.birthDate,
                    diagnosis: cond.code.coding[0].display || cond.code.coding[0].code,
                    recordedDate: cond.recordedDate
                };
            });

        setPatients(results);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold mb-4 text-blue-800">慢性病患快速篩選器</h2>

                {/* 篩選 UI */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">疾病種類</label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border"
                            value={filters.disease}
                            onChange={(e) => setFilters({...filters, disease: e.target.value})}
                        >
                            <option value="">請選擇疾病</option>
                            {diseaseOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">性別</label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border"
                            value={filters.gender}
                            onChange={(e) => setFilters({...filters, gender: e.target.value})}
                        >
                            <option value="all">全部</option>
                            <option value="male">男</option>
                            <option value="female">女</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">年齡層</label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 bg-white border"
                            value={filters.ageGroup}
                            onChange={(e) => setFilters({...filters, ageGroup: e.target.value})}
                        >
                            <option value="all">不限年齡</option>
                            <option value="adult">18-64 歲 (青壯年)</option>
                            <option value="senior">65 歲以上 (長者)</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                        {loading ? '搜尋中...' : '執行篩選'}
                    </button>
                </div>
            </div>

            {/* 結果列表 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">患者姓名</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">性別</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">出生日期</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">主要診斷</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">判定日期</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {patients.length > 0 ? patients.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{p.patientName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{p.gender}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{p.birthDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{p.diagnosis}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{p.recordedDate}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-gray-400">請設定篩選條件並點擊搜尋</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SearchByCondition;