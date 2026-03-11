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
        <div className="page-content" id="report-detail-printable">
            <style>
                {`
                @media print {
                    @page { margin: 15mm 20mm; }
                    body { background: white !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
                    .sidebar, .top-bar, .btn-icon, .btn { display: none !important; }
                    .main-content { margin-left: 0 !important; width: 100% !important; padding: 0 !important; }
                    .page-content { padding: 0 !important; max-width: 100% !important; border: none !important; }
                    
                    /* Custom Print Header */
                    #report-detail-printable::before {
                        content: 'DrugsSearch Medical Report';
                        display: block;
                        font-family: inherit;
                        font-size: 24pt;
                        font-weight: 700;
                        color: var(--primary);
                        margin-bottom: 5px;
                        border-bottom: 2px solid var(--primary);
                        padding-bottom: 10px;
                    }
                    
                    .card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; margin-bottom: 15pt !important; page-break-inside: avoid; }
                    .card-header { border-bottom: 1px solid #e2e8f0 !important; background-color: #f8fafc !important; }
                    th, td { padding: 8pt !important; border-bottom: 1px solid #e2e8f0 !important; }
                    
                    .grid-3 { display: flex !important; gap: 15px !important; }
                    .stat-card { flex: 1; margin: 0 !important; border: 1px solid #e2e8f0 !important; padding: 15px !important; }
                }
                `}
            </style>
            
            <div className="flex items-center justify-between mb-24">
                <div className="flex items-center gap-12">
                    <button className="btn-icon" onClick={() => onNavigate('history')}><span className="material-icons-outlined">arrow_back</span></button>
                    <div>
                        <h2>Report #{report.id}</h2>
                        <p className="text-sm text-muted">{report.category} • {report.date}</p>
                    </div>
                </div>
                
                <button className="btn btn-secondary" onClick={() => window.print()}>
                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>picture_as_pdf</span>
                    Download PDF
                </button>
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
                        <div className="flex gap-24 font-bold" style={{ fontSize: '1.1rem' }}>
                            {report.patient_name && <div><span className="text-sm text-muted block mb-4" style={{ fontWeight: 'normal' }}>Name</span><div>{report.patient_name}</div></div>}
                            {report.patient_age && <div><span className="text-sm text-muted block mb-4" style={{ fontWeight: 'normal' }}>Age</span><div>{report.patient_age}</div></div>}
                            {report.patient_gender && <div><span className="text-sm text-muted block mb-4" style={{ fontWeight: 'normal' }}>Gender</span><div>{report.patient_gender}</div></div>}
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
                                        <td style={{ fontWeight: 500 }}>
                                            {p.name}
                                            {p.recommendation && (
                                                <div style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--primary)', fontStyle: 'italic', fontWeight: 'normal' }}>
                                                    Recommended: {p.recommendation}
                                                </div>
                                            )}
                                        </td>
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
