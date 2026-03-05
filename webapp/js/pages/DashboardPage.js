// ============================================
// Dashboard Page
// ============================================
function DashboardPage({ onNavigate }) {
    const { user } = useAuth();
    const [reports, setReports] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (user?.userId) {
            ApiService.getUserReports(user.userId)
                .then(res => setReports(Array.isArray(res.data) ? res.data : []))
                .catch(() => { })
                .finally(() => setLoading(false));
        } else { setLoading(false); }
    }, [user]);

    const totalReports = reports.length;
    const abnormalReports = reports.filter(r => !r.is_normal).length;
    const normalReports = totalReports - abnormalReports;
    const recentReports = reports.slice(0, 5);

    const quickActions = [
        { icon: 'upload_file', label: 'Upload Report', desc: 'Scan & analyze lab report', page: 'upload', color: 'var(--primary)' },
        { icon: 'edit_note', label: 'Manual Entry', desc: 'Enter values manually', page: 'manual-entry', color: 'var(--accent)' },
        { icon: 'medication', label: 'Drug Search', desc: 'Search drug information', page: 'drug-search', color: 'var(--success)' },
        { icon: 'history', label: 'View History', desc: 'Past reports & trends', page: 'history', color: 'var(--warning)' },
    ];

    return (
        <>
            <div className="page-content">
                <div style={{ marginBottom: '32px' }}>
                    <h1>Welcome back, {user?.fullName?.split(' ')[0] || 'User'} 👋</h1>
                    <p style={{ marginTop: '4px' }}>Here's your health overview at a glance.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-4" style={{ marginBottom: '32px' }}>
                    <div className="stat-card">
                        <div className="stat-icon blue"><span className="material-icons-outlined">description</span></div>
                        <div className="stat-info"><h4>Total Reports</h4><div className="stat-value">{totalReports}</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon green"><span className="material-icons-outlined">check_circle</span></div>
                        <div className="stat-info"><h4>Normal</h4><div className="stat-value">{normalReports}</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon red"><span className="material-icons-outlined">warning</span></div>
                        <div className="stat-info"><h4>Abnormal</h4><div className="stat-value">{abnormalReports}</div></div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon amber"><span className="material-icons-outlined">trending_up</span></div>
                        <div className="stat-info"><h4>Health Score</h4><div className="stat-value">{totalReports > 0 ? Math.round((normalReports / totalReports) * 100) : '--'}%</div></div>
                    </div>
                </div>

                {/* Quick Actions */}
                <h3 className="mb-16">Quick Actions</h3>
                <div className="grid grid-4" style={{ marginBottom: '32px' }}>
                    {quickActions.map(a => (
                        <div key={a.page} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '28px 20px' }} onClick={() => onNavigate(a.page)}>
                            <span className="material-icons-outlined" style={{ fontSize: '36px', color: a.color, marginBottom: '12px' }}>{a.icon}</span>
                            <h4>{a.label}</h4>
                            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>{a.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Reports */}
                <div className="card">
                    <div className="card-header">
                        <h3>Recent Reports</h3>
                        {totalReports > 0 && <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('history')}>View All →</button>}
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {loading ? <LoadingSpinner text="Loading reports..." /> :
                            recentReports.length === 0 ? (
                                <EmptyState icon="description" title="No Reports Yet" description="Upload or manually enter your lab report to get started."
                                    action={<button className="btn btn-primary" onClick={() => onNavigate('upload')}>Upload Report</button>} />
                            ) : (
                                <div className="table-container">
                                    <table>
                                        <thead><tr><th>Category</th><th>Date</th><th>Status</th><th>Parameters</th><th></th></tr></thead>
                                        <tbody>
                                            {recentReports.map(r => (
                                                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('report-detail', r)}>
                                                    <td style={{ fontWeight: 600 }}>{r.category}</td>
                                                    <td>{r.date}</td>
                                                    <td>{r.is_normal ? <span className="badge badge-success">Normal</span> : <span className="badge badge-danger">{r.abnormal_count} Abnormal</span>}</td>
                                                    <td>{r.parameters?.length || 0}</td>
                                                    <td><span className="material-icons-outlined" style={{ color: 'var(--text-muted)' }}>chevron_right</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </>
    );
}
