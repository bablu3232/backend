// ============================================
// Register Page — Split layout with brand slider
// ============================================

// Validation helpers
function isValidName(name) {
    return /^[a-zA-Z\s]{5,}$/.test(name.trim());
}
function isValidEmail(email) {
    return email.trim().toLowerCase().endsWith('@gmail.com') && email.trim().length > 10;
}
function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone.trim());
}
function isValidPassword(pwd) {
    if (pwd.length < 8) return false;
    if (/\s/.test(pwd)) return false;
    if (!/[A-Z]/.test(pwd)) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return false;
    return true;
}

function RegisterPage({ onNavigate }) {
    const [form, setForm] = React.useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '' });
    const [errors, setErrors] = React.useState({});
    const [apiError, setApiError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);
    const [agreeToTerms, setAgreeToTerms] = React.useState(false);

    const handleChange = (field, val) => {
        setForm(prev => ({ ...prev, [field]: val }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!form.full_name.trim()) {
            newErrors.full_name = 'Please enter your full name';
        } else if (!isValidName(form.full_name)) {
            newErrors.full_name = 'Name must be at least 5 characters (alphabets and spaces only)';
        }

        if (!form.email.trim()) {
            newErrors.email = 'Please enter your email';
        } else if (!isValidEmail(form.email)) {
            newErrors.email = 'Email must end with @gmail.com';
        }

        if (!form.phone.trim()) {
            newErrors.phone = 'Please enter your phone number';
        } else if (!isValidPhone(form.phone)) {
            newErrors.phone = 'Phone must be exactly 10 digits';
        }

        if (!form.password) {
            newErrors.password = 'Please enter a password';
        } else if (!isValidPassword(form.password)) {
            newErrors.password = 'Min 8 chars with uppercase, lowercase, number & special character';
        }

        if (!form.confirm_password) {
            newErrors.confirm_password = 'Please confirm your password';
        } else if (form.confirm_password !== form.password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        if (!agreeToTerms) {
            newErrors.terms = 'You must agree to the Terms of Service';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setLoading(true); setApiError('');
        try {
            const res = await ApiService.register(form);
            if (res.data.message && !res.data.message.toLowerCase().includes('error')) {
                onNavigate('login');
            } else {
                setApiError(res.data.message || 'Registration failed');
            }
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    const eyeStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', userSelect: 'none' };
    const fieldErrorStyle = { color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' };

    return (
        <div className="auth-split">
            <div className="auth-split-left">
                <div className="auth-split-card">
                    <div className="auth-header">
                        <div className="auth-logo" style={{ background: 'transparent' }}>
                            <img src="assets/logo.png" alt="DrugsSearch" style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover' }} />
                        </div>
                        <h1>Create Account</h1>
                        <p>Join DrugsSearch today</p>
                    </div>
                    <form className="auth-body" onSubmit={handleSubmit}>
                        {apiError && <div className="alert alert-danger"><span className="material-icons-outlined" style={{ fontSize: '18px' }}>error</span>{apiError}</div>}

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" placeholder="Enter your full name" value={form.full_name} onChange={e => handleChange('full_name', e.target.value)} style={errors.full_name ? { borderColor: '#EF4444' } : {}} />
                            {errors.full_name && <div style={fieldErrorStyle}><span className="material-icons-outlined" style={{ fontSize: '14px' }}>error</span>{errors.full_name}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" placeholder="yourname@gmail.com" value={form.email} onChange={e => handleChange('email', e.target.value)} style={errors.email ? { borderColor: '#EF4444' } : {}} />
                            {errors.email && <div style={fieldErrorStyle}><span className="material-icons-outlined" style={{ fontSize: '14px' }}>error</span>{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <input className="form-input" type="tel" placeholder="Enter 10-digit phone number" value={form.phone} onChange={e => handleChange('phone', e.target.value)} maxLength={10} style={errors.phone ? { borderColor: '#EF4444' } : {}} />
                            {errors.phone && <div style={fieldErrorStyle}><span className="material-icons-outlined" style={{ fontSize: '14px' }}>error</span>{errors.phone}</div>}
                        </div>

                        <div className="grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Create password" value={form.password} onChange={e => handleChange('password', e.target.value)} style={Object.assign({ paddingRight: '44px' }, errors.password ? { borderColor: '#EF4444' } : {})} />
                                    <span className="material-icons-outlined" onClick={() => setShowPassword(!showPassword)} style={eyeStyle}>{showPassword ? 'visibility' : 'visibility_off'}</span>
                                </div>
                                {errors.password && <div style={fieldErrorStyle}><span className="material-icons-outlined" style={{ fontSize: '14px' }}>error</span>{errors.password}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm</label>
                                <div style={{ position: 'relative' }}>
                                    <input className="form-input" type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" value={form.confirm_password} onChange={e => handleChange('confirm_password', e.target.value)} style={Object.assign({ paddingRight: '44px' }, errors.confirm_password ? { borderColor: '#EF4444' } : {})} />
                                    <span className="material-icons-outlined" onClick={() => setShowConfirm(!showConfirm)} style={eyeStyle}>{showConfirm ? 'visibility' : 'visibility_off'}</span>
                                </div>
                                {errors.confirm_password && <div style={fieldErrorStyle}><span className="material-icons-outlined" style={{ fontSize: '14px' }}>error</span>{errors.confirm_password}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '8px', marginBottom: '4px' }}>
                            <input type="checkbox" checked={agreeToTerms} onChange={e => { setAgreeToTerms(e.target.checked); if (errors.terms) setErrors(prev => ({ ...prev, terms: null })); }} style={{ marginTop: '3px', accentColor: 'var(--primary)' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                I agree to the <a href="#" style={{ color: 'var(--primary)', fontWeight: '500' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)', fontWeight: '500' }}>Privacy Policy</a>
                            </span>
                        </div>
                        {errors.terms && <div style={Object.assign({}, fieldErrorStyle, { marginBottom: '8px' })}><span className="material-icons-outlined" style={{ fontSize: '14px' }}>error</span>{errors.terms}</div>}

                        <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
                            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></div> Creating...</> : 'Create Account'}
                        </button>
                    </form>
                    <div className="auth-footer">
                        <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>Sign In</a>
                    </div>
                </div>
            </div>
            <AuthBrandPanel />
        </div>
    );
}
