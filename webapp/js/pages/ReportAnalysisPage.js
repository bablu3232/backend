// ============================================
// Report Analysis Page
// ============================================
function ReportAnalysisPage({ onNavigate, data }) {
    const [activeTab, setActiveTab] = React.useState('overview');

    if (!data || !data.analysis) {
        return <div className="page-content"><EmptyState icon="analytics" title="No Analysis Data" description="Submit a report for analysis first." action={<button className="btn btn-primary" onClick={() => onNavigate('upload')}>Upload Report</button>} /></div>;
    }

    const analysis = data.analysis;
    const parameters = analysis.parameters || {};
    const paramEntries = Object.entries(parameters);
    const normalParams = paramEntries.filter(([, p]) => p.status === 'Normal');
    const abnormalParams = paramEntries.filter(([, p]) => p.status !== 'Normal');

    const getRiskColor = (risk) => {
        if (risk === 'High' || risk === 'Critical') return 'var(--danger)';
        if (risk === 'Moderate' || risk === 'Medium') return 'var(--warning)';
        return 'var(--success)';
    };

    return (
        <div className="page-content">
            <div className="flex items-center gap-12 mb-24">
                <button className="btn-icon" onClick={() => onNavigate('dashboard')}><span className="material-icons-outlined">arrow_back</span></button>
                <div>
                    <h2>Analysis Results</h2>
                    <p className="text-sm text-muted">{data.category || analysis.report_category || 'Report'}</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-3 mb-24">
                <div className="stat-card">
                    <div className="stat-icon blue"><span className="material-icons-outlined">science</span></div>
                    <div className="stat-info"><h4>Total Parameters</h4><div className="stat-value">{paramEntries.length}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><span className="material-icons-outlined">check_circle</span></div>
                    <div className="stat-info"><h4>Normal</h4><div className="stat-value">{normalParams.length}</div></div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red"><span className="material-icons-outlined">warning</span></div>
                    <div className="stat-info"><h4>Abnormal</h4><div className="stat-value">{abnormalParams.length}</div></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {['overview', 'abnormal', 'normal', 'recommendations'].map(tab => (
                    <div key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </div>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="card">
                    <div className="card-header"><h3>All Parameters</h3></div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table>
                            <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Status</th><th>Risk</th></tr></thead>
                            <tbody>
                                {paramEntries.map(([name, p]) => (
                                    <tr key={name}>
                                        <td style={{ fontWeight: 500 }}>{name}</td>
                                        <td className="font-bold">{String(p.value ?? '-')}</td>
                                        <td className="text-muted">{p.unit || '-'}</td>
                                        <td><StatusBadge status={p.status || 'Normal'} /></td>
                                        <td><span style={{ color: getRiskColor(p.risk_level), fontWeight: 600, fontSize: '0.85rem' }}>{p.risk_level || 'None'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'abnormal' && (
                <div>
                    {abnormalParams.length === 0 ? <EmptyState icon="check_circle" title="All Normal!" description="All your parameters are within normal range." /> :
                        abnormalParams.map(([name, p]) => (
                            <div key={name} className="card mb-16">
                                <div className="card-body">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4>{name}</h4>
                                        <StatusBadge status={p.status || 'Abnormal'} />
                                    </div>
                                    <div className="flex gap-24 mb-16">
                                        <div><span className="text-muted text-sm">Value</span><div className="font-bold" style={{ fontSize: '1.3rem', color: 'var(--danger)' }}>{String(p.value ?? '-')} {p.unit || ''}</div></div>
                                        <div><span className="text-muted text-sm">Risk Level</span><div style={{ color: getRiskColor(p.risk_level), fontWeight: 600 }}>{p.risk_level || 'None'}</div></div>
                                        {p.deviation !== undefined && <div><span className="text-muted text-sm">Deviation</span><div className="font-bold">{p.deviation}%</div></div>}
                                    </div>
                                    {p.condition && <div className="alert alert-warning" style={{ marginBottom: '8px' }}><span className="material-icons-outlined" style={{ fontSize: '18px' }}>medical_information</span><div><strong>Condition:</strong> {p.condition}</div></div>}
                                    {p.summary && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{p.summary}</p>}
                                    {p.recommendation && (
                                        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>Recommended</div>
                                            <div style={{ fontSize: '0.9rem' }}>{p.recommendation.category}: {p.recommendation.drugs}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}

            {activeTab === 'normal' && (
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <table>
                            <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th></tr></thead>
                            <tbody>
                                {normalParams.map(([name, p]) => (
                                    <tr key={name}>
                                        <td style={{ fontWeight: 500 }}>{name}</td>
                                        <td className="font-bold" style={{ color: 'var(--success)' }}>{String(p.value ?? '-')}</td>
                                        <td className="text-muted">{p.unit || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'recommendations' && (
                <div>
                    {abnormalParams.filter(([, p]) => p.recommendation).length === 0 ?
                        <EmptyState icon="thumb_up" title="No Recommendations" description="All parameters are normal. Keep it up!" /> :
                        abnormalParams.filter(([, p]) => p.recommendation).map(([name, p]) => (
                            <div key={name} className="card mb-16">
                                <div className="card-body">
                                    <h4>{name}</h4>
                                    <div className="flex gap-16 mt-8">
                                        <span className="badge badge-info">{p.recommendation.category}</span>
                                    </div>
                                    <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                                        <strong>Suggested:</strong> {p.recommendation.drugs}
                                    </p>
                                    {p.condition && <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Condition: {p.condition}</p>}
                                </div>
                            </div>
                        ))
                    }
                </div>
            )}

            <div className="flex gap-12 mt-24">
                <button className="btn btn-primary" onClick={() => onNavigate('dashboard')}>← Back to Dashboard</button>
                <button className="btn btn-secondary" onClick={() => onNavigate('history')}>View All Reports</button>
            </div>
        </div>
    );
}
