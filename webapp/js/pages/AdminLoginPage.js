// ============================================
// Admin Login Page
// ============================================
function AdminLoginPage({ onNavigate }) {
    const { adminLogin } = useAuth();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError('Please fill in all fields'); return; }
        setLoading(true); setError('');
        try {
            const res = await ApiService.adminLogin(email, password);
            const data = res.data;
            if (data.status === 'success') {
                adminLogin({ userId: data.userId || 0, fullName: data.fullName || 'Administrator', email: data.email });
                onNavigate('admin-dashboard');
            } else {
                setError(data.message || 'Invalid admin credentials');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo" style={{ background: 'transparent' }}><img src="assets/logo.png" alt="DrugSearch" style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} /></div>
                    <h1>Admin Portal</h1>
                    <p>Secure access required</p>
                </div>
                <form className="auth-body" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger"><span className="material-icons-outlined" style={{ fontSize: '18px' }}>error</span>{error}</div>}
                    <div className="form-group">
                        <label className="form-label">Admin ID</label>
                        <input className="form-input" placeholder="Enter admin identifier" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Enter admin password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '44px' }} />
                            <span className="material-icons-outlined" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', userSelect: 'none' }}>{showPassword ? 'visibility' : 'visibility_off'}</span>
                        </div>
                    </div>
                    <button className="btn btn-full btn-lg" type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: 'white' }}>
                        {loading ? 'Authenticating...' : 'Admin Sign In'}
                    </button>
                </form>
                <div className="auth-footer">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>← Back to User Login</a>
                </div>
            </div>
        </div>
    );
}
