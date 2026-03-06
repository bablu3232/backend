// ============================================
// Sidebar Navigation
// ============================================
function Sidebar({ currentPage, onNavigate, onLogout, sidebarOpen, onCloseSidebar }) {
    const { user } = useAuth();
    const navItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
        { id: 'upload', icon: 'upload_file', label: 'Upload Report' },
        { id: 'manual-entry', icon: 'edit_note', label: 'Manual Entry' },
        { id: 'history', icon: 'history', label: 'Report History' },
        { id: 'drug-search', icon: 'medication', label: 'Drug Search' },
    ];

    const bottomItems = [
        { id: 'profile', icon: 'person', label: 'Profile' },
        { id: 'about', icon: 'info', label: 'About' },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={onCloseSidebar}></div>
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <div className="logo-icon" style={{ background: 'transparent', overflow: 'hidden' }}><img src="assets/logo.png" alt="DS" style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover' }} /></div>
                    <h2>DrugSearch</h2>
                </div>
                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Main Menu</div>
                    {navItems.map(item => (
                        <div
                            key={item.id}
                            className={`sidebar-nav-item ${currentPage === item.id ? 'active' : ''}`}
                            onClick={() => { onNavigate(item.id); onCloseSidebar(); }}
                        >
                            <span className="material-icons-outlined">{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                    <div className="sidebar-section-label">Account</div>
                    {bottomItems.map(item => (
                        <div
                            key={item.id}
                            className={`sidebar-nav-item ${currentPage === item.id ? 'active' : ''}`}
                            onClick={() => { onNavigate(item.id); onCloseSidebar(); }}
                        >
                            <span className="material-icons-outlined">{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                    <div
                        className="sidebar-nav-item"
                        onClick={() => { if (window.confirm('Are you sure you want to logout?')) onLogout(); }}
                        style={{ color: '#EF4444', marginTop: '8px' }}
                    >
                        <span className="material-icons-outlined">logout</span>
                        Logout
                    </div>
                </nav>
                {user && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{user.fullName || user.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{user.email}</div>
                    </div>
                )}
            </aside>
        </>
    );
}

function TopBar({ title, onMenuClick, actions }) {
    return (
        <div className="top-bar">
            <div className="flex items-center gap-12">
                <button className="mobile-menu-btn" onClick={onMenuClick}>
                    <span className="material-icons-outlined">menu</span>
                </button>
                <span className="top-bar-title">{title}</span>
            </div>
            <div className="top-bar-actions">
                {actions}
            </div>
        </div>
    );
}
