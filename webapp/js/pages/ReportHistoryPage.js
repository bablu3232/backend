// ============================================
// Report History Page
// ============================================
function ReportHistoryPage({ onNavigate }) {
    const { user } = useAuth();
    const [reports, setReports] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('all');

    React.useEffect(() => {
        if (user?.userId) {
            ApiService.getUserReports(user.userId)
                .then(res => setReports(Array.isArray(res.data) ? res.data : []))
                .catch(() => { })
                .finally(() => setLoading(false));
        }
    }, [user]);

    const categories = [...new Set(reports.map(r => r.category))];
    const filtered = filter === 'all' ? reports : filter === 'normal' ? reports.filter(r => r.is_normal) : filter === 'abnormal' ? reports.filter(r => !r.is_normal) : reports.filter(r => r.category === filter);

    return (
        <div className="page-content">
            <div className="flex items-center justify-between mb-24">
                <h2>Report History</h2>
                <button className="btn btn-primary" onClick={() => onNavigate('upload')}>
                    <span className="material-icons-outlined" style={{ fontSize: '18px' }}>add</span> New Report
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
                <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All ({reports.length})</button>
                <button className={`btn btn-sm ${filter === 'normal' ? 'btn-success' : 'btn-secondary'}`} onClick={() => setFilter('normal')}>Normal</button>
                <button className={`btn btn-sm ${filter === 'abnormal' ? 'btn-danger' : 'btn-secondary'}`} onClick={() => setFilter('abnormal')}>Abnormal</button>
                {categories.map(c => (
                    <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(c)}>{c}</button>
                ))}
            </div>

            {loading ? <LoadingSpinner text="Loading reports..." /> :
                filtered.length === 0 ? (
                    <EmptyState icon="description" title="No Reports Found" description="Upload or manually enter a report to see it here."
                        action={<button className="btn btn-primary" onClick={() => onNavigate('upload')}>Upload Report</button>} />
                ) : (
                    <div className="grid grid-2">
                        {filtered.map(report => (
                            <div key={report.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('report-detail', report)}>
                                <div className="card-body">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="badge badge-info">{report.category}</span>
                                        {report.is_normal ? <span className="badge badge-success">Normal</span> : <span className="badge badge-danger">{report.abnormal_count} Abnormal</span>}
                                    </div>
                                    <h4 style={{ marginBottom: '8px' }}>Report #{report.id}</h4>
                                    {report.patient_name && <p className="text-sm" style={{ marginBottom: '4px' }}>Patient: {report.patient_name}</p>}
                                    <div className="flex items-center justify-between mt-8">
                                        <span className="text-sm text-muted">{report.date}</span>
                                        <span className="text-sm text-muted">{report.parameters?.length || 0} parameters</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
