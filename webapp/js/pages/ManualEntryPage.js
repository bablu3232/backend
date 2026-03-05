// ============================================
// Manual Entry Page
// ============================================
function ManualEntryPage({ onNavigate }) {
    const { user } = useAuth();
    const [step, setStep] = React.useState(1);
    const [category, setCategory] = React.useState('');
    const [values, setValues] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const categories = {
        'Blood Count': ['Hemoglobin', 'RBC', 'WBC', 'Platelets', 'Hematocrit', 'MCV', 'MCH', 'MCHC', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils', 'ESR'],
        'Lipid Profile': ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides', 'VLDL Cholesterol', 'LDL/HDL Ratio', 'T-Chol/HDL Ratio'],
        'Liver Function': ['Total Bilirubin', 'Direct Bilirubin', 'Indirect Bilirubin', 'Total Protein', 'Serum Albumin', 'Globulin', 'A/G Ratio', 'Alkaline Phosphatase', 'Gamma GT'],
        'Kidney Function': ['Blood Urea', 'Creatinine', 'BUN', 'eGFR', 'Uric Acid', 'BUN/Creatinine Ratio'],
        'Thyroid Panel': ['TSH', 'Free T3', 'Free T4', 'Total T3', 'Total T4'],
        'Metabolic Panel': ['Glucose', 'Calcium', 'Sodium', 'Potassium', 'Uric Acid'],
        'Diabetes Panel': ['HbA1c', 'Fasting Insulin', 'Random Blood Glucose', 'Postprandial Glucose'],
    };

    const selectCategory = (cat) => {
        setCategory(cat);
        const init = {};
        categories[cat].forEach(p => init[p] = '');
        setValues(init);
        setStep(2);
    };

    const handleSubmit = async () => {
        const filledParams = Object.entries(values).filter(([, v]) => v.trim() !== '');
        if (filledParams.length === 0) { setError('Enter at least one value'); return; }
        setLoading(true); setError('');
        const params = filledParams.map(([name, value]) => ({
            name, value, unit: '', is_normal: true, recommendation: ''
        }));
        try {
            const res = await ApiService.saveReportData({
                report_id: null, user_id: user.userId, category,
                parameters: params, patient_name: null, patient_age: null, patient_gender: null, remarks: null
            });
            onNavigate('report-analysis', {
                analysis: res.data.analysis, reportId: res.data.report_id, category, parameters: params
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit');
        }
        setLoading(false);
    };

    return (
        <div className="page-content">
            <h2 className="mb-8">Manual Entry</h2>
            <p className="text-muted mb-24">Select a category and enter your lab values manually.</p>

            {step === 1 && (
                <div className="grid grid-3">
                    {Object.keys(categories).map(cat => (
                        <div key={cat} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '28px 20px' }} onClick={() => selectCategory(cat)}>
                            <span className="material-icons-outlined" style={{ fontSize: '36px', color: 'var(--primary)', marginBottom: '12px' }}>
                                {cat.includes('Blood') ? 'bloodtype' : cat.includes('Lipid') ? 'favorite' : cat.includes('Liver') ? 'local_hospital' :
                                    cat.includes('Kidney') ? 'water_drop' : cat.includes('Thyroid') ? 'psychology' : cat.includes('Diabetes') ? 'monitor_heart' : 'science'}
                            </span>
                            <h4>{cat}</h4>
                            <p className="text-sm text-muted mt-8">{categories[cat].length} parameters</p>
                        </div>
                    ))}
                </div>
            )}

            {step === 2 && (
                <>
                    <div className="flex items-center gap-12 mb-24">
                        <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>← Change Category</button>
                        <span className="badge badge-info">{category}</span>
                    </div>
                    {error && <div className="alert alert-danger mb-16"><span className="material-icons-outlined" style={{ fontSize: '18px' }}>error</span>{error}</div>}
                    <div className="card mb-24">
                        <div className="card-header"><h3>Enter Values</h3></div>
                        <div className="card-body">
                            <div className="grid grid-2">
                                {Object.entries(values).map(([name, val]) => (
                                    <div key={name} className="form-group">
                                        <label className="form-label">{name}</label>
                                        <input className="form-input" type="number" step="any" placeholder="Enter value" value={val}
                                            onChange={e => setValues(prev => ({ ...prev, [name]: e.target.value }))} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                        <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div> Analyzing...</> :
                                <><span className="material-icons-outlined" style={{ fontSize: '18px' }}>science</span> Analyze Report</>}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
