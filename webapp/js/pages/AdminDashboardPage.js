// ============================================
// Admin Dashboard Page
// ============================================
function AdminDashboardPage({ onNavigate }) {
    const { logout } = useAuth();
    const [tab, setTab] = React.useState('overview');
    const [stats, setStats] = React.useState(null);
    const [users, setUsers] = React.useState([]);
    const [reports, setReports] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [message, setMessage] = React.useState({ text: '', type: '' });

    // Add parameter form
    const [paramForm, setParamForm] = React.useState({
        parameter_name: '', unit: '', min_value: '', max_value: '', category: '',
        condition_if_abnormal: '', drug_category: '', example_drugs: ''
    });

    // Add drug form
    const [drugForm, setDrugForm] = React.useState({
        drug_name: '', generic_name: '', drug_category: '', indication: '', description: '',
        common_dosage: '', side_effects: '', safety_warnings: '', storage_details: ''
    });

    // Parameter & Drug lists for delete
    const [paramList, setParamList] = React.useState([]);
    const [drugList, setDrugList] = React.useState([]);
    const [paramSearch, setParamSearch] = React.useState('');
    const [drugSearch, setDrugSearch] = React.useState('');

    const fetchParamList = async () => {
        try {
            const res = await api.get('web_admin_parameters.php');
            setParamList(res.data?.parameters || []);
        } catch (e) { }
    };

    const fetchDrugList = async () => {
        try {
            const res = await api.get('web_admin_drugs.php');
            setDrugList(res.data?.drugs || []);
        } catch (e) { }
    };

    React.useEffect(() => {
        Promise.all([
            ApiService.getAdminStats().catch(() => ({ data: {} })),
            ApiService.getAdminUsers().catch(() => ({ data: {} })),
            api.get('web_admin_reports.php').catch(() => ({ data: {} }))
        ]).then(([s, u, r]) => {
            setStats(s.data?.stats || {});
            setUsers(s.data?.users || u.data?.users || []);
            setReports(r.data?.users || []);
            setLoading(false);
        });
        fetchParamList();
        fetchDrugList();
    }, []);

    const handleAddParam = async (e) => {
        e.preventDefault();
        try {
            await ApiService.adminAddParameter({
                ...paramForm, min_value: parseFloat(paramForm.min_value), max_value: parseFloat(paramForm.max_value)
            });
            setMessage({ text: 'Parameter added!', type: 'success' });
            setParamForm({ parameter_name: '', unit: '', min_value: '', max_value: '', category: '', condition_if_abnormal: '', drug_category: '', example_drugs: '' });
            fetchParamList();
        } catch (err) { setMessage({ text: err.response?.data?.message || 'Failed', type: 'error' }); }
    };

    const handleAddDrug = async (e) => {
        e.preventDefault();
        try {
            await ApiService.adminAddDrug(drugForm);
            setMessage({ text: 'Drug added!', type: 'success' });
            setDrugForm({ drug_name: '', generic_name: '', drug_category: '', indication: '', description: '', common_dosage: '', side_effects: '', safety_warnings: '', storage_details: '' });
            fetchDrugList();
        } catch (err) { setMessage({ text: err.response?.data?.message || 'Failed', type: 'error' }); }
    };

    const handleDeleteParam = async (id, name) => {
        if (!window.confirm(`Delete parameter "${name}"? This cannot be undone.`)) return;
        try {
            await api.post('admin_delete_parameter.php', { id });
            setMessage({ text: `Parameter "${name}" deleted`, type: 'success' });
            fetchParamList();
        } catch (err) { setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'error' }); }
    };

    const handleDeleteDrug = async (id, name) => {
        if (!window.confirm(`Delete drug "${name}"? This cannot be undone.`)) return;
        try {
            await api.post('admin_delete_drug.php', { id });
            setMessage({ text: `Drug "${name}" deleted`, type: 'success' });
            fetchDrugList();
        } catch (err) { setMessage({ text: err.response?.data?.message || 'Delete failed', type: 'error' }); }
    };

    const handleLogout = () => { if (window.confirm('Are you sure you want to logout?')) { logout(); onNavigate('admin-login'); } };

    if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

    const filteredParams = paramList.filter(p => p.parameter_name.toLowerCase().includes(paramSearch.toLowerCase()));
    const filteredDrugs = drugList.filter(d => d.drug_name.toLowerCase().includes(drugSearch.toLowerCase()));

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Admin Sidebar */}
            <aside className="sidebar" style={{ transform: 'none' }}>
                <div className="sidebar-logo">
                    <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)' }}>🛡</div>
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    {[
                        { id: 'overview', icon: 'dashboard', label: 'Overview' },
                        { id: 'users', icon: 'people', label: 'Users' },
                        { id: 'reports', icon: 'description', label: 'Reports' },
                        { id: 'add-parameter', icon: 'add_circle', label: 'Add Parameter' },
                        { id: 'add-drug', icon: 'medication', label: 'Add Drug' },
                    ].map(item => (
                        <div key={item.id} className={`sidebar-nav-item ${tab === item.id ? 'active' : ''}`} onClick={() => { setTab(item.id); setMessage({ text: '', type: '' }); }}>
                            <span className="material-icons-outlined">{item.icon}</span>{item.label}
                        </div>
                    ))}
                    <div className="sidebar-nav-item" style={{ color: '#EF4444', marginTop: '16px' }} onClick={handleLogout}>
                        <span className="material-icons-outlined">logout</span>Logout
                    </div>
                </nav>
            </aside>

            <div style={{ flex: 1, marginLeft: '260px' }}>
                <div className="top-bar"><span className="top-bar-title">Admin Dashboard</span></div>
                <div className="page-content">
                    {message.text && <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-16`}>
                        <span className="material-icons-outlined" style={{ fontSize: '18px' }}>{message.type === 'success' ? 'check_circle' : 'error'}</span>{message.text}
                    </div>}

                    {/* Overview */}
                    {tab === 'overview' && (
                        <div>
                            <h2 className="mb-24">Dashboard Overview</h2>
                            <div className="grid grid-4 mb-24">
                                <div className="stat-card"><div className="stat-icon blue"><span className="material-icons-outlined">people</span></div><div className="stat-info"><h4>Users</h4><div className="stat-value">{stats?.total_users || 0}</div></div></div>
                                <div className="stat-card"><div className="stat-icon green"><span className="material-icons-outlined">description</span></div><div className="stat-info"><h4>Reports</h4><div className="stat-value">{stats?.total_reports || 0}</div></div></div>
                                <div className="stat-card"><div className="stat-icon amber"><span className="material-icons-outlined">medication</span></div><div className="stat-info"><h4>Drugs</h4><div className="stat-value">{stats?.total_drugs || 0}</div></div></div>
                                <div className="stat-card"><div className="stat-icon red"><span className="material-icons-outlined">science</span></div><div className="stat-info"><h4>Parameters</h4><div className="stat-value">{stats?.total_parameters || 0}</div></div></div>
                            </div>
                        </div>
                    )}

                    {/* Users */}
                    {tab === 'users' && (
                        <div>
                            <h2 className="mb-24">All Users ({users.length})</h2>
                            <div className="card"><div className="card-body" style={{ padding: 0 }}>
                                <table>
                                    <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th></tr></thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id}><td>{u.id}</td><td style={{ fontWeight: 600 }}>{u.full_name}</td><td>{u.email}</td><td>{u.phone || '-'}</td><td>{u.created_at}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div></div>
                        </div>
                    )}

                    {/* Reports — User Summary */}
                    {tab === 'reports' && (
                        <div>
                            <h2 className="mb-24">Reports by User ({reports.length} users)</h2>
                            <div className="card"><div className="card-body" style={{ padding: 0 }}>
                                <table>
                                    <thead><tr><th>User ID</th><th>Name</th><th>Total Reports</th></tr></thead>
                                    <tbody>
                                        {reports.map(u => (
                                            <tr key={u.user_id}>
                                                <td>{u.user_id}</td>
                                                <td style={{ fontWeight: 600 }}>{u.user_name}</td>
                                                <td><span className="badge badge-info">{u.total_reports}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div></div>
                        </div>
                    )}

                    {/* Add Parameter */}
                    {tab === 'add-parameter' && (
                        <div>
                            <h2 className="mb-24">Add Lab Parameter</h2>
                            <div className="card" style={{ maxWidth: '700px' }}><div className="card-body">
                                <form onSubmit={handleAddParam}>
                                    <div className="grid grid-2">
                                        <div className="form-group"><label className="form-label">Parameter Name *</label><input className="form-input" required value={paramForm.parameter_name} onChange={e => setParamForm(p => ({ ...p, parameter_name: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Unit *</label><input className="form-input" required value={paramForm.unit} onChange={e => setParamForm(p => ({ ...p, unit: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Min Value *</label><input className="form-input" type="number" step="any" required value={paramForm.min_value} onChange={e => setParamForm(p => ({ ...p, min_value: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Max Value *</label><input className="form-input" type="number" step="any" required value={paramForm.max_value} onChange={e => setParamForm(p => ({ ...p, max_value: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Category *</label><input className="form-input" required value={paramForm.category} onChange={e => setParamForm(p => ({ ...p, category: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Condition If Abnormal</label><input className="form-input" value={paramForm.condition_if_abnormal} onChange={e => setParamForm(p => ({ ...p, condition_if_abnormal: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Drug Category</label><input className="form-input" value={paramForm.drug_category} onChange={e => setParamForm(p => ({ ...p, drug_category: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Example Drugs</label><input className="form-input" value={paramForm.example_drugs} onChange={e => setParamForm(p => ({ ...p, example_drugs: e.target.value }))} /></div>
                                    </div>
                                    <button className="btn btn-primary mt-16" type="submit">Add Parameter</button>
                                </form>
                            </div></div>

                            {/* Existing Parameters List */}
                            <h3 className="mt-24 mb-16" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                Existing Parameters ({paramList.length})
                            </h3>
                            <div style={{ maxWidth: '700px', marginBottom: '16px' }}>
                                <input className="form-input" placeholder="Search parameters..." value={paramSearch} onChange={e => setParamSearch(e.target.value)} style={{ maxWidth: '300px' }} />
                            </div>
                            <div className="card" style={{ maxWidth: '700px' }}><div className="card-body" style={{ padding: 0 }}>
                                <table>
                                    <thead><tr><th>ID</th><th>Name</th><th>Unit</th><th>Range</th><th>Category</th><th style={{ width: '60px' }}>Action</th></tr></thead>
                                    <tbody>
                                        {filteredParams.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td style={{ fontWeight: 600 }}>{p.parameter_name}</td>
                                                <td>{p.unit}</td>
                                                <td>{p.min_value} - {p.max_value}</td>
                                                <td>{p.category}</td>
                                                <td>
                                                    <button className="btn-icon" style={{ color: '#EF4444' }} onClick={() => handleDeleteParam(p.id, p.parameter_name)} title="Delete">
                                                        <span className="material-icons-outlined" style={{ fontSize: '20px' }}>delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredParams.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No parameters found</td></tr>}
                                    </tbody>
                                </table>
                            </div></div>
                        </div>
                    )}

                    {/* Add Drug */}
                    {tab === 'add-drug' && (
                        <div>
                            <h2 className="mb-24">Add Drug</h2>
                            <div className="card" style={{ maxWidth: '700px' }}><div className="card-body">
                                <form onSubmit={handleAddDrug}>
                                    <div className="grid grid-2">
                                        <div className="form-group"><label className="form-label">Drug Name *</label><input className="form-input" required value={drugForm.drug_name} onChange={e => setDrugForm(p => ({ ...p, drug_name: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Generic Name</label><input className="form-input" value={drugForm.generic_name} onChange={e => setDrugForm(p => ({ ...p, generic_name: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Category *</label><input className="form-input" required value={drugForm.drug_category} onChange={e => setDrugForm(p => ({ ...p, drug_category: e.target.value }))} /></div>
                                        <div className="form-group"><label className="form-label">Indication</label><input className="form-input" value={drugForm.indication} onChange={e => setDrugForm(p => ({ ...p, indication: e.target.value }))} /></div>
                                    </div>
                                    <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={drugForm.description} onChange={e => setDrugForm(p => ({ ...p, description: e.target.value }))}></textarea></div>
                                    <div className="form-group"><label className="form-label">Common Dosage</label><input className="form-input" value={drugForm.common_dosage} onChange={e => setDrugForm(p => ({ ...p, common_dosage: e.target.value }))} /></div>
                                    <div className="form-group"><label className="form-label">Side Effects</label><textarea className="form-input" value={drugForm.side_effects} onChange={e => setDrugForm(p => ({ ...p, side_effects: e.target.value }))}></textarea></div>
                                    <div className="form-group"><label className="form-label">Safety Warnings</label><textarea className="form-input" value={drugForm.safety_warnings} onChange={e => setDrugForm(p => ({ ...p, safety_warnings: e.target.value }))}></textarea></div>
                                    <div className="form-group"><label className="form-label">Storage Details</label><input className="form-input" value={drugForm.storage_details} onChange={e => setDrugForm(p => ({ ...p, storage_details: e.target.value }))} /></div>
                                    <button className="btn btn-primary mt-16" type="submit">Add Drug</button>
                                </form>
                            </div></div>

                            {/* Existing Drugs List */}
                            <h3 className="mt-24 mb-16">Existing Drugs ({drugList.length})</h3>
                            <div style={{ maxWidth: '700px', marginBottom: '16px' }}>
                                <input className="form-input" placeholder="Search drugs..." value={drugSearch} onChange={e => setDrugSearch(e.target.value)} style={{ maxWidth: '300px' }} />
                            </div>
                            <div className="card" style={{ maxWidth: '700px' }}><div className="card-body" style={{ padding: 0 }}>
                                <table>
                                    <thead><tr><th>ID</th><th>Drug Name</th><th>Generic Name</th><th>Category</th><th style={{ width: '60px' }}>Action</th></tr></thead>
                                    <tbody>
                                        {filteredDrugs.map(d => (
                                            <tr key={d.id}>
                                                <td>{d.id}</td>
                                                <td style={{ fontWeight: 600 }}>{d.drug_name}</td>
                                                <td>{d.generic_name || '-'}</td>
                                                <td>{d.drug_category || '-'}</td>
                                                <td>
                                                    <button className="btn-icon" style={{ color: '#EF4444' }} onClick={() => handleDeleteDrug(d.id, d.drug_name)} title="Delete">
                                                        <span className="material-icons-outlined" style={{ fontSize: '20px' }}>delete</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredDrugs.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No drugs found</td></tr>}
                                    </tbody>
                                </table>
                            </div></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
