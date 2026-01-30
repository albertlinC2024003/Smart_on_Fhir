import React, { useState, useMemo, useEffect } from 'react';
import { useFhir } from "../../utils/module/FhirContext.tsx";
import { useNavigate, useLocation } from "react-router-dom"; // 引入 useLocation 讀取 URL
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts';
import {UrlPath} from "../../utils/module/PathListener.tsx";
import {useProvider} from "../../utils/ComponentProvider.tsx";

const CODES = { GLUCOSE: "15074-8", BP: "85354-9" };

const ChronicTracker = () => {
    const { client } = useFhir();
    const navigate = useNavigate();
    const { popUp } = useProvider();
    const location = useLocation(); // 取得當前路徑資訊

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [vitals, setVitals] = useState({ glucose: [], bp: [] });
    const [loading, setLoading] = useState(false);

    // --- ✨ 新增：自動載入邏輯 ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const patientIdFromUrl = params.get('patientId');

        if (patientIdFromUrl && client) {
            const autoLoad = async () => {
                setLoading(true);
                try {
                    // 1. 先抓病人基本資料
                    const p = await client.request(`Patient/${patientIdFromUrl}`);
                    if (p) {
                        setSelectedPatient(p);
                        // 2. 接著抓生理指標
                        await fetchVitals(p.id);
                    }
                } catch (err) {
                    console.error("載入個案失敗:", err);
                } finally {
                    setLoading(false);
                }
            };
            autoLoad();
        }
    }, [location.search, client]);

    const fetchVitals = async (patientId) => {
        try {
            const query = `Observation?patient=${patientId}&code=${CODES.GLUCOSE},${CODES.BP}&_sort=date&_count=100`;
            const bundle = await client.request(query);
            const entries = bundle.entry ? bundle.entry.map(e => e.resource) : [];

            setVitals({
                glucose: entries.filter(obs => obs.code.coding.some(c => c.code === CODES.GLUCOSE)),
                bp: entries.filter(obs => obs.code.coding.some(c => c.code === CODES.BP))
            });
        } catch (err) {
            console.error("抓取生理指標失敗:", err);
        }
    };

    const glucoseChartData = useMemo(() => {
        return vitals.glucose.map(obs => ({
            time: new Date(obs.effectiveDateTime).toLocaleDateString('zh-TW', {month:'numeric', day:'numeric'}) + ' ' + new Date(obs.effectiveDateTime).getHours() + ':00',
            value: obs.valueQuantity.value,
        }));
    }, [vitals.glucose]);

    const bpChartData = useMemo(() => {
        return vitals.bp.map(obs => {
            const sys = obs.component?.find(c => c.code.coding.some(x => x.code === "8480-6"))?.valueQuantity?.value;
            const dia = obs.component?.find(c => c.code.coding.some(x => x.code === "8462-4"))?.valueQuantity?.value;
            return {
                time: new Date(obs.effectiveDateTime).toLocaleDateString('zh-TW', {month:'numeric', day:'numeric'}) + ' ' + new Date(obs.effectiveDateTime).getHours() + ':00',
                systolic: sys,
                diastolic: dia
            };
        });
    }, [vitals.bp]);

    const stats = useMemo(() => {
        const gluVals = vitals.glucose.map(o => o.valueQuantity.value);
        return {
            gluAvg: gluVals.length ? Math.round(gluVals.reduce((a, b) => a + b, 0) / gluVals.length) : '--',
            gluMax: gluVals.length ? Math.max(...gluVals) : '--',
            gluCount: gluVals.length
        };
    }, [vitals.glucose]);

    useEffect(() => {
        if (loading) {
            popUp.loading(true, true)
        }else{
            popUp.loading(false)
        }
    }, [loading]);

    return (
        <div style={{ padding: '30px', backgroundColor: '#f4f6f8', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* 返回斷藥風險監測頁面 */}
            <button
                onClick={() => navigate(UrlPath.EHR_MEDICATION_RISK)}
                style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#3182ce', fontWeight: 'bold', marginBottom: '20px', fontSize: '16px' }}
            >
                ⬅ 返回監測名單
            </button>

            {loading && <div style={{ textAlign: 'center', padding: '50px', color: '#3182ce' }}>⏳ 正在載入個案生理數據...</div>}

            {!loading && !selectedPatient && (
                <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '15px' }}>
                    <p style={{ color: '#718096' }}>❌ 未指定個案或載入錯誤，請從監測名單進入。</p>
                    <button onClick={() => navigate('/AdherenceMonitor')} style={{ padding: '10px 20px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>回到名單</button>
                </div>
            )}

            {selectedPatient && (
                <div>
                    {/* 數據看板 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #3182ce', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#718096' }}>個案姓名</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedPatient.name?.[0]?.text}</div>
                            </div>
                        </div>

                        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #38a169' }}>
                            <div style={{ fontSize: '12px', color: '#718096' }}>本週平均血糖</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38a169' }}>{stats.gluAvg} <small style={{fontSize:'12px'}}>mg/dL</small></div>
                        </div>
                        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #e53e3e' }}>
                            <div style={{ fontSize: '12px', color: '#718096' }}>本週最高紀錄</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e53e3e' }}>{stats.gluMax} <small style={{fontSize:'12px'}}>mg/dL</small></div>
                        </div>
                        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '5px solid #718096' }}>
                            <div style={{ fontSize: '12px', color: '#718096' }}>監測點總數</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.gluCount} <small style={{fontSize:'12px'}}>回</small></div>
                        </div>
                    </div>

                    {/* 圖表區塊 */}
                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 15px 0' }}>🩸 血糖週趨勢分析</h4>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer>
                                <AreaChart data={glucoseChartData} syncId="chronic">
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3182ce" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3182ce" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="time" fontSize={10} minTickGap={30} />
                                    <YAxis domain={[60, 250]} fontSize={10} />
                                    <Tooltip />
                                    <ReferenceLine y={140} stroke="#38a169" strokeDasharray="3 3" label={{value:'140', fontSize:10, fill:'#38a169'}} />
                                    <ReferenceLine y={200} stroke="#e53e3e" strokeWidth={2} strokeDasharray="5 5" label={{value:'危險 200', position:'right', fontSize:10, fill:'#e53e3e', fontWeight:'bold'}} />
                                    <Area type="monotone" dataKey="value" stroke="#3182ce" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 15px 0' }}>💓 血壓監測趨勢</h4>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer>
                                <LineChart data={bpChartData} syncId="chronic">
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="time" fontSize={10} minTickGap={30} />
                                    <YAxis domain={[50, 180]} fontSize={10} />
                                    <Tooltip />
                                    <ReferenceLine y={140} stroke="#e53e3e" strokeDasharray="3 3" label={{value:'140', fontSize:10, fill:'#e53e3e'}} />
                                    <Line name="收縮壓" type="monotone" dataKey="systolic" stroke="#e53e3e" strokeWidth={2} dot={{r:3}} />
                                    <Line name="舒張壓" type="monotone" dataKey="diastolic" stroke="#3182ce" strokeWidth={2} dot={{r:3}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChronicTracker;