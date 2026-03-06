// ============================================
// Register Page
// ============================================
function RegisterPage({ onNavigate }) {
    const [form, setForm] = React.useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.full_name || !form.email || !form.phone || !form.password) { setError('All fields are required'); return; }
        if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
        setLoading(true); setError('');
        try {
            const res = await ApiService.register(form);
            if (res.data.message && !res.data.message.toLowerCase().includes('error')) {
                onNavigate('login');
            } else {
                setError(res.data.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    const eyeStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', userSelect: 'none' };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo" style={{ background: 'transparent' }}><img src="assets/logo.png" alt="DrugSearch" style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} /></div>
                    <h1>Create Account</h1>
                    <p>Join DrugSearch today</p>
                </div>
                <form className="auth-body" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger"><span className="material-icons-outlined" style={{ fontSize: '18px' }}>error</span>{error}</div>}
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" placeholder="Enter your full name" value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="Enter your email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" type="tel" placeholder="Enter your phone number" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
                    </div>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Create password" value={form.password} onChange={e => handleChange('password', e.target.value)} style={{ paddingRight: '44px' }} />
                                <span className="material-icons-outlined" onClick={() => setShowPassword(!showPassword)} style={eyeStyle}>{showPassword ? 'visibility' : 'visibility_off'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" value={form.confirm_password} onChange={e => handleChange('confirm_password', e.target.value)} style={{ paddingRight: '44px' }} />
                                <span className="material-icons-outlined" onClick={() => setShowConfirm(!showConfirm)} style={eyeStyle}>{showConfirm ? 'visibility' : 'visibility_off'}</span>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                        {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div> Creating...</> : 'Create Account'}
                    </button>
                </form>
                <div className="auth-footer">
                    <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Sign In</a>
                </div>
            </div>
        </div>
    );
}
