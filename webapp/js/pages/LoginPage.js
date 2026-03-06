// ============================================
// Login Page
// ============================================
function LoginPage({ onNavigate }) {
    const { login } = useAuth();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) { setError('Please enter your email'); return; }
        // Admin redirect — same as mobile app
        if (email.trim().toLowerCase() === 'admin') { onNavigate('admin-login'); return; }
        if (!password) { setError('Please enter your password'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await ApiService.login(email, password);
            const data = res.data;
            if (data.user_id) {
                login({
                    userId: data.user_id,
                    fullName: data.full_name,
                    email: data.email,
                    phone: data.phone,
                    dob: data.date_of_birth,
                    gender: data.gender
                });
                onNavigate('dashboard');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Connection error. Check if server is running.');
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo" style={{ background: 'transparent' }}><img src="assets/logo.png" alt="DrugSearch" style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} /></div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to DrugSearch</p>
                </div>
                <form className="auth-body" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger"><span className="material-icons-outlined" style={{ fontSize: '18px' }}>error</span>{error}</div>}
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="text" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: '44px' }} />
                            <span className="material-icons-outlined" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', userSelect: 'none' }}>{showPassword ? 'visibility' : 'visibility_off'}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('forgot-password'); }} style={{ fontSize: '0.85rem' }}>Forgot password?</a>
                    </div>
                    <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                        {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div> Signing in...</> : 'Sign In'}
                    </button>
                </form>
                <div className="auth-footer">
                    <span style={{ color: 'var(--text-secondary)' }}>Don't have an account? </span>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('register'); }}>Sign Up</a>
                </div>
            </div>
        </div>
    );
}
