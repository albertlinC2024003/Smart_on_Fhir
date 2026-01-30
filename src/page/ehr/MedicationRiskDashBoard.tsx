import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFhir } from "../../utils/module/FhirContext.tsx";
import { useNavigate } from "react-router-dom";
import {useProvider} from "../../utils/ComponentProvider.tsx";

// 疾病選項配置
const DISEASE_OPTIONS = [
    { id: 'hypertension', label: '高血壓', code: 'I10' },
    { id: 'diabetes', label: '糖尿病', code: 'E11' },
    { id: 'lipid', label: '高血脂', code: 'E78' },
    { id: 'ckd', label: '慢性腎病', code: 'N18' },
    { id: 'heart_failure', label: '心臟衰竭', code: 'I50' },
    { id: 'cad', label: '冠狀心臟病', code: 'I25' },
    { id: 'afib', label: '心房顫動', code: 'I48' },
    { id: 'copd', label: '肺阻塞', code: 'J44' },
    { id: 'arthritis', label: '關節炎', code: 'M19' },
    { id: 'gout', label: '痛風', code: 'M10' },
    { id: 'osteoporosis', label: '骨鬆', code: 'M81' },
];

const PAGE_SIZE = 20;
const FETCH_BATCH_SIZE = 50;

const getPatientName = (p) => {
    const nameObj = p.name?.[0];
    if (!nameObj) return p.id;
    if (nameObj.text) return nameObj.text;
    return `${nameObj.family || ''}${nameObj.given?.join('') || ''}`;
};

