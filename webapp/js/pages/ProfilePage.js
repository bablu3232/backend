// ============================================
// Profile Page
// ============================================
function ProfilePage({ onNavigate }) {
    const { user, login } = useAuth();
    const [editing, setEditing] = React.useState(false);
    const [form, setForm] = React.useState({
        full_name: user?.fullName || '', email: user?.email || '', phone: user?.phone || '',
        date_of_birth: user?.dob || '', gender: user?.gender || ''
    });
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ text: '', type: '' });

    const handleSave = async () => {
        setLoading(true); setMessage({ text: '', type: '' });
        try {
            await ApiService.updateProfile({
                user_id: user.userId, full_name: form.full_name, email: form.email,
                phone: form.phone, date_of_birth: form.date_of_birth, gender: form.gender
            });
            login({ ...user, fullName: form.full_name, email: form.email, phone: form.phone, dob: form.date_of_birth, gender: form.gender });
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setEditing(false);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div className="page-content">
            <h2 className="mb-24">My Profile</h2>

            {message.text && <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-16`}>
                <span className="material-icons-outlined" style={{ fontSize: '18px' }}>{message.type === 'success' ? 'check_circle' : 'error'}</span>{message.text}
            </div>}

            <div className="card mb-24">
                <div className="card-header">
                    <h3>Personal Information</h3>
                    {!editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                        <span className="material-icons-outlined" style={{ fontSize: '16px' }}>edit</span> Edit
                    </button>}
                </div>
                <div className="card-body">
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} disabled={!editing} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} disabled={!editing} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} disabled={!editing} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date of Birth</label>
                            <input className="form-input" type="date" value={form.date_of_birth} onChange={e => setForm(p => ({ ...p, date_of_birth: e.target.value }))} disabled={!editing} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select className="form-input" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} disabled={!editing}>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    {editing && (
                        <div className="flex gap-12 mt-16">
                            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3>Security</h3></div>
                <div className="card-body">
                    <button className="btn btn-secondary" onClick={() => onNavigate('change-password')}>
                        <span className="material-icons-outlined" style={{ fontSize: '18px' }}>lock</span> Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}
