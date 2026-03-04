// ============================================
// Review Values Page
// ============================================
function ReviewValuesPage({ onNavigate, data }) {
    const { user } = useAuth();
    const [values, setValues] = React.useState(data?.values || {});
    const [category, setCategory] = React.useState(data?.category || 'Unknown');
    const [patientName, setPatientName] = React.useState(data?.patientDetails?.name || '');
    const [patientAge, setPatientAge] = React.useState(data?.patientDetails?.age || '');
    const [patientGender, setPatientGender] = React.useState(data?.patientDetails?.gender || '');
    const [newParamName, setNewParamName] = React.useState('');
    const [newParamValue, setNewParamValue] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleValueChange = (paramName, newValue) => {
        setValues(prev => ({ ...prev, [paramName]: newValue }));
    };

    const addParameter = () => {
        if (!newParamName.trim() || !newParamValue.trim()) return;
        setValues(prev => ({ ...prev, [newParamName.trim()]: newParamValue.trim() }));
        setNewParamName(''); setNewParamValue('');
    };

    const removeParameter = (name) => {
        setValues(prev => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (Object.keys(values).length === 0) { setError('No parameters to submit'); return; }
        setLoading(true); setError('');
        const params = Object.entries(values).map(([name, value]) => ({
            name, value: String(value), unit: data?.fullAnalysis?.[name]?.unit || '', is_normal: true, recommendation: ''
        }));
        try {
            const res = await ApiService.saveReportData({
                report_id: data?.reportId || null,
                user_id: user.userId,
                category: category,
                parameters: params,
                patient_name: patientName || null,
                patient_age: patientAge || null,
                patient_gender: patientGender || null,
                remarks: null
            });
            const responseData = res.data;
            onNavigate('report-analysis', {
                analysis: responseData.analysis,
                reportId: responseData.report_id,
                category: category,
                parameters: params,
                patientName, patientAge, patientGender
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report');
        }
        setLoading(false);
    };

    if (!data) return <div className="page-content"><EmptyState icon="error" title="No Data" description="Go back and upload a report first." /></div>;

    return (
        <div className="page-content">
            <div className="flex items-center gap-12 mb-8">
                <button className="btn-icon" onClick={() => onNavigate('upload')}><span className="material-icons-outlined">arrow_back</span></button>
                <h2>Review Extracted Values</h2>
            </div>

            <div className="alert alert-warning mb-24">
                <span className="material-icons-outlined" style={{ fontSize: '20px' }}>info</span>
                <div>
                    <strong>Please verify the extracted values.</strong> Some values may be inaccurate or missing due to OCR limitations. You can edit any value below or add missing parameters.
                </div>
            </div>

            {error && <div className="alert alert-danger mb-16"><span className="material-icons-outlined" style={{ fontSize: '18px' }}>error</span>{error}</div>}

            <div className="grid grid-2 mb-24" style={{ gap: '24px' }}>
                {/* Patient Details */}
                <div className="card">
                    <div className="card-header"><h3>Patient Details</h3></div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <input className="form-input" value={category} onChange={e => setCategory(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Patient Name</label>
                            <input className="form-input" placeholder="Patient name" value={patientName} onChange={e => setPatientName(e.target.value)} />
                        </div>
                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Age</label>
                                <input className="form-input" placeholder="Age" value={patientAge} onChange={e => setPatientAge(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select className="form-input" value={patientGender} onChange={e => setPatientGender(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Missing Parameter */}
                <div className="card">
                    <div className="card-header"><h3>Add Missing Parameter</h3></div>
                    <div className="card-body">
                        <p className="text-sm text-muted mb-16">If any parameter was not detected by OCR, add it manually here.</p>
                        <div className="form-group">
                            <label className="form-label">Parameter Name</label>
                            <input className="form-input" placeholder="e.g. Hemoglobin" value={newParamName} onChange={e => setNewParamName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Value</label>
                            <input className="form-input" placeholder="e.g. 14.5" value={newParamValue} onChange={e => setNewParamValue(e.target.value)} />
                        </div>
                        <button className="btn btn-secondary btn-full" onClick={addParameter}>
                            <span className="material-icons-outlined" style={{ fontSize: '18px' }}>add</span> Add Parameter
                        </button>
                    </div>
                </div>
            </div>

            {/* Extracted Parameters */}
            <div className="card mb-24">
                <div className="card-header">
                    <h3>Extracted Parameters ({Object.keys(values).length})</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    <table>
                        <thead><tr><th>Parameter</th><th>Value</th><th style={{ width: '60px' }}></th></tr></thead>
                        <tbody>
                            {Object.entries(values).map(([name, val]) => (
                                <tr key={name}>
                                    <td style={{ fontWeight: 500 }}>{name}</td>
                                    <td>
                                        <input className="form-input" style={{ maxWidth: '200px', padding: '8px 12px' }} value={val} onChange={e => handleValueChange(name, e.target.value)} />
                                    </td>
                                    <td>
                                        <button className="btn-icon" style={{ border: 'none', color: 'var(--danger)' }} onClick={() => removeParameter(name)}>
                                            <span className="material-icons-outlined" style={{ fontSize: '18px' }}>delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-between">
                <button className="btn btn-secondary" onClick={() => onNavigate('upload')}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                    {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div> Analyzing...</> :
                        <><span className="material-icons-outlined" style={{ fontSize: '18px' }}>science</span> Submit for Analysis</>}
                </button>
            </div>
        </div>
    );
}
