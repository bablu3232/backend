// ============================================
// Change Password Page
// ============================================
function ChangePasswordPage({ onNavigate }) {
    const { user } = useAuth();
    const [form, setForm] = React.useState({ current: '', newPass: '', confirm: '' });
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ text: '', type: '' });
    const [showCurrent, setShowCurrent] = React.useState(false);
    const [showNew, setShowNew] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPass !== form.confirm) { setMessage({ text: 'Passwords do not match', type: 'error' }); return; }
        if (form.newPass.length < 6) { setMessage({ text: 'Password must be at least 6 characters', type: 'error' }); return; }
        setLoading(true); setMessage({ text: '', type: '' });
        try {
            await ApiService.changePassword(user.userId, form.current, form.newPass, form.confirm);
            setMessage({ text: 'Password changed successfully!', type: 'success' });
            setForm({ current: '', newPass: '', confirm: '' });
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Failed to change password', type: 'error' });
        }
        setLoading(false);
    };

    const eyeStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', userSelect: 'none' };

    return (
        <div className="page-content">
            <div className="flex items-center gap-12 mb-24">
                <button className="btn-icon" onClick={() => onNavigate('profile')}><span className="material-icons-outlined">arrow_back</span></button>
                <h2>Change Password</h2>
            </div>

            <div className="card" style={{ maxWidth: '500px' }}>
                <div className="card-body">
                    {message.text && <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-16`}>
                        <span className="material-icons-outlined" style={{ fontSize: '18px' }}>{message.type === 'success' ? 'check_circle' : 'error'}</span>{message.text}
                    </div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" type={showCurrent ? 'text' : 'password'} placeholder="Enter current password" value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))} style={{ paddingRight: '44px' }} />
                                <span className="material-icons-outlined" onClick={() => setShowCurrent(!showCurrent)} style={eyeStyle}>{showCurrent ? 'visibility' : 'visibility_off'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" type={showNew ? 'text' : 'password'} placeholder="Enter new password" value={form.newPass} onChange={e => setForm(p => ({ ...p, newPass: e.target.value }))} style={{ paddingRight: '44px' }} />
                                <span className="material-icons-outlined" onClick={() => setShowNew(!showNew)} style={eyeStyle}>{showNew ? 'visibility' : 'visibility_off'}</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password" value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))} style={{ paddingRight: '44px' }} />
                                <span className="material-icons-outlined" onClick={() => setShowConfirm(!showConfirm)} style={eyeStyle}>{showConfirm ? 'visibility' : 'visibility_off'}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
