// ============================================
// Report Detail Page
// ============================================
function ReportDetailPage({ onNavigate, data }) {
    if (!data) return <div className="page-content"><EmptyState icon="description" title="No Report Selected" description="Go back to history and select a report." /></div>;

    const report = data;
    const params = report.parameters || [];
    const normalParams = params.filter(p => p.is_normal);
    const abnormalParams = params.filter(p => !p.is_normal);

    return (
        <div className="page-content">
            <div className="flex items-center gap-12 mb-24">
                <button className="btn-icon" onClick={() => onNavigate('history')}><span className="material-icons-outlined">arrow_back</span></button>
                <div>
                    <h2>Report #{report.id}</h2>
                    <p className="text-sm text-muted">{report.category} • {report.date}</p>
                </div>
            </div>

            {/* Overview */}
            <div className="grid grid-3 mb-24">
                <div className="stat-card">
                    <div className="stat-icon blue"><span className="material-icons-outlined">science</span></div>
                    <div className="stat-info"><h4>Parameters</h4><div className="stat-value">{params.length}</div></div>
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

            {/* Patient Info */}
            {(report.patient_name || report.patient_age || report.patient_gender) && (
                <div className="card mb-24">
                    <div className="card-header"><h3>Patient Details</h3></div>
                    <div className="card-body">
                        <div className="flex gap-24">
                            {report.patient_name && <div><span className="text-sm text-muted">Name</span><div className="font-bold">{report.patient_name}</div></div>}
                            {report.patient_age && <div><span className="text-sm text-muted">Age</span><div className="font-bold">{report.patient_age}</div></div>}
                            {report.patient_gender && <div><span className="text-sm text-muted">Gender</span><div className="font-bold">{report.patient_gender}</div></div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Abnormal */}
            {abnormalParams.length > 0 && (
                <div className="card mb-24">
                    <div className="card-header"><h3 style={{ color: 'var(--danger)' }}>⚠ Abnormal Values</h3></div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table>
                            <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th></tr></thead>
                            <tbody>
                                {abnormalParams.map((p, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                                        <td className="font-bold" style={{ color: 'var(--danger)' }}>{p.value}</td>
                                        <td className="text-muted">{p.unit || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Normal */}
            <div className="card mb-24">
                <div className="card-header"><h3 style={{ color: 'var(--success)' }}>✓ Normal Values</h3></div>
                <div className="card-body" style={{ padding: 0 }}>
                    <table>
                        <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th></tr></thead>
                        <tbody>
                            {normalParams.map((p, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td className="font-bold" style={{ color: 'var(--success)' }}>{p.value}</td>
                                    <td className="text-muted">{p.unit || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {report.remarks && (
                <div className="card mb-24">
                    <div className="card-header"><h3>Remarks</h3></div>
                    <div className="card-body"><p>{report.remarks}</p></div>
                </div>
            )}
        </div>
    );
}
