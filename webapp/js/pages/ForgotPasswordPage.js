// ============================================
// Forgot Password Page (OTP Flow)
// ============================================
function ForgotPasswordPage({ onNavigate }) {
    const [step, setStep] = React.useState(1); // 1: email, 2: OTP, 3: new password
    const [email, setEmail] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [newPass, setNewPass] = React.useState('');
    const [confirmPass, setConfirmPass] = React.useState('');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [showNew, setShowNew] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const requestOtp = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            await ApiService.requestOtp(email);
            setSuccess('OTP sent to your email');
            setStep(2);
        } catch (err) { setError(err.response?.data?.message || 'Failed to send OTP'); }
        setLoading(false);
    };

    const verifyOtp = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try {
            await ApiService.verifyOtp(email, otp);
            setSuccess('OTP verified');
            setStep(3);
        } catch (err) { setError(err.response?.data?.message || 'Invalid OTP'); }
        setLoading(false);
    };

    const resetPassword = async (e) => {
        e.preventDefault(); setError('');
        if (newPass !== confirmPass) { setError('Passwords do not match'); return; }
        setLoading(true);
        try {
            await ApiService.resetPassword(email, newPass, confirmPass);
            setSuccess('Password reset successful!');
            setTimeout(() => onNavigate('login'), 2000);
        } catch (err) { setError(err.response?.data?.message || 'Reset failed'); }
        setLoading(false);
    };

    const eyeStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', userSelect: 'none' };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo" style={{ background: 'transparent' }}><img src="assets/logo.png" alt="DrugSearch" style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} /></div>
                    <h1>{step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'New Password'}</h1>
                    <p>{step === 1 ? 'Enter your email to receive an OTP' : step === 2 ? 'Enter the OTP sent to your email' : 'Create your new password'}</p>
                </div>
                <div className="auth-body">
                    {error && <div className="alert alert-danger"><span className="material-icons-outlined" style={{ fontSize: '18px' }}>error</span>{error}</div>}
                    {success && <div className="alert alert-success"><span className="material-icons-outlined" style={{ fontSize: '18px' }}>check_circle</span>{success}</div>}
                    {step === 1 && (
                        <form onSubmit={requestOtp}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input className="form-input" type="email" placeholder="Enter your registered email" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    )}
                    {step === 2 && (
                        <form onSubmit={verifyOtp}>
                            <div className="form-group">
                                <label className="form-label">Enter OTP</label>
                                <input className="form-input" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }} />
                            </div>
                            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>
                    )}
                    {step === 3 && (
                        <form onSubmit={resetPassword}>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input className="form-input" type={showNew ? 'text' : 'password'} placeholder="Enter new password" value={newPass} onChange={e => setNewPass(e.target.value)} style={{ paddingRight: '44px' }} />
                                    <span className="material-icons-outlined" onClick={() => setShowNew(!showNew)} style={eyeStyle}>{showNew ? 'visibility' : 'visibility_off'}</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input className="form-input" type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} style={{ paddingRight: '44px' }} />
                                    <span className="material-icons-outlined" onClick={() => setShowConfirm(!showConfirm)} style={eyeStyle}>{showConfirm ? 'visibility' : 'visibility_off'}</span>
                                </div>
                            </div>
                            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
                <div className="auth-footer">
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('login'); }}>← Back to Login</a>
                </div>
            </div>
        </div>
    );
}