const AdherenceMonitor = () => {
    const { client } = useFhir();
    const navigate = useNavigate();
    const { popUp } = useProvider();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDiseases, setSelectedDiseases] = useState(DISEASE_OPTIONS.map(d => d.id));
    const [displayList, setDisplayList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const allValidPoolRef = useRef([]);
    const serverOffsetRef = useRef(0);
    const hasMoreRef = useRef(true);

    const activeCodes = useMemo(() => {
        return DISEASE_OPTIONS.filter(d => selectedDiseases.includes(d.id)).map(d => d.code);
    }, [selectedDiseases]);

    const getWorstGap = (meds) => {
        if (!meds || meds.length === 0) return 999;
        const now = Date.now();
        return Math.min(...meds.map(m => {
            const supply = m.dispenseRequest?.expectedSupplyDuration?.value || 0;
            const authoredDate = new Date(m.authoredOn).getTime();
            if (isNaN(authoredDate)) return 999;
            const elapsed = Math.ceil((now - authoredDate) / 86400000);
            return supply - elapsed;
        }));
    };

    // --- 核心修正：統一資料整合邏輯 ---
    const processCombinedData = (patients, conditions, meds) => {
        const patientMap = new Map();

        // 1. 建立病人對照表
        patients.forEach(p => {
            const id = p.id.split('/').pop();
            patientMap.set(id, { patient: p, conditions: [], meds: [] });
        });

        // 2. 歸納疾病 (Condition)
        conditions.forEach(c => {
            const refId = c.subject?.reference?.split('/').pop();
            if (patientMap.has(refId)) patientMap.get(refId).conditions.push(c);
        });

        // 3. 歸納藥單 (MedicationRequest) - 這是姓名搜尋會失敗的關鍵點
        meds.forEach(m => {
            const refId = m.subject?.reference?.split('/').pop();
            if (patientMap.has(refId)) patientMap.get(refId).meds.push(m);
        });

        // 4. 過濾並轉換格式
        return Array.from(patientMap.values())
            .filter(data => data.conditions.length > 0) // 至少要有一項慢性病診斷
            .map(data => ({
                id: data.patient.id.split('/').pop(),
                displayName: getPatientName(data.patient),
                patientFull: data.patient,
                chronicConds: data.conditions,
                meds: data.meds,
                // 這裡會正確呼叫 getWorstGap 並算出剩餘天數
                worstGap: getWorstGap(data.meds)
            }));
    };

    const startMining = async () => {
        if (!client || loading || activeCodes.length === 0) return;
        setLoading(true);

        try {
            let processedOnes = [];

            // 軌道 A：精準人名搜尋 (分兩次查詢)
            if (searchTerm.trim()) {
                // 1. 先抓病人基本資料
                const pBundle = await client.request(`Patient?name=${searchTerm.trim()}&_count=10`);
                if (pBundle.entry && pBundle.entry.length > 0) {
                    const patients = pBundle.entry.map(e => e.resource);
                    const pIds = patients.map(p => p.id.split('/').pop());

                    // 2. 分別抓取疾病與藥單 (明確查詢)
                    const [condBundle, medBundle] = await Promise.all([
                        client.request(`Condition?patient=${pIds.join(',')}&code=${activeCodes.join(',')}`),
                        client.request(`MedicationRequest?patient=${pIds.join(',')}&_count=100`)
                    ]);

                    const conditions = condBundle.entry ? condBundle.entry.map(e => e.resource) : [];
                    const meds = medBundle.entry ? medBundle.entry.map(e => e.resource) : [];

                    // 3. 整合
                    processedOnes = processCombinedData(patients, conditions, meds);
                }
                hasMoreRef.current = false;
            }
            // 軌道 B：大範圍挖掘 (分次查詢模式)
            else if (hasMoreRef.current) {
                const offset = serverOffsetRef.current;
                const bundle = await client.request(
                    `Condition?code=${activeCodes.join(',')}&_include=Condition:patient&_count=${FETCH_BATCH_SIZE}&_getpagesoffset=${offset}&_sort=_id`
                );

                if (bundle.entry) {
                    const entries = bundle.entry.map(e => e.resource);
                    const patients = entries.filter(r => r.resourceType === 'Patient');
                    const conditions = entries.filter(r => r.resourceType === 'Condition');
                    const pIds = patients.map(p => p.id.split('/').pop());

                    // 明確抓取藥單
                    const medBundle = await client.request(`MedicationRequest?patient=${pIds.join(',')}&_count=100`);
                    const meds = medBundle.entry ? medBundle.entry.map(e => e.resource) : [];

                    processedOnes = processCombinedData(patients, conditions, meds);
                    serverOffsetRef.current += FETCH_BATCH_SIZE;
                    if (bundle.entry.length < FETCH_BATCH_SIZE) hasMoreRef.current = false;
                }
            }

            // 更新池子與排序
            if (searchTerm.trim()) {
                allValidPoolRef.current = processedOnes;
            } else {
                const existingIds = new Set(allValidPoolRef.current.map(p => p.id));
                const uniqueNew = processedOnes.filter(p => !existingIds.has(p.id));
                allValidPoolRef.current = [...allValidPoolRef.current, ...uniqueNew];
            }

            allValidPoolRef.current.sort((a, b) => a.worstGap - b.worstGap);
            updateDisplay(currentPage);

        } catch (err) {
            console.error("Mining Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateDisplay = (page) => {
        const start = page * PAGE_SIZE;
        setDisplayList(allValidPoolRef.current.slice(start, start + PAGE_SIZE));
    };

    const resetAndRemine = () => {
        allValidPoolRef.current = [];
        serverOffsetRef.current = 0;
        hasMoreRef.current = true;
        setCurrentPage(0);
        startMining();
    };

    useEffect(() => {
        const timer = setTimeout(() => { resetAndRemine(); }, 600);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedDiseases]);

    const handleDiseaseToggle = (id) => {
        setSelectedDiseases(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleNext = () => {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        if (allValidPoolRef.current.length < (nextPage + 1) * PAGE_SIZE && hasMoreRef.current) {
            startMining();
        } else { updateDisplay(nextPage); }
    };

    const handlePrev = () => {
        if (currentPage > 0) { setCurrentPage(currentPage - 1); updateDisplay(currentPage - 1); }
    };
    useEffect(() => {
        if (loading) {
            popUp.loading(true, true)
        }else{
            popUp.loading(false)
        }
    }, [loading]);

    return (
        <div style={{ padding: '30px', backgroundColor: '#f4f6f8', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <button onClick={() => navigate('/EHREntry')} style={{ display: 'flex', alignItems: 'center', color: '#3182ce', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>⬅ 返回首頁</button>

            {/* 搜尋區 */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <input type="text" placeholder="🔍 姓名搜尋..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', marginBottom: '15px' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {DISEASE_OPTIONS.map(d => (
                        <label key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: selectedDiseases.includes(d.id) ? '#ebf8ff' : 'white' }}>
                            <input type="checkbox" checked={selectedDiseases.includes(d.id)} onChange={() => handleDiseaseToggle(d.id)} /> {d.label}
                        </label>
                    ))}
                    <button onClick={resetAndRemine} style={{ marginLeft: 'auto', padding: '8px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>手動重新整理</button>
                </div>
            </div>

            {/* 表格 */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#4a5568', color: 'white' }}>
                    <tr><th style={{ padding: '15px', width: '80px' }}>序號</th><th style={{ padding: '15px', textAlign: 'left' }}>姓名</th><th style={{ padding: '15px', textAlign: 'left' }}>慢性診斷</th><th style={{ padding: '15px' }}>藥量狀態</th></tr>
                    </thead>
                    <tbody>
                    {displayList.map((p, index) => (
                        <tr key={p.id} onClick={() => setSelectedPatient(p)} style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}>
                            <td style={{ padding: '15px', textAlign: 'center' }}>{currentPage * PAGE_SIZE + index + 1}</td>
                            <td style={{ padding: '15px', fontWeight: 'bold' }}>{p.displayName}</td>
                            <td style={{ padding: '15px' }}>{p.chronicConds[0]?.code?.text || '未知診斷'}</td>
                            <td style={{ padding: '15px', textAlign: 'center', color: p.worstGap < 0 ? '#e53e3e' : '#d69e2e', fontWeight: 'bold' }}>{p.worstGap === 999 ? '無紀錄' : (p.worstGap < 0 ? `逾期 ${Math.abs(p.worstGap)} 天` : `剩餘 ${p.worstGap}天`)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 分頁 */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px', marginTop: '30px' }}>
                <button onClick={handlePrev} disabled={currentPage === 0 || loading}>⬅ 上一頁</button>
                <span style={{ fontWeight: 'bold' }}>第 {currentPage + 1} 頁</span>
                <button onClick={handleNext} disabled={loading || (!hasMoreRef.current && (currentPage + 1) * PAGE_SIZE >= allValidPoolRef.current.length)}>下一頁 ➡</button>
            </div>

            {/* 彈窗細節 */}
            {selectedPatient && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '600px', maxHeight: '85vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f1f1f1', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0 }}>個案全覽：{selectedPatient.displayName}</h3>
                            <button onClick={() => setSelectedPatient(null)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '8px', fontSize: '14px' }}>
                            <div>性別：{selectedPatient.patientFull.gender}</div>
                            <div>生日：{selectedPatient.patientFull.birthDate || 'N/A'}</div>
                            <div style={{ gridColumn: 'span 2' }}>ID: {selectedPatient.id}</div>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>慢性病診斷</div>
                        {selectedPatient.chronicConds.map((c, i) => <div key={i} style={{ marginBottom: '5px', fontSize: '13px' }}>📍 {c.code?.text || '未知診斷'}</div>)}

                        {/* 生理指標按鈕 */}
                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff5f5', borderRadius: '10px', border: '1px solid #feb2b2' }}>
                            <button onClick={() => navigate(`/ChronicTracker?patientId=${selectedPatient.id}`)} style={{ width: '100%', padding: '12px', background: '#c53030', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🩸 檢視此病患血糖 / 血壓監測趨勢</button>
                        </div>

                        {/* ✨ 補回：藥品詳情 */}
                        <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px' }}>藥品詳情 (Medication Details)</div>
                        {selectedPatient.meds.length > 0 ? selectedPatient.meds.map((m, i) => (
                            <div key={i} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '8px', marginBottom: '8px' }}>
                                <div style={{ fontWeight: 'bold', color: '#2d3748' }}>{m.medicationCodeableConcept?.text || '未知藥名'}</div>
                                <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginTop: '5px', color: '#718096' }}>
                                    <span>開立日：{m.authoredOn || 'N/A'}</span>
                                    <span>給藥量：{m.dispenseRequest?.expectedSupplyDuration?.value || '0'} 天</span>
                                </div>
                            </div>
                        )) : <div style={{ color: '#a0aec0', fontSize: '13px' }}>無藥單紀錄</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdherenceMonitor;