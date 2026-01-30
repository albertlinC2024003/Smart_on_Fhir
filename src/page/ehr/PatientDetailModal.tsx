const PatientDetailModal = ({ patient, onClose }) => {
    // 輔助函式：美化日期
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : '無資料';

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex',
            justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', width: '70%', maxHeight: '85%', padding: '30px',
                borderRadius: '12px', overflow: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0 }}>{patient.name?.[0]?.text || '未知姓名'}</h2>
                        <small style={{ color: '#888' }}>Patient ID: {patient.id} | 性別: {patient.gender}</small>
                    </div>
                    <button onClick={onClose} style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' }}>關閉詳情</button>
                </div>

                {/* 診斷區區 (Conditions) */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{ borderLeft: '4px solid #1890ff', paddingLeft: '10px' }}>📋 診斷紀錄 (Conditions)</h3>
                    {patient.conditions && patient.conditions.length > 0 ? (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                            {patient.conditions.map((c, i) => (
                                <span key={i} style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', padding: '5px 12px', borderRadius: '20px', fontSize: '14px' }}>
                                    {c.code?.text || c.code?.coding?.[0]?.display || '未定義診斷'}
                                </span>
                            ))}
                        </div>
                    ) : <p style={{ color: '#999' }}>查無相關診斷紀錄</p>}
                </div>

                {/* 藥單區 (MedicationRequests) */}
                <div>
                    <h3 style={{ borderLeft: '4px solid #52c41a', paddingLeft: '10px' }}>💊 藥單清單 (Medication Requests)</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>藥品名稱</th>
                            <th style={{ padding: '12px' }}>開單日期</th>
                            <th style={{ padding: '12px' }}>預計天數</th>
                            <th style={{ padding: '12px' }}>狀態</th>
                        </tr>
                        </thead>
                        <tbody>
                        {patient.medications && patient.medications.length > 0 ? (
                            patient.medications.map((m, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{m.medicationCodeableConcept?.text || m.medicationReference?.display || '未知藥品'}</td>
                                    <td style={{ padding: '12px' }}>{formatDate(m.authoredOn)}</td>
                                    <td style={{ padding: '12px' }}>{m.dispenseRequest?.expectedSupplyDuration?.value || '--'} 天</td>
                                    <td style={{ padding: '12px' }}>
                                            <span style={{ backgroundColor: m.status === 'active' ? '#f6ffed' : '#f5f5f5', color: m.status === 'active' ? '#52c41a' : '#888', padding: '2px 8px', borderRadius: '4px', border: '1px solid' }}>
                                                {m.status}
                                            </span>
                                    </td>
                                </tr>
                            ))
                        ) : <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>查無藥單資料</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailModal;