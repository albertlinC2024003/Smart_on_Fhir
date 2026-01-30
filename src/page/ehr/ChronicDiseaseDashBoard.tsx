import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
} from 'chart.js';
import { useFhir } from "../../utils/module/FhirContext.tsx";
import {useNavigate} from "react-router-dom";
import {useProvider} from "../../utils/ComponentProvider.tsx";

// 註冊 Chart.js 組件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const DISEASE_OPTIONS = [
    { id: 'hypertension', label: '高血壓', code: 'I10' },
    { id: 'diabetes', label: '糖尿病', code: 'E11' },
    { id: 'lipid', label: '高血脂', code: 'E78' }, // 新增
    { id: 'ckd', label: '慢性腎病', code: 'N18' },
    { id: 'heart_failure', label: '心臟衰竭', code: 'I50' }, // 新增
    { id: 'cad', label: '冠狀動脈心臟病', code: 'I25' }, // 新增
    { id: 'afib', label: '心房顫動', code: 'I48' }, // 新增
    { id: 'asthma', label: '氣喘', code: 'J45' },
    { id: 'copd', label: '肺阻塞', code: 'J44' },
    { id: 'arthritis', label: '退化性關節炎', code: 'M19' }, // 新增
    { id: 'gout', label: '痛風/高尿酸', code: 'M10' }, // 新增
    { id: 'osteoporosis', label: '骨質疏鬆', code: 'M81' }, // 新增
];

const ChronicDiseaseDashboard = () => {
    const { client } = useFhir();
    const navigate = useNavigate();
    const { popUp } = useProvider();
    const currentYear = new Date().getFullYear();
    const YEARS = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => 2010 + i);

    const [selectedYear, setSelectedYear] = useState(2025);
    const [ageRange, setAgeRange] = useState({ min: 0, max: 100 });
    const [gender, setGender] = useState('all');
    const [selectedDiseases, setSelectedDiseases] = useState([
        'hypertension',
        'diabetes',
        'lipid',
        'ckd',
        'heart_failure',
        'cad',
        'afib',
        'asthma',
        'copd',
        'arthritis',
        'gout',
        'osteoporosis'
    ]);
    const [loading, setLoading] = useState(false);
    const [statsData, setStatsData] = useState({ pieData: [], lineData: new Array(12).fill(0) });

    const fetchData = async () => {
        if (!client) return;
        setLoading(true);
        try {
            const selectedCodesArr = selectedDiseases.map(id => DISEASE_OPTIONS.find(d => d.id === id).code);
            const selectedCodes = selectedCodesArr.join(',');

            // 抓取 Condition，並包含 Patient 與 Encounter
            // 加上日期過濾優化效能：只抓該年度的 Encounter
            const query = `Condition?code=${selectedCodes}` +
                `&_include=Condition:patient` +
                `&_include=Condition:encounter` +
                `&_count=200`;

            const bundle = await client.request(query);
            const entries = bundle.entry || [];

            const conditions = entries.filter(e => e.resource.resourceType === 'Condition').map(e => e.resource);
            const patients = entries.filter(e => e.resource.resourceType === 'Patient').map(e => e.resource);
            const encounters = entries.filter(e => e.resource.resourceType === 'Encounter').map(e => e.resource);

            const diseaseDistribution = {};
            const monthlyCounts = new Array(12).fill(0);

            // 用於追蹤「初診」：同一個病人在這一年內同個疾病只算一次
            const trackedInitialVisits = new Set();

            conditions.forEach(c => {
                const encRef = c.encounter?.reference?.split('/')[1];
                const pRef = c.subject?.reference?.split('/')[1];

                const patient = patients.find(p => p.id === pRef);
                const encounter = encounters.find(e => e.id === encRef);

                if (patient && encounter) {
                    // 1. 檢查年份與日期區間
                    const visitDate = new Date(encounter.period?.start);
                    if (visitDate.getFullYear() !== selectedYear) return;

                    // 2. 年齡與性別過濾
                    const birth = new Date(patient.birthDate);
                    let age = selectedYear - birth.getFullYear();
                    const genderMatch = gender === 'all' || patient.gender === gender;
                    const ageMatch = age >= ageRange.min && age <= ageRange.max;

                    if (genderMatch && ageMatch) {
                        const matchedCodes = c.code?.coding
                            ?.map(coding => coding.code)
                            ?.filter(code => selectedCodesArr.some(selCode => code?.startsWith(selCode))) || [];

                        matchedCodes.forEach(code => {
                            // 統計圓餅圖：疾病分布
                            diseaseDistribution[code] = (diseaseDistribution[code] || 0) + 1;

                            // 統計折線圖：初診人數 (同一病患、同一疾病代碼、同一年度只計一次)
                            const uniqueVisitKey = `${pRef}-${code}-${selectedYear}`;
                            if (!trackedInitialVisits.has(uniqueVisitKey)) {
                                const monthIndex = visitDate.getMonth(); // 0-11
                                monthlyCounts[monthIndex] += 1;
                                trackedInitialVisits.add(uniqueVisitKey);
                            }
                        });
                    }
                }
            });

            // 確保圓餅圖數據對應正確的 label 順序
            const pieValues = selectedDiseases.map(id => {
                const code = DISEASE_OPTIONS.find(d => d.id === id).code;
                return diseaseDistribution[code] || 0;
            });

            setStatsData({
                pieData: pieValues,
                lineData: monthlyCounts,
            });

        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDiseases, gender, selectedYear, ageRange.min, ageRange.max]);

    useEffect(() => {
        if (loading) {
            popUp.loading(true, true)
        }else{
            popUp.loading(false)
        }
    }, [loading]);

    const pieChartData = {
        labels: selectedDiseases.map(id => DISEASE_OPTIONS.find(d => d.id === id).label),
        datasets: [{
            data: statsData.pieData,
            backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'],
        }],
    };

    const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: `${selectedYear} 年度慢性病初診趨勢`,
            data: statsData.lineData,
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
        }],
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* --- 返回功能區域 --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => navigate('/EHREntry')} style={{ display: 'flex', alignItems: 'center', color: '#3182ce', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    ⬅ 返回首頁
                </button>
                <div style={{ fontSize: '12px', color: '#718096', backgroundColor: 'white', padding: '5px 15px', borderRadius: '20px' }}>
                    FHIR Server Connected
                </div>
            </div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">🏥 診所慢性病初診統計儀表板</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">統計年度</label>
                    <select
                        className="border rounded p-2 text-sm w-full bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                    >
                        {YEARS.map(y => <option key={y} value={y}>{y} 年</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">年齡篩選 ({ageRange.min}-{ageRange.max})</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            className="border rounded p-2 text-sm w-full"
                            value={ageRange.min}
                            onChange={e => setAgeRange({...ageRange, min: Number(e.target.value)})}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            className="border rounded p-2 text-sm w-full"
                            value={ageRange.max}
                            onChange={e => setAgeRange({...ageRange, max: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">生理性別</label>
                    <select
                        className="border rounded p-2 text-sm w-full bg-white"
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                    >
                        <option value="all">全部性別</option>
                        <option value="male">男性 (Male)</option>
                        <option value="female">女性 (Female)</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full font-medium transition disabled:bg-blue-300"
                    >
                        {loading ? '數據加載中...' : '重新計算數據'}
                    </button>
                </div>

                <div className="md:col-span-4 mt-2 border-t pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">慢性病追蹤項目 (複選)</label>
                    <div className="flex flex-wrap gap-4">
                        {DISEASE_OPTIONS.map(disease => (
                            <label key={disease.id} className="inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                                    checked={selectedDiseases.includes(disease.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedDiseases([...selectedDiseases, disease.id]);
                                        else setSelectedDiseases(selectedDiseases.filter(id => id !== disease.id));
                                    }}
                                />
                                <span className="ml-2 text-sm text-gray-600 group-hover:text-blue-600 transition">{disease.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">疾病盛行分布</h3>
                    <div className="h-72">
                        <Pie
                            data={pieChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'bottom' } }
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">每月初診人數成長趨勢</h3>
                    <div className="h-72">
                        <Line
                            data={lineChartData}
                            options={{
                                maintainAspectRatio: false,
                                responsive: true,
                                scales: {
                                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChronicDiseaseDashboard;